export type SolutionVariant = 'industrial' | 'enterprise' | 'contract' | 'mobile';

export interface SolutionPoint {
  title: string;
  description: string;
}

export interface SolutionArchitectureDefinition {
  title: string;
  description: string;
  layers: {
    title: string;
    description: string;
    items: string[];
  }[];
  crossCutting: string[];
}

export interface Solution {
  id: SolutionVariant;
  title: string;
  summary: string;
  variant: SolutionVariant;
  icon: string;
  audience: string;
  introduction: string;
  startingPoint: string;
  problems: SolutionPoint[];
  architecture: SolutionArchitectureDefinition;
  advantages: SolutionPoint[];
  modules: (SolutionPoint & { features: string[] })[];
  workflow: SolutionPoint[];
  deliverables: string[];
  boundaries: string[];
  technologies: string[];
  serviceIds: string[];
  previewCaption: string;
}

export const solutions: Solution[] = [
  {
    id: 'industrial',
    title: '工业设备采集与监控方案',
    summary: '从设备点位到业务看板，建立可追踪的数据采集链路。',
    variant: 'industrial',
    icon: 'tabler:cpu',
    audience: '需要设备联网、产线监测、能耗汇集的制造与设备管理团队。',
    introduction:
      '设备能联网，并不意味着数据已经可用。方案围绕现场协议、点位含义、采集质量与业务用途组织链路，让设备数据进入平台后仍保留清楚的来源和状态。',
    startingPoint: '先选一组有代表性的设备和点位，确认接入条件与业务口径，再逐步扩展覆盖范围。',
    problems: [
      {
        title: '设备类型多，接入条件不一致',
        description: '不同设备可能有不同协议、地址定义与访问限制，接入前缺少统一的设备清单和点位说明。',
      },
      {
        title: '有数值，却不知道是否可信',
        description: '读取失败、设备离线与业务数值为零混在一起，时间戳、单位和质量信息不完整。',
      },
      {
        title: '看板与日常业务脱节',
        description: '数据停留在展示层，告警、处理记录与生产管理系统之间缺少清晰的联动方式。',
      },
    ],
    architecture: {
      title: '从现场接入，到业务使用',
      description: '按数据流向分层，采集服务与业务应用各自承担清楚的职责。',
      layers: [
        {
          title: '现场设备',
          description: '确认设备与点位',
          items: ['PLC / 仪表', '传感器 / 网关', '设备协议与点位表'],
        },
        {
          title: '边缘采集',
          description: '按现场条件适配',
          items: ['协议适配', '采集调度', '连接与重试', '质量标记'],
        },
        {
          title: '数据服务',
          description: '保留来源与过程',
          items: ['点位映射', '历史存储', '规则处理', '业务数据接口'],
        },
        {
          title: '业务应用',
          description: '围绕任务使用数据',
          items: ['设备监控', '趋势查询', '告警处理', '业务系统集成'],
        },
      ],
      crossCutting: ['访问控制', '运行日志', '配置管理', '时间与数据口径'],
    },
    advantages: [
      {
        title: '接入范围可逐步扩展',
        description: '以设备和协议适配边界组织接入逻辑，先完成代表设备联调，再扩展同类设备与业务场景。',
      },
      {
        title: '采集状态与业务状态分开',
        description: '分别呈现连接情况、读取结果和业务指标，避免用一个绿色状态掩盖链路中的未知问题。',
      },
      {
        title: '让业务系统用得上数据',
        description: '围绕点位模型与接口契约输出数据，为生产、设备管理和报表应用保留集成路径。',
      },
    ],
    modules: [
      {
        title: '设备与点位管理',
        description: '把现场信息整理成可以维护的接入配置。',
        features: ['设备分组与基本资料', '连接参数与点位映射', '数据类型、单位与采集周期'],
      },
      {
        title: '采集运行与监测',
        description: '让运行状态、异常原因和最后有效数据可以区分。',
        features: ['连接与读取状态', '采集质量与最后更新时间', '错误记录与重连策略'],
      },
      {
        title: '数据应用与联动',
        description: '从看见数据，延伸到日常查询和问题处理。',
        features: ['实时值与历史趋势', '告警规则与处理记录', '报表导出与业务接口'],
      },
    ],
    workflow: [
      { title: '确认接入条件', description: '收集设备型号、协议资料、点位表与现场网络条件。' },
      { title: '完成代表设备联调', description: '验证读数、单位、时间戳和异常恢复，明确可接入范围。' },
      { title: '建立数据链路', description: '串联采集、存储、规则与展示，保留运行记录。' },
      { title: '分批扩展与交接', description: '按设备批次扩展，移交配置、文档与运行维护方法。' },
    ],
    deliverables: [
      '设备与点位清单、协议接入说明',
      '采集服务与管理平台源码',
      '数据模型、业务接口与配置文档',
      '联调记录、部署与故障恢复说明',
    ],
    boundaries: [
      '页面为方案与界面演示，数值不来自真实设备，也不表示已有客户部署。',
      '协议能力、设备数量、采集周期与数据保留期，需要结合现场环境和设备授权评估。',
      '硬件采购、工业网络改造、现场施工及设备写入控制不默认包含，需单独确认范围。',
    ],
    technologies: ['Java', 'Modbus / OPC UA / MQTT（按设备评估）', 'Vue', '关系型 / 时序数据存储'],
    serviceIds: ['industrial-iot', 'data-integration', 'java-enterprise'],
    previewCaption: '演示界面用于说明设备概览、趋势与采集状态的组织方式，不连接真实设备。',
  },
  {
    id: 'enterprise',
    title: 'ERP / OA 业务协同方案',
    summary: '围绕单据、审批与台账，把跨部门协作接成一条线。',
    variant: 'enterprise',
    icon: 'tabler:building-community',
    audience: '需要统一采购、库存、项目与办公审批的企业业务与管理团队。',
    introduction:
      '当业务靠表格、聊天和多个系统接力时，信息经常在交接处丢失。方案从主数据、单据关系与岗位职责入手，建立适合自身作业方式的业务平台，而不是要求团队先适应一套庞杂流程。',
    startingPoint: '选择采购到入库、项目到费用等一条高频业务链，先形成可使用、可对账的闭环。',
    problems: [
      {
        title: '同一份信息在多处重复维护',
        description: '客户、供应商、物料与项目编码缺少统一口径，部门之间要靠人工重新核对。',
      },
      {
        title: '审批完成，不代表业务完成',
        description: '申请、审批、执行和台账各自独立，难以追踪单据后续是否入库、交付或付款。',
      },
      {
        title: '报表有结果，却难追溯来源',
        description: '汇总口径不透明，数据调整依赖手工加工，管理视图与实际业务记录脱节。',
      },
    ],
    architecture: {
      title: '以业务单据连接部门协作',
      description: '从统一基础资料出发，通过规则与流程把操作转化为可追溯的业务记录。',
      layers: [
        { title: '统一入口', description: '按岗位组织工作', items: ['业务工作台', '审批待办', '移动填报'] },
        { title: '业务模块', description: '围绕单据协同', items: ['采购与库存', '项目与费用', '办公审批', '查询报表'] },
        { title: '共享能力', description: '复用规则与基础', items: ['组织权限', '流程规则', '主数据', '操作审计'] },
        {
          title: '数据与集成',
          description: '明确数据边界',
          items: ['业务数据库', '文件归档', '已有 ERP 接口', '对账与同步'],
        },
      ],
      crossCutting: ['职责分离', '数据范围', '单据状态', '可追溯关联'],
    },
    advantages: [
      {
        title: '按业务闭环逐步建设',
        description: '优先完成一条可用的业务链，再按部门和模块扩展，避免一次上线过多功能却缺少明确负责人。',
      },
      {
        title: '流程贴合实际组织',
        description: '根据岗位、金额、项目或部门设计审批分支，明确退回与撤回后的业务状态。',
      },
      {
        title: '保留已有系统的价值',
        description: '先厘清主数据与读写职责，再通过接口协同，减少多系统争抢同一份数据的问题。',
      },
    ],
    modules: [
      {
        title: '基础资料与权限',
        description: '建立统一的数据入口和职责边界。',
        features: ['组织、岗位与角色', '客户、供应商和物料资料', '操作权限与数据范围'],
      },
      {
        title: '业务单据与审批',
        description: '把申请、审批和执行放进同一条业务链。',
        features: ['采购、入库与库存台账', '项目协作与费用申请', '条件审批、退回与处理记录'],
      },
      {
        title: '查询报表与系统集成',
        description: '让汇总可追溯，让跨系统流转可核对。',
        features: ['单据关联与业务查询', '指标口径与报表导出', '接口同步、失败处理与对账'],
      },
    ],
    workflow: [
      { title: '梳理业务闭环', description: '确认角色、单据、状态和原有系统的职责。' },
      { title: '统一资料与规则', description: '整理编码、审批条件、数据权限与报表口径。' },
      { title: '分模块实施', description: '按主业务链组织页面、接口与存量数据迁移。' },
      { title: '试运行与交接', description: '围绕真实作业核对流程，移交使用与维护文档。' },
    ],
    deliverables: [
      '业务流程、单据与权限设计说明',
      '管理平台前后端源码与数据库结构',
      '数据导入模板、接口与报表口径文档',
      '迁移、部署、操作和维护说明',
    ],
    boundaries: [
      '页面为业务协同方案演示，不是现成 ERP 产品的功能或价格承诺。',
      '实施模块、组织层级、存量数据质量与第三方接口范围需共同确认。',
      '专业财务核算、税务申报和第三方软件授权不默认包含，相关接口另行评估。',
    ],
    technologies: ['Java / Spring Boot', 'Vue', 'MySQL / PostgreSQL', '工作流与消息服务（按需）'],
    serviceIds: ['enterprise-management', 'java-enterprise', 'data-integration'],
    previewCaption: '演示界面用于呈现业务待办、单据和协同工作台结构，不包含真实企业经营数据。',
  },
  {
    id: 'contract',
    title: '合同管理与审批方案',
    summary: '让合同从起草、审批到履约，每一步都有清楚的状态与责任人。',
    variant: 'contract',
    icon: 'tabler:file-description',
    audience: '需要规范合同审批、版本归档和履约跟进的业务、法务与管理团队。',
    introduction:
      '合同不应只是一份通过聊天传递的附件。方案以合同台账为主线，把相对方、版本、审批意见、履约节点和归档材料关联起来，让不同角色在同一份业务记录上协作。',
    startingPoint: '先确认合同类型、审批权限与履约节点，选择一类高频合同建立从申请到归档的完整流程。',
    problems: [
      {
        title: '版本散落，难判断哪份有效',
        description: '起草稿、修改稿和审批附件混在一起，缺少版本说明与变更责任记录。',
      },
      {
        title: '审批意见与最终文件脱节',
        description: '流程通过后无法清楚确认审批针对的文件版本，退回修改也缺少明确的衔接规则。',
      },
      {
        title: '签订后缺少持续跟进',
        description: '付款、交付、到期与续签节点仍依赖个人记忆，合同台账没有形成履约协作入口。',
      },
    ],
    architecture: {
      title: '一份台账，贯穿合同全流程',
      description: '以合同记录关联文件版本、流程实例和履约事项，保留关键变更上下文。',
      layers: [
        { title: '角色工作台', description: '按职责协作', items: ['业务发起', '法务审阅', '审批处理', '履约跟进'] },
        {
          title: '合同生命周期',
          description: '状态与责任对应',
          items: ['起草与版本', '审批与退回', '履约与提醒', '归档与查询'],
        },
        { title: '业务支撑', description: '保留过程依据', items: ['合同分类', '相对方资料', '流程规则', '附件权限'] },
        {
          title: '存储与接口',
          description: '建立可追溯记录',
          items: ['合同台账', '文件版本库', '操作记录', '签章 / 财务接口（按需）'],
        },
      ],
      crossCutting: ['文件访问范围', '审批版本关联', '关键操作留痕', '履约责任人'],
    },
    advantages: [
      {
        title: '审批对应明确的文件版本',
        description: '让文件、流程与审批意见形成关联，关键版本更换时按业务规则重新确认，而不是覆盖原附件。',
      },
      {
        title: '签订之后仍然可跟进',
        description: '把交付、收付款、到期等事项纳入台账，明确负责人、计划时间与处理记录。',
      },
      {
        title: '协作开放，访问保持克制',
        description: '按部门、角色与合同范围划分访问权限，敏感附件与导出操作单独定义边界。',
      },
    ],
    modules: [
      {
        title: '合同台账与文件版本',
        description: '给合同业务和文档一个统一的归属。',
        features: ['合同分类、编号与相对方', '金额、期限与关联业务', '附件版本、变更说明和归档'],
      },
      {
        title: '审批流与审阅记录',
        description: '清楚记录谁在什么版本上做了什么决定。',
        features: ['按类型与金额配置流程', '审阅意见、退回与重新提交', '审批版本关联和操作留痕'],
      },
      {
        title: '履约与提醒',
        description: '把合同约定转化为可跟进的工作事项。',
        features: ['交付与收付款计划', '到期、续签和事项提醒', '履约记录、检索与报表'],
      },
    ],
    workflow: [
      { title: '定义合同规则', description: '确认合同类型、编号方式、金额口径与访问权限。' },
      { title: '设计审批路径', description: '梳理审阅职责、审批分支、退回与版本变更规则。' },
      { title: '串联履约事项', description: '设置交付、付款、到期节点与对应责任人。' },
      { title: '整理归档与交接', description: '确认存量导入、文件访问、查询和维护方式。' },
    ],
    deliverables: [
      '合同数据模型、权限与审批规则说明',
      '合同管理平台源码与文件存储配置',
      '台账导入模板、接口和操作文档',
      '部署、归档与维护说明',
    ],
    boundaries: [
      '页面为合同管理方案演示，不提供法律意见，也不替代专业合同审查。',
      '电子签章、实名认证、证据保全与法律效力取决于合规服务商、实际流程及相关要求，均需单独评估。',
      '提醒渠道、文件存储周期、历史资料迁移和第三方服务费用按项目范围确认。',
    ],
    technologies: ['Java / Spring Boot', 'Vue', '关系型数据库', '文件存储', '工作流引擎（按需）'],
    serviceIds: ['enterprise-management', 'java-enterprise', 'data-integration'],
    previewCaption: '演示界面中的合同名称、金额与审批状态均为示意，不包含真实合同或签署记录。',
  },
  {
    id: 'mobile',
    title: '小程序与互联网平台方案',
    summary: '连接用户入口与运营后台，把一次操作接到完整的服务流程。',
    variant: 'mobile',
    icon: 'tabler:device-mobile',
    audience: '需要预约服务、会员运营、订单管理或移动业务入口的产品与运营团队。',
    introduction:
      '移动端的提交只是业务开始。方案同时考虑用户如何找到服务、完成操作、获得进度反馈，以及后台如何受理、履约和维护内容，避免只做前台页面而留下运营断点。',
    startingPoint: '明确一条核心用户路径和对应的后台处理流程，先完成可运营的业务闭环，再扩展增长与会员能力。',
    problems: [
      {
        title: '入口很多，核心操作不清楚',
        description: '页面堆叠活动与功能，用户很难找到预约、申请或查询结果的最短路径。',
      },
      {
        title: '前台已提交，后台接不住',
        description: '订单、预约或服务申请缺少一致状态，运营人员仍靠手工分派与重复核对。',
      },
      {
        title: '平台与个人信息要求后置',
        description: '登录、支付、消息和用户授权到发布前才评估，容易让资质与平台限制影响上线安排。',
      },
    ],
    architecture: {
      title: '用户侧与运营侧，共用业务闭环',
      description: '以同一套业务接口与状态规则连接移动入口和管理后台。',
      layers: [
        { title: '用户入口', description: '适配使用场景', items: ['微信小程序', '移动 H5', '服务与进度查询'] },
        {
          title: '业务服务',
          description: '保持状态一致',
          items: ['用户与权限', '预约 / 订单', '内容与服务', '通知规则'],
        },
        { title: '运营后台', description: '承接真实处理', items: ['内容维护', '申请受理', '履约跟进', '运营查询'] },
        {
          title: '数据与平台',
          description: '按需接入能力',
          items: ['业务数据与文件', '微信开放能力', '支付接口（按需）', '日志与访问控制'],
        },
      ],
      crossCutting: ['最小信息采集', '身份与授权', '提交幂等', '异常与进度反馈'],
    },
    advantages: [
      {
        title: '先把核心任务做顺畅',
        description: '以预约、购买、申请等核心任务组织导航与表单，让用户知道当前状态和下一步。',
      },
      {
        title: '前后台围绕同一业务记录',
        description: '把用户提交与运营受理、处理和完成状态关联，减少“提交成功但无人处理”的断点。',
      },
      {
        title: '把发布条件前置确认',
        description: '在设计阶段确认平台能力、主体资质和授权要求，区分源码交付、平台审核和实际运营。',
      },
    ],
    modules: [
      {
        title: '移动端服务入口',
        description: '让用户快速理解服务并完成核心操作。',
        features: ['服务展示、内容与搜索', '预约、下单或业务申请', '个人中心、进度与记录查询'],
      },
      {
        title: '业务接口与平台能力',
        description: '把前台动作转化为可信的业务记录。',
        features: ['登录授权与访问控制', '提交校验、状态与防重复处理', '订阅消息与支付能力评估'],
      },
      {
        title: '运营与管理后台',
        description: '给团队日常运营所需的维护和处理入口。',
        features: ['服务与内容维护', '订单、预约和申请处理', '角色权限、运营查询与导出'],
      },
    ],
    workflow: [
      { title: '确认用户与平台', description: '明确核心用户、使用场景、主体资质和平台能力。' },
      { title: '梳理核心业务路径', description: '串联用户提交、运营受理、履约与进度反馈。' },
      { title: '联动前后台实现', description: '共同实现移动端、接口和运营后台，处理异常分支。' },
      { title: '准备发布与交接', description: '整理配置、隐私说明所需信息与审核材料，移交运营文档。' },
    ],
    deliverables: [
      '用户路径、页面与前后台业务设计',
      '小程序或 H5、接口和管理后台源码',
      '数据库结构、平台配置与接口文档',
      '发布资料清单、运营和维护说明',
    ],
    boundaries: [
      '页面为小程序与平台概念演示，不是真实可交易应用，不接收订单或支付。',
      '平台认证、类目资质、支付开通、隐私要求与审核结果由相应平台及实际主体情况决定。',
      '短信、支付、云资源和第三方服务费用另行确认，不承诺用户增长、审核时效或经营收益。',
    ],
    technologies: ['微信小程序 / uni-app（按需）', 'Vue / H5', 'Java API', '关系型数据库', '文件存储'],
    serviceIds: ['miniapp-mobile', 'java-enterprise', 'data-integration'],
    previewCaption: '演示界面用于说明用户入口、服务卡片与业务进度，不连接真实账号、订单或支付能力。',
  },
];
