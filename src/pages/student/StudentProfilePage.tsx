import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GlobalHeader } from "../../components/GlobalHeader";
import { InfoBox } from "../../components/InfoBox";
import { loadSession } from "../../storage";
import { useLang } from "../../hooks/useLang";
import type { AuthResponse } from "../../types";

export function StudentProfilePage() {
  const { t } = useTranslation();
  const lang = useLang();
  const [session] = useState<AuthResponse | null>(() => loadSession("student"));

  if (!session) {
    return (
      <main className="shell route-shell">
        <GlobalHeader />
        <section className="hero-panel">
          <p className="eyebrow">{t("common.profile")}</p>
          <h1>{t("studentProfile.needLogin")}</h1>
          <p className="lead">{t("studentProfile.needLoginDesc")}</p>
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
          <p className="eyebrow">{t("studentProfile.eyebrow")}</p>
          <h1>{session.fullName || t("student.studentDefault")}</h1>
        </div>
        <div className="topbar-actions">
          <Link className="ghost-button" to={`/${lang}/students`}>
            {t("common.back")}
          </Link>
        </div>
      </section>

      <section style={{ padding: "0 0 32px" }} className="animate-fade-in">
        <div className="list-animate" style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <InfoBox label={t("studentProfile.role")} value={t("student.studentDefault")} />
          <InfoBox label={t("studentProfile.school")} value={session.schoolName || "—"} />
          <InfoBox label={t("studentProfile.yourClass")} value={session.className || "—"} />
          <InfoBox label={t("studentProfile.yourTeacher")} value={session.teacherFullName || "—"} />
        </div>
      </section>
    </main>
  );
}

