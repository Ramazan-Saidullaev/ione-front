import { useState } from "react";
import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import { loadSession, clearSession } from "../../storage";
import { GlobalHeader } from "../../components/GlobalHeader";
import type { AuthResponse } from "../../types";
import { useRoleSession } from "../../hooks/authHooks";
import { TeacherRiskDashboardPage } from "./TeacherRiskDashboardPage";
import { TeacherAutoTestResultsPage } from "./TeacherAutoTestResultsPage";
import { TeacherStudentTestResultsPage } from "./TeacherStudentTestResultsPage";
import { TeacherStudentsProgressPage } from "./TeacherStudentsProgressPage";

export function TeacherPage() {
  const [session, setSession] = useState<AuthResponse | null>(() => loadSession("teacher"));
  const [authLoading, setAuthLoading] = useState<boolean>(Boolean(loadSession("teacher")));

  useRoleSession("teacher", "TEACHER", setSession, setAuthLoading);

  function handleLogout() {
    clearSession("teacher");
    setSession(null);
  }

  if (authLoading) return <div className="shell loading-shell">Проверка сохранённой сессии учителя...</div>;

  if (!session) {
    return (
      <main className="shell route-shell">
        <GlobalHeader />
        <section className="hero-panel">
          <p className="eyebrow">Раздел учителя</p>
          <h1>Сначала нужно войти через общую страницу входа.</h1>
          <p className="lead">Используйте вход на странице `/auth` — после авторизации сайт автоматически перенаправит учителя сюда.</p>
          <a className="route-card compact-route-card" href="/auth"><h2>Перейти ко входу</h2><p>Открыть общую страницу входа и регистрации.</p></a>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <GlobalHeader />
      <section className="topbar">
        <div>
          <p className="eyebrow">Раздел учителя</p>
          <h1>Панель учителя</h1>
        </div>
        <div className="topbar-actions">
          <div className="identity-card">
            <span>{session.fullName ? "Учитель" : "ID учителя"}</span>
            <strong>{session.fullName || session.userId}</strong>
          </div>
          <button className="ghost-button" onClick={handleLogout} type="button">Выйти</button>
        </div>
      </section>

      <nav className="page-nav" aria-label="Страницы учителя">
        <NavLink to="/teachers" end>
          Панель рисков
        </NavLink>
        <NavLink to="/teachers/tests">Авто‑результаты психологических тестов</NavLink>
        <NavLink to="/teachers/progress">Прогресс курсов</NavLink>
      </nav>

      <Routes>
        <Route path="/" element={<TeacherRiskDashboardPage session={session} />} />
        <Route path="/tests" element={<TeacherAutoTestResultsPage session={session} />} />
        <Route path="/tests/:studentId/results" element={<TeacherStudentTestResultsPage session={session} />} />
        <Route path="/progress" element={<TeacherStudentsProgressPage session={session} />} />
        <Route path="*" element={<Navigate to="." replace />} />
      </Routes>
    </main>
  );
}