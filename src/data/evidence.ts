/** 内容证据状态只表达证据边界，不代表客户授权、商业交付或现场兼容性验收。 */
export const evidenceStatus = {
  verified: 'verified-fact',
  capability: 'technical-capability',
  concept: 'concept-demo',
  pending: 'pending-confirmation',
} as const;

export type EvidenceStatus = (typeof evidenceStatus)[keyof typeof evidenceStatus];

export interface ContentEvidence {
  status: EvidenceStatus;
  summary: string;
  /** 本地审计依据，不自动发布原始材料、源码或内部地址。 */
  sources: string[];
  pending: string[];
}

export const evidenceLabels: Record<EvidenceStatus, string> = {
  [evidenceStatus.verified]: '已验证事实',
  [evidenceStatus.capability]: '已核实技术能力',
  [evidenceStatus.concept]: '概念演示',
  [evidenceStatus.pending]: '待用户确认',
};
