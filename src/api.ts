/**
 * Central API configuration.
 * Set VITE_API_URL in your .env file for production deployments.
 * Defaults to localhost:3001 for local development.
 */
export const API_BASE = (import.meta.env.VITE_API_URL as string) ?? 'http://localhost:3001';

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
