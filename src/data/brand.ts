/**
 * 品牌与联系信息的唯一配置入口。
 * 联系信息尚未配置：不要把占位值拼接为 tel:、mailto: 或微信跳转链接。
 * 正式启用联系渠道时，应同时核实联系方式、二维码及页面说明。
 * 本配置不提供在线提交接口；联系表单始终仅作前端演示。
 */
export const brand = {
  name: 'REISUN',
  domain: 'https://reisun.cn',
  positioning: '独立软件开发品牌',
  tagline: '让业务需求，成为可靠的软件。',
  description: '面向企业业务系统、工业数据连接与多端应用的软件定制开发品牌。',
  contact: {
    configured: false,
    phone: '待配置',
    email: '待配置',
    wechat: '待配置',
    wechatQrCode: null as string | null,
    notice: '当前尚未配置正式联系信息，下方电话、邮箱和微信均为占位内容，暂不可用于联系。',
    formMode: 'demo',
    formNotice: '当前为演示模式，暂未开通在线提交，请通过正式联系方式联系。',
  },
} as const;
