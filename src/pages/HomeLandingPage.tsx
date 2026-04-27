import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../api";
import { GlobalHeader } from "../components/GlobalHeader";
import { useLang } from "../hooks/useLang";
import type { Course } from "../types";

export function HomeLandingPage() {
  const { t } = useTranslation();
  const lang = useLang();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  useEffect(() => {
    setCoursesLoading(true);
    setCoursesError(null);
    api
      .getCourses()
      .then(setCourses)
      .catch((e: unknown) => {
        setCourses([]);
        setCoursesError(e instanceof Error ? e.message : t("landing.loadCoursesError"));
      })
      .finally(() => setCoursesLoading(false));
  }, []);

  const ageGroups = useMemo(() => {
    const set = new Set<string>();
    for (const c of courses) {
      const v = c.ageGroup?.trim();
      if (v) set.add(v);
    }
    return Array.from(set);
  }, [courses]);

  const featuredCourses = useMemo(() => courses.slice(0, 6), [courses]);

  return (
    <main className="landing-shell byjus-landing">
      <GlobalHeader />

      <section className="byjus-hero" id="product">
        <div className="byjus-hero-inner">
          <div className="byjus-hero-copy">
            <div className="byjus-badges">
              <span className="byjus-badge">{t("landing.badges.age")}</span>
              <span className="byjus-badge">{t("landing.badges.microLessons")}</span>
              <span className="byjus-badge">{t("landing.badges.practice")}</span>
            </div>

            <h1 className="byjus-h1">{t("landing.hero.title")}</h1>
            <p className="byjus-lead">
              {t("landing.hero.description")}
            </p>

            <div className="byjus-cta">
              <a className="byjus-btn byjus-btn-primary" href={`/${lang}/auth`}>{t("landing.hero.startFree")}</a>
              <a className="byjus-btn byjus-btn-ghost" href={`/${lang}/public-courses`}>{t("landing.hero.viewCourses")}</a>
            </div>

            <div className="byjus-trust">
              <div className="byjus-trust-item">
                <strong>{coursesLoading ? "…" : courses.length}</strong>
                <span>{t("landing.trust.coursesInCatalog")}</span>
              </div>
              <div className="byjus-trust-item">
                <strong>{coursesLoading ? "…" : ageGroups.length || "—"}</strong>
                <span>{t("landing.trust.ageGroups")}</span>
              </div>
              <div className="byjus-trust-item">
                <strong>{t("landing.trust.lessonDuration")}</strong>
                <span>{t("landing.trust.perLesson")}</span>
              </div>
            </div>

            {coursesError ? <div className="byjus-inline-error">{coursesError}</div> : null}
          </div>

          <div className="byjus-hero-media" aria-hidden="true">
            <div className="byjus-media-card">
              <img className="byjus-hero-img" src="/landing-hero.svg" alt="" />
            </div>
            <div className="byjus-float byjus-float-1">
              <strong>{t("landing.progress.title")}</strong>
              <span>{t("landing.progress.visibleToTeacher")}</span>
            </div>
            <div className="byjus-float byjus-float-2">
              <strong>{t("landing.feedback.title")}</strong>
              <span>{t("landing.feedback.noOverload")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="byjus-section" id="catalog">
        <div className="byjus-section-head">
          <p className="byjus-kicker">{t("landing.catalog.kicker")}</p>
          <h2 className="byjus-h2">{t("landing.catalog.title")}</h2>
          <p className="byjus-text">{t("landing.catalog.subtitle")}</p>
        </div>

        {coursesLoading ? (
          <div className="byjus-course-grid" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="byjus-course-skeleton" />
            ))}
          </div>
        ) : featuredCourses.length === 0 ? (
          <div className="byjus-empty">
            <strong>{t("landing.catalog.noCourses")}</strong>
            <span>{t("landing.catalog.noCoursesHint")}</span>
          </div>
        ) : (
          <div className="byjus-course-grid">
            {featuredCourses.map((course) => (
              <a key={course.id} className="byjus-course-card" href={`/${lang}/public-courses`}>
                <div className="byjus-course-top">
                  <strong>{course.title}</strong>
                  <span className="byjus-pill">{course.ageGroup || t("common.forAll")}</span>
                </div>
                <p>{course.description || t("landing.catalog.defaultDescription")}</p>
                <div className="byjus-course-cta">
                  <span>{t("common.open")}</span>
                  <span className="byjus-arrow">→</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="byjus-section" id="features">
        <div className="byjus-section-head">
          <p className="byjus-kicker">{t("landing.howItWorks.kicker")}</p>
          <h2 className="byjus-h2">{t("landing.howItWorks.title")}</h2>
          <p className="byjus-text">
            {t("landing.howItWorks.description")}
          </p>
        </div>

        <div className="byjus-split">
          <div className="byjus-split-copy">
            <div className="byjus-step">
              <div className="byjus-step-dot">1</div>
              <div>
                <strong>{t("landing.howItWorks.step1Title")}</strong>
                <span>{t("landing.howItWorks.step1Desc")}</span>
              </div>
            </div>
            <div className="byjus-step">
              <div className="byjus-step-dot">2</div>
              <div>
                <strong>{t("landing.howItWorks.step2Title")}</strong>
                <span>{t("landing.howItWorks.step2Desc")}</span>
              </div>
            </div>
            <div className="byjus-step">
              <div className="byjus-step-dot">3</div>
              <div>
                <strong>{t("landing.howItWorks.step3Title")}</strong>
                <span>{t("landing.howItWorks.step3Desc")}</span>
              </div>
            </div>
            <div className="byjus-note">
              {t("landing.howItWorks.psychNote")}
            </div>
          </div>

          <div className="byjus-split-media" aria-hidden="true">
            <img className="byjus-figure" src="/landing-learning.svg" alt="" />
          </div>
        </div>

        <div className="byjus-grid">
          <div className="byjus-card">
            <strong>{t("landing.features.finance")}</strong>
            <span>{t("landing.features.financeDesc")}</span>
          </div>
          <div className="byjus-card">
            <strong>{t("landing.features.cyber")}</strong>
            <span>{t("landing.features.cyberDesc")}</span>
          </div>
          <div className="byjus-card">
            <strong>{t("landing.features.law")}</strong>
            <span>{t("landing.features.lawDesc")}</span>
          </div>
          <div className="byjus-card">
            <strong>{t("landing.features.communication")}</strong>
            <span>{t("landing.features.communicationDesc")}</span>
          </div>
          <div className="byjus-card">
            <strong>{t("landing.features.teacherPanel")}</strong>
            <span>{t("landing.features.teacherPanelDesc")}</span>
          </div>
          <div className="byjus-card">
            <strong>{t("landing.features.recommendations")}</strong>
            <span>{t("landing.features.recommendationsDesc")}</span>
          </div>
        </div>
      </section>

      <section className="byjus-section" id="audience">
        <div className="byjus-section-head">
          <p className="byjus-kicker">{t("landing.audience.kicker")}</p>
          <h2 className="byjus-h2">{t("landing.audience.title")}</h2>
        </div>

        <div className="byjus-audience">
          <div className="byjus-audience-card">
            <strong>{t("landing.audience.students")}</strong>
            <span>{t("landing.audience.studentsDesc")}</span>
          </div>
          <div className="byjus-audience-card">
            <strong>{t("landing.audience.teachers")}</strong>
            <span>{t("landing.audience.teachersDesc")}</span>
          </div>
          <div className="byjus-audience-card">
            <strong>{t("landing.audience.parents")}</strong>
            <span>{t("landing.audience.parentsDesc")}</span>
          </div>
        </div>

        <div className="byjus-split byjus-split-tight">
          <div className="byjus-split-media" aria-hidden="true">
            <img className="byjus-figure" src="/landing-teacher.svg" alt="" />
          </div>
          <div className="byjus-split-copy">
            <h3 className="byjus-h3">{t("landing.teacherAnalytics.title")}</h3>
            <p className="byjus-text">
              {t("landing.teacherAnalytics.description")}
            </p>
            <div className="byjus-mini">
              <strong>{t("landing.teacherAnalytics.riskSignals")}</strong>
              <span>{t("landing.teacherAnalytics.riskSignalsDesc")}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="byjus-cta">
        <div className="byjus-cta-inner">
          <div>
            <p className="byjus-kicker">{t("landing.cta.kicker")}</p>
            <h2 className="byjus-h2">{t("landing.cta.title")}</h2>
            <p className="byjus-text" style={{ margin: 0 }}>
              {t("landing.cta.description")}
            </p>
          </div>
          <div className="byjus-cta-actions">
            <a className="byjus-btn byjus-btn-primary" href={`/${lang}/auth`}>{t("landing.cta.register")}</a>
            <a className="byjus-btn byjus-btn-ghost" href={`/${lang}/public-courses`}>{t("landing.cta.openCourses")}</a>
          </div>
        </div>
      </section>

      <footer className="site-footer" id="privacy">
        <div className="footer-brand">
          <strong>SanaU</strong>
          <p>{t("landing.footer.description")}</p>
        </div>
        <div className="footer-links">
          <a href="mailto:support@sanau.local">support@sanau.local</a>
          <a href="https://t.me/" target="_blank" rel="noreferrer">
            Telegram
          </a>
          <a href="https://instagram.com/" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href={`/${lang}/auth`}>{t("common.login")}</a>
          <a href="#privacy">{t("landing.footer.privacyPolicy")}</a>
        </div>
      </footer>
    </main>
  );
}
