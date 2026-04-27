import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api";
import { GlobalHeader } from "../../components/GlobalHeader";
import { InfoBox } from "../../components/InfoBox";
import { loadSession } from "../../storage";
import { useLang } from "../../hooks/useLang";
import type { AuthResponse, TeacherStudent } from "../../types";
import { getErrorMessage } from "../../utils/helpers";

export function TeacherProfilePage() {
  const { t } = useTranslation();
  const lang = useLang();
  const [session] = useState<AuthResponse | null>(() => loadSession("teacher"));
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    setError(null);
    api
      .getTeacherStudents(session.accessToken)
      .then(setStudents)
      .catch((e: unknown) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [session]);

  if (!session) {
    return (
      <main className="shell route-shell">
        <GlobalHeader />
        <section className="hero-panel">
          <p className="eyebrow">{t("common.profile")}</p>
          <h1>{t("teacherProfile.needLogin")}</h1>
          <p className="lead">{t("teacherProfile.needLoginDesc")}</p>
          <a className="route-card compact-route-card" href={`/${lang}/auth`}>
            <h2>{t("common.loginToAccount")}</h2>
            <p>{t("common.openAuthPage")}</p>
          </a>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <GlobalHeader />
      <section className="topbar">
        <div>
          <p className="eyebrow">{t("teacherProfile.eyebrow")}</p>
          <h1>{session.fullName || t("teacher.teacherLabel")}</h1>
        </div>
        <div className="topbar-actions">
          <Link className="ghost-button" to={`/${lang}/teachers`}>
            {t("common.back")}
          </Link>
        </div>
      </section>

      <section style={{ padding: "0 0 24px" }} className="animate-fade-in">
        <div className="list-animate" style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <InfoBox label={t("teacherProfile.role")} value={t("teacher.teacherLabel")} />
          <InfoBox label={t("teacherProfile.school")} value={session.schoolName || "—"} />
          <InfoBox label={t("teacherProfile.homeroom")} value={session.homeroomClass || "—"} />
          <InfoBox label={t("teacherProfile.studentsCount")} value={loading ? "…" : String(students.length)} />
        </div>
      </section>

      <section className="animate-fade-in" style={{ padding: "0 0 32px", animationDelay: "0.1s" }}>
        <div className="card" style={{ padding: "18px 18px" }}>
          <div className="section-heading" style={{ marginBottom: "12px" }}>
            <p className="eyebrow">{t("teacherProfile.listEyebrow")}</p>
            <h2>{t("teacherProfile.yourStudents")}</h2>
          </div>

          {error ? <div className="banner error">{error}</div> : null}
          {loading ? <div className="empty-state">{t("teacherProfile.loadingStudents")}</div> : null}
          {!loading && students.length === 0 ? (
            <div className="empty-state">
              <strong>{t("teacherProfile.noStudents")}</strong>
              <p>{t("teacherProfile.noStudentsHint")}</p>
            </div>
          ) : null}

          {!loading && students.length > 0 ? (
            <div className="list-animate" style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {students.map((s) => (
                <div key={s.id} className="hero-note">
                  <span>{t("teacherProfile.studentLabel")}</span>
                  <strong>{s.fullName}</strong>
                  <span style={{ marginTop: "6px" }}>{t("teacherProfile.classLabel")}: {s.className || "—"}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

