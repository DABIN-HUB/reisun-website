# Phase 3 案例依据与公开边界

## 本轮结论

四案均保持 **C：概念演示**，数据统一使用 `ContentEvidence` 与 `evidenceStatus.concept`，中文状态由 `evidenceLabels` 提供；原有 `label: '演示案例'`、案例 id、路由、七部分内容和四种系统示意保留。

本轮未获得足够证据，将任何一案认定为已核实的 Java 业务系统、现场协议实现或真实商业交付；这不等于断言没有真实项目。没有生成未经依据支持的真实案例草稿，也没有将概念内容升级为 B 技术能力或 A 商业事实。

本记录只依据获授权的当前官网仓库。Phase 1 / R2 记录用于辨认历史设计与交付范围，不冒充本轮运行验证。其他本地工程、个人记忆、技术名词或服务定位均不作为实施证据。

## 共同依据与表达规则

- `src/data/cases.ts`：四案的虚拟背景、痛点、方案、拟议功能、架构选型、页面规划、预期价值、演示边界及主题关联。
- `src/data/evidence.ts`：统一 `ContentEvidence`、`evidenceStatus`、`evidenceLabels`。各案 `sources` 为本地审计索引，`pending` 为待收集材料，不等于已拥有原件或公开授权。
- `src/components/reisun/SystemPreview.astro`：按 `variant` 选择四种 Astro 静态概念界面；共同显示“演示界面”“全部模拟”和“非真实系统截图”。以下按分支名定位组件，不把源码选择标记当作网页锚点。
- `src/pages/cases/index.astro`：保留 `CaseFilter` 和全部 compact 系统示意，展示演示标签、统一概念状态、虚拟摘要和技术设计选型提示；元数据不暗示商业交付。
- `src/pages/cases/[slug].astro`：由四个 id 生成详情；保留背景、痛点、方案、功能、架构、界面、价值七部分。只展示证据状态和摘要，不渲染 `evidence.sources`、原始材料、内部地址或源文件链接。
- 技术栈和架构描述是拟议设计选型，不是本站真实业务技术栈或客户项目使用履历；本站的概念画面由 Astro 静态组件呈现。
- “核心功能”和页面说明是规划范围，代表性概念图不证明每一项功能已有界面或实现。“项目价值”均为预期设计目标，不是测得的效率、收益或交付成果。
- 关联服务与方案从现有类型化数据读取，文稿通过 `findPostsBySlugs` 和原生 `getPermalink` 解析已公开文章，尊重博客路由开关与草稿过滤；主题关联不是实现、客户或效果证据。

## 逐案记录

### 1. 工业物联网采集与监控平台

- **标识与状态**：`industrial-iot-monitoring`；`/cases/industrial-iot-monitoring`；C 概念演示，保留“演示案例”。
- **精确本仓依据**：`src/data/cases.ts` 中 `id: 'industrial-iot-monitoring'` 的记录；`src/components/reisun/SystemPreview.astro` 的 `variant === 'industrial'` 分支；`src/pages/cases/[slug].astro` 的动态 `SystemPreview` 调用；索引页的 compact 调用。
- **当前可验证结论**：源码定义了设备、点位、告警及状态分层的设计说明；组件包含静态设备/点位示例、模拟温度曲线、模拟连接中断和待确认告警。示例数量与曲线不是设备采集、压力验证或长期运行记录。
- **不能推断**：Java 采集服务已经实现；MQTT、Modbus TCP 或文章涉及的 OPC UA 已完成兼容验收；真实设备读写、采样新鲜度、断线恢复、吞吐、生产安全等级或已完成 MES 集成。组件中的协议文字不构成握手或采集证据。
- **真实案例所需材料与授权**：明确授权的实现文件范围及版本、脱敏设备型号和协议范围、点位定义与单位/时间/质量核对记录、异常恢复及运行观察记录；如描述商业成果，还需项目角色、实施范围、客户或权利人公开授权、指标口径和可追溯记录。只读采集不隐含设备控制权限。
- **内容关联**：方案 `industrial`；服务 `industrial-iot`、`data-integration`、`java-enterprise`；文稿 `java-industrial-collection-architecture`、`modbus-tcp-opc-ua-integration`。

### 2. ERP 企业运营协同系统

- **标识与状态**：`enterprise-erp`；`/cases/enterprise-erp`；C 概念演示，保留“演示案例”。
- **精确本仓依据**：`src/data/cases.ts` 中 `id: 'enterprise-erp'` 的记录；`src/components/reisun/SystemPreview.astro` 的 `variant === 'enterprise'` 分支；`src/pages/cases/[slug].astro` 和 `src/pages/cases/index.astro` 对应动态示意调用。
- **当前可验证结论**：源码描述主数据、订单、采购、库存和岗位权限的拟议业务模型；界面包含模拟单据数量、分类柱形、待办与采购到入库再汇总的静态链路。
- **不能推断**：订单/库存模块已经运行；事务一致性、冲销、并发库存、组织权限和审计得到实际验证；真实企业财务结果、库存准确率、录入效率提升或财税系统接入完成。
- **真实案例所需材料与授权**：获授权的业务模块实现说明、脱敏单据规则与组织权限矩阵、库存变动/冲销/对账的核验记录、迁移或业务确认材料；若陈述效果，需前后口径一致的记录及公开许可。只接受经权利人整理的必要技术材料，不读取客户数据库或真实经营数据。
- **内容关联**：方案 `enterprise`；服务 `enterprise-management`、`java-enterprise`、`data-integration`；文稿 `spring-boot-enterprise-architecture`、`enterprise-digital-transformation`。

### 3. 合同审批与履约流程平台

- **标识与状态**：`contract-workflow`；`/cases/contract-workflow`；C 概念演示，保留“演示案例”。
- **精确本仓依据**：`src/data/cases.ts` 中 `id: 'contract-workflow'` 的记录；`src/components/reisun/SystemPreview.astro` 的 `approvalSteps` 常量和 `variant === 'contract'` 分支；`src/pages/cases/[slug].astro` 和索引页的动态示意调用。
- **当前可验证结论**：源码描述版本绑定审批、条件节点与履约事项的设计；界面以固定演示记录呈现已发起、审核中、待处理和未归档节点。节点状态是静态示意，不是发生过的审批。
- **不能推断**：流程引擎或状态机已经运行；附件访问控制、版本快照或审计完整性已有实现验证；真实合同已获批准、履约效果得到改善，或已接入电子签章、实名认证、证据保全。
- **真实案例所需材料与授权**：不含合同原件的获授权技术说明、脱敏版本关联和审批状态核验记录、权限与附件访问策略说明；涉及第三方集成时需其明确范围及可公开核验结论。案例文字、匿名处理和示意素材须分别确认公开权限，不以匿名为默认授权。
- **内容关联**：方案 `contract`；服务 `enterprise-management`、`java-enterprise`、`data-integration`；文稿 `spring-boot-enterprise-architecture`、`enterprise-digital-transformation`。

### 4. 小程序预约与服务管理

- **标识与状态**：`mobile-service`；`/cases/mobile-service`；C 概念演示，保留“演示案例”。
- **精确本仓依据**：`src/data/cases.ts` 中 `id: 'mobile-service'` 的记录；`src/components/reisun/SystemPreview.astro` 的 `variant === 'mobile'` 分支；`src/pages/cases/[slug].astro` 和索引页的动态示意调用。
- **当前可验证结论**：源码包含虚拟门店预约、容量、排期、进度与跟进的规划；组件呈现网页中的手机造型和“移动提交→后台受理→进度反馈”静态链路，并明确“不实际办理业务”。预约确认、排期等文字规划不等于已有独立页面或小程序包。
- **不能推断**：有可运行或已发布的小程序；预约容量、防重复提交或并发控制已得到验证；登录、订阅通知、支付、平台审核已完成；真实用户满意度、转化率或经营收益得到提升。
- **真实案例所需材料与授权**：获授权的小程序/业务后端范围、脱敏预约状态/容量/幂等核验记录、平台接入范围和审核情况；主体与素材公开权限、隐私合规责任需用户确认。仅需公开状态说明，不读取用户资料、平台密钥、支付凭据或真实订单。
- **内容关联**：方案 `mobile`；服务 `miniapp-mobile`、`java-enterprise`；文稿 `spring-boot-enterprise-architecture`、`docker-deployment-practice`。部署文稿是延伸阅读，不证明本案例已部署。

## 后续取证与公开授权门槛

1. 本轮唯一授权工程是当前官网。其他本地工程只有在用户**明确给出具体工程路径及允许读取的子目录/文件范围**后，才可在该范围内只读取证；不得扫描相邻目录、修改其他工程、按记忆猜路径或把可访问视作授权。
2. **禁读、禁复制、禁公开**：`.env`、Token/密钥、用户隐私、客户数据库、商业合同原件、真实客户名称和联系资料、生产地址、内部网络配置及未公开业务数据。现有取证授权不覆盖这些内容；应由用户或权利人先提供去敏的必要技术说明，不自行读取原件再脱敏。
3. 源码存在、局部核验、设备联调、生产运行、商业交付、对外公开是不同结论。取证许可不等于源码、截图、客户细节或指标的发布许可；即使技术事实成立，也不能自动作为商业业绩公开。
4. 真实案例须先确认项目关系、可公开实施范围、证据版本、匿名规则、素材版权及权利人许可；效果须有基线、观察期、口径和可追溯结论。未取得前保持 C，不编客户、上线时间、团队、规模、成绩、评价或 Logo。
5. 当前页面仅展示安全摘要与内容关联，不提供 `sources` 路径原件下载、内部地址或敏感细节。资料补充后先形成经授权的待审核稿，再由用户决定是否公开；不自动替换现有四案。

## 案例分项与主流程验证边界

- 案例分项仅修改 `src/data/cases.ts`、`src/pages/cases/index.astro`、`src/pages/cases/[slug].astro`，新增本文件；共享证据定义、系统示意组件、配置、依赖和其他工程未由本工作流修改。
- 四案完整填写可选 `evidence`、`solutionIds`、`serviceIds`、`postSlugs`；现有字段和数据结构继续兼容旧消费者。
- 源码人工核对：四个 id 与演示标签、七个章节及其锚点、全部示意调用保留；关联目标对应现有服务 id、方案 id 与五篇文章标识。文章标题读取源内容，不维护第二份标题。
- 目录原咨询按钮改为跳转相关内容，保留页尾共享 CTA；不新增重复咨询入口。正式联系配置与共享 CTA 状态由主工作流处理。
- 已对上述四个文件执行本地已安装 Prettier 的定点 `--write` 与 `--check`，退出码 0，输出 `All matched files use Prettier code style!`。分项工作没有运行 Git、测试、build / check 或部署，不沿用 R2 结果证明本轮通过；主流程随后实际完成 Astro / ESLint / build、35 页六宽度、链接、筛选与安全表单验证。格式检查不代替这些验证，最终范围和像素结论见 `phase3-delivery.md`。
