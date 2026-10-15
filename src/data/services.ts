export interface ServiceCapability {
  title: string;
  description: string;
}

export interface Service {
  id: string;
  title: string;
  summary: string;
  icon: string;
  description: string;
  scenarios: string[];
  deliverables: string[];
  capabilities: ServiceCapability[];
  technologies: string[];
  solutionIds: string[];
  scope: string;
}

export const services: Service[] = [
  {
    id: 'java-enterprise',
    title: 'Java 企业应用开发',
    summary: '把业务规则、协作流程与数据权限，落实到可持续迭代的企业系统。',
    icon: 'tabler:code',
    description:
      '从业务对象和操作流程出发，梳理角色、状态与系统边界。适合需要独立业务平台、已有系统扩展，或希望逐步替换历史应用的团队。',
    scenarios: ['业务后台与管理平台', '多角色协同作业', '现有 Java 系统扩展'],
    deliverables: ['业务流程与功能范围说明', '前后端源码与数据库结构', '接口文档、部署说明与操作指引'],
    capabilities: [
      {
        title: '业务建模与流程落地',
        description: '围绕订单、客户、项目等核心对象定义状态流转、校验规则与异常处理，让系统对应真实作业方式。',
      },
      {
        title: '权限与操作留痕',
        description: '按岗位设计菜单、操作与数据范围，区分查看、修改和审批权限，保留关键操作的审计记录。',
      },
      {
        title: '接口与系统演进',
        description: '设计清晰的模块和接口边界，结合实际规模选择应用架构，为后续业务扩展保留空间。',
      },
    ],
    technologies: ['Java', 'Spring Boot', 'Vue', 'MySQL / PostgreSQL', 'Redis'],
    solutionIds: ['enterprise', 'contract'],
    scope: '根据业务复杂度选择单体或模块化架构，不以堆叠中间件代替业务设计。性能目标与部署环境在立项时共同确认。',
  },
  {
    id: 'industrial-iot',
    title: '工业物联网与设备采集',
    summary: '连接设备、采集服务与业务平台，让现场数据有来源、可追踪、能使用。',
    icon: 'tabler:cpu',
    description:
      '面向设备联网、产线监测与能耗管理，建立从点位梳理、协议接入到数据展示的完整链路。先确认现场条件，再确定接入方式和数据处理策略。',
    scenarios: ['设备状态与参数监测', '产线数据采集', '能耗与环境数据汇集'],
    deliverables: ['设备清单、点位表与接入方案', '采集配置、平台源码与数据接口', '现场联调记录、运行与恢复说明'],
    capabilities: [
      {
        title: '设备与协议适配',
        description: '梳理设备型号、协议版本、寄存器或节点定义，评估 Modbus、OPC UA、MQTT 等接入路径。',
      },
      {
        title: '采集链路与异常恢复',
        description: '按设备能力设计采集周期、连接管理与重试策略，区分设备离线、读取失败和业务数据异常。',
      },
      {
        title: '数据治理与业务联动',
        description: '统一点位名称、单位、时间戳和质量标记，再对接看板、告警规则或已有生产管理系统。',
      },
    ],
    technologies: ['Java', 'Modbus', 'OPC UA', 'MQTT', '时序数据存储'],
    solutionIds: ['industrial'],
    scope:
      '具体协议支持以设备资料和联调结果为准；现场网络、设备授权、硬件采购及停机窗口需单独确认。默认讨论只读采集，不暗含设备控制权限。',
  },
  {
    id: 'enterprise-management',
    title: 'ERP / OA / 合同管理系统',
    summary: '把分散的台账和审批串成业务闭环，让协作不再依赖反复传表。',
    icon: 'tabler:building-community',
    description:
      '针对采购、库存、项目、费用和合同等管理场景，按实际组织与制度设计轻量业务系统。可以从一个高频流程切入，也可以围绕已有 ERP 做补充集成。',
    scenarios: ['采购与库存台账', '办公审批与项目协作', '合同审批与履约跟进'],
    deliverables: ['业务单据、审批与权限设计', '管理后台、流程配置与报表', '数据导入模板、迁移说明与使用文档'],
    capabilities: [
      {
        title: '业务单据与统一台账',
        description: '统一客户、供应商、物料等基础资料，建立单据之间的关联，减少重复录入与口径分歧。',
      },
      {
        title: '审批流与职责分离',
        description: '明确发起、审批、退回、撤回等流程状态，结合岗位和金额条件设计审批规则与操作记录。',
      },
      {
        title: '履约与经营视图',
        description: '围绕交付、收付款、到期提醒和业务汇总设计查询，让管理者看到数据来源而非孤立数字。',
      },
    ],
    technologies: ['Java', 'Spring Boot', 'Vue', '关系型数据库', '工作流引擎（按需）'],
    solutionIds: ['enterprise', 'contract'],
    scope: '定制范围按业务模块确认；财务核算、电子签章、税务和第三方平台接入不默认包含，需评估授权、接口及服务费用。',
  },
  {
    id: 'miniapp-mobile',
    title: '微信小程序与移动端开发',
    summary: '把预约、服务、订单与协作入口，放到用户随手可达的移动端。',
    icon: 'tabler:device-mobile',
    description:
      '从移动场景中的关键任务出发，设计小程序、H5 与配套管理后台。既关注用户侧的操作路径，也关注后台的履约、内容维护与权限管理。',
    scenarios: ['预约与到店服务', '会员与订单管理', '移动巡检与外勤填报'],
    deliverables: ['移动端页面与交互设计', '小程序或 H5 源码、接口与后台', '发布配置、平台审核资料清单与操作说明'],
    capabilities: [
      {
        title: '面向任务的移动体验',
        description: '围绕浏览、提交、查询和通知梳理操作路径，设计网络异常、空状态与重复提交等必要反馈。',
      },
      {
        title: '前后台业务一致',
        description: '让用户端订单或申请与后台处理流程关联，明确待处理、处理中、已完成等状态的真实含义。',
      },
      {
        title: '平台能力与隐私边界',
        description: '按需评估微信登录、订阅消息与支付等能力，遵循最小信息采集原则，明确授权和配置条件。',
      },
    ],
    technologies: ['微信小程序', 'uni-app（按需）', 'Vue', 'H5', 'Java API'],
    solutionIds: ['mobile'],
    scope: '主体认证、类目资质、支付申请及平台审核由对应平台决定。交付不等于审核通过，也不包含任何流量或经营效果承诺。',
  },
  {
    id: 'data-integration',
    title: '企业数据平台与系统集成',
    summary: '打通系统间的数据流，让同一项业务信息有一致的定义和可查的去向。',
    icon: 'tabler:database',
    description:
      '面向多系统协同和数据汇总，先梳理数据所有者、业务标识和更新规则，再设计接口、同步任务与查询视图，避免把数据搬运误当成业务集成。',
    scenarios: ['ERP 与业务系统对接', '多来源数据汇总', '经营报表与数据看板'],
    deliverables: ['系统与数据映射清单', '接口服务、同步任务与运行记录', '指标口径、对账与故障处置说明'],
    capabilities: [
      {
        title: '接口与数据契约',
        description: '定义字段、主键、时间口径与错误响应，明确数据读写方向，减少接口上线后的理解偏差。',
      },
      {
        title: '同步与一致性处理',
        description: '按时效要求选择批量、定时或事件驱动方式，设计幂等、失败重试、补偿及对账机制。',
      },
      {
        title: '可解释的数据展示',
        description: '记录数据来源、更新时间和处理状态，区分无数据、同步失败和业务值为零，保留问题追踪入口。',
      },
    ],
    technologies: ['REST API', 'Java', 'SQL', '消息队列（按需）', '数据可视化'],
    solutionIds: ['industrial', 'enterprise'],
    scope: '第三方系统需提供合法的访问权限和可用接口；实时性、历史数据质量及接口限额将影响最终方案与实施范围。',
  },
  {
    id: 'system-upgrade',
    title: '系统升级与维护',
    summary: '先理解已有系统，再逐步改造，让新能力接得上，原有业务稳得住。',
    icon: 'tabler:tool',
    description:
      '围绕已有系统的功能缺口、性能问题和维护困难，梳理现状、识别风险并制定分阶段改造路径。优先解决明确问题，不默认整套推倒重来。',
    scenarios: ['历史系统功能扩展', '架构与依赖升级', '性能排查与运维交接'],
    deliverables: ['现状梳理与风险清单', '约定范围内的改造源码与配置', '迁移步骤、回退方案与维护文档'],
    capabilities: [
      {
        title: '现状评估与问题定位',
        description: '结合源码、日志、数据结构与部署方式，确认问题影响范围，区分业务缺陷、环境限制与技术债。',
      },
      {
        title: '渐进式升级与替换',
        description: '按风险和业务价值安排模块重构、依赖更新或接口替换，关注数据兼容、旧功能衔接与迁移窗口。',
      },
      {
        title: '维护机制与知识移交',
        description: '梳理日志、备份、告警与恢复步骤，明确问题受理边界、维护内容和后续协作方式。',
      },
    ],
    technologies: ['Java / Spring', 'Vue', 'SQL', '日志与监控', '迁移与回退设计'],
    solutionIds: ['enterprise'],
    scope:
      '开始前需确认源码、依赖、数据和环境的授权与可访问性。维护周期、响应时间和保障等级另行约定，不默认提供全天候值守。',
  },
];
