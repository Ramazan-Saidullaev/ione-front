import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api";
import { loadSession, clearSession } from "../../storage";
import { GlobalHeader } from "../../components/GlobalHeader";
import { LessonCompletedModal } from "../../components/LessonCompletedModal";
import { VideoLessonPlayer } from "../../components/VideoLessonPlayer";
import { KpiGrid } from "../../components/dashboard/KpiGrid";
import { QuickActionsCard } from "../../components/dashboard/QuickActionsCard";
import { useLang } from "../../hooks/useLang";
import type {
  AuthResponse,
  CategoryResult,
  Course,
  FinishAttemptResponse,
  Lesson,
  StudentCourseProgress,
  StudentLessonProgress,
  StudentLessonScenarios,
  TestListItem,
  TestQuestion
} from "../../types";
import { getErrorMessage, formatDateTime } from "../../utils/helpers";
import { useRoleSession, handleRoleLogin } from "../../hooks/authHooks";
import { parseMediaUrl } from "../../utils/mediaUrl";

export function StudentPage() {
  const { t } = useTranslation();
  const lang = useLang();
  const navigate = useNavigate();
  const [session, setSession] = useState<AuthResponse | null>(() => loadSession("student"));
  const [authLoading, setAuthLoading] = useState<boolean>(Boolean(loadSession("student")));
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesError, setCoursesError] = useState<string | null>(null);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [courseProgress, setCourseProgress] = useState<Record<number, StudentCourseProgress>>({});
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonProgress, setLessonProgress] = useState<Record<number, StudentLessonProgress>>({});
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [lessonDetails, setLessonDetails] = useState<Lesson | null>(null);
  const [lessonScenarios, setLessonScenarios] = useState<StudentLessonScenarios | null>(null);
  const [lessonScenarioLoading, setLessonScenarioLoading] = useState(false);
  const [lessonDetailsLoading, setLessonDetailsLoading] = useState(false);
  const [lessonActionMessage, setLessonActionMessage] = useState<string | null>(null);
  const [lessonActionBusy, setLessonActionBusy] = useState(false);
  const [isLessonVideoOpen, setIsLessonVideoOpen] = useState(false);
  const [resolvedLessonVideoUrl, setResolvedLessonVideoUrl] = useState<string>("");
  const [tests, setTests] = useState<TestListItem[]>([]);
  const [testsError, setTestsError] = useState<string | null>(null);
  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [answersByQuestion, setAnswersByQuestion] = useState<Record<number, number>>({});
  const [answerBusyQuestionId, setAnswerBusyQuestionId] = useState<number | null>(null);
  const [finishResult, setFinishResult] = useState<FinishAttemptResponse | null>(null);
  const [testActionError, setTestActionError] = useState<string | null>(null);
  const [testActionBusy, setTestActionBusy] = useState(false);
  
  // Новые состояния для улучшения UI
  const [activeTab, setActiveTab] = useState<"courses" | "tests">("courses");
  const [unansweredQuestions, setUnansweredQuestions] = useState<number[]>([]);
  const [lessonCompletedLocally, setLessonCompletedLocally] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  useRoleSession("student", "STUDENT", setSession, setAuthLoading);

  useEffect(() => {
    if (!session) return;
    setCoursesLoading(true);
    setCoursesError(null);
    setTestsError(null);

    Promise.all([
      api.getCourses(),
      api.getStudentTests(session.accessToken),
      api.getStudentCourseProgress(session.accessToken)
    ])
      .then(([loadedCourses, loadedTests, loadedCourseProgress]) => {
        setCourses(loadedCourses);
        setTests(loadedTests);
        setCourseProgress(Object.fromEntries(loadedCourseProgress.map((item) => [item.courseId, item])));
        if (loadedCourses.length > 0) setSelectedCourseId((current) => current ?? loadedCourses[0].id);
        if (loadedTests.length > 0) setSelectedTestId((current) => current ?? loadedTests[0].id);
      })
      .catch((error: unknown) => {
        const message = getErrorMessage(error);
        setCoursesError(message);
        setTestsError(message);
      })
      .finally(() => setCoursesLoading(false));
  }, [session]);

  useEffect(() => {
    if (!selectedCourseId || !session) {
      setLessons([]);
      setLessonProgress({});
      return;
    }
    setLessonsLoading(true);
    setLessonsError(null);
    Promise.all([
      api.getCourseLessons(selectedCourseId),
      api.getCourseLessonProgress(session.accessToken, selectedCourseId)
    ])
      .then(([loadedLessons, loadedProgress]) => {
        setLessons(loadedLessons);
        setLessonProgress(Object.fromEntries(loadedProgress.map((item) => [item.lessonId, item])));
        if (loadedLessons.length > 0) {
          setSelectedLessonId((current) =>
            current && loadedLessons.some((lesson) => lesson.id === current) ? current : loadedLessons[0].id
          );
        } else {
          setSelectedLessonId(null);
          setLessonDetails(null);
          setLessonCompletedLocally(false);
        }
      })
      .catch((error: unknown) => {
        setLessons([]);
        setLessonProgress({});
        setLessonsError(getErrorMessage(error));
      })
      .finally(() => setLessonsLoading(false));
  }, [selectedCourseId, session]);

  useEffect(() => {
    setIsLessonVideoOpen(false);
    setResolvedLessonVideoUrl("");
    if (!selectedLessonId) {
      setLessonDetails(null);
      setLessonScenarios(null);
      setLessonCompletedLocally(false);
      setLessonActionMessage(null);
      return;
    }
    setLessonCompletedLocally(lessonProgress[selectedLessonId]?.status === "COMPLETED");
    setLessonDetailsLoading(true);
    setLessonScenarioLoading(true);
    api
      .getLesson(selectedLessonId)
      .then(setLessonDetails)
      .catch(() => setLessonDetails(null))
      .finally(() => setLessonDetailsLoading(false));
    if (session && selectedCourseId) {
      api
        .getLessonScenarios(session.accessToken, selectedCourseId, selectedLessonId)
        .then(setLessonScenarios)
        .catch(() => setLessonScenarios(null))
        .finally(() => setLessonScenarioLoading(false));
    } else {
      setLessonScenarios(null);
      setLessonScenarioLoading(false);
    }
  }, [selectedLessonId, lessonProgress, session, selectedCourseId]);

  useEffect(() => {
    if (!session || !selectedTestId) {
      setQuestions([]);
      return;
    }
    setQuestionsLoading(true);
    setQuestionsError(null);
    api
      .getStudentTest(session.accessToken, selectedTestId)
      .then((result) => {
        setQuestions(result);
        setAttemptId(null);
        setAnswersByQuestion({});
        setFinishResult(null);
        setTestActionError(null);
        setUnansweredQuestions([]);
      })
      .catch((error: unknown) => {
        setQuestions([]);
        setQuestionsError(getErrorMessage(error));
      })
      .finally(() => setQuestionsLoading(false));
  }, [selectedTestId, session]);

  const selectedCourseIndex = selectedCourseId ? courses.findIndex((course) => course.id === selectedCourseId) : -1;
  const selectedCourseProgress = selectedCourseId ? courseProgress[selectedCourseId] : undefined;
  const isCurrentCourseCompleted = Boolean(selectedCourseProgress?.completed);
  const currentLessonIndex = selectedLessonId ? lessons.findIndex((lesson) => lesson.id === selectedLessonId) : -1;
  const hasNextLesson = currentLessonIndex !== -1 && currentLessonIndex < lessons.length - 1;
  const hasNextCourse = selectedCourseIndex !== -1 && selectedCourseIndex < courses.length - 1;
  const programFullyCompleted =
    courses.length > 0 && courses.every((course) => courseProgress[course.id]?.completed === true);

  const completedCoursesCount = courses.filter((course) => courseProgress[course.id]?.completed).length;
  const totalLessonsCount = Object.values(courseProgress).reduce((sum, p) => sum + (p.totalLessons ?? 0), 0);
  const completedLessonsCount = Object.values(courseProgress).reduce((sum, p) => sum + (p.completedLessons ?? 0), 0);
  const selectedCoursePercent = selectedCourseProgress?.totalLessons
    ? Math.round((selectedCourseProgress.completedLessons / selectedCourseProgress.totalLessons) * 100)
    : 0;

  function handleNextCourse() {
    if (!hasNextCourse || selectedCourseIndex === -1) {
      setShowCompletionModal(false);
      return;
    }

    const nextCourse = courses[selectedCourseIndex + 1];
    setSelectedCourseId(nextCourse.id);
    setLessonCompletedLocally(false);
    setLessonActionMessage(null);
    setShowCompletionModal(false);
  }

  const completionModalConfig = hasNextLesson
    ? {
        completionMessage: t("student.lessonCompletedSuccess"),
        helperText: t("student.readyForNextLesson"),
        primaryActionLabel: t("student.goToNextLesson"),
        onPrimaryAction: handleNextLesson
      }
    : isCurrentCourseCompleted && hasNextCourse
      ? {
          completionMessage: t("student.courseCompletedCongrats"),
          helperText: t("student.goToNextCourseHint"),
          primaryActionLabel: t("student.goToNextCourse"),
          onPrimaryAction: handleNextCourse
        }
      : programFullyCompleted
        ? {
            completionMessage: t("student.programCompletedCongrats"),
            helperText: t("student.programCompletedThankYou"),
            primaryActionLabel: t("common.close"),
            onPrimaryAction: () => setShowCompletionModal(false)
          }
        : isCurrentCourseCompleted
          ? {
              completionMessage: t("student.courseCompleted"),
              helperText: t("student.completeOtherCourses"),
              primaryActionLabel: t("student.continue"),
              onPrimaryAction: () => setShowCompletionModal(false)
            }
          : {
              completionMessage: t("student.lessonCompletedSuccess"),
              helperText: t("student.completeRemainingLessons"),
              primaryActionLabel: t("student.continueLearning"),
              onPrimaryAction: () => setShowCompletionModal(false)
            };

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleRoleLogin(
      "student",
      "STUDENT",
      loginEmail,
      loginPassword,
      setLoginBusy,
      setLoginError,
      (result) => {
        setSession(result);
        setLessonActionMessage(null);
        setTestActionError(null);
      }
    );
  }

  async function handleCompleteLesson() {
    if (!session || !lessonDetails) return;
    setLessonActionBusy(true);
    setLessonActionMessage(null);
    try {
      const wasAlreadyCompleted = lessonProgress[lessonDetails.id]?.status === "COMPLETED";
      const result = await api.completeLesson(session.accessToken, lessonDetails.id);
      setLessonProgress((current) => ({
        ...current,
        [lessonDetails.id]: {
          lessonId: lessonDetails.id,
          status: "COMPLETED",
          completedAt: result.completedAt
        }
      }));
      if (selectedCourseId && !wasAlreadyCompleted) {
        setCourseProgress((current) => {
          const currentCourse = current[selectedCourseId];
          if (!currentCourse) return current;

          const completedLessons = Math.min(currentCourse.completedLessons + 1, currentCourse.totalLessons);
          return {
            ...current,
            [selectedCourseId]: {
              ...currentCourse,
              completedLessons,
              completed: currentCourse.totalLessons > 0 && completedLessons === currentCourse.totalLessons
            }
          };
        });
      }
      setLessonCompletedLocally(true);
      setShowCompletionModal(true);
      setLessonActionMessage(`${t("student.lessonPassed")} (${formatDateTime(result.completedAt)})`);
    } catch (error: unknown) {
      setLessonActionMessage(getErrorMessage(error));
    } finally {
      setLessonActionBusy(false);
    }
  }

  function handleNextLesson() {
    if (!selectedLessonId) return;
    const currentIndex = lessons.findIndex((l) => l.id === selectedLessonId);
    if (currentIndex !== -1 && currentIndex < lessons.length - 1) {
      const nextLesson = lessons[currentIndex + 1];
      setSelectedLessonId(nextLesson.id);
      setLessonCompletedLocally(false);
      setLessonActionMessage(null);
      setShowCompletionModal(false);
      return;
    }
    if (selectedCourseIndex !== -1 && selectedCourseIndex < courses.length - 1) {
      handleNextCourse();
      return;
    }
    setShowCompletionModal(false);
  }

  async function handleStartAttempt() {
    if (!session || !selectedTestId) return;
    setTestActionBusy(true);
    setTestActionError(null);
    try {
      const result = await api.startStudentAttempt(session.accessToken, selectedTestId);
      setAttemptId(result.attemptId);
      setAnswersByQuestion({});
      setFinishResult(null);
      setUnansweredQuestions([]);
    } catch (error: unknown) {
      setTestActionError(getErrorMessage(error));
    } finally {
      setTestActionBusy(false);
    }
  }

  async function handleAnswerQuestion(questionId: number, optionId: number) {
    if (!session || !attemptId) return;
    setAnswerBusyQuestionId(questionId);
    setTestActionError(null);
    try {
      await api.answerStudentQuestion(session.accessToken, attemptId, questionId, optionId);
      setAnswersByQuestion((current) => ({ ...current, [questionId]: optionId }));
      setUnansweredQuestions((prev) => prev.filter((id) => id !== questionId));
    } catch (error: unknown) {
      setTestActionError(getErrorMessage(error));
    } finally {
      setAnswerBusyQuestionId(null);
    }
  }

  function handleTryFinish() {
    const missed = questions.filter((q) => !answersByQuestion[q.id]).map((q) => q.id);
    if (missed.length > 0) {
      setUnansweredQuestions(missed);
      alert(t("student.answerAllQuestions"));
      const firstMissedElement = document.getElementById(`question-${missed[0]}`);
      firstMissedElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (window.confirm(t("student.confirmFinishTest"))) {
      handleFinishAttempt();
    }
  }

  async function handleFinishAttempt() {
    if (!session || !attemptId) return;
    setTestActionBusy(true);
    setTestActionError(null);
    try {
      const result = await api.finishStudentAttempt(session.accessToken, attemptId);
      setFinishResult(result);
    } catch (error: unknown) {
      setTestActionError(getErrorMessage(error));
    } finally {
      setTestActionBusy(false);
    }
  }

  function handleLogout() {
    clearSession("student");
    setSession(null);
    setCourseProgress({});
    setLessons([]);
    setLessonProgress({});
    setLessonDetails(null);
    setLessonScenarios(null);
    setQuestions([]);
    setAttemptId(null);
    setFinishResult(null);
    setUnansweredQuestions([]);
  }

  if (authLoading) return <div className="shell loading-shell">{t("student.loadingStudentData")}</div>;

  if (!session) {
    return (
      <main className="shell route-shell">
        <GlobalHeader />
        <section className="hero-panel">
          <p className="eyebrow">{t("student.cabinetEyebrow")}</p>
          <h1>{t("student.needLogin")}</h1>
          <p className="lead">{t("student.needLoginDesc")}</p>
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
          <p className="eyebrow">{t("student.cabinetEyebrow")}</p>
          <h1>{t("student.welcomeStudent", { name: session.fullName || t("student.studentDefault") })}</h1>
        </div>
        <div className="topbar-actions">
          <button className="ghost-button" onClick={handleLogout} type="button">
            {t("common.logout")}
          </button>
        </div>
      </section>

      {/* Вкладки навигации */}
      <div className="student-tabs">
        {[
          { id: "courses", label: t("student.tabCourses") },
          { id: "tests", label: t("student.tabTests") }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "courses" | "tests")}
            className={`student-tab ${activeTab === tab.id ? "selected" : ""}`}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      <KpiGrid
        items={[
          {
            label: t("student.kpiCourses"),
            value: `${completedCoursesCount} / ${courses.length}`,
            hint: t("student.kpiCompleted"),
            tone: completedCoursesCount > 0 ? "success" : "default"
          },
          {
            label: t("student.kpiLessons"),
            value: `${completedLessonsCount} / ${totalLessonsCount}`,
            hint: t("student.kpiPassed"),
            tone: completedLessonsCount > 0 ? "success" : "default"
          },
          {
            label: t("student.kpiCurrentCourse"),
            value: selectedCourseId ? `${selectedCoursePercent}%` : "—",
            hint: selectedCourseId ? t("student.kpiProgress") : t("student.kpiSelectCourse"),
            tone: selectedCoursePercent >= 70 ? "success" : selectedCoursePercent >= 35 ? "warning" : "default"
          },
          {
            label: t("student.kpiTests"),
            value: tests.length,
            hint: t("student.kpiAvailable"),
            tone: tests.length > 0 ? "default" : "warning"
          }
        ]}
      />

      <QuickActionsCard
        title={activeTab === "courses" ? t("student.continueLearning") : t("student.quickActions")}
        actions={
          activeTab === "courses"
            ? [
                {
                  label: selectedCourseId && selectedLessonId ? t("student.openCurrentLesson") : t("student.selectCourse"),
                  onClick: () => {
                    const el = document.querySelector(".details-card");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  },
                  tone: "primary"
                },
                {
                  label: t("student.goToTests"),
                  onClick: () => setActiveTab("tests"),
                  tone: "ghost"
                }
              ]
            : [
                {
                  label: t("student.startSelectedTest"),
                  onClick: () => {
                    const el = document.querySelector(".details-card");
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                  },
                  tone: "primary"
                },
                {
                  label: t("student.backToCourses"),
                  onClick: () => setActiveTab("courses"),
                  tone: "ghost"
                }
              ]
        }
      />

      {activeTab === "courses" && (
        <section className="student-dashboard-grid">
          <aside className="card sidebar-card">
            <div className="section-heading">
              <p className="eyebrow">{t("student.availablePrograms")}</p>
              <h2>{t("student.kpiCourses")}</h2>
            </div>
            {coursesLoading ? <div className="empty-state">{t("student.loadingCourses")}</div> : null}
            {coursesError ? <div className="banner error">{coursesError}</div> : null}
            <div className="stack list-animate">
              {courses.length === 0 && !coursesLoading && <p className="muted-text">{t("student.noCourses")}</p>}
              {courses.map((course) => (
                <button
                  key={course.id}
                  className={`student-card ${selectedCourseId === course.id ? "selected" : ""}`}
                  onClick={() => setSelectedCourseId(course.id)}
                  type="button"
                >
                  <div className="student-card-top">
                    <strong>{course.title}</strong>
                    <span className="mini-pill">{course.ageGroup || t("student.forAll")}</span>
                  </div>
                  {courseProgress[course.id] ? (
                    <p style={{ marginTop: "8px", color: courseProgress[course.id].completed ? "#166534" : "#4b5563", fontWeight: 600 }}>
                      {t("student.lessonsCompleted", { completed: courseProgress[course.id].completedLessons, total: courseProgress[course.id].totalLessons })}
                    </p>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="section-heading compact-heading" style={{ marginTop: '24px' }}>
              <p className="eyebrow">{t("student.courseMaterials")}</p>
              <h2>{t("student.kpiLessons")}</h2>
            </div>
            {lessonsLoading ? <div className="empty-state">{t("student.loadingLessons")}</div> : null}
            {lessonsError ? <div className="banner error">{lessonsError}</div> : null}
            <div className="stack list-animate">
              {lessons.length === 0 && selectedCourseId && !lessonsLoading && <p className="muted-text">{t("student.noLessons")}</p>}
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  className={`student-card ${selectedLessonId === lesson.id ? "selected" : ""}`}
                  onClick={() => setSelectedLessonId(lesson.id)}
                  type="button"
                >
                  <div className="student-card-top">
                    <strong>{lesson.orderNumber}. {lesson.title}</strong>
                    <span
                      className="mini-pill"
                      style={{
                        background: lessonProgress[lesson.id]?.status === "COMPLETED" ? "#dcfce7" : "#e5e7eb",
                        color: lessonProgress[lesson.id]?.status === "COMPLETED" ? "#166534" : "#4b5563",
                        flexShrink: 0,
                        whiteSpace: "nowrap"
                      }}
                    >
                      {lessonProgress[lesson.id]?.status === "COMPLETED" ? t("student.lessonDone") : t("student.lessonNotDone")}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <section className="card details-card panel-animate">
            {selectedCourseProgress ? (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  background: selectedCourseProgress.completed ? "#f0fdf4" : "#f8fafc",
                  border: selectedCourseProgress.completed ? "1px solid #bbf7d0" : "1px solid #e5e7eb",
                  color: selectedCourseProgress.completed ? "#166534" : "#334155",
                  fontWeight: 600
                }}
              >
                {selectedCourseProgress.completed
                  ? t("student.courseFinished", { completed: selectedCourseProgress.completedLessons, total: selectedCourseProgress.totalLessons })
                  : t("student.lessonsCompleted", { completed: selectedCourseProgress.completedLessons, total: selectedCourseProgress.totalLessons })}
              </div>
            ) : null}
            <div className="section-heading">
              <p className="eyebrow">{t("student.contentEyebrow")}</p>
              <h2>{t("student.lessonView")}</h2>
            </div>
            {lessonDetailsLoading ? <div className="empty-state">{t("student.loadingLesson")}</div> : null}
            {!lessonDetailsLoading && lessonDetails ? (
              <div className="details-layout animate-fade-in" key={`lesson-${selectedLessonId}`}>
                {programFullyCompleted ? (
                  <div
                    className="panel-block"
                    style={{
                      marginBottom: "8px",
                      padding: "18px 20px",
                      borderRadius: "12px",
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      color: "#1e3a8a",
                      fontWeight: 600,
                      lineHeight: 1.5
                    }}
                  >
                    {t("student.programFullyCompletedBanner")}
                  </div>
                ) : null}
                <div className="panel-block">
                  <div className="content-card" style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
                    <h3 style={{ marginTop: 0 }}>{lessonDetails.title}</h3>
                    {lessonDetails.textContent?.trim() ? (
                      <p style={{ whiteSpace: "pre-wrap", marginBottom: 0 }}>{lessonDetails.textContent.trim()}</p>
                    ) : null}
                    {lessonDetails.videoUrl ? (
                      <div style={{ marginTop: lessonDetails.textContent?.trim() ? "24px" : "12px" }}>
                        <button
                          type="button"
                          className="primary-link-button"
                          onClick={() => {
                            const resolved = parseMediaUrl(lessonDetails.videoUrl!).replace(
                              /^.*\/media\/(https?:\/\/.*)/,
                              "$1"
                            );
                            setResolvedLessonVideoUrl(resolved);
                            setIsLessonVideoOpen((prev) => !prev);
                          }}
                          style={{ display: "inline-block", border: "none", cursor: "pointer" }}
                        >
                          {isLessonVideoOpen ? t("student.hideVideo") : t("student.openVideo")}
                        </button>

                        {isLessonVideoOpen ? (
                          <VideoLessonPlayer
                            title={lessonDetails?.title ? `${t("student.videoLesson")}: ${lessonDetails.title}` : t("student.videoLesson")}
                            videoUrl={resolvedLessonVideoUrl}
                          />
                        ) : null}
                      </div>
                    ) : (
                      <p className="muted-text" style={{ marginTop: lessonDetails.textContent?.trim() ? "24px" : "12px" }}>
                        {t("student.noVideoAttached")}
                      </p>
                    )}
                  </div>
                </div>
                {!programFullyCompleted ? (
                  <div className="panel-block" style={{ marginTop: "8px" }}>
                    {hasNextLesson ? (
                      <button type="button" className="ghost-button" onClick={handleNextLesson} style={{ width: "100%", padding: "14px", fontWeight: 600 }}>
                        {t("student.nextLesson")}
                      </button>
                    ) : hasNextCourse ? (
                      <button type="button" className="ghost-button" onClick={handleNextCourse} style={{ width: "100%", padding: "14px", fontWeight: 600 }}>
                        {t("student.nextCourse")}
                      </button>
                    ) : null}
                  </div>
                ) : null}
                
                {!lessonCompletedLocally ? (
                  <div className="panel-block" style={{ marginTop: '24px' }}>
                    <button className="primary-button" onClick={handleCompleteLesson} disabled={lessonActionBusy} style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
                      {lessonActionBusy ? t("student.saving") : t("student.iStudiedThis")}
                    </button>
                  </div>
                ) : (
                  <>
                  <div style={{ marginTop: '24px', padding: '24px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', display: 'none' }}>
                    <h3 style={{ color: '#166534', margin: '0 0 8px 0' }}>{t("student.lessonPassedTitle")}</h3>
                    <p style={{ color: '#15803d', marginBottom: '16px' }}>{t("student.scenarioAvailable")}</p>
                    <button style={{ backgroundColor: '#166534', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', width: '100%', fontSize: '1rem' }} onClick={() => alert(t("student.scenarioInDev"))}>
                      {t("student.startSituationTest")}
                    </button>
                  </div>
                  <div style={{ marginTop: '24px', padding: '24px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
                    <h3 style={{ color: '#166534', margin: '0 0 8px 0' }}>{t("student.lessonPassedTitle")}</h3>
                    {lessonScenarioLoading ? (
                      <p style={{ color: '#15803d', marginBottom: '16px' }}>{t("student.checkingScenario")}</p>
                    ) : lessonScenarios?.hasScenarios ? (
                      <div style={{ color: '#15803d' }}>
                        {(() => {
                          const list = lessonScenarios.scenarios || [];
                          const anyAvailable = list.some((s) => s.available);
                          const anyCompleted = list.some((s) => s.completed);
                          const allCompleted = list.length > 0 && list.every((s) => s.completed);
                          const message = list.find((s) => s.message)?.message;

                          if (anyAvailable) {
                            return (
                              <>
                                <p style={{ margin: '0 0 12px 0' }}>
                                  {t("student.scenariosAvailableCount", { count: list.filter((s) => s.available).length })}
                                </p>
                                {selectedCourseId ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      navigate(`/${lang}/students/course/${selectedCourseId}/lesson/${selectedLessonId}/situation-test`)
                                    }
                                    style={{
                                      backgroundColor: '#166534',
                                      color: '#fff',
                                      padding: '12px 24px',
                                      borderRadius: '8px',
                                      border: 'none',
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      width: '100%',
                                      fontSize: '1rem'
                                    }}
                                  >
                                    {t("student.startSituationTest")}
                                  </button>
                                ) : null}
                              </>
                            );
                          }

                          if (allCompleted && anyCompleted) {
                            return (
                              <>
                                <p style={{ margin: '0 0 12px 0' }}>
                                  {t("student.allScenariosCompleted")}
                                </p>
                                {selectedCourseId ? (
                                  <Link
                                    className="primary-link-button"
                                    to={`/${lang}/students/course/${selectedCourseId}/lesson/${selectedLessonId}/situation-test`}
                                    style={{ display: 'inline-block' }}
                                  >
                                    {t("student.viewResults")}
                                  </Link>
                                ) : null}
                              </>
                            );
                          }

                          if (message) {
                            return <p style={{ color: '#15803d', margin: 0 }}>{message}</p>;
                          }

                          return null;
                        })()}
                      </div>
                    ) : null}
                  </div>
                  </>
                )}
                {lessonActionMessage && !lessonCompletedLocally ? <div className="banner info">{lessonActionMessage}</div> : null}
              </div>
            ) : null}
            {!lessonDetailsLoading && !lessonDetails ? (
              <div className="empty-state">
                <strong>{t("student.noLessonSelected")}</strong>
                <p>{t("student.selectLessonHint")}</p>
              </div>
            ) : null}
          </section>
        </section>
      )}

      {activeTab === "tests" && (
        <section className="student-dashboard-grid">
          <aside className="card sidebar-card">
            <div className="section-heading">
              <p className="eyebrow">{t("student.diagnosticsEyebrow")}</p>
              <h2>{t("student.kpiTests")}</h2>
            </div>
            {testsError ? <div className="banner error">{testsError}</div> : null}
            <div className="stack list-animate">
              {tests.length === 0 && <p className="muted-text">{t("student.noTestsAvailable")}</p>}
              {tests.map((test) => (
                <button
                  key={test.id}
                  className={`student-card ${selectedTestId === test.id ? "selected" : ""}`}
                  onClick={() => setSelectedTestId(test.id)}
                  type="button"
                >
                  <div className="student-card-top">
                    <strong>{test.title}</strong>
                  </div>
                  <p>{test.description || t("student.psychTest")}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="card details-card panel-animate">
            {questionsLoading ? <div className="empty-state">{t("student.loadingQuestions")}</div> : null}
            {questionsError ? <div className="banner error">{questionsError}</div> : null}

            {!questionsLoading && selectedTestId && questions.length > 0 ? (
              <div className="details-layout">
                {!attemptId && !finishResult ? (
                  <div className="empty-state animate-fade-in" key="test-intro" style={{ padding: '60px 20px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
                    <h3 style={{ fontSize: '1.4rem', color: '#111827', marginBottom: '12px' }}>{t("student.readyToStart")}</h3>
                    <p style={{ color: '#4b5563', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>{t("student.testIntroDescription")}</p>
                    <button className="primary-button" onClick={handleStartAttempt} disabled={testActionBusy} style={{ padding: '12px 32px', fontSize: '1.1rem' }}>
                      {testActionBusy ? t("student.preparing") : t("student.startTesting")}
                    </button>
                  </div>
                ) : null}

                {attemptId && !finishResult ? (
                  <div className="animate-fade-in" key={`test-attempt-${attemptId}`}>
                    <div className="student-test-head">
                      <h2 style={{ margin: 0, color: '#111827' }}>{t("student.testInProgress")}</h2>
                      <span style={{ background: '#e0e7ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '99px', fontWeight: 600, fontSize: '0.9rem' }}>{t("student.inProgress")}</span>
                    </div>
                    
                    <div className="question-list list-animate" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {questions.map((question, index) => {
                        const isUnanswered = unansweredQuestions.includes(question.id);
                        return (
                          <article id={`question-${question.id}`} key={question.id} className="question-card" style={{ border: isUnanswered ? '2px solid #dc2626' : '1px solid #e5e7eb', padding: '24px', borderRadius: '12px', backgroundColor: isUnanswered ? '#fef2f2' : '#fff', transition: 'all 0.3s' }}>
                            <div className="student-card-top" style={{ marginBottom: '16px' }}>
                              <strong style={{ fontSize: '1.15rem', color: '#111827' }}>
                                {index + 1}. {question.text}
                              </strong>
                            </div>
                            {isUnanswered && (
                              <div style={{ color: '#dc2626', fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>
                                {t("student.forgotAnswer")}
              </div>
                            )}
                            <div className="option-list" style={{ display: 'grid', gap: '8px' }}>
                              {question.options.map((option) => {
                                const isSelected = answersByQuestion[question.id] === option.id;
                                return (
                                  <button
                                    key={option.id}
                                    className={`option-button ${isSelected ? "selected" : ""}`}
                                    disabled={!attemptId || answerBusyQuestionId === question.id || Boolean(finishResult)}
                                    onClick={() => handleAnswerQuestion(question.id, option.id)}
                                    type="button"
                                    style={{ padding: '12px', textAlign: 'left', fontSize: '1rem', background: isSelected ? '#eff6ff' : '#f9fafb', border: isSelected ? '1px solid #3b82f6' : '1px solid #e5e7eb', borderRadius: '8px', cursor: 'pointer', transition: 'all 0.2s', color: isSelected ? '#1d4ed8' : '#374151', fontWeight: isSelected ? 500 : 400 }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                      <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: isSelected ? '6px solid #3b82f6' : '2px solid #d1d5db', backgroundColor: '#fff', flexShrink: 0 }}></div>
                                      {option.text}
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </article>
                        );
                      })}
                    </div>
                    
                    <div style={{ marginTop: '32px', borderTop: '1px solid #e5e7eb', paddingTop: '24px', display: 'flex', justifyContent: 'center' }}>
                      <button className="primary-button" onClick={handleTryFinish} disabled={testActionBusy} style={{ padding: '16px 48px', fontSize: '1.1rem', backgroundColor: '#111827' }}>
                        {testActionBusy ? t("student.submitting") : t("student.finishTestAndSubmit")}
                      </button>
                    </div>
                  </div>
                ) : null}

                {finishResult ? (
                  <div className="panel-block result-success-animate" key="test-result" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
                    <h2 style={{ color: '#111827', marginBottom: '12px' }}>{t("student.testCompletedTitle")}</h2>
                    <p style={{ color: '#4b5563', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 24px' }}>{t("student.testCompletedDesc")}</p>
                    <button className="ghost-button" onClick={() => { setAttemptId(null); setFinishResult(null); setAnswersByQuestion({}); }} style={{ padding: '10px 24px', fontSize: '1rem' }}>
                      {t("student.retakeTest")}
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {!questionsLoading && selectedTestId && questions.length === 0 ? (
              <div className="empty-state">
                <strong>{t("student.questionsNotFound")}</strong>
                <p>{t("student.noQuestionsInTest")}</p>
              </div>
            ) : null}
          </section>
        </section>
      )}

      {showCompletionModal && (
        <LessonCompletedModal 
          onPrimaryAction={completionModalConfig.onPrimaryAction}
          primaryActionLabel={completionModalConfig.primaryActionLabel}
          completionMessage={completionModalConfig.completionMessage}
          helperText={completionModalConfig.helperText}
          onClose={() => setShowCompletionModal(false)}
        />
      )}
    </main>
  );
}
