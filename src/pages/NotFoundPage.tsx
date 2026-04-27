import { useTranslation } from "react-i18next";
import { GlobalHeader } from "../components/GlobalHeader";
import { useLang } from "../hooks/useLang";

export function NotFoundPage() {
  const { t } = useTranslation();
  const lang = useLang();

  return (
    <main className="shell route-shell">
      <GlobalHeader />
      <section className="hero-panel">
        <p className="eyebrow">{t("notFound.eyebrow")}</p>
        <h1>{t("notFound.title")}</h1>
        <p className="lead">{t("notFound.description")}</p>
        <div className="route-grid">
          <a className="route-card" href={`/${lang}/teachers`}>
            <h2>/teachers</h2>
            <p>{t("notFound.teacherSection")}</p>
          </a>
          <a className="route-card" href={`/${lang}/students`}>
            <h2>/students</h2>
            <p>{t("notFound.studentSection")}</p>
          </a>
        </div>
      </section>
    </main>
  );
}