const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

export async function api(path: string, options: RequestInit = {}, token?: string, guestToken?: string) {
  const headers = new Headers(options.headers || {});
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  if (guestToken) headers.set('x-guest-token', guestToken);
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) throw new Error((await res.json()).message || 'Request failed');
  return res;
}
