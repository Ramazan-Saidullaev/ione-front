import { useState } from "react";
import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import { loadSession, clearSession } from "../storage";
import { GlobalHeader } from "../components/GlobalHeader";
import type { AuthResponse } from "../types";
import { useRoleSession } from "../hooks/authHooks";
import { TeacherRiskDashboardPage } from "./teacher/TeacherRiskDashboardPage";
import { TeacherAutoTestResultsPage } from "./teacher/TeacherAutoTestResultsPage";
import { TeacherStudentTestResultsPage } from "./teacher/TeacherStudentTestResultsPage";
import { TeacherStudentsProgressPage } from "./teacher/TeacherStudentsProgressPage";

export function TeacherPage() {
  const [session, setSession] = useState<AuthResponse | null>(() => loadSession("teacher"));
  const [authLoading, setAuthLoading] = useState<boolean>(Boolean(loadSession("teacher")));

  useRoleSession("teacher", "TEACHER", setSession, setAuthLoading);

  function handleLogout() {
    clearSession("teacher");
    setSession(null);
  }

  if (authLoading) return <div className="shell loading-shell">Checking saved teacher session...</div>;

  if (!session) {
    return (
      <main className="shell route-shell">
        <GlobalHeader />
        <section className="hero-panel">
          <p className="eyebrow">Teacher Console</p>
          <h1>You need to sign in from the main page first.</h1>
          <p className="lead">Use the unified login on `/auth`, then the site will redirect teachers here automatically.</p>
          <a className="route-card compact-route-card" href="/auth"><h2>Go to login</h2><p>Open the shared login and registration page.</p></a>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <GlobalHeader />
      <section className="topbar">
        <div>
          <p className="eyebrow">Teacher Console</p>
          <h1>Teacher dashboard</h1>
        </div>
        <div className="topbar-actions">
          <div className="identity-card">
            <span>{session.fullName ? "Teacher" : "Teacher ID"}</span>
            <strong>{session.fullName || session.userId}</strong>
          </div>
          <button className="ghost-button" onClick={handleLogout} type="button">Log out</button>
        </div>
      </section>

      <nav className="page-nav" aria-label="Teacher pages">
        <NavLink to="/teachers" end>
          Risk dashboard
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