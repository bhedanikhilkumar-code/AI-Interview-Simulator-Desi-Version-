const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

export const getGuestToken = () => localStorage.getItem("guestToken") || "";

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json", ...(options.headers as Record<string, string> || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!token && getGuestToken()) headers["x-guest-token"] = getGuestToken();

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export const apiUrl = API_URL;
