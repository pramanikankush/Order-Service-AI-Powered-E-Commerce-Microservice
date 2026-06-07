import axios, { AxiosError, AxiosRequestConfig } from "axios";

/**
 * Typed API client.
 * - Tries the real Spring Boot backend at /api/...
 * - If the backend is unreachable, transparently falls back to an in-memory demo
 *   implementation so the UI remains fully functional.
 * - Retries idempotent requests (GET / PUT / DELETE) once on transient
 *   network errors to absorb brief flakiness.
 */

function resolveApiBase(): string {
  const win = typeof window !== "undefined" ? (window as unknown as { __API_BASE__?: string }) : undefined;
  const fromWindow = win?.__API_BASE__?.trim();
  if (fromWindow) return fromWindow;
  const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env;
  const fromEnv = env?.VITE_API_BASE?.trim();
  if (fromEnv) return fromEnv;
  return "http://localhost:8080/api";
}

export const API_BASE = resolveApiBase();

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: { "Content-Type": "application/json" },
});

const IDEMPOTENT_METHODS = new Set(["get", "put", "delete", "head", "options"]);

api.interceptors.response.use(
  (r) => r,
  async (error: AxiosError) => {
    const config = error.config as (AxiosRequestConfig & { __retry?: boolean }) | undefined;
    if (!config || !config.method) throw error;

    const method = config.method.toLowerCase();
    const isIdempotent = IDEMPOTENT_METHODS.has(method);
    const isNetwork = !error.response;
    if (!isIdempotent || !isNetwork || config.__retry) throw error;

    config.__retry = true;
    await new Promise((res) => setTimeout(res, 250));
    return api.request(config);
  }
);

export function setOwnerKey(key: string | undefined | null) {
  const trimmed = (key || "").trim();
  if (trimmed) api.defaults.headers.common["X-Owner-Key"] = trimmed;
  else delete api.defaults.headers.common["X-Owner-Key"];
}

export function isBackendReachable(err: unknown): boolean {
  if (!err) return false;
  const e = err as AxiosError;
  // A response (even 4xx/5xx) means backend IS reachable
  return !!e?.response;
}

export function extractError(err: unknown): string {
  const e = err as AxiosError<{ message?: string; error?: string }>;
  if (e?.response?.data?.message) return e.response.data.message;
  if (e?.response?.data?.error && e.response.status >= 500) return e.response.data.error;
  if (e?.code === "ERR_NETWORK") return "Cannot reach the backend. Running in demo mode.";
  if (e?.message) return e.message;
  return "Unknown error";
}
