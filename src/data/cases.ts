import { evidenceStatus, type ContentEvidence } from '~/data/evidence';

export type CaseVariant = 'industrial' | 'enterprise' | 'contract' | 'mobile';

export interface CasePoint {
  title: string;
  description: string;
}

export interface CaseStudy {
  id: string;
  title: string;
  category: string;
  summary: string;
  /** 概念方案的设计选型，不是项目实际使用记录。 */
  stack: string[];
  variant: CaseVariant;
  label: '演示案例';
  evidence?: ContentEvidence;
  solutionIds?: string[];
  serviceIds?: string[];
  postSlugs?: string[];
  scope: string[];
  background: string[];
  painPoints: CasePoint[];
  approach: CasePoint[];
  features: CasePoint[];
  architecture: {
    layer: string;
    technology: string;
    description: string;
  }[];
  screens: {
    title: string;
    description: string;
    highlights: string[];
  }[];
  /** 预期设计目标，不是已测得的业务成果。 */
  value: CasePoint[];
  boundary: string;
}

export const caseDemoNotice =
  '本栏目均为 REISUN 自主设计的演示案例，业务背景为虚拟场景，页面使用模拟数据与原创概念示意。技术标签与架构仅为设计选型，价值仅为预期目标，不代表实际使用记录、真实客户、已交付项目或测得成效。';

export const cases: CaseStudy[] = [
  {
    id: 'industrial-iot-monitoring',
    title: '工业物联网采集与监控平台',
    category: '工业物联网',
    summary: '以虚拟产线为背景，演示设备、点位与告警工作台的设计思路，不连接真实设备。',
    stack: ['Java / Spring Boot', 'Vue 3 / TypeScript', 'PostgreSQL', 'MQTT / Modbus TCP'],
    variant: 'industrial',
    label: '演示案例',
    evidence: {
      status: evidenceStatus.concept,
      summary: '可核实的是本站的工业概念界面与方案说明；本轮未获得足够的采集后端、协议联调或客户交付证据。',
      sources: [
        'src/data/cases.ts#industrial-iot-monitoring',
        'src/components/reisun/SystemPreview.astro (industrial)',
        'src/pages/cases/[slug].astro',
      ],
      pending: ['获授权的采集实现材料', '脱敏的设备型号、协议范围与联调记录', '客户案例公开授权及可追溯成果依据'],
    },
    solutionIds: ['industrial'],
    serviceIds: ['industrial-iot', 'data-integration', 'java-enterprise'],
    postSlugs: ['java-industrial-collection-architecture', 'modbus-tcp-opc-ua-integration'],
    scope: ['设备与点位建模', '采集运行工作台', '告警与历史追溯'],
    background: [
      '设定场景是一处包含多条产线的虚拟制造现场。设备来自不同批次，现场人员希望在一个入口查看设备档案、采集点位、运行状态和告警记录，而不是在多个工具间反复核对。',
      '这个演示关注采集平台的信息组织与异常处理路径：配置是否已保存、采集任务是否已启动、设备是否建立连接、数据是否仍然新鲜，应当分别表达。页面中的设备名称、读数和趋势均为模拟内容。',
    ],
    painPoints: [
      {
        title: '接入配置缺少统一语境',
        description: '协议参数、设备档案和点位映射分散，排查时难以判断问题发生在配置、连接还是数据转换环节。',
      },
      {
        title: '一个“在线”不足以说明状态',
        description: '采集进程运行不等于设备可达，历史读数也不等于当前读数，需要让未知、异常和正常有明确区别。',
      },
      {
        title: '告警难以回到现场上下文',
        description: '只看到告警文字，无法同时了解关联设备、点位、阈值规则和处理记录，容易丢失排查线索。',
      },
    ],
    approach: [
      {
        title: '先统一设备与点位模型',
        description:
          '用设备、连接、点位和采集任务描述现场对象；协议适配器承担数据读取与转换，业务页面不直接绑定某一种协议。',
      },
      {
        title: '再建立分层运行视图',
        description:
          '分别展示期望配置、任务执行、连接状态和最近成功采集时间；保留最后一次已知读数时，同时标注其时间与过期状态。',
      },
      {
        title: '把告警带回处理流程',
        description: '按设备和规则关联告警、确认记录与历史趋势，让值班人员沿着同一条线索查看原因、记录判断并交接。',
      },
    ],
    features: [
      { title: '设备档案', description: '按站点、产线与设备类型组织资产，关联连接参数、维护说明和点位清单。' },
      { title: '协议配置', description: '按协议呈现必要字段与校验提示，区分保存配置、请求启动和实际连接结果。' },
      {
        title: '点位工作台',
        description: '定义标识、数据类型、单位与读取方式，提供转换规则和数据质量标记的设计入口。',
      },
      { title: '运行监控', description: '并列呈现采集任务、连接状态、读数与成功时间，不把未知状态显示为正常。' },
      { title: '告警闭环', description: '设计规则、触发记录、确认与处理备注，保留操作人和关联设备上下文。' },
      { title: '历史查询', description: '按设备、点位和时间范围检索历史数据，明确空数据、读取失败与数据过期的区别。' },
    ],
    architecture: [
      {
        layer: '现场接入层',
        technology: 'MQTT / Modbus TCP 适配设计',
        description: '规划协议适配、连接生命周期、点位读取与质量标记；官网演示不连接现场设备。',
      },
      {
        layer: '采集与应用层',
        technology: 'Java / Spring Boot',
        description:
          '拟用此选型组织设备配置、任务调度、数据标准化与告警规则；这里只说明分层职责，未提供采集后端实现记录。',
      },
      {
        layer: '数据层',
        technology: 'PostgreSQL / 历史数据分区设计',
        description:
          '拟管理设备主数据、点位定义、告警记录与时间序列；这不是本站数据库，历史存储方案需按采集规模另行评估。',
      },
      {
        layer: '操作界面',
        technology: 'Vue 3 / TypeScript',
        description: '规划设备工作台、趋势视图和异常处理入口；本页仅使用静态原创示意。',
      },
    ],
    screens: [
      {
        title: '采集运行总览',
        description: '优先呈现待处理异常，再查看任务和设备状态，模拟读数始终保留来源提示。',
        highlights: ['运行与连接分开', '异常优先', '模拟趋势'],
      },
      {
        title: '设备与点位工作台',
        description: '在设备上下文内组织连接配置、点位定义和最近读数，避免跨页面丢失排查目标。',
        highlights: ['配置分组', '完整单位', '数据新鲜度'],
      },
      {
        title: '告警追溯视图',
        description: '围绕一次告警串联规则、关联点位、历史区间和处理说明，表达设计中的追溯路径。',
        highlights: ['规则关联', '处理记录', '历史区间'],
      },
    ],
    value: [
      {
        title: '形成统一的现场语境',
        description: '预期通过一致的设备、连接和点位模型形成共同语境；能否适配目标设备，仍需实现与联调证据。',
      },
      {
        title: '让异常有可解释的入口',
        description:
          '设计目标是通过分层状态与数据时间区分配置、通信和过期数据问题；尚无真实运维效率或故障恢复成效记录。',
      },
      {
        title: '为后续集成保留接口',
        description:
          '预期按采集、存储和业务呈现分层，为 MES、能源管理或运维系统的对接留下讨论边界，不代表已有集成成果。',
      },
    ],
    boundary:
      '本案例不提供实际采集服务，不证明任何工业协议兼容性、设备吞吐能力或生产安全等级。真实项目需单独确认现场网络、设备协议、数据规模与安全要求。',
  },
  {
    id: 'enterprise-erp',
    title: 'ERP 企业运营协同系统',
    category: '企业管理',
    summary: '以虚拟企业为背景，演示订单、采购、库存与岗位协作的信息结构，不使用真实经营数据。',
    stack: ['Java / Spring Boot', 'Vue 3 / TypeScript', 'PostgreSQL', '角色与数据权限'],
    variant: 'enterprise',
    label: '演示案例',
    evidence: {
      status: evidenceStatus.concept,
      summary: '可核实的是本站的单据协同概念界面与业务设计；本轮未获得足够的 ERP 实现、库存一致性或客户交付证据。',
      sources: [
        'src/data/cases.ts#enterprise-erp',
        'src/components/reisun/SystemPreview.astro (enterprise)',
        'src/pages/cases/[slug].astro',
      ],
      pending: ['获授权的业务模块实现材料', '脱敏的单据规则、权限与库存核对记录', '客户案例公开授权及可追溯成果依据'],
    },
    solutionIds: ['enterprise'],
    serviceIds: ['enterprise-management', 'java-enterprise', 'data-integration'],
    postSlugs: ['spring-boot-enterprise-architecture', 'enterprise-digital-transformation'],
    scope: ['订单与采购协同', '库存与出入库', '经营台账与权限'],
    background: [
      '设定场景是一家兼有销售、采购与仓储环节的虚拟企业。不同岗位分别记录订单、收发货与结算信息，需要一个围绕业务单据组织协作的管理系统。',
      '演示以“销售需求如何关联采购和出库”为主线，呈现共享主数据、单据状态和库存变动之间的关系。商品、订单、库存与金额均为模拟数据，不对应任何真实企业的经营情况。',
    ],
    painPoints: [
      {
        title: '数据口径各自维护',
        description: '客户、供应商与商品名称在多个表格中重复维护，同一对象难以被稳定识别。',
      },
      {
        title: '单据与库存缺少关联',
        description: '订单状态、待入库数量和实际库存分别更新，业务人员很难知道一个库存变化来自哪张单据。',
      },
      {
        title: '协作边界不清晰',
        description: '不同岗位需要看到和处理的信息不同，单纯按菜单分权限不足以表达组织与数据范围。',
      },
    ],
    approach: [
      {
        title: '以主数据建立共同语言',
        description: '统一商品、客户、供应商、仓库与组织的标识和维护规则，保留停用状态而不是删除已被单据引用的对象。',
      },
      {
        title: '让单据驱动业务变动',
        description:
          '围绕草稿、审核、执行与关闭组织流转，库存变动关联来源单据；撤销与冲销保留原始轨迹，不直接覆盖历史。',
      },
      {
        title: '把权限放回具体岗位',
        description: '按角色、组织和业务范围设计可见与可操作边界，让销售、采购、仓储和管理人员使用同一套业务语言。',
      },
    ],
    features: [
      { title: '基础资料', description: '集中管理商品、往来单位与仓库，明确编码、状态与历史引用关系。' },
      { title: '销售订单', description: '组织订单明细、交付计划和执行状态，关联后续采购或出库单据。' },
      { title: '采购协同', description: '从需求形成采购单，记录到货、验收与入库的关联关系。' },
      { title: '库存台账', description: '区分账面、占用与可用数量，按来源单据追溯出入库变动。' },
      { title: '经营视图', description: '按明确口径设计订单和库存汇总，区分业务统计与财务核算。' },
      { title: '角色与审计', description: '规划岗位权限、组织数据范围和关键操作留痕，避免只依赖页面按钮控制。' },
    ],
    architecture: [
      {
        layer: '业务工作台',
        technology: 'Vue 3 / TypeScript',
        description: '拟按岗位组织待办、单据与查询界面；Vue 仅为方案选型，本站示意由 Astro 静态组件呈现。',
      },
      {
        layer: '应用服务',
        technology: 'Java / Spring Boot',
        description: '拟按订单、采购和库存划分业务模块，在应用边界校验操作条件与数据范围；不表示已有可运行的业务后端。',
      },
      {
        layer: '数据与事务',
        technology: 'PostgreSQL',
        description: '规划主数据、单据、库存流水和审计记录，在事务边界内维护单据与库存的一致性。',
      },
      {
        layer: '集成边界',
        technology: '接口契约 / 导入导出设计',
        description: '为财务或第三方系统预留映射和对账边界；演示不连接真实财务、税务或支付服务。',
      },
    ],
    screens: [
      {
        title: '运营工作台',
        description: '把角色待办、业务概览与异常单据放在同一视野，图表使用明确标注的模拟口径。',
        highlights: ['岗位待办', '单据入口', '口径说明'],
      },
      {
        title: '订单协同视图',
        description: '从一张订单查看关联采购、交付安排与执行记录，设计信息可追踪的单据链。',
        highlights: ['状态流转', '关联单据', '变更记录'],
      },
      {
        title: '库存追溯视图',
        description: '在库存汇总下查看明细流水与来源单据，让数量变化有据可查。',
        highlights: ['库存口径', '来源明细', '冲销说明'],
      },
    ],
    value: [
      {
        title: '减少口径歧义',
        description: '预期通过统一主数据和单据定义减少岗位间的口径歧义，是否减少重复录入需由真实业务使用记录验证。',
      },
      {
        title: '让协作能够追溯',
        description: '设计目标是按来源单据与业务流水追溯变化；示意不证明真实库存准确性，也没有测得协作效率提升。',
      },
      {
        title: '按业务边界逐步扩展',
        description: '预期从订单与库存逐步扩展到所需模块，不预设一次替换全部系统；实施成本与收益仍需结合实际流程评估。',
      },
    ],
    boundary:
      '本案例不是财务软件或税务服务，不提供真实库存、会计核算、报税或经营分析结果。库存与成本规则、组织结构及外部系统对接需在真实项目中另行确认。',
  },
  {
    id: 'contract-workflow',
    title: '合同审批与履约流程平台',
    category: '流程协同',
    summary: '以虚拟审批场景，演示合同版本、流程节点与履约事项的关联设计，不包含真实合同记录。',
    stack: ['Java / Spring Boot', 'Vue 3 / TypeScript', 'PostgreSQL', '流程状态机'],
    variant: 'contract',
    label: '演示案例',
    evidence: {
      status: evidenceStatus.concept,
      summary: '可核实的是本站的审批节点概念界面与版本关联设计；本轮未获得足够的流程实现、签章接入或客户交付证据。',
      sources: [
        'src/data/cases.ts#contract-workflow',
        'src/components/reisun/SystemPreview.astro (contract, approvalSteps)',
        'src/pages/cases/[slug].astro',
      ],
      pending: [
        '获授权且不含合同原件的技术说明',
        '脱敏的版本关联、审批权限与流程核验记录',
        '案例文字和示意素材的公开授权',
      ],
    },
    solutionIds: ['contract'],
    serviceIds: ['enterprise-management', 'java-enterprise', 'data-integration'],
    postSlugs: ['spring-boot-enterprise-architecture', 'enterprise-digital-transformation'],
    scope: ['合同资料与版本', '条件审批流程', '履约事项与归档'],
    background: [
      '设定场景是一个需要业务、法务和财务共同审核合同的虚拟团队。合同文本经多次修改，审批意见通过不同渠道传递，履约事项则在审批结束后另行整理。',
      '这个演示围绕“一次审批到底批准了哪个版本”展开，将文本版本、审批实例与履约计划放在同一条业务链上。合同名称、金额、人员与节点记录都是模拟数据。',
    ],
    painPoints: [
      {
        title: '文本版本与审批脱节',
        description: '审批意见指向的文本不明确，修改后的附件可能覆盖旧版本，难以还原当时的审核依据。',
      },
      {
        title: '审批条件依赖口头约定',
        description: '合同类型、金额区间与组织不同，审核路径也可能不同，需要把条件与退回处理说明清楚。',
      },
      {
        title: '批准之后仍有工作',
        description: '付款、交付、到期和归档事项缺少统一入口，审批通过并不意味着履约已完成。',
      },
    ],
    approach: [
      {
        title: '让审批绑定明确版本',
        description:
          '以合同版本形成待审核快照；发起新版本时保留旧版本及其意见，避免将历史审批自动解释为对新文本的认可。',
      },
      {
        title: '显式表达流转规则',
        description: '根据合同类别、金额与组织设计条件节点，区分待审批、退回、撤回和通过；每个节点都有明确的操作边界。',
      },
      {
        title: '从审批延伸到履约',
        description:
          '将付款、交付和续约等事项关联到合同台账，记录负责人、计划日期与处理说明，不把审批完成等同于合同完成。',
      },
    ],
    features: [
      { title: '合同起草', description: '组织基本信息、合同类型、相对方与附件，提示必填资料和待确认事项。' },
      { title: '版本管理', description: '保留版本说明、变更记录与对应附件，展示审批所依据的文本版本。' },
      { title: '条件审批', description: '规划按业务条件选择节点的流转规则，明确退回、撤回和重新提交的状态。' },
      { title: '审批工作台', description: '聚合待办、意见和流程轨迹，在合同上下文内呈现审批依据。' },
      { title: '履约提醒', description: '设计付款、交付、到期和续约事项的计划与跟进入口，提醒为概念设计。' },
      {
        title: '档案与权限',
        description: '按角色和合同范围规划文件访问、下载和操作留痕，不将附件地址公开为通用访问入口。',
      },
    ],
    architecture: [
      {
        layer: '协作界面',
        technology: 'Vue 3 / TypeScript',
        description: '拟围绕起草、审核和履约组织角色视图；Vue 为设计选型，不是此静态示意的实际框架记录。',
      },
      {
        layer: '流程与业务',
        technology: 'Java / Spring Boot / 流程状态机',
        description: '拟以业务规则校验合同状态、条件节点与审批操作；本页没有执行状态机或真实审批。',
      },
      {
        layer: '资料与记录',
        technology: 'PostgreSQL / 对象存储接口设计',
        description: '规划合同元数据、版本快照、审批轨迹与附件权限，文件内容与访问授权分开管理。',
      },
      {
        layer: '外部服务边界',
        technology: '通知与电子签章适配接口',
        description: '仅预留通知和签章的集成边界；本地展示未接入消息、电子签章或实名认证服务。',
      },
    ],
    screens: [
      {
        title: '合同协作工作台',
        description: '把待审批合同、履约事项与流程状态放在一处，示例人员与事项均为虚构。',
        highlights: ['角色待办', '状态分组', '履约入口'],
      },
      {
        title: '版本与审批视图',
        description: '围绕一个明确版本组织附件、变更说明和节点意见，不混用其他版本的审批结果。',
        highlights: ['版本快照', '节点意见', '退回路径'],
      },
      {
        title: '履约台账视图',
        description: '按合同串联计划日期、责任角色和事项状态，为后续跟进提供概念性的信息结构。',
        highlights: ['计划事项', '责任角色', '归档说明'],
      },
    ],
    value: [
      {
        title: '明确审批依据',
        description: '预期通过版本与流程实例绑定明确审批依据；是否能还原真实审核过程，需以获授权的实现与核验记录确认。',
      },
      {
        title: '让规则可被讨论',
        description: '设计目标是让业务、法务与技术共同讨论审批边界；不替代组织内部授权制度，也不表示已降低合规风险。',
      },
      {
        title: '持续关注履约事项',
        description: '预期将审批后的计划纳入跟进范围；提醒与归档仍为设计方向，没有真实履约完成率或处理时效记录。',
      },
    ],
    boundary:
      '本案例不提供法律意见，也不构成电子签约、实名认证或合规认证服务。签章效力、授权规则、文件保留与隐私要求需由真实项目的相关责任方确认。',
  },
  {
    id: 'mobile-service',
    title: '小程序预约与服务管理',
    category: '小程序应用',
    summary: '以虚拟门店为背景，演示预约、排期与服务跟进的概念流程，不是可运行的小程序。',
    stack: ['微信小程序 / TypeScript', 'Java / Spring Boot', 'PostgreSQL', 'Vue 3 管理端'],
    variant: 'mobile',
    label: '演示案例',
    evidence: {
      status: evidenceStatus.concept,
      summary: '可核实的是本站的移动入口与后台协同示意；本轮未获得足够的小程序运行、预约服务或客户交付证据。',
      sources: [
        'src/data/cases.ts#mobile-service',
        'src/components/reisun/SystemPreview.astro (mobile)',
        'src/pages/cases/[slug].astro',
      ],
      pending: ['获授权的小程序与预约后端材料', '脱敏的容量、幂等及平台接入核验记录', '平台主体及案例素材公开授权'],
    },
    solutionIds: ['mobile'],
    serviceIds: ['miniapp-mobile', 'java-enterprise'],
    postSlugs: ['spring-boot-enterprise-architecture', 'docker-deployment-practice'],
    scope: ['移动预约入口', '门店排期工作台', '服务记录与跟进'],
    background: [
      '设定场景是一个提供到店服务的虚拟品牌。用户需要了解服务内容、选择门店与时段，并在预约后查看进度；门店人员需要管理可约时段、接待安排和服务记录。',
      '演示从用户提交预约到门店完成服务串起移动端与管理端，重点表达预约容量、状态变化与操作反馈。门店、服务项目、用户资料与订单全部为模拟内容。',
    ],
    painPoints: [
      {
        title: '预约信息无法进入排期',
        description: '表单或聊天记录中的预约需要人工重新整理，用户选择的时段也未必与门店的实际容量一致。',
      },
      {
        title: '状态变化缺少反馈',
        description: '用户不清楚预约是否被确认，门店也难以统一处理改期、取消和已到店等不同状态。',
      },
      {
        title: '移动入口与后台各自独立',
        description: '服务目录、门店排期和服务记录缺少关联，运营人员难以在同一上下文内跟进。',
      },
    ],
    approach: [
      {
        title: '围绕预约任务组织移动页面',
        description: '让用户按服务、门店与时段完成选择，在确认前展示预约内容和取消规则，不用后台结构直接堆叠手机页面。',
      },
      {
        title: '让预约服从容量与状态规则',
        description: '规划时段容量、占位与确认规则，重复提交使用幂等标识；改期和取消先检查当前状态，再回收或调整容量。',
      },
      {
        title: '用管理端衔接服务跟进',
        description:
          '将排期、接待和服务记录放在门店工作台，移动端与管理端围绕同一预约单交换状态，明确各自可操作的范围。',
      },
    ],
    features: [
      { title: '服务目录', description: '呈现服务说明、可预约门店和预约须知，让用户先了解再选择。' },
      { title: '时段预约', description: '规划可约日期、时段容量和提交确认，展示无可用时段与提交失败时的恢复方向。' },
      {
        title: '预约进度',
        description: '组织待确认、已确认、已完成和已取消等状态，避免用模糊的“处理中”代替业务说明。',
      },
      { title: '门店排期', description: '按日期和服务查看预约，管理门店营业安排与临时不可预约时段。' },
      { title: '服务记录', description: '关联到店与服务处理记录，按岗位限制用户资料的可见范围。' },
      {
        title: '消息与运营入口',
        description: '规划用户授权后的提醒和服务内容维护，通知、支付与平台登录均未实际接入。',
      },
    ],
    architecture: [
      {
        layer: '用户移动端',
        technology: '微信小程序 / TypeScript',
        description: '规划服务浏览、时段选择和预约记录；本页展示网页原创概念图，不是可运行的小程序。',
      },
      {
        layer: '预约应用服务',
        technology: 'Java / Spring Boot',
        description: '拟由后端处理身份边界、容量校验、幂等提交与状态流转；官网没有执行预约逻辑或接入业务 API。',
      },
      {
        layer: '业务数据',
        technology: 'PostgreSQL',
        description: '规划门店、服务、排期、预约单与服务记录，使用一致的状态和关联标识。',
      },
      {
        layer: '门店与运营端',
        technology: 'Vue 3 / 平台服务适配接口',
        description: '设计排期和内容维护入口；登录、订阅通知与支付需在真实项目取得授权并单独接入。',
      },
    ],
    screens: [
      {
        title: '移动服务首页',
        description: '以服务选择和预约入口为重点，让手机上的首要操作不被运营信息淹没。',
        highlights: ['服务目录', '清晰入口', '模拟门店'],
      },
      {
        title: '预约确认与进度',
        description: '确认页说明所选服务与时段，记录页表达改期、取消和完成后的下一步。',
        highlights: ['确认信息', '业务状态', '恢复方向'],
      },
      {
        title: '门店排期工作台',
        description: '围绕日期和门店组织容量、预约和接待记录，说明移动入口背后的业务协同。',
        highlights: ['时段容量', '预约列表', '服务跟进'],
      },
    ],
    value: [
      {
        title: '降低移动操作的理解负担',
        description: '预期按预约任务安排信息与反馈，供后续可用性评估；尚无真实用户研究或转化率提升记录。',
      },
      {
        title: '让前台与后台共享规则',
        description: '设计目标是用统一业务模型描述预约容量和状态；是否避免超约、重复提交需由实际实现与核验确认。',
      },
      {
        title: '按需连接平台能力',
        description: '预期按业务与授权条件独立评估登录、通知和支付，不代表已通过平台审核、完成支付接入或取得经营收益。',
      },
    ],
    boundary:
      '本案例不采集真实个人资料，不提供可运行的小程序、微信登录、订阅消息或支付能力。上线所需的平台主体、隐私授权与服务资质需在真实项目中另行确认。',
  },
];

export const caseCategories = [...new Set(cases.map((item) => item.category))];
