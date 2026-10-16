/**
 * 品牌与联系信息的唯一配置入口。
 * 仅展示用户确认公开的联系方式；未提供的电话、二维码等保持为空且不显示占位。
 * 正式启用联系渠道时，应同时核实联系方式、二维码及页面说明。
 * 本配置不提供在线提交接口；联系表单始终仅作前端演示。
 */
import { METADATA, SITE } from 'astrowind:config';

export type ContactField = 'phone' | 'email' | 'wechat' | 'wechatQrCode';
export type BrandProfileField = 'legalName' | 'location' | 'icpNumber' | 'github';

export interface BrandData {
  name: string | null;
  domain: string | null;
  positioning: string | null;
  tagline: string | null;
  description: string | null;
  legalName: string | null;
  location: string | null;
  icpNumber: string | null;
  github: string | null;
  confirmed: Record<BrandProfileField, boolean>;
  contact: Record<ContactField, string | null> & {
    configured: boolean;
    confirmed: Record<ContactField, boolean>;
    notice: string;
    formMode: 'demo';
    formNotice: string;
  };
}

export const brand: BrandData = {
  name: SITE.name || null,
  domain: SITE.site || null,
  positioning: '软件开发与技术服务',
  tagline: '让技术真正服务业务。',
  description: METADATA.description || null,
  legalName: null,
  location: null,
  icpNumber: null,
  github: null,
  confirmed: { legalName: false, location: false, icpNumber: false, github: false },
  contact: {
    configured: true,
    confirmed: { phone: false, email: true, wechat: true, wechatQrCode: true },
    phone: null,
    email: '958070007@qq.com',
    wechat: 'TBHGS2020',
    wechatQrCode: '/images/wechat-contact-qr.png',
    notice: '请通过下方微信或邮箱交流开发需求。在线表单仅作演示，不发送或保存填写内容。',
    formMode: 'demo',
    formNotice: '当前为演示模式，暂未开通在线提交，请通过正式联系方式联系。',
  },
};

/** 双重门控：填写值不等于获得公开确认；表单模式不会随联系方式改变。 */
export function getConfirmedContact(field: ContactField): string | null {
  const value = brand.contact[field];
  return brand.contact.configured && brand.contact.confirmed[field] && value?.trim() ? value : null;
}

export function getConfirmedProfile(field: BrandProfileField): string | null {
  const value = brand[field];
  if (!brand.confirmed[field] || !value?.trim()) return null;
  if (field === 'github') {
    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' || url.hostname !== 'github.com' || url.username || url.password) return null;
    } catch {
      return null;
    }
  }
  return value;
}

export const hasConfirmedContact = (): boolean =>
  (['phone', 'email', 'wechat', 'wechatQrCode'] as const).some((field) => getConfirmedContact(field) !== null);
