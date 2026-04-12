import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api";
import { loadSession, clearSession } from "../storage";
import { GlobalHeader } from "../components/GlobalHeader";
import { LessonCompletedModal } from "../components/LessonCompletedModal";
import type {
  AuthResponse,
  CategoryResult,
  Course,
  FinishAttemptResponse,
  Lesson,
  StudentCourseProgress,
  StudentLessonProgress,
  StudentLessonScenario,
  TestListItem,
  TestQuestion
} from "../types";
import { getErrorMessage, formatDateTime } from "../utils/helpers";
import { useRoleSession, handleRoleLogin } from "../hooks/authHooks";
import { InfoBox } from "../components/InfoBox";
import { parseMediaUrl } from "../utils/mediaUrl";

export function StudentPage() {
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
  const [lessonScenario, setLessonScenario] = useState<StudentLessonScenario | null>(null);
  const [lessonScenarioLoading, setLessonScenarioLoading] = useState(false);
  const [lessonDetailsLoading, setLessonDetailsLoading] = useState(false);
  const [lessonActionMessage, setLessonActionMessage] = useState<string | null>(null);
  const [lessonActionBusy, setLessonActionBusy] = useState(false);
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
    if (!selectedLessonId) {
      setLessonDetails(null);
      setLessonScenario(null);
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
        .getLessonScenario(session.accessToken, selectedCourseId, selectedLessonId)
        .then(setLessonScenario)
        .catch(() => setLessonScenario(null))
        .finally(() => setLessonScenarioLoading(false));
    } else {
      setLessonScenario(null);
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
        completionMessage: "Вы успешно завершили этот урок.",
        helperText: "Готовы перейти к следующему уроку?",
        primaryActionLabel: "Перейти на следующий урок",
        onPrimaryAction: handleNextLesson
      }
    : isCurrentCourseCompleted && hasNextCourse
      ? {
          completionMessage: "Поздравляем, вы завершили все уроки этого курса.",
          helperText: "Можно сразу перейти к следующему курсу и продолжить обучение.",
          primaryActionLabel: "Перейти на следующий курс",
          onPrimaryAction: handleNextCourse
        }
      : programFullyCompleted
        ? {
            completionMessage: "Поздравляем! Вы прошли всю образовательную программу.",
            helperText: "Вы успешно завершили все курсы. Спасибо за обучение!",
            primaryActionLabel: "Закрыть",
            onPrimaryAction: () => setShowCompletionModal(false)
          }
        : isCurrentCourseCompleted
          ? {
              completionMessage: "Вы завершили этот курс.",
              helperText: "Чтобы завершить всю программу, пройдите остальные курсы в списке слева.",
              primaryActionLabel: "Продолжить",
              onPrimaryAction: () => setShowCompletionModal(false)
            }
          : {
              completionMessage: "Вы успешно завершили этот урок.",
              helperText: "Чтобы завершить курс, пройдите оставшиеся уроки из списка.",
              primaryActionLabel: "Продолжить обучение",
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
      setLessonActionMessage(`Урок успешно пройден! (${formatDateTime(result.completedAt)})`);
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
      alert("Вы ответили не на все вопросы! Пожалуйста, выберите ответы для вопросов, выделенных красным.");
      const firstMissedElement = document.getElementById(`question-${missed[0]}`);
      firstMissedElement?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (window.confirm("Вы уверены, что хотите завершить тест? После этого ответы нельзя будет изменить.")) {
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
    setLessonScenario(null);
    setQuestions([]);
    setAttemptId(null);
    setFinishResult(null);
    setUnansweredQuestions([]);
  }

  if (authLoading) return <div className="shell loading-shell">Загрузка данных ученика...</div>;

  if (!session) {
    return (
      <main className="shell route-shell">
        <GlobalHeader />
        <section className="hero-panel">
          <p className="eyebrow">Кабинет ученика</p>
          <h1>Вам необходимо войти в систему</h1>
          <p className="lead">Используйте общую страницу авторизации, после чего вы будете перенаправлены сюда.</p>
          <a className="route-card compact-route-card" href="/auth">
            <h2>Войти в аккаунт</h2>
            <p>Открыть страницу авторизации.</p>
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
          <p className="eyebrow">Кабинет ученика</p>
          <h1>Добро пожаловать, {session.fullName || "Ученик"}</h1>
        </div>
        <div className="topbar-actions">
          <div className="identity-card">
            <span>Роль: Ученик</span>
            <strong>{session.fullName || session.userId}</strong>
          </div>
          <button className="ghost-button" onClick={handleLogout} type="button">
            Выйти
          </button>
        </div>
      </section>

      {/* Вкладки навигации */}
      <div style={{ padding: "0 32px", marginBottom: "24px", display: "flex", gap: "24px", borderBottom: "1px solid #e5e7eb" }}>
        <button
          onClick={() => setActiveTab("courses")}
          style={{ padding: "12px 16px", fontSize: "1.1rem", fontWeight: 600, background: "none", border: "none", borderBottom: activeTab === "courses" ? "3px solid #2563eb" : "3px solid transparent", color: activeTab === "courses" ? "#2563eb" : "#6b7280", cursor: "pointer", transition: "color 0.2s" }}
        >
          📚 Учебные курсы
        </button>
        <button
          onClick={() => setActiveTab("tests")}
          style={{ padding: "12px 16px", fontSize: "1.1rem", fontWeight: 600, background: "none", border: "none", borderBottom: activeTab === "tests" ? "3px solid #2563eb" : "3px solid transparent", color: activeTab === "tests" ? "#2563eb" : "#6b7280", cursor: "pointer", transition: "color 0.2s" }}
        >
          🧠 Психологические тесты
        </button>
      </div>

      {activeTab === "courses" && (
        <section className="student-dashboard-grid">
          <aside className="card sidebar-card">
            <div className="section-heading">
              <p className="eyebrow">Доступные программы</p>
              <h2>Курсы</h2>
            </div>
            {coursesLoading ? <div className="empty-state">Загрузка курсов...</div> : null}
            {coursesError ? <div className="banner error">{coursesError}</div> : null}
            <div className="stack">
              {courses.length === 0 && !coursesLoading && <p className="muted-text">Нет доступных курсов</p>}
              {courses.map((course) => (
                <button
                  key={course.id}
                  className={`student-card ${selectedCourseId === course.id ? "selected" : ""}`}
                  onClick={() => setSelectedCourseId(course.id)}
                  type="button"
                >
                  <div className="student-card-top">
                    <strong>{course.title}</strong>
                    <span
                      className="mini-pill"
                      style={{
                        display: courseProgress[course.id]?.completed ? undefined : "none",
                        background: "#dcfce7",
                        color: "#166534"
                      }}
                    >
                      Курс пройден
                    </span>
                    <span className="mini-pill">{course.ageGroup || "Для всех"}</span>
                  </div>
                  <p>{course.description || "Описание отсутствует."}</p>
                  {courseProgress[course.id] ? (
                    <p style={{ marginTop: "8px", color: courseProgress[course.id].completed ? "#166534" : "#4b5563", fontWeight: 600 }}>
                      {courseProgress[course.id].completedLessons} из {courseProgress[course.id].totalLessons} уроков пройдено
                    </p>
                  ) : null}
                </button>
              ))}
            </div>

            <div className="section-heading compact-heading" style={{ marginTop: '24px' }}>
              <p className="eyebrow">Материалы курса</p>
              <h2>Уроки</h2>
            </div>
            {lessonsLoading ? <div className="empty-state">Загрузка уроков...</div> : null}
            {lessonsError ? <div className="banner error">{lessonsError}</div> : null}
            <div className="stack">
              {lessons.length === 0 && selectedCourseId && !lessonsLoading && <p className="muted-text">В этом курсе пока нет уроков.</p>}
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
                        color: lessonProgress[lesson.id]?.status === "COMPLETED" ? "#166534" : "#4b5563"
                      }}
                    >
                      {lessonProgress[lesson.id]?.status === "COMPLETED" ? "Пройден" : "Не пройден"}
                    </span>
                  </div>
                  {lesson.textContent?.trim() ? (
                    <p className="muted-text" style={{ marginTop: "6px", fontSize: "0.9rem" }}>
                      {lesson.textContent.trim().length > 120
                        ? `${lesson.textContent.trim().slice(0, 120)}…`
                        : lesson.textContent.trim()}
                    </p>
                  ) : null}
                </button>
              ))}
            </div>
          </aside>

          <section className="card details-card">
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
                  ? `Курс завершён: ${selectedCourseProgress.completedLessons} из ${selectedCourseProgress.totalLessons} уроков`
                  : `Пройдено ${selectedCourseProgress.completedLessons} из ${selectedCourseProgress.totalLessons} уроков`}
              </div>
            ) : null}
            <div className="section-heading">
              <p className="eyebrow">Содержимое</p>
              <h2>Просмотр урока</h2>
            </div>
            {lessonDetailsLoading ? <div className="empty-state">Загрузка урока...</div> : null}
            {!lessonDetailsLoading && lessonDetails ? (
              <div className="details-layout">
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
                    Поздравляем! Вы прошли всю образовательную программу — все доступные курсы успешно завершены.
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
                        <a className="primary-link-button" href={parseMediaUrl(lessonDetails.videoUrl)} target="_blank" rel="noreferrer" style={{ display: 'inline-block' }}>
                          ▶ Открыть видеоурок
                        </a>
                      </div>
                    ) : (
                      <p className="muted-text" style={{ marginTop: lessonDetails.textContent?.trim() ? "24px" : "12px" }}>
                        Видео к этому уроку не прикреплено.
                      </p>
                    )}
                  </div>
                </div>
                {!programFullyCompleted ? (
                  <div className="panel-block" style={{ marginTop: "8px" }}>
                    {hasNextLesson ? (
                      <button type="button" className="ghost-button" onClick={handleNextLesson} style={{ width: "100%", padding: "14px", fontWeight: 600 }}>
                        Следующий урок
                      </button>
                    ) : hasNextCourse ? (
                      <button type="button" className="ghost-button" onClick={handleNextCourse} style={{ width: "100%", padding: "14px", fontWeight: 600 }}>
                        Следующий курс
                      </button>
                    ) : null}
                  </div>
                ) : null}
                
                {!lessonCompletedLocally ? (
                  <div className="panel-block" style={{ marginTop: '24px' }}>
                    <button className="primary-button" onClick={handleCompleteLesson} disabled={lessonActionBusy} style={{ width: '100%', padding: '16px', fontSize: '1.1rem' }}>
                      {lessonActionBusy ? "Сохранение..." : "Я изучил(а) этот материал"}
                    </button>
                  </div>
                ) : (
                  <>
                  <div style={{ marginTop: '24px', padding: '24px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', display: 'none' }}>
                    <h3 style={{ color: '#166534', margin: '0 0 8px 0' }}>✅ Урок успешно пройден</h3>
                    <p style={{ color: '#15803d', marginBottom: '16px' }}>Вам стал доступен ситуационный сценарий для закрепления материала.</p>
                    <button style={{ backgroundColor: '#166534', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, cursor: 'pointer', width: '100%', fontSize: '1rem' }} onClick={() => alert('Раздел загрузки ситуационных сценариев в разработке. Здесь откроется диалог для выбора вариантов ответа.')}>
                      🎭 Начать ситуационный тест (Сценарий)
                    </button>
                  </div>
                  <div style={{ marginTop: '24px', padding: '24px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px' }}>
                    <h3 style={{ color: '#166534', margin: '0 0 8px 0' }}>Урок успешно пройден</h3>
                    {lessonScenarioLoading ? (
                      <p style={{ color: '#15803d', marginBottom: '16px' }}>Проверяем доступность ситуационного теста...</p>
                    ) : lessonScenario?.hasScenario && lessonScenario.completed ? (
                      <div style={{ color: '#15803d' }}>
                        <p style={{ margin: '0 0 12px 0' }}>
                          Ситуационный тест по этому уроку уже пройден. Повторно пройти его нельзя — ответ сохранён один раз.
                        </p>
                        {selectedCourseId ? (
                          <Link
                            className="primary-link-button"
                            to={`/students/course/${selectedCourseId}/lesson/${selectedLessonId}/situation-test`}
                            style={{ display: 'inline-block' }}
                          >
                            Посмотреть результат теста
                          </Link>
                        ) : null}
                      </div>
                    ) : lessonScenario?.available ? (
                      <div style={{ color: '#15803d' }}>
                        <p style={{ margin: '0 0 12px 0' }}>
                          Вы прошли урок. Вам доступен ситуационный тест (одна попытка). На отдельной странице будет описание ситуации и
                          выбор ответа с подтверждением.
                        </p>
                        {selectedCourseId ? (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/students/course/${selectedCourseId}/lesson/${selectedLessonId}/situation-test`)
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
                            Перейти к ситуационному тесту
                          </button>
                        ) : null}
                      </div>
                    ) : lessonScenario?.hasScenario && lessonScenario.message ? (
                      <p style={{ color: '#15803d', margin: 0 }}>{lessonScenario.message}</p>
                    ) : null}
                  </div>
                  </>
                )}
                {lessonActionMessage && !lessonCompletedLocally ? <div className="banner info">{lessonActionMessage}</div> : null}
              </div>
            ) : null}
            {!lessonDetailsLoading && !lessonDetails ? (
              <div className="empty-state">
                <strong>Урок не выбран</strong>
                <p>Выберите курс и урок слева, чтобы начать обучение.</p>
              </div>
            ) : null}
          </section>
        </section>
      )}

      {activeTab === "tests" && (
        <section className="student-dashboard-grid">
          <aside className="card sidebar-card">
            <div className="section-heading">
              <p className="eyebrow">Диагностика</p>
              <h2>Тесты</h2>
            </div>
            {testsError ? <div className="banner error">{testsError}</div> : null}
            <div className="stack">
              {tests.length === 0 && <p className="muted-text">Доступных тестов пока нет.</p>}
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
                  <p>{test.description || "Психологическое тестирование"}</p>
                </button>
              ))}
            </div>
          </aside>

          <section className="card details-card">
            {questionsLoading ? <div className="empty-state">Загрузка вопросов...</div> : null}
            {questionsError ? <div className="banner error">{questionsError}</div> : null}

            {!questionsLoading && selectedTestId && questions.length > 0 ? (
              <div className="details-layout">
                {!attemptId && !finishResult ? (
                  <div className="empty-state" style={{ padding: '60px 20px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📝</div>
                    <h3 style={{ fontSize: '1.4rem', color: '#111827', marginBottom: '12px' }}>Готовы начать тест?</h3>
                    <p style={{ color: '#4b5563', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>Вам будет предложено несколько вопросов. Пожалуйста, отвечайте на них честно. После завершения теста результаты будут отправлены вашему учителю.</p>
                    <button className="primary-button" onClick={handleStartAttempt} disabled={testActionBusy} style={{ padding: '12px 32px', fontSize: '1.1rem' }}>
                      {testActionBusy ? "Подготовка..." : "Начать тестирование"}
                    </button>
                  </div>
                ) : null}

                {attemptId && !finishResult ? (
                  <div>
                    <div style={{ marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h2 style={{ margin: 0, color: '#111827' }}>Прохождение теста</h2>
                      <span style={{ background: '#e0e7ff', color: '#1d4ed8', padding: '4px 12px', borderRadius: '99px', fontWeight: 600, fontSize: '0.9rem' }}>В процессе</span>
                    </div>
                    
                    <div className="question-list" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                                ⚠️ Вы забыли выбрать ответ на этот вопрос
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
                        {testActionBusy ? "Отправка..." : "Завершить тест и отправить ответы"}
                      </button>
                    </div>
                  </div>
                ) : null}

                {finishResult ? (
                  <div className="panel-block" style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
                    <h2 style={{ color: '#111827', marginBottom: '12px' }}>Тест успешно завершен!</h2>
                    <p style={{ color: '#4b5563', fontSize: '1.1rem', maxWidth: '500px', margin: '0 auto 24px' }}>Ваши ответы сохранены и отправлены вашему учителю для ознакомления. Спасибо за прохождение.</p>
                    <button className="ghost-button" onClick={() => { setAttemptId(null); setFinishResult(null); setAnswersByQuestion({}); }} style={{ padding: '10px 24px', fontSize: '1rem' }}>
                      Пройти тест заново
                    </button>
                  </div>
                ) : null}
              </div>
            ) : null}

            {!questionsLoading && selectedTestId && questions.length === 0 ? (
              <div className="empty-state">
                <strong>Вопросы не найдены</strong>
                <p>В этом тесте пока нет вопросов.</p>
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
