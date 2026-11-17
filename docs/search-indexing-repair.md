# 搜索收录配置修复与验收

## 范围与当前基线

- 源码使用当前已确认工作区 `F:/ideaWorkSpace/reisun-website`，不采用任务中的目录占位符。
- 分支 `main`，开始时工作区干净；当前 HEAD `81c50bdfe816d8f13d02dc9fa5f31b34a824e686`。
- Astro 7 静态生成，既有命令 `npm run build`，输出目录 `dist`；仓库 CI 仅检查和构建，没有部署步骤。
- 仓库同时含 Cloudflare Workers、Netlify、Vercel 与 Docker/Nginx 模板；模板存在不等于实际线上采用该平台，线上平台需结合只读响应/DNS证据，不能由模板猜测。
- 只改收录/主站 URL 与构建防护，不改布局、可见文案、业务功能、域名 DNS、证书或线上生产设置；不注册、不付费、不提交搜索引擎收录。

## 执行步骤

1. 复测 www / 裸域的 GET、重定向、响应头、robots、sitemap，记录证书和 DNS；确认当前分支和构建链。
2. 追踪 config.yaml → AstroWind 虚拟配置 → Metadata.astro / 页面覆盖，核实 noindex 来自源码还是响应头。
3. 仅允许生产构建的首页、服务、方案目录/详情和技术文章目录/已发布文章具备 index 条件；其他页面、显式 noindex、预览/开发构建保持禁止索引。
4. 统一正式站点为 `https://www.reisun.cn/`；保留根路径斜杠、其他现有页面无尾斜杠，canonical 自指且无跟踪参数。
5. 地图按实际生成 HTML 的 robots 与公开范围过滤，避免地图包含 noindex；预览不输出地图。robots 不能替代 HTML noindex。
6. 分别运行既有生产构建与真实预览构建，逐页检查 HTML robots/canonical、robots.txt、索引与子地图、页面路径和未改动正文。
7. 对线上未生效部分独立报告；实际托管未确认或需要后台权限时给出可核对的设置与回滚步骤，不执行生产改动。
8. 只有获准部署且生产验证全部通过之后，才提供百度/Bing 验证与提交步骤；本轮不提前提交。

## 实际结果

### 状态与根因

- **源码修复及本地产物/HTTP验收完成；未部署，线上修复未完成。** 本轮未提交 Git、未 push、未修改 DNS/证书/后台设置，也未注册或提交搜索引擎收录。
- 原始生产构建的 35 个 HTML 全带 `noindex`。直接来源是 `src/config.yaml` 的默认 robots 及博客配置，经过 AstroWind 虚拟配置、页面布局和 `Metadata.astro` 输出。此前成功的线上 GET 在代表页面未发现 `X-Robots-Tag`，但 HTML 明确为 `noindex, follow`，不能将已确认的源码问题归因于响应头或 DNS。
- 默认仍然拒绝索引：只有**生产上下文 + 本轮公开路径范围 + 页面/博客显式 index 许可**同时成立才开放；显式 `robots.index: false` 不被覆盖。未知页面不会因为落在某个目录就自动开放。
- 公开范围为首页、服务页、方案目录及现有四个方案、文章目录及现有五篇已发布文章，共 13 个 URL。案例、关于、联系、分类、标签、隐私、条款及 404 等其余 22 页保持 `noindex`，不进 sitemap。没有改动方案/案例的概念演示属性。
- 每页 canonical 自指 `https://www.reisun.cn` 上的原路径，不带查询/片段；首页保留 `/`，非首页无尾斜杠。35 个现有 HTML 路由文件保持不变。

### 修改文件（14 个，其中生产文件 13 个）

| 文件                                    | 修改                                                                                         |
| --------------------------------------- | -------------------------------------------------------------------------------------------- |
| `astro.config.ts`                       | 接入公开页面过滤及最终收录产物集成，保持原静态构建与尾斜杠规则                               |
| `package.json`                          | 增加 `build:preview`，没有新增依赖或修改锁文件                                               |
| `public/robots.txt`                     | 声明 www sitemap，继续允许抓取以读取真实 HTML robots                                         |
| `src/config.yaml`                       | 正式 site 改为 www；保留默认拒绝，明确博客许可                                               |
| `src/components/common/Metadata.astro`  | 环境、公开范围与显式页面许可三重门控；公开页面使用自身 canonical                             |
| `src/pages/index.astro`                 | 仅增加首页 robots 许可                                                                       |
| `src/pages/services.astro`              | 仅增加服务页 robots 许可                                                                     |
| `src/pages/solutions/index.astro`       | 仅增加方案目录 robots 许可                                                                   |
| `src/pages/solutions/[slug].astro`      | 仅增加方案详情 robots 许可                                                                   |
| `src/utils/permalinks.ts`               | 统一主站、根路径和非根尾斜杠，canonical 去除查询/片段                                        |
| `src/utils/indexing.ts`                 | 新增构建环境与公开路径策略                                                                   |
| `vendor/integration/index.ts`           | 移除旧的无条件 sitemap/robots 追加，避免双写                                                 |
| `vendor/integration/search-indexing.ts` | 最终 HTML robots 过滤 sitemap；统一根 URL；预览移除地图及声明、生成额外 noindex headers 产物 |
| `docs/search-indexing-repair.md`        | 本记录、实测输出及待审托管/回滚步骤                                                          |

### 真实构建与质量检查

- `npm run check:astro`：退出 0；`npm run check:eslint`：退出 0；`npm run build`：退出 0，生成 35 页。
- `npm run build:preview`：退出 0；下面各上下文均实际执行完整 Astro 构建，不只是模拟函数返回值。
- `npm run check`：退出 1，失败原因是 **100 个未修改文件的既有 Prettier 问题**；与本轮修改清单交集为 0。没有批量格式化模板文件，不宣称全仓 check 通过。
- 本轮支持 Prettier 的修改文件进行定点检查；纯文本 `robots.txt` 通过产物内容检查。没有创建、修改或运行测试类、测试套件或仓库内测试脚本。
- 最初默认工具链为 Node `v22.22.0`、npm `10.9.4`，低于项目声明的 `>=22.22.3`。随后只读发现本机已安装 Node `v24.22.0`、npm `11.19.1`，通过每个子进程独立的临时 PATH 完整重跑类型检查、ESLint、下表八个构建上下文、恢复生产构建及 HTTP 验收，全部符合下述结果；最终 `dist` 是该受支持版本的生产产物。未安装工具、未运行 `nvm use`，没有切换用户全局 Node。正式平台仍需核对实际构建版本。

| 实际构建上下文/命令                                                                                  | HTML | index | noindex | sitemap URL |
| ---------------------------------------------------------------------------------------------------- | ---: | ----: | ------: | ----------: |
| 默认 `npm run build`                                                                                 |   35 |    13 |      22 |          13 |
| `npm run build:preview`                                                                              |   35 |     0 |      35 |           0 |
| `SITE_ENV=preview npm run build`                                                                     |   35 |     0 |      35 |           0 |
| `SITE_ENV=production VERCEL_ENV=preview npm run build`                                               |   35 |     0 |      35 |           0 |
| `CI=1 npm run build`（身份不明）                                                                     |   35 |     0 |      35 |           0 |
| `SITE_ENV=production CF_PAGES=1 CF_PAGES_BRANCH=review SITE_PRODUCTION_BRANCH=main npm run build`    |   35 |     0 |      35 |           0 |
| `CI=1 SITE_ENV=production CF_PAGES=1 CF_PAGES_BRANCH=main SITE_PRODUCTION_BRANCH=main npm run build` |   35 |    13 |      22 |          13 |
| `SITE_ENV=production CONTEXT=deploy-preview npm run build`                                           |   35 |     0 |      35 |           0 |

上述提供商变量仅用于真实构建上下文验收，不意味着已确认当前线上采用该平台或采用 main 为生产分支。最终又运行默认生产构建，并确认当前 `dist` 恢复为 13 个可索引 URL 的产物。

- 逐页核对 35 个 canonical，全部与该页自身 www 路径一致。
- 索引只引用 `https://www.reisun.cn/sitemap-0.xml`，子地图 13 条、无重复，与最终 HTML 可索引 canonical 集合精确相等。
- 预览 35 页全部 `noindex, nofollow`；没有索引/子地图，robots 不声明 sitemap。预览 `_headers` 增加 `X-Robots-Tag: noindex, nofollow`，生产 `_headers` 没有这条限制。
- `_headers` 是否实际形成响应头取决于已确认的托管平台。Astro 本地 preview 不应用该文件，实测其预览响应头没有该字段，但所有 HTML 已具有 noindex；未将产物中的声明冒充线上响应头实测。
- 保留原生 sitemap 集成，并在写出后仅修正根 `<loc>` 的斜杠：当前插件在 `trailingSlash: never` 下会在 serialize 之后剥掉根斜杠。初次严格集合检查因此失败，修正后重新构建并通过；没有修改 node_modules 或盲目替换地图内容。
- 与原始生产基线比较，35 页 body 只在预期的主站域名及根 URL 斜杠规范化后逐字节一致；对比的 37 个既有 CSS、JS、图片和字体文件全部字节一致。未改设计、可见文案、交互和联系方式。

### 本地真实 HTTP 验收

使用任务独占的 Astro programmatic preview 分别服务生产与真实预览产物；不是把读取磁盘当作 HTTP 请求。最终又在 Node `v24.22.0` 下完成 16 个 GET，十个 HTML 响应逐字节匹配对应构建产物；受支持版本重建的 35 个 HTML 与早前产物亦逐字节一致。GET 结果：

| 路径                                            | 生产 HTTP | 生产 robots     | 生产 canonical                                                       | X-Robots-Tag |
| ----------------------------------------------- | --------: | --------------- | -------------------------------------------------------------------- | ------------ |
| `/`                                             |       200 | `index, follow` | `https://www.reisun.cn/`                                             | 未发现       |
| `/services`                                     |       200 | `index, follow` | `https://www.reisun.cn/services`                                     | 未发现       |
| `/solutions/industrial`                         |       200 | `index, follow` | `https://www.reisun.cn/solutions/industrial`                         | 未发现       |
| `/blog/java-industrial-collection-architecture` |       200 | `index, follow` | `https://www.reisun.cn/blog/java-industrial-collection-architecture` | 未发现       |
| `/services?seo_audit=1&source=local`            |       200 | `index, follow` | `https://www.reisun.cn/services`                                     | 未发现       |

相同五个请求在真实预览产物上均返回 200、`noindex, nofollow`，canonical 仍为对应正式地址；生产 robots/索引/子地图均 200，预览 robots 200、索引及子地图均 404。此处带查询请求只验证本地 canonical 去参数，**不等于裸域 301 验收**。

### 线上只读结果与边界

完整成功基线为 **2026-11-17 13:51—13:58（北京时间）**：

- www 首页、服务、工业方案、指定技术文章、robots、sitemap 索引 GET 均为 200；四个 HTML 仍 `noindex, follow`，canonical 指向裸域，未发现 `X-Robots-Tag`。
- www HTTP 也返回 200，当次没有观察到强制 HTTPS。
- 索引引用裸域子地图，因裸域不可达而无法沿原链接完整遍历。仅诊断性读取 www 同路径子地图成功，含 34 个裸域 URL；不能把此回退算作原索引目标成功。
- 两个公共 DoH 的裸域 A/AAAA/CNAME 返回 NOERROR/NODATA，本机解析失败；不是 NXDOMAIN。没有取得裸域 HTTPS 的首个 HTTP 响应，因此不能确认裸域 301、路径/查询保留或无循环。
- www 证书用当前 DNS 的两个 IPv4、原 hostname/SNI 及默认信任链实际验证成功，SAN 含 `*.reisun.cn` 和 `reisun.cn`，到期 `2027-01-08 02:01:16 UTC`。这**不证明裸域 TLS 已通过**。
- Cloudflare NS/响应头只能确认 DNS/边缘迹象，**源站托管平台、项目绑定及实际部署流水线仍未确认**。

交付前又进行了不同通道复测：Python urllib 四个 www 请求均收到 403；原生 curl 在部分请求收到 200 头、首页仍读到旧 noindex/裸域 canonical，但四个 curl 请求均超时（退出 28），没有得到完整成功组。这些按通道分别保存，不丢弃失败、不当作新版线上验收，也不直接断言源站本身统一返回 403/503。没有部署，自然不能报告线上已修复。

### 待审核托管操作：现在不执行

1. **先确认真实部署项目。** 需要管理员提供 www 对应的平台/项目名或非敏感域名绑定截图、生产分支与构建命令。不要提供密钥。仓库的 Workers/Netlify/Vercel/Docker 文件和 CI 检查不能代替真实绑定证据。
2. **生产/预览构建分离。** 正式项目继续 `npm run build`、发布目录 `dist`，在正式构建上下文明确 `SITE_ENV=production`；预览使用 `npm run build:preview` 或 `SITE_ENV=preview`。若确认是 Cloudflare Pages，还需把 `SITE_PRODUCTION_BRANCH` 设为其后台真实生产分支，不能从本地 main 自动推断。不得向预览全局继承生产 opt-in；身份不明 CI 会安全地保持 noindex。
3. **裸域 DNS 与证书必须先具备接入条件。** 若确认使用 Cloudflare 代理层进行纯跳转，且管理员确认裸域没有其他源站用途，当前又没有 A/AAAA/CNAME，可按 Cloudflare 官方纯跳转方案待审新增 `A`、名称 `@`、地址 `192.0.2.1`、代理 `Proxied`。这是官方保留占位地址，只供边缘规则接管，**不是 www 的源站 IP**。不要改 www 现有记录，不要照搬文档给 www 也设占位地址，不要将观测到的 Cloudflare 边缘 IP 当源站。必须核对 SSL/TLS → Edge Certificates 中裸域证书处于有效状态；证书 SAN 包含裸域不等于其接入已验证。
4. **确认由 Cloudflare 边缘执行时的待审 301。** 控制台选 `reisun.cn` → Rules → Overview → Create rule → Redirect Rule，选择 Custom filter expression。条件 `(http.host eq "reisun.cn")`；类型 Dynamic；目标表达式 `concat("https://www.reisun.cn", http.request.uri.path)`；状态 `301`；Preserve query string 开启。条件仅匹配裸域，目标 www 不再命中，从规则本身避免循环。先保存草稿，获得授权后才部署，且检查与现有跳转规则的顺序和冲突。
5. 早前 GET 观察到 HTTP www 未强制 HTTPS：如管理员确认同一边缘规则负责，可另审仅匹配 `http.host eq "www.reisun.cn"` 且请求方案为 `http` 的规则，直接 301 到相同 HTTPS www 路径并保留查询。不要为此擅自打开影响其他子域的全局设置。
6. **不是 Cloudflare 边缘托管/代理时，不执行第 3—5 项。** 在确认的平台域名重定向设置或实际服务实例配置中实现等价的“裸域 → HTTPS www、301、保留路径/查询”。目前不足以选择或修改本仓 Nginx/Workers/Netlify/Vercel 模板，不提交可能误用的激活配置。

官方核对资料（本轮直接读取成功，2026-11-17）：

- <https://developers.cloudflare.com/fundamentals/manage-domains/redirect-domain/>
- <https://developers.cloudflare.com/rules/url-forwarding/single-redirects/create-dashboard/>

### 回滚与获准部署后的验收

- 源码变更尚未提交；原始受影响配置快照在独立证据目录 `source-before/`，当前基准 commit 见本文开头。若需回退，只恢复本轮明确清单，并保留后续用户改动；不要执行全仓 reset。后续若提交，使用独立提交再按审核结果 revert。
- 部署回滚：由管理员保留当前线上发布 ID/构建产物和原环境变量，然后切回上一发布并恢复变量。未取得后台权限，不能在这里编造实际发布 ID。
- 重定向回滚：禁用/删除本次新增规则；先导出原 DNS 记录，再恢复原值。若仅新增了纯跳转 `A @ 192.0.2.1` 且原来不存在，则只删除该条；不动 www、MX/TXT 或无关证书配置。301 可能被浏览器/中间缓存保留，应以新客户端及无缓存 GET 辅助判断。
- 只有授权部署并确认域名绑定/DNS/TLS后，复测 www 四个代表页完整 GET 200、无任何大小写形式的 `X-Robots-Tag: noindex`、HTML index 且 canonical 自指；robots、索引与所有子地图均可沿真实链接读取，地图集合与可索引页一致。
- 裸域至少 GET `/` 与 `/services?seo_audit=1&source=apex`，手动记录首跳和完整链，必须首跳直接 `301` 到 `https://www.reisun.cn/` 与 `https://www.reisun.cn/services?seo_audit=1&source=apex`，保留路径及原查询，无循环，最终 200。当前这项为**未验证**，不得用本地 mock 或 hosts 改写冒充成功。
- 生产全部通过后才提供百度资源平台和 Bing 站长工具的站点验证与提交位置。本轮不注册、不收费、不提前提交；配置合格也不保证搜索引擎实际收录、收录时间或排名。

### 独立证据

- 本轮源码基线、完整构建日志、逐页 JSON、八个上下文与恢复生产构建结果、本地 HTTP、通道失败、正文及资源一致性：`C:/Users/wangbin/AppData/Local/hermes/cache/scratch/search-indexing-0c8e51be/`。
- 较早完整线上基线：`C:/Users/wangbin/AppData/Local/hermes/cache/scratch/reisun-readonly-20261117-135007-a442abd3/`，文件 `results.json`、`conclusion.zh-CN.md`、`verification.json`。
- 独立只读代码复核已完成：`passed: true`，安全问题 0、逻辑阻断项 0；复核包括完整差异和两个新增生产文件。父任务另核对 13 个生产文件 SHA-256，与送审快照完全一致；复核不是线上验收。
- 复核保留三项发布注意：实际平台/生产分支/环境变量与 `_headers` 支持需管理员确认；以后若引入修改 HTML head 的构建集成，需重新检查 sitemap 过滤时序及最终集合；普通生产构建产物不能直接作为安全预览发布，预览须使用专用命令或明确非生产环境。
