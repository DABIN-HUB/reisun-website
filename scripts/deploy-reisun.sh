#!/usr/bin/env bash
# Static publication only: never restarts or recreates the Nginx container.
set -Eeuo pipefail
umask 077

PROJECT_DIR="${PROJECT_DIR:-/data/reisun-website}"
SITE_DIR="${SITE_DIR:-$PROJECT_DIR/site}"
BRANCH="${BRANCH:-main}"
CONTAINER="${CONTAINER:-reisun-website}"
CHECK_URL="${CHECK_URL:-http://127.0.0.1:8888}"
CANONICAL_ORIGIN="${CANONICAL_ORIGIN:-https://www.reisun.cn}"
CHECK_HOST="${CHECK_HOST:-www.reisun.cn}"
LOCK_FILE="${LOCK_FILE:-/tmp/reisun-website-deploy.lock}"

log() { printf '[%s] %s\n' "$(date '+%F %T')" "$*"; }
fail() { log "错误：$*" >&2; exit 1; }

# Capture only non-secret runtime identity; do not print container environments.
runtime_state() {
    python3 - "$SITE_DIR" "$CONTAINER" "$PROJECT_DIR/nginx/hot-publish.conf" "${DOCKER[@]}" <<'PY'
import hashlib
import json
import pathlib
import subprocess
import sys

site, name, config = pathlib.Path(sys.argv[1]), sys.argv[2], pathlib.Path(sys.argv[3])
docker = sys.argv[4:]
fmt = '{"id":{{json .Id}},"image":{{json .Image}},"name":{{json .Name}},"startedAt":{{json .State.StartedAt}},"status":{{json .State.Status}},"restartCount":{{json .RestartCount}},"ports":{{json .HostConfig.PortBindings}},"mounts":{{json .Mounts}},"networks":{{json .NetworkSettings.Networks}},"project":{{json (index .Config.Labels "com.docker.compose.project")}},"service":{{json (index .Config.Labels "com.docker.compose.service")}},"mode":{{json (index .Config.Labels "io.reisun.static-hot-publish")}}}'
state = json.loads(subprocess.check_output(docker + ['inspect', '--type', 'container', '--format', fmt, name], text=True))
if state['status'] != 'running' or state['project'] != 'reisun' or state['service'] != 'web' or state['mode'] != '1':
    raise SystemExit('Website is not the initialized reisun/web hot-publish runtime; migration is required')
bindings = state['ports'].get('8080/tcp', [])
if not bindings or any(p.get('HostPort') != '8888' for p in bindings) or set(state['networks']) != {'middleware-net'}:
    raise SystemExit('Website port/network differs from the approved production topology')
mounts = [m for m in state['mounts'] if m['Destination'] == '/srv/site']
if len(mounts) != 1 or mounts[0]['Type'] != 'bind' or mounts[0]['RW'] or pathlib.Path(mounts[0]['Source']).resolve() != site.resolve():
    raise SystemExit('Expected read-only release-parent mount is missing')
actual = subprocess.check_output(docker + ['exec', name, 'cat', '/etc/nginx/nginx.conf'])
if hashlib.sha256(actual).digest() != hashlib.sha256(config.read_bytes()).digest():
    raise SystemExit('Nginx configuration differs from source; perform a separate runtime maintenance, not an article publish')
print(json.dumps(state, sort_keys=True, separators=(',', ':')))
PY
}

main() {
    local action="${1:-publish}"
    [[ $# -le 2 ]] || fail '用法：deploy-reisun.sh [publish|status|rollback [release-id]]'
    [[ "$action" == publish || "$action" == status || "$action" == rollback ]] || fail '未知操作'
    [[ "$action" == rollback || $# -le 1 ]] || fail '此操作不接受版本参数'
    for tool in git flock python3 docker sha256sum; do
        command -v "$tool" >/dev/null || fail "缺少 $tool"
    done
    [[ -d "$PROJECT_DIR/.git" ]] || fail '项目Git目录不存在'
    [[ -d "$SITE_DIR" && ! -L "$SITE_DIR" && -L "$SITE_DIR/current" ]] || fail '尚未完成首次目录挂载迁移，请勿使用旧容器发布'
    if docker info >/dev/null 2>&1; then
        DOCKER=(docker)
    else
        command -v sudo >/dev/null || fail '当前用户不能访问Docker'
        DOCKER=(sudo -n docker)
        "${DOCKER[@]}" info >/dev/null 2>&1 || fail '无法非交互访问Docker'
    fi
    exec 9>"$LOCK_FILE"
    flock -n 9 || fail '已有部署正在进行'
    cd "$PROJECT_DIR"
    local before after expected_current release_id archive build_log commit wrapper_sha
    local -a controller
    controller=(python3 "$PROJECT_DIR/scripts/static_release.py" --site-dir "$SITE_DIR" --origin "$CANONICAL_ORIGIN")
    expected_current="$(readlink "$SITE_DIR/current")"
    before="$(runtime_state)" || fail '运行态身份/挂载校验失败'

    if [[ "$action" == status ]]; then
        "${controller[@]}" verify --release "${expected_current#releases/}" --url "$CHECK_URL" --host "$CHECK_HOST" --all-assets
        log "当前版本：$expected_current"
        return
    fi
    if [[ "$action" == rollback ]]; then
        local -a target=()
        [[ $# -lt 2 ]] || target=(--release "$2")
        "${controller[@]}" rollback "${target[@]}" --url "$CHECK_URL" --host "$CHECK_HOST" --expected-current "$expected_current" --all-assets
    else
        [[ "$(git symbolic-ref --quiet --short HEAD)" == "$BRANCH" ]] || fail '分支不符，禁止自动切换'
        [[ -z "$(git status --porcelain --untracked-files=no)" ]] || fail '已跟踪文件有未提交修改，禁止覆盖'
        wrapper_sha="$(sha256sum "$PROJECT_DIR/scripts/deploy-reisun.sh")"
        log "[1/4] 拉取 origin/$BRANCH（仅快进）"
        git pull --ff-only origin "$BRANCH"
        [[ "$wrapper_sha" == "$(sha256sum "$PROJECT_DIR/scripts/deploy-reisun.sh")" ]] || fail '发布脚本已更新，请重新执行同一命令加载新版'
        [[ -z "$(git status --porcelain --untracked-files=no)" ]] || fail '拉取后源码状态异常'
        after="$(runtime_state)" || fail '更新后运行态配置校验失败'
        [[ "$before" == "$after" ]] || fail '构建前官网运行态发生变化，停止发布'
        "${DOCKER[@]}" buildx version >/dev/null || fail '需要Docker Buildx'
        commit="$(git rev-parse HEAD)"
        release_id="$(date -u '+%Y%m%dT%H%M%SZ')-${commit:0:12}-$(python3 -c 'import uuid; print(uuid.uuid4().hex[:8])')"
        mkdir -p "$SITE_DIR/.staging" "$SITE_DIR/logs"
        archive="$SITE_DIR/.staging/$release_id.tar"
        build_log="$SITE_DIR/logs/$release_id.build.log"
        log "[2/4] 构建并导出静态网页：$release_id（当前网站继续运行）"
        # stdout is the real tar stream; shell redirection keeps its ownership
        # with the publisher instead of root. Build diagnostics go elsewhere.
        # Build exclusively from the captured commit. Untracked server config,
        # ignored local files and concurrent working-tree edits are not inputs.
        if ! { git archive --format=tar "$commit" | "${DOCKER[@]}" buildx build --file Dockerfile --target static-artifact --build-arg "SITE_RELEASE_ID=$release_id" --output type=tar,dest=- -; } >"$archive" 2>"$build_log"; then
            fail "构建失败，未切换网站；回执：$build_log"
        fi
        [[ "$(git rev-parse HEAD)" == "$commit" && -z "$(git status --porcelain --untracked-files=no)" ]] || fail '构建期间源码变化，保留旧网站'
        log '[3/4] 安全导入并校验HTML、SEO、地图与资源'
        "${controller[@]}" stage --archive "$archive" --release "$release_id" --commit "$commit"
        after="$(runtime_state)" || fail '切换前运行态校验失败'
        [[ "$before" == "$after" ]] || fail '构建期间官网容器变化，拒绝切换'
        log '[4/4] 原子切换并逐文件验证实际HTTP，失败自动恢复旧版本'
        "${controller[@]}" activate --release "$release_id" --url "$CHECK_URL" --host "$CHECK_HOST" --expected-current "$expected_current" --all-assets
        rm -f -- "$archive"
    fi
    after="$(runtime_state)" || fail '发布后运行态校验失败'
    [[ "$before" == "$after" ]] || fail '运行态身份变化，不能宣称本次发布免重启'
    log "完成：$(readlink "$SITE_DIR/current")；容器ID、镜像、StartedAt与重启计数均未变化"
}

# Parse main in full before it fast-forwards source; script updates are detected.
main "$@"
