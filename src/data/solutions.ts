import { evidenceStatus, type ContentEvidence } from '~/data/evidence';

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
  preparation?: string[];
  caseIds?: string[];
  postSlugs?: string[];
  evidence?: ContentEvidence;
  previewCaption: string;
}

export const solutions: Solution[] = [
  {
    id: 'industrial',
    title: '工业设备采集与监控方案',
    summary: '规划从设备点位到监控看板的采集链路，先确认读数含义与接入条件。',
    variant: 'industrial',
    icon: 'tabler:cpu',
    audience: '需要设备联网、产线监测、能耗汇集的制造与设备管理团队。',
    introduction:
      '针对 PLC、仪表与网关数据分散、异常难定位的问题，提出只读采集、质量标记、历史趋势与告警处理的分层设计。本页是静态方案演示，协议适配与现场可用性需另行开发、联调和确认。',
    startingPoint: '先选代表设备与少量关键点位，约定只读权限、读数比对方法和异常恢复条件，再评估扩展批次。',
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
      description: '拟将现场读取、边缘调度、数据处理与业务展示分层；传输和存储方式按网络、点位规模及保留期评估。',
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
        description: '拟将设备、连接与点位分开建模，保存点位来源和转换口径。',
        features: ['设备分组与基本资料', '连接参数与点位映射', '数据类型、单位与采集周期'],
      },
      {
        title: '采集运行与监测',
        description: '拟分别记录任务运行、连接、读取结果与最后有效时间，不把缺失读数当作零。',
        features: ['连接与读取状态', '采集质量与最后更新时间', '错误记录与重连策略'],
      },
      {
        title: '数据应用与联动',
        description: '拟围绕点位来源与质量组织趋势、告警确认和外部系统读取接口。',
        features: ['实时值与历史趋势', '告警规则与处理记录', '报表导出与业务接口'],
      },
    ],
    workflow: [
      { title: '确认接入条件', description: '收集设备型号、协议资料、点位表与现场网络条件。' },
      { title: '代表设备联调', description: '按约定比对读数、单位、字节序和时间戳，记录断连恢复结果与未覆盖条件。' },
      { title: '开发数据链路', description: '按确认范围开发采集、存储、规则与展示，约定数据过期、缓存和补传策略。' },
      {
        title: '分批验收与交接',
        description: '按设备批次和约定工况验收，移交配置、运行记录与维护方法，不外推至未验设备。',
      },
    ],
    deliverables: [
      '约定设备与点位清单、协议适配范围和验收口径',
      '约定模块的采集服务、管理界面源码与配置',
      '数据模型、字段映射、业务接口与保留策略说明',
      '约定工况的联调记录、部署步骤与故障恢复说明',
    ],
    boundaries: [
      '页面为方案与界面演示，数值不来自真实设备，也不表示已有客户部署。',
      '协议名称仅表示拟评估方向；设备型号、固件、协议版本、点位和采集周期以资料与联调结果为准，不承诺全厂商兼容或数据零丢失。',
      '默认讨论只读采集。硬件采购、工业网络改造、现场施工及写入控制不默认包含，不替代设备安全控制系统。',
    ],
    technologies: ['Java', 'Modbus / OPC UA / MQTT（按设备评估）', 'Vue', '关系型 / 时序数据存储'],
    serviceIds: ['industrial-iot', 'data-integration', 'java-enterprise'],
    preparation: [
      '设备型号、固件与协议版本；寄存器或节点表、数据类型、字节序、单位和换算规则。',
      '网络拓扑、读权限与设备授权说明；联调设备、现场联系人和允许的联调窗口，不在本站提交账号或密钥。',
      '采集周期、历史保留期、允许延迟与断网处理要求；用于比对的脱敏样例及告警阈值。',
      '拟对接系统的接口说明、字段口径、访问限制与验收工况，逐设备确认接入范围。',
    ],
    caseIds: ['industrial-iot-monitoring'],
    postSlugs: ['java-industrial-collection-architecture', 'modbus-tcp-opc-ua-integration'],
    evidence: {
      status: evidenceStatus.concept,
      summary: '本站仅展示采集链路设计和模拟界面，未提供可运行的 Java 采集服务或现场协议验收证据。',
      sources: [
        'src/data/solutions.ts',
        'src/components/reisun/SystemPreview.astro',
        'src/components/reisun/SolutionArchitecture.astro',
      ],
      pending: ['获授权的协议实现与运行记录', '具体设备、固件及点位的联调结论', '接入规模、采集周期和异常恢复验收口径'],
    },
    previewCaption: '演示界面用于说明设备概览、趋势与采集状态的组织方式，不连接真实设备。',
  },
  {
    id: 'enterprise',
    title: 'ERP / OA 业务协同方案',
    summary: '以采购、审批与入库为切入点，规划可追溯的跨部门单据链。',
    variant: 'enterprise',
    icon: 'tabler:building-community',
    audience: '需要统一采购、库存、项目与办公审批的企业业务与管理团队。',
    introduction:
      '针对基础资料重复维护、审批与执行脱节、台账难对账的问题，提出从主数据、单据状态和岗位权限入手的定制设计。本页不提供现成 ERP / OA 产品，业务规则、开发模块与集成范围需按项目确认。',
    startingPoint: '选择采购到入库或项目到费用的一条高频业务链，用脱敏单据明确状态、责任人和对账口径。',
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
      description:
        '拟以岗位工作台连接单据模块，共享主数据、权限与流程规则；明确已有 ERP 的数据归属、同步方向和对账责任。',
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
        description: '拟统一业务编码和维护责任，区分菜单、操作与组织数据范围。',
        features: ['组织、岗位与角色', '客户、供应商和物料资料', '操作权限与数据范围'],
      },
      {
        title: '业务单据与审批',
        description: '拟关联申请、审批与库存流水，明确退回、撤回、冲销和重复操作规则。',
        features: ['采购、入库与库存台账', '项目协作与费用申请', '条件审批、退回与处理记录'],
      },
      {
        title: '查询报表与系统集成',
        description: '拟按来源单据汇总，定义同步失败、重复接收与对账差异的处理入口。',
        features: ['单据关联与业务查询', '指标口径与报表导出', '接口同步、失败处理与对账'],
      },
    ],
    workflow: [
      { title: '梳理业务闭环', description: '确认角色、单据、状态和原有系统的职责。' },
      { title: '统一资料与规则', description: '整理编码、审批条件、数据权限与报表口径。' },
      { title: '分模块开发与联调', description: '按业务链开发页面和接口，用脱敏样例核对单据、库存及同步结果。' },
      { title: '试运行与交接', description: '按约定场景核对审批、冲销、权限与对账，迁移前确认备份、窗口和回退步骤。' },
    ],
    deliverables: [
      '约定业务链的流程、单据状态与权限矩阵',
      '约定模块的前后端源码、数据库结构与流程配置',
      '数据导入模板、接口映射、报表口径及对账说明',
      '约定场景的验收记录、迁移回退步骤与使用维护文档',
    ],
    boundaries: [
      '页面为业务协同方案演示，不是现成 ERP 产品的功能或价格承诺。',
      '模块、组织层级、库存与费用口径、存量数据质量需共同确认；第三方接口需有合法授权、可用说明和联调条件。',
      '专业财务核算、税务申报和第三方软件授权不默认包含，相关接口另行评估。',
    ],
    technologies: ['Java / Spring Boot', 'Vue', 'MySQL / PostgreSQL', '工作流与消息服务（按需）'],
    serviceIds: ['enterprise-management', 'java-enterprise', 'data-integration'],
    preparation: [
      '现行流程、脱敏单据与报表样例；明确采购、入库、费用等首期业务范围及负责人。',
      '组织岗位、审批条件、职责分离要求与数据权限矩阵，包括退回、撤销和冲销规则。',
      '客户、供应商、物料等主数据编码及存量数据样例；约定清洗责任、迁移窗口和回退条件。',
      '已有 ERP、财务或身份系统的接口文档、授权方式、调用限制和联调环境，不提供生产凭据。',
    ],
    caseIds: ['enterprise-erp'],
    postSlugs: ['spring-boot-enterprise-architecture', 'enterprise-digital-transformation'],
    evidence: {
      status: evidenceStatus.concept,
      summary: '本站仅展示业务协同的逻辑设计与模拟单据，不证明 ERP / OA 后端实现、真实库存或客户交付。',
      sources: [
        'src/data/solutions.ts',
        'src/components/reisun/SystemPreview.astro',
        'src/components/reisun/SolutionArchitecture.astro',
      ],
      pending: ['实际业务规则与授权材料', '可公开的后端实现及权限验证记录', '迁移、同步与对账的验收范围'],
    },
    previewCaption: '演示界面用于呈现业务待办、单据和协同工作台结构，不包含真实企业经营数据。',
  },
  {
    id: 'contract',
    title: '合同管理与审批方案',
    summary: '规划合同台账、文件版本与审批关联，让履约事项有明确责任人。',
    variant: 'contract',
    icon: 'tabler:file-description',
    audience: '需要规范合同审批、版本归档和履约跟进的业务、法务与管理团队。',
    introduction:
      '针对附件版本散落、审批依据不明、签订后缺少跟进的问题，提出合同台账、版本快照、条件审批与履约事项的关联设计。本页仅为软件方案演示，不提供法律审查或可用的电子签约服务。',
    startingPoint: '选择一类高频合同，先用脱敏模板约定审批版本、退回规则、履约责任与归档要求。',
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
      description: '拟以合同记录关联文件版本、流程实例与履约事项；审批绑定明确版本，签章和财务作为独立的可选集成边界。',
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
        description: '拟将合同元数据与文件分开管理，保留版本快照、变更说明和访问范围。',
        features: ['合同分类、编号与相对方', '金额、期限与关联业务', '附件版本、变更说明和归档'],
      },
      {
        title: '审批流与审阅记录',
        description: '拟绑定审批实例与文本版本，定义改版、退回和重新提交后的权限与状态。',
        features: ['按类型与金额配置流程', '审阅意见、退回与重新提交', '审批版本关联和操作留痕'],
      },
      {
        title: '履约与提醒',
        description: '拟将交付、付款和到期事项关联到责任角色，区分提醒发送与实际处理结果。',
        features: ['交付与收付款计划', '到期、续签和事项提醒', '履约记录、检索与报表'],
      },
    ],
    workflow: [
      { title: '定义合同规则', description: '确认合同类型、编号方式、金额口径与访问权限。' },
      { title: '设计审批路径', description: '梳理审阅职责、审批分支、退回与版本变更规则。' },
      { title: '串联履约事项', description: '设置交付、付款、到期节点与对应责任人。' },
      {
        title: '验收归档与交接',
        description: '按约定核对改版重审、越权访问、提醒失败与归档查询，移交迁移和维护文档。',
      },
    ],
    deliverables: [
      '约定合同类型的数据模型、权限矩阵与审批版本规则',
      '约定模块的管理平台源码、流程与文件存储配置',
      '台账导入模板、可选集成接口与操作说明',
      '约定场景的验收记录、部署步骤与归档维护文档',
    ],
    boundaries: [
      '页面为合同管理方案演示，不提供法律意见，也不替代专业合同审查。',
      '电子签章、实名认证与证据保全不默认包含；需单独确认服务商、主体授权、接口与相关要求，不承诺法律效力。',
      '提醒渠道、文件存储周期、历史资料迁移和第三方服务费用按项目范围确认。',
    ],
    technologies: ['Java / Spring Boot', 'Vue', '关系型数据库', '文件存储', '工作流引擎（按需）'],
    serviceIds: ['enterprise-management', 'java-enterprise', 'data-integration'],
    preparation: [
      '脱敏合同模板、合同类别、编号与金额口径；不要通过演示表单上传真实合同或相对方资料。',
      '审阅、审批与代理授权矩阵；版本变更、退回、撤回和重新审批的制度要求。',
      '履约事项、提醒渠道、责任岗位、文件保留期与下载导出权限要求。',
      '如需签章或财务对接，准备服务商接口资料、主体授权与联调条件，单独确认费用和验收范围。',
    ],
    caseIds: ['contract-workflow'],
    postSlugs: ['spring-boot-enterprise-architecture', 'enterprise-digital-transformation'],
    evidence: {
      status: evidenceStatus.concept,
      summary: '本站仅展示合同版本、审批和履约的概念关联；未接入真实合同、电子签章、实名认证或通知服务。',
      sources: [
        'src/data/solutions.ts',
        'src/components/reisun/SystemPreview.astro',
        'src/components/reisun/SolutionArchitecture.astro',
      ],
      pending: [
        '合同规则、授权制度与资料公开许可',
        '流程及文件访问控制的实际实现证据',
        '签章、通知和财务服务的接入条件',
      ],
    },
    previewCaption: '演示界面中的合同名称、金额与审批状态均为示意，不包含真实合同或签署记录。',
  },
  {
    id: 'mobile',
    title: '小程序与互联网平台方案',
    summary: '以预约、申请或查询为起点，规划移动入口与后台受理的状态闭环。',
    variant: 'mobile',
    icon: 'tabler:device-mobile',
    audience: '需要预约服务、会员运营、订单管理或移动业务入口的产品与运营团队。',
    introduction:
      '针对移动提交后靠人工接单、预约容量不一致、用户无法查询进度的问题，提出小程序或 H5、Java 业务接口与管理后台的协同设计。本页是网页概念演示，不是已发布小程序，也未接入登录、订单或支付。',
    startingPoint: '先选预约、业务申请或移动填报的一条核心路径，明确用户、后台责任人、取消规则与反馈状态。',
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
      description:
        '拟让移动入口和后台通过统一业务接口处理同一记录；容量、权限与重复提交由服务端校验，平台能力按授权逐项评估。',
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
        description: '拟围绕服务选择、提交确认与记录查询组织页面，覆盖无可用时段和网络失败提示。',
        features: ['服务展示、内容与搜索', '预约、下单或业务申请', '个人中心、进度与记录查询'],
      },
      {
        title: '业务接口与平台能力',
        description: '拟在服务端校验容量、权限和状态，设计重复提交、改期与取消的处理规则。',
        features: ['登录授权与访问控制', '提交校验、状态与防重复处理', '订阅消息与支付能力评估'],
      },
      {
        title: '运营与管理后台',
        description: '拟以岗位工作台承接受理、排期与服务跟进，仅开放业务必需的个人资料。',
        features: ['服务与内容维护', '订单、预约和申请处理', '角色权限、运营查询与导出'],
      },
    ],
    workflow: [
      { title: '确认用户与平台', description: '明确核心用户、使用场景、主体资质和平台能力。' },
      { title: '梳理核心业务路径', description: '串联用户提交、运营受理、履约与进度反馈。' },
      {
        title: '前后台开发与联调',
        description: '按约定开发移动端、接口和后台，核对重复提交、容量冲突、取消与失败恢复。',
      },
      {
        title: '发布准备与交接',
        description: '按约定移交配置、隐私资料清单和审核材料；源码验收与平台审核、正式运营分别确认。',
      },
    ],
    deliverables: [
      '约定用户路径、页面、状态流转与个人信息清单',
      '约定终端的小程序或 H5、业务接口与后台模块源码',
      '数据库结构、平台配置说明与接口契约',
      '约定场景的联调记录、发布资料清单与运营维护文档',
    ],
    boundaries: [
      '页面为小程序与平台概念演示，不是真实可交易应用，不接收订单或支付。',
      '登录、订阅消息、支付等仅为可选集成项；主体认证、类目资质、隐私要求和审核条件需按项目与平台要求确认。',
      '短信、支付、云资源和第三方服务费用另行确认，不承诺用户增长、审核时效或经营收益。',
    ],
    technologies: ['微信小程序 / uni-app（按需）', 'Vue / H5', 'Java API', '关系型数据库', '文件存储'],
    serviceIds: ['miniapp-mobile', 'java-enterprise', 'data-integration'],
    preparation: [
      '目标用户、核心操作路径、服务目录与脱敏表单样例；确认预约、申请或查询的首期范围。',
      '后台受理岗位、排期容量、改期取消与异常处理规则；已有系统的状态映射和接口说明。',
      '拟发布平台、主体与类目资料、账号归属和域名准备情况，仅提供清单，不在本站填写凭据。',
      '个人信息使用目的、字段与保留期；如需登录、通知或支付，另行核实授权、服务费用与联调条件。',
    ],
    caseIds: ['mobile-service'],
    postSlugs: ['spring-boot-enterprise-architecture', 'docker-deployment-practice'],
    evidence: {
      status: evidenceStatus.concept,
      summary: '本站仅展示移动入口和后台处理路径的静态示意，不是可运行小程序，也不证明真实账号、消息或支付集成。',
      sources: [
        'src/data/solutions.ts',
        'src/components/reisun/SystemPreview.astro',
        'src/components/reisun/SolutionArchitecture.astro',
      ],
      pending: [
        '实际小程序及 Java 接口的实现与联调证据',
        '发布主体、类目及平台能力授权',
        '个人信息范围、运营规则与发布验收条件',
      ],
    },
    previewCaption: '演示界面用于说明用户入口、服务卡片与业务进度，不连接真实账号、订单或支付能力。',
  },
];
