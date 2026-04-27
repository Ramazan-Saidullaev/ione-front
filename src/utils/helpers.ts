import i18n from "i18next";
import { ApiError } from "../api";
import { UserRole } from "../types";

function getCurrentLang(): string {
  const match = window.location.pathname.match(/^\/(ru|kz|en)/);
  return match ? match[1] : i18n.language || "ru";
}

export function redirectToRole(role: UserRole) {
  const lang = getCurrentLang();
  const target = role === "ADMIN" ? `/${lang}/admin` : role === "TEACHER" ? `/${lang}/teachers` : role === "STUDENT" ? `/${lang}/students` : `/${lang}`;
  window.location.href = target;
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const lang = getCurrentLang();
  const locale = lang === "kz" ? "kk-KZ" : lang === "en" ? "en-US" : "ru-RU";
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return i18n.t("common.unknownError");
}