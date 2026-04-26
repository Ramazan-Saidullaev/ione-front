import { ApiError } from "../api";
import { UserRole } from "../types";

export function redirectToRole(role: UserRole) {
  const target = role === "ADMIN" ? "/admin" : role === "TEACHER" ? "/teachers" : role === "STUDENT" ? "/students" : "/";
  window.location.href = target;
}

export function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Неизвестная ошибка";
}