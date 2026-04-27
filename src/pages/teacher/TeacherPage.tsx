import { useState } from "react";
import { NavLink, Route, Routes, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loadSession, clearSession } from "../../storage";
import { GlobalHeader } from "../../components/GlobalHeader";
import { useLang } from "../../hooks/useLang";
import type { AuthResponse } from "../../types";
import { useRoleSession } from "../../hooks/authHooks";
import { TeacherRiskDashboardPage } from "./TeacherRiskDashboardPage";
import { TeacherAutoTestResultsPage } from "./TeacherAutoTestResultsPage";
import { TeacherStudentTestResultsPage } from "./TeacherStudentTestResultsPage";
import { TeacherStudentsProgressPage } from "./TeacherStudentsProgressPage";

export function TeacherPage() {
  const { t } = useTranslation();
  const lang = useLang();
  const [session, setSession] = useState<AuthResponse | null>(() => loadSession("teacher"));
  const [authLoading, setAuthLoading] = useState<boolean>(Boolean(loadSession("teacher")));

  useRoleSession("teacher", "TEACHER", setSession, setAuthLoading);

  function handleLogout() {
    clearSession("teacher");
    setSession(null);
  }

  if (authLoading) return <div className="shell loading-shell">{t("teacher.loading")}</div>;

  if (!session) {
    return (
      <main className="shell route-shell">
        <GlobalHeader />
        <section className="hero-panel">
          <p className="eyebrow">{t("teacher.section")}</p>
          <h1>{t("teacher.loginRequired")}</h1>
          <p className="lead">{t("teacher.loginDescription")}</p>
          <a className="route-card compact-route-card" href={`/${lang}/auth`}><h2>{t("teacher.goToLogin")}</h2><p>{t("teacher.goToLoginDesc")}</p></a>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <GlobalHeader />
      <section className="topbar">
        <div>
          <p className="eyebrow">{t("teacher.section")}</p>
          <h1>{t("teacher.title")}</h1>
        </div>
        <div className="topbar-actions">
          <div className="identity-card">
            <span>{session.fullName ? t("teacher.teacherLabel") : t("teacher.teacherId")}</span>
            <strong>{session.fullName || session.userId}</strong>
          </div>
          <button className="ghost-button" onClick={handleLogout} type="button">{t("teacher.logout")}</button>
        </div>
      </section>

      <nav className="page-nav" aria-label={t("teacher.pagesAria")}>
        <NavLink to={`/${lang}/teachers`} end>
          {t("teacher.riskPanel")}
        </NavLink>
        <NavLink to={`/${lang}/teachers/tests`}>{t("teacher.tests")}</NavLink>
        <NavLink to={`/${lang}/teachers/progress`}>{t("teacher.progress")}</NavLink>
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