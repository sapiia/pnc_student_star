export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:3001/api";
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
export const DEFAULT_AVATAR = `${API_ORIGIN}/uploads/logo/star_gmail_logo.jpg`;

export const resolveAvatarUrl = (
  value: string | null | undefined,
  fallback: string = DEFAULT_AVATAR,
): string => {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  if (/^https?:\/\//i.test(raw) || raw.startsWith("data:") || raw.startsWith("blob:")) {
    return raw;
  }
  const normalizedPath = raw.startsWith("/") ? raw : `/${raw}`;
  return `${API_ORIGIN}${normalizedPath}`;
};
