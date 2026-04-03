import type { AuthResponse } from "./types";

function getStorageKey(scope: string): string {
  return `console-auth-${scope}`;
}

export function loadSession(scope: string): AuthResponse | null {
  const raw = localStorage.getItem(getStorageKey(scope));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    localStorage.removeItem(getStorageKey(scope));
    return null;
  }
}

export function saveSession(scope: string, session: AuthResponse): void {
  localStorage.setItem(getStorageKey(scope), JSON.stringify(session));
}

export function clearSession(scope: string): void {
  localStorage.removeItem(getStorageKey(scope));
}
