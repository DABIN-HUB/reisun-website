# 静态热发布改造与运维

## 目标和授权边界

将官网日常发布拆为“构建静态产物 → 独立版本校验 → 原子切换”，不再每次重建 Nginx 容器。首次挂载迁移允许重建一次 **reisun-website**，保持 Oracle `140.238.38.47` 的 `8888:8080`、Compose 项目 `reisun` / 服务 `web`、网络 `middleware-net`。

不改页面、文章、署名、SEO许可规则或业务功能；不改 DNS、证书、Tunnel、OCI网络、防火墙和其他服务；不新增/运行测试代码，不开启本地预览服务。原 Dockerfile 的默认打包模式仍保留。

## 已确认基线

- 源码、远端 main、Oracle 初始提交均为 `e621c94fcae6c7ea728f58a867be7c89ac6b4bbf`，开始时工作区干净。
- 实际目录 `/data/reisun-website`；原生产 `compose.prod.yaml` 与 `deploy-reisun.sh` 是服务器侧配置，不以仓库的通用 Compose 覆盖它们。
- Python 3.9.25、ARM64、Buildx 0.38.0、SELinux Enforcing。
- 已有25容器，只允许官网变更。初次 SSH 超时后相同只读重试成功，失败回执保留。
- 根盘使用91%、约2.9GB可用；/data约62GB可用。新版本与资源放在/data，不清理已有镜像/缓存或迁移Docker存储。
- 新目录 `/data/reisun-website/site` 当前不存在，可作为本项目专属发布根。

## 文件与接口

| 文件                           | 职责                                                                         |
| ------------------------------ | ---------------------------------------------------------------------------- |
| `Dockerfile`                   | 新增仅导出dist的static-artifact目标和独立hot-runtime目标，默认deploy目标保留 |
| `.dockerignore` / `.gitignore` | 排除版本目录、Git元数据和私密本地配置，避免构建递归/提交运行数据             |
| `nginx/hot-publish.conf`       | 固定读取`/srv/site/current`，`/_astro/`读取共享不可变资源，HTML可重新校验    |
| `deploy/compose.hot.yaml`      | 首次迁移用生产配置；只读挂载整个site父目录，保留原端口与网络                 |
| `scripts/static_release.py`    | 安全导入、产物/SEO校验、相对符号链接原子切换、HTTP验收、回滚                 |
| `scripts/deploy-reisun.sh`     | 拉取main、纯静态构建导出、版本发布；不调用compose up/restart                 |

目录约定：

```text
site/
  releases/<release-id>/      # 已校验完整网页
  manifests/<release-id>.json # 内部摘要，不公开
  assets/_astro/             # 保留历次真实哈希资源
  current -> releases/<id>
  previous -> releases/<id>
  .staging/                  # 私有候选与归档
  logs/                      # 构建/发布回执
```

容器必须挂载整个`site`至`/srv/site:ro,z`，不能直接绑定 current 解析后的目标，否则切换可能不可见。SELinux 共享标签只应用于该新增项目目录。共享哈希资源同名不同字节拒绝覆盖，默认不自动删除旧资源和旧版本。

已发布版本冻结为只读文件和目录（0444/0555），候选工作区为0700。构建输入必须来自所记录提交的`git archive`，不能直接构建含未跟踪生产文件的工作目录；这样未提交文章、临时页面和并发工作区修改不会混入版本。导出为真实文件系统tar，不是Docker镜像归档。

## 执行步骤与验收门禁

- [x] 1. 完成生产工具，静态检查与独立审查；保留已有静态构建与默认拒绝索引策略。
- [ ] 2. 冻结源码和原配置摘要，保留旧官网镜像及原脚本/Compose；只读核对紧邻现场。
- [ ] 3. 从批准源码导出真实产物到/data，校验所有HTML、canonical、robots、RSS、地图精确集合及文件摘要。
- [ ] 4. 构建独立Nginx运行镜像，初始化current；用短暂、仅回环暴露的任务专属候选实例验证挂载、SELinux、Nginx与实际HTTP。候选实例结束后只移除其自身。
- [ ] 5. 仅迁移原官网容器一次，读回端口、网络、只读挂载、镜像、StartedAt与重启计数，并与24个保护容器基线比较。
- [ ] 6. 使用正式发布命令对同一批准源码再次构建发布，利用RSS真实生成时间/内容变化验证切换；不制造假文章或测试资源。容器ID、镜像、StartedAt、RestartCount必须不变。
- [ ] 7. 实际回滚上一静态版本并恢复新版，重复HTTP/摘要检查，证明回滚同样不重启容器。
- [ ] 8. 记录真实命令、源码、目录/镜像摘要、HTTP与保护证据，更新本文件状态。公网域名读回与源站验收分别报告。

## 日常命令（迁移后）

服务器入口保留：

```bash
bash /data/reisun-website/deploy-reisun.sh
bash /data/reisun-website/deploy-reisun.sh status
bash /data/reisun-website/deploy-reisun.sh rollback
```

`publish`是默认动作。发布失败不得切走当前版本；切换后HTTP验证失败自动恢复旧current并核验恢复。运行镜像或Nginx配置变化不属于普通文章发布，工具应拒绝不匹配的运行态并要求单独维护。现有脚本锁继续防止并发部署，控制器另有目录锁与current比较交换。

生产构建显式传入`SITE_ENV=production`；仍由现有HTML metadata决定公开范围和sitemap，不能为了热发布放开整站。RSS/robots/maps均随同一版本切换。新构建仅通过独立参数打破构建阶段缓存，以便同源码再发布仍产生真实新RSS时间；依赖阶段可缓存。

RSS校验频道、Atom自指、文章链接与GUID的一致性。robots校验只支持有界的字面路径前缀、空Disallow和Allow；高级通配符、编码路径等不支持的规则会拒绝发布而不是猜测含义。普通文章发布不需要修改这些规则。

## 首次迁移回滚

迁移前保存原生产Compose/脚本与运行镜像，记录确切SHA。迁移失败时，在确认配置和继任容器属于本次事务、前向Compose操作已经稳定后，才恢复原官网配置/镜像，并使用原Compose仅重建`web`。未知替换或前向完成状态不明时停止自动回退，保留现场供人工处理，不能覆盖其他操作。不停止其他服务、不删除数据或历史版本。首次迁移和常规静态版本回滚是两类操作，不能混为一谈。正常SIGTERM/SIGHUP会进入恢复处理；SIGKILL、断电不承诺跨两个链接/文件的事务性。

## 当前状态

**源码实现、静态门禁和独立审查完成，生产迁移待执行。** Astro检查134文件零错误/警告，ESLint通过；生产构建37HTML、14可索引、23noindex，地图14条精确匹配；预览37noindex且无地图。发布与迁移代码均在实际Python3.9.25上编译通过。全仓check仅受100个原有、未修改文件的Prettier问题阻断，本轮文件没有格式失败，未批量修改旧文件。尚未声称线上已经切换；完成后回填实际发布和免重启验收。
