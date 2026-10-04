/**
 * Central API configuration.
 * - If VITE_API_URL is explicitly set (e.g. for production deployments), use it.
 * - In development, use an empty string (relative URLs) so Vite's proxy forwards
 *   /api/* and /uploads/* to the Express backend on port 3001 automatically.
 *   This avoids cross-origin (CORS) issues and works on localhost as well as
 *   phones/devices over Wi-Fi without any manual IP configuration.
 */
export const API_BASE: string = (() => {
  const envUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim();
  if (envUrl) {
    return envUrl.replace(/\/+$/, '');
  }

  // In dev, Vite proxies /api -> http://localhost:3001 — use relative URLs
  return '';
})();

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}

