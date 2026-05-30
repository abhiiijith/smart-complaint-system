// Smart Complaint System API client
const STORAGE_KEY = "scs_api_base";
const TOKEN_KEY = "scs_token";
const USER_KEY = "scs_user";

export const DEFAULT_API_BASE = "http://127.0.0.1:8000";

export function getApiBase(): string {
  if (typeof window === "undefined") return DEFAULT_API_BASE;
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_API_BASE;
}

export function setApiBase(url: string) {
  localStorage.setItem(STORAGE_KEY, url.replace(/\/$/, ""));
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(t: string | null) {
  if (t) localStorage.setItem(TOKEN_KEY, t);
  else localStorage.removeItem(TOKEN_KEY);
}

export function getStoredUser(): { name?: string; email?: string } | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(u: { name?: string; email?: string } | null) {
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else localStorage.removeItem(USER_KEY);
}

export function imageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:/.test(path)) return path;
  return `${getApiBase()}/${path.replace(/^\//, "")}`;
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `${res.status} ${res.statusText}`;
    try {
      const j = await res.json();
      msg = j.detail || j.message || JSON.stringify(j);
    } catch {}
    throw new Error(msg);
  }
  return res.json() as Promise<T>;
}

function authHeaders(): Record<string, string> {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export interface Complaint {
  id: number;
  title: string;
  description: string;
  category: string;
  location: string;
  status: string;
  image?: string | null;
}

export const api = {
  register: (data: { name: string; email: string; password: string }) =>
    fetch(`${getApiBase()}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle<{ message: string }>),

  login: (data: { email: string; password: string }) =>
    fetch(`${getApiBase()}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }).then(handle<{ access_token: string; token_type: string }>),

  listComplaints: () =>
    fetch(`${getApiBase()}/complaints`, { headers: authHeaders() }).then(
      handle<Complaint[]>
    ),

  createComplaint: (form: FormData) =>
    fetch(`${getApiBase()}/complaints`, {
      method: "POST",
      headers: authHeaders(),
      body: form,
    }).then(handle<{ message: string; image?: string }>),

  updateStatus: (id: number, status: string) =>
    fetch(`${getApiBase()}/complaints/${id}?status=${encodeURIComponent(status)}`, {
      method: "PUT",
      headers: authHeaders(),
    }).then(handle<{ message: string; updated_status: string }>),

  deleteComplaint: (id: number) =>
    fetch(`${getApiBase()}/complaints/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    }).then(handle<{ message: string }>),
};
