export const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "时间未知";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
};

export const formatRelativeTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return "今天更新";
  }
  if (diffDays === 1) {
    return "昨天更新";
  }
  if (diffDays < 7) {
    return `${diffDays} 天前更新`;
  }
  if (diffDays < 30) {
    return `${Math.floor(diffDays / 7)} 周前更新`;
  }
  return `${Math.floor(diffDays / 30)} 月前更新`;
};
