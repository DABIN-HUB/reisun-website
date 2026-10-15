# REISUN 第一阶段设计与实施清单

## 目标与边界

依据用户完整设计任务，直接实现可浏览的中文软件定制开发品牌官网。仅本地 UI、静态内容和演示交互；不执行任何 Git 命令、不改 Docker/生产配置、不接后端、不创建或运行测试代码。保留 AstroWind 内容集合、Markdown/MDX、RSS、分类标签、SEO 与 Sitemap。

## 视觉设计

- 深海蓝 #102B50：首屏、页脚、重点方案背景。
- 品牌蓝 #245EEA：主操作与架构连接。
- 冰川青 #63D7E7：深色区域的技术示意强调。
- 冷白 #F4F7FB：内容分区与系统预览背景。
- 墨蓝 #172B46：正文标题。
- 石板灰 #5B6B80：辅助文字。
- 字体：系统中文优先 PingFang SC、Microsoft YaHei、Noto Sans CJK SC，英文使用项目 Inter；中文正文行高 1.8，文章行高 1.95。
- 最大宽度 1200px，左右边距桌面 40px、手机 20px；320px 下 16px。
- 首页左文案右原创分层系统图，服务为开放网格，方案为深色分栏，案例为大图双列，文章为编辑式列表。编号仅用于六步交付流程。
- 主按钮小圆角，不使用通篇胶囊和多余渐变。可见焦点、触摸操作区不少于 44px。仅保留有意义的轻量交互，遵循 reduced-motion。
- 桌面并列信息，移动端重排为顺序叙事、单列案例、纵向流程和可折叠导航；不以缩小 PC 页面代替移动端设计。

## 共享实现契约

复用 PageLayout/Layout、Metadata、Image、Button、StructuredData 与 AstroWind 博客工具。专属展示组件位于 src/components/reisun，避免改动通用示例组件接口。

- `PageIntro.astro`：`title: string; description: string; label?: string`，只有一个 h1，内部无需再写页面头部。
- `CTA.astro`：`title?: string; description?: string`，联系入口 `/contact`。
- `Process.astro`：无必须参数，六步交付流程。
- `SystemPreview.astro`：`variant?: 'industrial' | 'enterprise' | 'contract' | 'mobile'; compact?: boolean`，原生 HTML/CSS/SVG 系统概念示意，明确演示数据。
- 通用类：`rs-container`、`rs-section`、`rs-section-soft`、`rs-section-dark`、`rs-section-heading`、`rs-lead`、`rs-grid-2`、`rs-grid-3`、`rs-card`、`rs-tags`、`rs-tag`、`rs-link`、`rs-button`、`rs-button-secondary`、`rs-detail-grid`、`rs-prose`、`rs-note`。
- 所有新页面用 `~/layouts/PageLayout.astro`；元数据含独立中文 title、description。
- 服务数据导出 `services`，每项 `id,title,summary,icon,scenarios:string[],deliverables:string[]`；首页只依赖 id/title/summary/icon。
- 方案数据导出 `solutions`，每项至少 `id,title,summary,variant`；方案详情 `/solutions/{id}`。
- 案例数据导出 `cases`，每项至少 `id,title,category,summary,stack:string[],variant`；详情 `/cases/{id}`。
- 图标使用已安装 Tabler，添加前核实图标名称。

## 执行步骤

- [x] 阅读 AGENTS.md、CLAUDE.md、frontend-design、项目技能、布局、样式、配置与路由。
- [x] 获取参考网站内容，确认借鉴信息结构而非素材。
- [x] 实现统一色彩、排版、导航、页脚、首页全部区块与原创系统视觉。
- [x] 实现 /services 六类详细服务与真实锚点、技术业务映射和流程。
- [x] 实现 /solutions 四类方案与四个完整详情页。
- [x] 实现 /cases 四个演示案例、可用筛选与四个完整详情页。
- [x] 使用原始内容集合提供至少五篇中文 Markdown/MDX 文章、封面、分类标签、详情和相关推荐；旧英文文章设为草稿。
- [x] 实现 /about，品牌不冒充法人企业、不编造规模、客户和历史。
- [x] 实现 /contact，集中配置占位信息、非真实二维码、表单只本地展示演示提示。
- [x] 将 canonical/site 配置为未来品牌域名，仅修改本地配置；本地预览 noindex；保留 RSS/Sitemap。
- [x] 清除访客入口中的模板品牌与英文演示内容，保留核心博客路由机制。
- [x] 执行 npm run build、npm run check，不新增测试、不运行测试。
- [x] 实际浏览器检查七栏目与详情，检查 1440/1024/768/390/375/320px 溢出、菜单、表单与筛选；检查资源、链接、控制台。
- [x] 保存 PC 首页、手机首页、服务、案例、文章截图，给出实际验证范围。
- [x] 启动 npm run dev 的本地预览、读回 HTTP 与页面，交付中文报告，停止第一阶段。

## 验证记录

最终结果写入 docs/phase-one-delivery.md。浏览器截图存放项目之外的 Hermes scratch 目录，避免构建时将证据变成网站资源。构建、可访问性、浏览器交互与用户最终 UI 审核分别报告，绝不互相替代。
