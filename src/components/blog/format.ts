/** Blog presentation only; keep collection dates and RSS values unchanged. */
export const formatChineseDate = (date: Date): string =>
  new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Shanghai',
  }).format(date);

export const formatReadingTime = (minutes?: number): string | undefined =>
  minutes && Number.isFinite(minutes) ? `约 ${Math.max(1, Math.ceil(minutes))} 分钟阅读` : undefined;
