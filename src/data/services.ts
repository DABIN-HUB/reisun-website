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
  preparation?: string[];
  caseIds?: string[];
  postSlugs?: string[];
  scope: string;
}

export const services: Service[] = [
  {
    id: 'java-enterprise',
    title: 'Java 企业应用开发',
    summary: '业务规则靠人工核对、旧系统难以扩展时，从权限、流程和接口梳理定制开发范围。',
    icon: 'tabler:code',
    description:
      '当表格难以承载业务规则、多个岗位反复传递信息，或既有 Java 系统难以调整时，可以从一个高频流程切入。拟按业务对象、角色与状态拆分模块，明确新建、扩展或渐进改造的边界。',
    scenarios: ['内部业务平台与管理后台', '多角色审批与数据权限', '既有 Java 系统二次开发'],
    deliverables: [
      '业务流程、权限矩阵与验收清单',
      '约定模块的前后端源码、数据库结构与迁移脚本',
      'REST API 文档、部署说明与操作指引',
    ],
    capabilities: [
      {
        title: '业务流程与权限设计',
        description:
          '围绕订单、客户或项目梳理校验、审批、退回与异常处理，拟按岗位配置菜单、操作和数据范围，并设计关键操作留痕。',
      },
      {
        title: '前后端与数据实现方向',
        description:
          '以 Spring Boot 后端与 Vue 业务页面为选型方向，使用 MySQL 组织业务数据；Redis 按缓存、会话或并发控制需求评估，不作为必选依赖。',
      },
      {
        title: '接口与既有系统改造',
        description:
          '通过 REST API 规划系统对接与模块替换，先核对旧接口和数据兼容性；仅在独立部署、服务治理确有需要时评估 Spring Cloud。',
      },
    ],
    technologies: ['Java / Spring Boot', 'Vue', 'MySQL', 'Redis（按需）', 'REST API', 'Spring Cloud（按需）'],
    solutionIds: ['enterprise', 'contract'],
    preparation: [
      '现有流程、业务单据和角色清单，列明最想改善的操作及审批、数据权限规则。',
      '既有系统技术版本、接口文档和脱敏数据样例；由客户确认源码使用及系统改造授权。',
      '优先模块、部署约束、预期访问规模与验收负责人，用于共同确认阶段范围和性能目标。',
    ],
    caseIds: ['enterprise-erp', 'contract-workflow'],
    postSlugs: ['spring-boot-enterprise-architecture', 'enterprise-digital-transformation'],
    scope:
      '优先评估单体或模块化应用，不默认采用微服务。技术选型、旧系统兼容性、性能目标及源码交付范围按实际资料和联调结果约定；客户负责业务规则与授权确认。',
  },
  {
    id: 'industrial-iot',
    title: '工业物联网与设备采集',
    summary: '设备读数分散、采集状态不清时，先核对设备与点位，再规划边缘采集、上报和监控。',
    icon: 'tabler:cpu',
    description:
      '面向 PLC、仪表、传感器与工业网关数据分散的问题，拟梳理设备档案、点位含义和现场网络，设计边缘采集、质量标记、平台上报与监控链路。先以代表性设备联调，再讨论扩大接入范围。',
    scenarios: ['设备状态与工艺参数监测', '产线与边缘网关数据采集', '能耗、环境与工业数据上报'],
    deliverables: [
      '设备与点位映射、接入设计及兼容性确认清单',
      '约定范围的采集程序、配置、平台源码与上报接口',
      '样机或现场联调记录、部署及异常恢复说明',
    ],
    capabilities: [
      {
        title: '设备与协议接入评估',
        description:
          '根据型号、固件、寄存器或节点资料评估 Modbus TCP/RTU、OPC UA、MQTT 等接入方向；具体设备、功能与兼容性需逐项联调确认。',
      },
      {
        title: '边缘采集与质量标记',
        description:
          '拟按点位周期设计边缘任务、连接与重试、缓存及补传策略，保留来源、单位、时间戳和质量状态，区分离线、读取失败与有效零值。',
      },
      {
        title: '趋势、告警与平台上报',
        description:
          '按业务用途规划历史趋势、阈值告警、确认记录和数据上报，分别表达采集成功与上报成功；采样频率、存储周期和告警规则按现场条件约定。',
      },
    ],
    technologies: [
      'Java / Spring Boot',
      '边缘采集',
      'Modbus TCP / RTU（待评估）',
      'OPC UA（待评估）',
      'MQTT（待评估）',
      '时序存储（按需）',
    ],
    solutionIds: ['industrial'],
    preparation: [
      '设备型号、固件版本、协议手册与点位表，包含地址或节点、类型、字节序、单位及读写属性。',
      '现场网络与边缘运行环境说明、设备访问授权及可联调窗口；由客户协调设备厂商、现场人员和硬件条件。',
      '采样周期、质量判定、趋势留存、告警规则及上报目标接口，配脱敏样例与代表性设备的确认标准。',
    ],
    caseIds: ['industrial-iot-monitoring'],
    postSlugs: ['java-industrial-collection-architecture', 'modbus-tcp-opc-ua-integration'],
    scope:
      '协议名称仅为接入评估方向，不代表本站已实现或通过现场兼容验收。默认讨论只读采集，不包含设备控制；硬件采购、厂商授权、现场网络和停机安排需另行落实，不承诺无条件兼容或数据永不丢失。',
  },
  {
    id: 'enterprise-management',
    title: 'ERP / OA / 合同管理系统',
    summary: '采购、费用和合同反复传表时，按单据关联、审批职责与履约节点梳理业务闭环。',
    icon: 'tabler:building-community',
    description:
      '当采购、库存、费用与合同记录分散，审批依靠群聊、履约靠人工提醒时，拟从一个高频单据流程切入，统一台账与组织权限。可讨论独立模块，也可围绕已有 ERP 或 OA 做补充集成。',
    scenarios: ['采购、库存与成本费用台账', '办公审批与项目协作', '合同审批、履约与到期跟进'],
    deliverables: [
      '单据模型、组织权限、审批与统计口径说明',
      '约定模块的管理后台、流程配置与报表源码',
      '数据导入模板、迁移对账及操作交接文档',
    ],
    capabilities: [
      {
        title: '单据与统一业务台账',
        description:
          '拟统一客户、供应商、物料和项目标识，关联采购、入库、费用与合同单据；保留来源、修改记录和统计口径，减少重复录入。',
      },
      {
        title: '组织权限与审批规则',
        description:
          '按岗位、部门和金额条件梳理发起、审批、退回、撤回及委托规则；流程引擎按复杂度评估，不把所有审批都做成复杂流程平台。',
      },
      {
        title: '合同履约与系统对接',
        description: '规划合同版本、交付节点、收付款计划与到期提醒，并按客户确认的业务口径设计汇总视图和既有系统接口。',
      },
    ],
    technologies: ['Java / Spring Boot', 'Vue', 'MySQL', 'REST API', '工作流引擎（按需）'],
    solutionIds: ['enterprise', 'contract'],
    preparation: [
      '脱敏单据、合同模板及现有台账，说明采购、库存、成本费用与履约之间的关联。',
      '组织岗位、数据范围、审批条件及例外处理规则，指定业务确认人和迁移数据负责人。',
      '既有 ERP/OA 接口、报表口径、历史数据样例与导入范围；明确哪些外部服务已获授权。',
    ],
    caseIds: ['enterprise-erp', 'contract-workflow'],
    postSlugs: ['enterprise-digital-transformation', 'spring-boot-enterprise-architecture'],
    scope:
      '客户负责确认制度、合同规则与数据口径，开发范围按模块约定。财务核算、税务申报、电子签章及第三方服务费用不默认包含；软件流程设计不替代法律或财税专业意见。',
  },
  {
    id: 'miniapp-mobile',
    title: '微信小程序与移动端开发',
    summary: '预约、查询、填报不便在手机完成时，把移动入口与 Java 后台办理流程一起设计。',
    icon: 'tabler:device-mobile',
    description:
      '面向业务型小程序、移动办公和既有管理系统的移动延伸，拟围绕查询、预约、提交与进度反馈设计页面。将移动端任务与 Java 后端、后台受理及履约状态关联，而不是只增加一个展示入口。',
    scenarios: ['预约、订单与服务进度查询', '企业移动办公与业务提交', '巡检填报与既有后台的移动延伸'],
    deliverables: [
      '移动任务路径、页面与接口范围说明',
      '约定的小程序或 H5 源码、Java 接口与配套后台',
      '平台配置说明、审核资料清单及业务操作指引',
    ],
    capabilities: [
      {
        title: '围绕移动任务组织页面',
        description:
          '拟梳理浏览、查询、填写和提交路径，设计断网、空数据、重复提交及失败重试反馈；离线作业等特殊要求单独评估。',
      },
      {
        title: '前后台状态与权限衔接',
        description:
          '通过 Java REST API 关联申请、订单与后台办理记录，明确用户身份、岗位权限及状态变化；改造既有接口前先确认兼容边界。',
      },
      {
        title: '平台能力与隐私准备',
        description:
          '按业务必要性评估微信登录、订阅消息与支付，梳理所需个人信息、授权提示和配置前提，避免把平台开通或审核结果当作开发承诺。',
      },
    ],
    technologies: ['微信小程序', 'Vue / H5', 'uni-app（按需）', 'Java / Spring Boot', 'REST API'],
    solutionIds: ['mobile'],
    preparation: [
      '主要用户、移动业务流程、表单字段与办理状态，提供脱敏页面或现有系统操作说明。',
      '已有后台接口和授权范围，说明身份、消息、支付、定位等能力是否确需，以及目标机型和网络条件。',
      '平台主体与类目资质状态、服务内容和隐私材料；由客户负责主体认证、资质申请、业务内容及平台账号管理。',
    ],
    caseIds: ['mobile-service'],
    postSlugs: ['spring-boot-enterprise-architecture', 'enterprise-digital-transformation'],
    scope:
      '交付范围按端、页面、接口和后台模块确认。主体认证、支付申请及平台审核由客户与对应平台办理；开发交付不等于审核通过，也不包含流量、获客或经营效果承诺。',
  },
  {
    id: 'data-integration',
    title: '企业数据平台与系统集成',
    summary: '同一业务信息在多个系统中对不上时，先统一数据口径，再设计接口、同步与对账。',
    icon: 'tabler:database',
    description:
      '面向 ERP、业务平台与设备数据需要汇总，却存在重复录入、标识冲突和同步失败难追踪的问题，拟先明确数据所有者、读写方向和更新规则，再规划接口服务、同步任务及查询视图。',
    scenarios: ['ERP、OA 与业务系统接口对接', '设备与多来源数据汇总', '经营报表、指标口径与数据看板'],
    deliverables: [
      '系统边界、数据映射与接口契约说明',
      '约定的接口源码、同步任务与运行记录入口',
      '指标口径、迁移对账、补偿及故障处置文档',
    ],
    capabilities: [
      {
        title: '接口契约与主数据口径',
        description:
          '拟明确字段、主键、时间口径、读写权限与错误响应，按 REST API 或既有接口能力设计映射，不默认直接改写第三方数据库。',
      },
      {
        title: '同步、补偿与对账设计',
        description:
          '根据接口限额和时效选择批量、定时或事件驱动方式，规划幂等标识、失败重试、人工补偿及差异对账，避免把重试等同于必然成功。',
      },
      {
        title: '数据视图与问题追踪',
        description:
          '按确认后的指标口径规划看板，保留来源、最近成功更新时间和处理状态，区分无数据、同步失败及有效零值，便于定位异常环节。',
      },
    ],
    technologies: ['Java / Spring Boot', 'REST API', 'SQL / MySQL', '消息队列（按需）', '数据可视化'],
    solutionIds: ['industrial', 'enterprise'],
    preparation: [
      '源系统与目标系统清单、数据负责人、字段字典和脱敏样例，列明主数据归属与冲突处理规则。',
      '接口文档、访问授权方式、调用限额及联调环境；客户协调第三方接口开放与系统所有者配合。',
      '同步频率、历史迁移量、对账标准及失败处置责任人，明确哪些数据可读、可写或不可出域。',
    ],
    caseIds: ['industrial-iot-monitoring', 'enterprise-erp'],
    postSlugs: ['java-industrial-collection-architecture', 'spring-boot-enterprise-architecture'],
    scope:
      '客户负责提供合法的数据使用授权并协调外部系统；第三方改造、接口收费与数据清洗责任单独约定。实时性与一致性目标须结合接口能力、网络和历史数据质量评估，不承诺任意系统无条件接入。',
  },
  {
    id: 'system-upgrade',
    title: '系统升级与维护',
    summary: '旧系统改动难、运行问题难定位时，先查清现状，再按风险安排升级、迁移与维护。',
    icon: 'tabler:tool',
    description:
      '面向已有 Java、Vue 系统的二次开发、依赖老化、慢查询或部署交接困难，拟结合源码与脱敏运行资料定位问题，制定分阶段改造路径。优先处理可界定的问题，不默认整套重写或直接修改生产环境。',
    scenarios: ['既有系统功能扩展与接口改造', '架构、依赖升级及数据迁移', '数据库性能排查与部署维护交接'],
    deliverables: [
      '现状评估、问题复现条件与风险清单',
      '约定范围的改造源码、数据库或部署配置说明',
      '迁移与回退步骤、备份恢复说明及维护边界清单',
    ],
    capabilities: [
      {
        title: '问题定位与优化建议',
        description:
          '结合脱敏日志、错误复现、SQL 与索引资料区分业务缺陷、数据库瓶颈和环境限制；性能优化先约定基线与目标，不预设提升比例。',
      },
      {
        title: '渐进改造与部署迁移',
        description:
          '拟按模块安排 Java/Spring、Vue 和依赖升级，核对接口及数据兼容性；Docker 部署、迁移窗口与回退路径按实际环境评估。',
      },
      {
        title: '维护责任与知识交接',
        description:
          '梳理日志、监控、备份和恢复步骤，明确问题受理、版本发布、客户确认及第三方处置边界，按约定周期提供维护文档与协作安排。',
      },
    ],
    technologies: ['Java / Spring Boot', 'Vue', 'SQL / 数据库优化', 'Docker（按需）', '日志与监控', '迁移与回退设计'],
    solutionIds: ['enterprise'],
    preparation: [
      '已获授权的源码、依赖版本与部署架构说明，列明数据库版本、外部依赖及当前维护责任人。',
      '可复现步骤、脱敏日志与 SQL 样例，说明业务影响、发生频率、现有性能基线和改造目标。',
      '备份恢复现状、可用验证环境、变更审批人及迁移窗口；生产变更、访问授权与维护响应等级另行约定。',
    ],
    caseIds: ['enterprise-erp'],
    postSlugs: ['docker-deployment-practice', 'spring-boot-enterprise-architecture'],
    scope:
      '先确认源码、依赖和环境的使用授权，以及备份与回退条件，再约定改造范围。客户负责协调原厂、业务确认及生产变更审批；不默认包含生产操作、第三方故障处置或全天候值守，不承诺固定修复时间。',
  },
];
