# REISUN UI-REVIEW-R2 定点精修计划

## 范围与基线

- 仅改善既有官网 UI，不重建站点、不改路由、品牌配色、原始业务数据或文章事实。
- 不执行任何 Git 命令，不修改 Docker、服务器、Cloudflare、联系方式、后端或依赖。不编写或运行测试代码。
- 保留 Astro SSG、内容集合、Markdown/MDX、分类/标签、RSS、Sitemap。
- 已读取实际 AGENTS.md、CLAUDE.md、第一阶段交付记录、frontend-design 及品牌 UI 技能，按项目组件边界实现。
- 本轮修改前，实际构建预览 HTTP 200；已采集七栏目 1440/390px 基线截图与 DOM 尺寸。
- 首页基线：1440px 高 6588px，390px 高 11003px。开发服务页基线：1440px 高 7969px，390px 高 12908px。高度只作观察指标，不是删减内容或压小字号的目标。
- 原始源码/路由/哈希与本轮截图保存在 Hermes scratch/reisun-ui-r2/baseline，禁止覆盖第一阶段证据。

## 设计约定

继续使用深海蓝 #102b50、科技蓝 #245eea、冷白 #f4f7fb 与既有字体/1200px 容器。保留 Header、Logo、首页 HeroGraphic 原作以及全部既有路由。

1. 首页：服务保持六项；合并手机端重复入口，紧凑排版而不缩小正文；四案例全部展示；工业方案用业务链路图避免与案例重复堆叠仪表盘；首页最新三篇文章采用手机编辑式摘要行，完整摘要仍在文章列表与详情；流程、关于、CTA、Footer 全保留。
2. 服务：保留数据中的全部描述、场景、能力、交付物、技术方向、范围说明及关联方案。目录采用真实锚点，桌面定位导航与手机可见六项目录；将问题/能力/技术/交付/咨询分层。工业、ERP/OA、小程序三种服务增加原创静态业务链路图；其余模块采用交付清单/能力分栏等不同节奏。
3. 栏目首屏：共享 PageIntro 的标题/描述/语义不变，增加显式可选 variant。services=工程交付图；solutions=深蓝业务链路；cases=作品索引叠窗；articles=编辑式阅读索引；about=品牌理念构图；contact=沟通准备纸页。手机转为紧凑语义提示，不塞入缩小的大图。
4. 系统概念界面：重组工业状态、数据链路、带单位趋势与模拟告警；ERP 保留待办并增加清楚的单据关联；合同标明已完成/当前/待处理节点；小程序放大手机、增加关联后台办理路径。手机隐藏非必要后台侧栏，重组内容而不把字号缩成装饰。所有演示标识保留。
5. 文章：只改组件表现，不修改任何 Markdown/MDX 内容。明确分类与标签、封面/标题/日期/阅读时间层级；优化代码与图示容器、文章目录/相邻及相关文章；保留原生博客生成工具。
6. 联系：只改布局与说明层级，不改集中品牌数据与演示表单提交逻辑、提示内容及原有输入保持行为。

## 并行责任与接口

- 主工作流：src/pages/index.astro、PageIntro.astro、SystemPreview.astro、solutions/index.astro 与 cases/index.astro 的 PageIntro variant、必要的主页范围样式，以及集成/构建/浏览器验收/交付记录。
- 服务工作流：只编辑 src/pages/services.astro；新增 src/components/reisun/ServiceScenario.astro。场景组件 Props={variant:'industrial'|'enterprise'|'mobile'; compact?:boolean}；默认浅色静态场景图；compact 供首页工业方案复用，尺寸自然流式、无脚本、语义文字不能全部画进 SVG；services 的 PageIntro 显式 variant="services"。
- 博客工作流：只编辑 src/components/blog/ 内表现组件；Grid.astro 新增可选 compact?:boolean，默认 false；首页以 compact 启用手机摘要行，桌面仍三列。Archive 的 PageIntro 显式 variant="articles"。不得修改 data/post、utils/blog.ts、内容 schema 或页面路由。
- 品牌/联系工作流：只编辑 src/pages/about.astro、src/pages/contact.astro 的展示；分别传 variant="about"/"contact"。不改联系页 script、brand.ts、表单字段、提示语、action 或联网逻辑。
- 各工作流先完整读取相关源文件与现有调用，不改共享 ownership 外文件。不依赖新包，不运行构建/测试，统一集成后运行质量检查。

## 执行与验收

- [x] 读取约定、源代码、交付记录和技能；保护源码与本轮基线。
- [x] R2-01 首页手机阅读节奏。
- [x] R2-02 服务内容分层、目录定位和三种业务场景图。
- [x] R2-03 六种栏目首屏差异化。
- [x] R2-04 四种系统概念画面重组。
- [x] R2-05 文章列表、正文、代码图示与内部阅读导航。
- [x] R2-06 联系占位与演示说明布局。
- [x] 对修改文件做定点格式检查；不处理 104 个无关模板文件。
- [x] 依次真实执行 npm run build、npm run check:astro、npm run check:eslint。
- [x] 从本轮最终 dist 验证 1440/1024/768/390/375/320px：首页、服务、方案、案例、博客、正文、联系与重点详情；检查页面宽度、图片、标题断词、图形/文字重叠、点击目标、手机菜单、案例筛选、表单不联网与返回后交互。
- [x] 从最终构建生成桌面/手机截图，原生像素审阅并修复必要问题；若重建，则刷新受影响证据与验收。
- [x] 比较受保护源码哈希及路由文件列表；记录实际命令、结果、截图身份、未解决问题与预览地址。
- [x] 提供本轮交付并停止；不进入生产内容替换或部署。
