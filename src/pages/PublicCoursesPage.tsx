import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { GlobalHeader } from "../components/GlobalHeader";
import { VideoLessonPlayer } from "../components/VideoLessonPlayer";
import { useLang } from "../hooks/useLang";
import type { Course, Lesson } from "../types";

function getMediaUrl(path: string | undefined | null) {
  if (!path) return "";

  // Если бэкенд ошибочно склеил свой путь и внешнюю ссылку (например, YouTube)
  const externalMatch = path.match(/\/media\/(https?:\/\/.*)/);
  if (externalMatch) {
    return externalMatch[1];
  }

  if (path.startsWith("http")) return path;
  const baseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";
  return baseUrl + (path.startsWith("/") ? path : `/${path}`);
}

export function PublicCoursesPage() {
  const { t } = useTranslation();
  const lang = useLang();
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState<string | null>(null);

  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [lessonDetails, setLessonDetails] = useState<Lesson | null>(null);
  const [lessonDetailsLoading, setLessonDetailsLoading] = useState(false);
  const [isLessonVideoOpen, setIsLessonVideoOpen] = useState(false);
  const [resolvedLessonVideoUrl, setResolvedLessonVideoUrl] = useState<string>("");

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8081";

  // Загружаем публичные курсы
  useEffect(() => {
    setCoursesLoading(true);
    fetch(`${API_BASE}/api/public/courses`)
      .then((res) => {
        if (!res.ok) throw new Error(t("publicCourses.failedLoadCourses"));
        return res.json();
      })
      .then((data) => {
        setCourses(data);
        if (data.length > 0) setSelectedCourseId(data[0].id);
      })
      .catch((e) => setCoursesError(e.message))
      .finally(() => setCoursesLoading(false));
  }, [API_BASE]);

  // Загружаем уроки выбранного курса
  useEffect(() => {
    if (!selectedCourseId) {
      setLessons([]);
      return;
    }
    setLessonsLoading(true);
    fetch(`${API_BASE}/api/public/courses/${selectedCourseId}/lessons`)
      .then((res) => {
        if (!res.ok) throw new Error(t("publicCourses.failedLoadLessons"));
        return res.json();
      })
      .then((data) => {
        setLessons(data);
        if (data.length > 0) setSelectedLessonId(data[0].id);
        else setSelectedLessonId(null);
      })
      .catch((e) => setLessonsError(e.message))
      .finally(() => setLessonsLoading(false));
  }, [selectedCourseId, API_BASE]);

  // Загружаем содержимое выбранного урока
  useEffect(() => {
    if (!selectedLessonId) {
      setLessonDetails(null);
      setIsLessonVideoOpen(false);
      return;
    }
    setLessonDetailsLoading(true);
    fetch(`${API_BASE}/api/public/lessons/${selectedLessonId}`)
      .then((res) => {
        if (!res.ok) throw new Error(t("publicCourses.failedLoadLessonContent"));
        return res.json();
      })
      .then((data) => setLessonDetails(data))
      .catch((e) => console.error(e))
      .finally(() => setLessonDetailsLoading(false));
  }, [selectedLessonId, API_BASE]);

  return (
    <main className="dashboard-shell">
      <GlobalHeader />
      <section className="topbar">
        <div>
          <p className="eyebrow">{t("publicCourses.openAccessEyebrow")}</p>
          <h1>{t("publicCourses.catalogTitle")}</h1>
        </div>
        <div className="topbar-actions">
          <a className="primary-button" href={`/${lang}/auth`} style={{ textDecoration: "none" }}>
            {t("common.loginToAccount")}
          </a>
        </div>
      </section>

      <section className="student-dashboard-grid">
        {/* Боковая панель с курсами и уроками */}
        <aside className="card sidebar-card">
          <div className="section-heading">
            <p className="eyebrow">{t("publicCourses.programsEyebrow")}</p>
            <h2>{t("publicCourses.availableCourses")}</h2>
          </div>
          {coursesLoading && <div className="empty-state">{t("publicCourses.loadingCourses")}</div>}
          {coursesError && <div className="banner error">{coursesError}</div>}
          <div className="stack list-animate">
            {courses.length === 0 && !coursesLoading && <p className="muted-text">{t("publicCourses.noCoursesYet")}</p>}
            {courses.map((course) => (
              <button
                key={course.id}
                className={`student-card ${selectedCourseId === course.id ? "selected" : ""}`}
                onClick={() => setSelectedCourseId(course.id)}
                type="button"
              >
                <div className="student-card-top">
                  <strong>{course.title}</strong>
                  <span className="mini-pill">{course.ageGroup || t("common.forAll")}</span>
                </div>
                <p>{course.description || t("publicCourses.noDescription")}</p>
              </button>
            ))}
          </div>

          <div className="section-heading compact-heading" style={{ marginTop: "24px" }}>
            <p className="eyebrow">{t("publicCourses.courseMaterialsEyebrow")}</p>
            <h2>{t("publicCourses.lessonsTitle")}</h2>
          </div>
          {lessonsLoading && <div className="empty-state">{t("publicCourses.loadingLessons")}</div>}
          {lessonsError && <div className="banner error">{lessonsError}</div>}
          <div className="stack list-animate">
            {lessons.length === 0 && selectedCourseId && !lessonsLoading && (
              <p className="muted-text">{t("publicCourses.noLessonsInCourse")}</p>
            )}
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                className={`student-card ${selectedLessonId === lesson.id ? "selected" : ""}`}
                onClick={() => setSelectedLessonId(lesson.id)}
                type="button"
              >
                <div className="student-card-top">
                  <strong>
                    {lesson.orderNumber}. {lesson.title}
                  </strong>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Основная зона с контентом урока */}
        <section className="card details-card panel-animate">
          <div className="section-heading">
            <p className="eyebrow">{t("publicCourses.contentEyebrow")}</p>
            <h2>{t("publicCourses.lessonView")}</h2>
          </div>
          {lessonDetailsLoading && <div className="empty-state">{t("publicCourses.loadingLesson")}</div>}
          {!lessonDetailsLoading && lessonDetails && (
            <div className="details-layout animate-fade-in" key={`lesson-${selectedLessonId}`}>
              <div className="panel-block">
                <div className="content-card" style={{ fontSize: "1.05rem", lineHeight: 1.6 }}>
                  <h3 style={{ marginTop: 0 }}>{lessonDetails.title}</h3>
                  {lessonDetails.textContent?.trim() && (
                    <p style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>{lessonDetails.textContent.trim()}</p>
                  )}
                  
                  {/* Иногда API возвращает videoUrl, а иногда videoPath */}
                  {(lessonDetails.videoUrl || lessonDetails.videoPath) ? (
                    <div style={{ marginTop: lessonDetails.textContent?.trim() ? "24px" : "12px" }}>
                      <button
                        type="button"
                        className="primary-link-button"
                        onClick={() => {
                          const resolved = getMediaUrl(lessonDetails.videoUrl || lessonDetails.videoPath);
                          setResolvedLessonVideoUrl(resolved);
                          setIsLessonVideoOpen((prev) => !prev);
                        }}
                        style={{ display: "inline-block", border: "none", cursor: "pointer" }}
                      >
                        {isLessonVideoOpen ? t("publicCourses.hideVideo") : t("publicCourses.openVideo")}
                      </button>

                      {isLessonVideoOpen ? (
                        <VideoLessonPlayer
                          title={lessonDetails?.title ? `${t("publicCourses.lessonView")}: ${lessonDetails.title}` : t("publicCourses.lessonView")}
                          videoUrl={resolvedLessonVideoUrl}
                        />
                      ) : null}
                    </div>
                  ) : (
                    <p
                      className="muted-text"
                      style={{ marginTop: lessonDetails.textContent?.trim() ? "24px" : "12px" }}
                    >
                      {t("publicCourses.noVideo")}
                    </p>
                  )}
                </div>
              </div>

              {/* Блок призыва к регистрации вместо кнопки "Закончить урок" */}
              <div
                className="panel-block"
                style={{
                  marginTop: "24px",
                  background: "#f8fafc",
                  padding: "24px",
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                  textAlign: "center",
                }}
              >
                <p style={{ margin: "0 0 16px 0", color: "#334155", fontWeight: 500 }}>
                  {t("publicCourses.needLoginForProgress")}
                </p>
                <a className="primary-button" href={`/${lang}/auth`} style={{ display: "inline-block", textDecoration: "none" }}>
                  {t("publicCourses.loginOrRegister")}
                </a>
              </div>
            </div>
          )}
          {!lessonDetailsLoading && !lessonDetails && (
            <div className="empty-state">
              <strong>{t("publicCourses.noLessonSelected")}</strong>
              <p>{t("publicCourses.selectLessonHint")}</p>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}