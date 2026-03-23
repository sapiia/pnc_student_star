// Period input normalization utils
export const normalizePeriodInput = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const normalized = trimmed.replace(/\s+/g, " ").toUpperCase();
  const qMatch = normalized.match(/^Q([1-4])\s*(\d{4})$/);
  if (qMatch) return `${qMatch[2]}-Q${qMatch[1]}`;
  const altMatch = normalized.match(/^(\d{4})\s*-\s*Q([1-4])$/);
  if (altMatch) return `${altMatch[1]}-Q${altMatch[2]}`;
  return trimmed;
};

export const formatPeriodInput = (value: string): string => {
  const trimmed = String(value || "").trim();
  const quarterMatch = trimmed.match(/^(\d{4})-Q([1-4])$/i);
  if (quarterMatch) return `Q${quarterMatch[2]} ${quarterMatch[1]}`;
  return trimmed;
};

export const formatLongDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
};

export const toPeriodTitle = (period: string): string => {
  const trimmed = String(period || "").trim();
  const quarterMatch = trimmed.match(/^(\d{4})-Q([1-4])$/i);
  if (quarterMatch) {
    return `Q${quarterMatch[2]} ${quarterMatch[1]} Evaluation`;
  }
  return `${trimmed || "Evaluation"} Evaluation`;
};

export const buildNextDueDate = (
  submittedAt: string,
  cycleDays: number,
): string => {
  const date = new Date(submittedAt);
  if (Number.isNaN(date.getTime())) return "";
  date.setDate(date.getDate() + cycleDays);
  return date.toISOString();
};
