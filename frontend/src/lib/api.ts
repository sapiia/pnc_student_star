export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api";
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, "");
export const DEFAULT_AVATAR = `${API_ORIGIN}/uploads/logo/star_gmail_logo.jpg`;

export const resolveAvatarUrl = (
  value: string | null | undefined,
  fallback: string = DEFAULT_AVATAR,
): string => {
  const raw = String(value || "").trim();
  if (!raw) return fallback;

  // If absolute URL but points to localhost, rewrite to production origin to avoid mixed content
  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      const isLocal =
        url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.hostname.endsWith('.local');
      if (isLocal) {
        const normalizedPath = url.pathname.startsWith('/') ? url.pathname : `/${url.pathname}`;
        return `${API_ORIGIN}${normalizedPath}`;
      }
      return raw;
    } catch {
      return raw;
    }
  }

  // Relative path
  const normalizedPath = raw.startsWith("/") ? raw : `/${raw}`;
  return `${API_ORIGIN}${normalizedPath}`;
};
