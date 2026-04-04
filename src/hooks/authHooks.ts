import { useEffect } from "react";
import { api } from "../api";
import { loadSession, clearSession, saveSession } from "../storage";
import type { AuthResponse, UserRole } from "../types";
import { getErrorMessage } from "../utils/helpers";

export function useRoleSession(
  scope: "teacher" | "student",
  expectedRole: UserRole,
  setSession: (value: AuthResponse | null) => void,
  setAuthLoading: (value: boolean) => void
) {
  useEffect(() => {
    const existing = loadSession(scope);
    if (!existing) {
      setAuthLoading(false);
      return;
    }

    api.me(existing.accessToken)
      .then(() => {
        if (existing.role !== expectedRole) throw new Error(`This page is only available for ${expectedRole.toLowerCase()} users.`);
        setSession(existing);
      })
      .catch(() => {
        clearSession(scope);
        setSession(null);
      })
      .finally(() => setAuthLoading(false));
  }, [expectedRole, scope, setAuthLoading, setSession]);
}

export async function handleRoleLogin(
  scope: "teacher" | "student", expectedRole: UserRole, email: string, password: string,
  setBusy: (value: boolean) => void, setError: (value: string | null) => void, onSuccess: (result: AuthResponse) => void
) {
  setBusy(true); setError(null);
  try {
    const result = await api.login({ email: email.trim(), password });
    if (result.role !== expectedRole) throw new Error(`Signed in user role is ${result.role}, not ${expectedRole}.`);
    saveSession(scope, result);
    onSuccess(result);
  } catch (error: unknown) { setError(getErrorMessage(error)); } finally { setBusy(false); }
}