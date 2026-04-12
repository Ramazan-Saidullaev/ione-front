/** Исправляет URL, если бэкенд отдал внешнюю ссылку с префиксом /media/ */
export function parseMediaUrl(url: string): string {
  if (!url) return url;
  const mediaHttpIndex = url.indexOf("/media/http");
  if (mediaHttpIndex !== -1) {
    return url.substring(mediaHttpIndex + 7);
  }
  const mediaHttpsIndex = url.indexOf("/media/https");
  if (mediaHttpsIndex !== -1) {
    return url.substring(mediaHttpsIndex + 7);
  }
  const mediaWwwIndex = url.indexOf("/media/www.");
  if (mediaWwwIndex !== -1) {
    return `https://${url.substring(mediaWwwIndex + 7)}`;
  }
  return url;
}

export function resolveStudentMediaSrc(apiBaseUrl: string, url: string | null | undefined): string {
  if (!url) return "";
  const u = parseMediaUrl(url.trim());
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  return `${apiBaseUrl}${u.startsWith("/") ? u : `/${u}`}`;
}
