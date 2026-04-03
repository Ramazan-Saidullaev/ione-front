import { useEffect, useState } from "react";
import { api, ApiError } from "./api";
import { HomeLandingPage } from "./HomeLandingPage";
import { GlobalHeader } from "./GlobalHeader";
import { clearSession, loadSession, saveSession } from "./storage";
import type {
  AuthResponse,
  CategoryResult,
  Course,
  FinishAttemptResponse,
  Lesson,
  RiskStudent,
  RiskZone,
  TeacherAttemptDetails,
  TeacherStudent,
  TestListItem,
  TestQuestion,
  UserRole,
  AdminDashboardDto,
  AdminCourseDto,
  AdminLessonDto,
  AdminTestDto,
  AdminTestCategoryDto,
  AdminCategoryZoneDto,
  AdminTestQuestionDto,
  AdminTestAnswerDto
} from "./types";

type AppRoute = "home" | "auth" | "teachers" | "students" | "admin" | "not-found";

const zoneOptions: RiskZone[] = ["YELLOW", "RED", "BLACK", "GREEN"];
const zoneLabels: Record<RiskZone, string> = {
  GREEN: "Green",
  YELLOW: "Yellow",
  RED: "Red",
  BLACK: "Black"
};

function App() {
  const [route, setRoute] = useState<AppRoute>(() => resolveRoute(window.location.pathname));

  useEffect(() => {
    const onPopState = () => setRoute(resolveRoute(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  if (route === "home") return <HomeLandingPage />;
  if (route === "auth") return <AuthPage />;
  if (route === "teachers") return <TeacherPage />;
  if (route === "students") return <StudentPage />;
  if (route === "admin") return <AdminPage />;
  return <NotFoundPage />;
}

function LandingPage() {
  return (
    <main className="landing-shell">
      <header className="site-header">
        <a className="brand-mark" href="/">
          Safe School Platform
        </a>
        <nav className="site-nav">
          <a className="nav-cta" href="/auth">
            Войти в аккаунт
          </a>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="hero-panel landing-panel">
          <p className="eyebrow">Платформа для школьников, родителей и учителей</p>
          <h1>Забота о развитии, обучении и психологическом состоянии ребёнка в одном месте.</h1>
          <p className="lead">
            Онлайн-курсы, образовательные и психологические тесты, аналитика состояния ребёнка и
            рекомендации для родителей и учителей в безопасной цифровой среде.
          </p>
          <div className="landing-actions">
            <a className="primary-link-button" href="/auth">
              Начать бесплатно
            </a>
            <a className="secondary-link-button" href="#about">
              О платформе
            </a>
          </div>
        </div>

        <div className="landing-feature-grid">
          <article className="route-card">
            <p className="eyebrow">Обучение</p>
            <h2>Курсы и полезные материалы</h2>
            <p>Помогаем школьникам учиться в понятном и дружелюбном цифровом формате.</p>
          </article>
          <article className="route-card">
            <p className="eyebrow">Поддержка</p>
            <h2>Диагностика и рекомендации</h2>
            <p>Даём родителям и учителям понятные ориентиры для поддержки ребёнка.</p>
          </article>
        </div>
      </section>

      <section className="landing-sections two-column" id="about">
        <div className="card feature-card">
          <div className="section-heading">
            <p className="eyebrow">О платформе</p>
            <h2>Спокойная и понятная среда для развития ребёнка</h2>
          </div>
          <p className="lead compact-lead">
            Платформа объединяет учебные материалы, тестирование и психологическую аналитику, чтобы
            взрослые могли вовремя замечать изменения, а дети получали поддержку без давления.
          </p>
          <div className="bullet-grid">
            <div className="mini-feature">
              <strong>Для школьников</strong>
              <p>Интересные курсы, понятные тесты и удобный интерфейс.</p>
            </div>
            <div className="mini-feature">
              <strong>Для родителей</strong>
              <p>Прозрачная картина прогресса и состояния ребёнка.</p>
            </div>
            <div className="mini-feature">
              <strong>Для учителей</strong>
              <p>Удобные отчёты и практические рекомендации.</p>
            </div>
          </div>
        </div>

        <div className="card feature-card">
          <div className="section-heading">
            <p className="eyebrow">Преимущества</p>
            <h2>Почему платформе можно доверять</h2>
          </div>
          <div className="bullet-grid">
            <div className="mini-feature">
              <strong>Безопасность данных</strong>
              <p>Внимательное отношение к персональным данным и приватности семьи.</p>
            </div>
            <div className="mini-feature">
              <strong>Научный подход</strong>
              <p>Диагностика и интерпретация строятся на понятной методологической основе.</p>
            </div>
            <div className="mini-feature">
              <strong>Удобство использования</strong>
              <p>Простой интерфейс для детей и взрослых без лишней сложности.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-sections" id="features">
        <div className="section-header-block">
          <p className="eyebrow">Функционал</p>
          <h2>Все ключевые возможности на одной платформе</h2>
        </div>
        <div className="feature-grid-wide">
          <article className="card feature-card">
            <h3>Онлайн-курсы</h3>
            <p>Образовательные материалы для школьников с поэтапным прохождением уроков.</p>
          </article>
          <article className="card feature-card">
            <h3>Образовательные тесты</h3>
            <p>Проверка знаний и вовлечение в обучение через удобный цифровой формат.</p>
          </article>
          <article className="card feature-card">
            <h3>Психологическая диагностика</h3>
            <p>Тесты и сценарии, помогающие оценить эмоциональное и психологическое состояние.</p>
          </article>
          <article className="card feature-card">
            <h3>Отчёты и рекомендации</h3>
            <p>Понятные выводы и практические советы для родителей и учителей.</p>
          </article>
        </div>
      </section>

      <section className="landing-sections" id="steps">
        <div className="section-header-block">
          <p className="eyebrow">Как это работает</p>
          <h2>Простой путь от регистрации до рекомендаций</h2>
        </div>
        <div className="steps-grid">
          <article className="step-card">
            <span>01</span>
            <h3>Регистрация</h3>
            <p>Пользователь создаёт аккаунт и получает доступ к подходящему разделу платформы.</p>
          </article>
          <article className="step-card">
            <span>02</span>
            <h3>Прохождение</h3>
            <p>Ребёнок изучает курсы и проходит образовательные или психологические тесты.</p>
          </article>
          <article className="step-card">
            <span>03</span>
            <h3>Анализ</h3>
            <p>Система собирает результаты и формирует понятную аналитику по прогрессу и состоянию.</p>
          </article>
          <article className="step-card">
            <span>04</span>
            <h3>Рекомендации</h3>
            <p>Родители и учителя получают практические советы для поддержки ребёнка.</p>
          </article>
        </div>
      </section>

      <section className="landing-sections" id="reviews">
        <div className="section-header-block">
          <p className="eyebrow">Отзывы</p>
          <h2>Что говорят родители и учителя</h2>
        </div>
        <div className="feature-grid-wide">
          <article className="card testimonial-card">
            <p>
              “Стало намного проще понимать, как ребёнок чувствует себя в школе и где ему нужна поддержка.”
            </p>
            <strong>Айгуль, мама ученика 7 класса</strong>
          </article>
          <article className="card testimonial-card">
            <p>
              “Отчёты помогают замечать риски раньше и обсуждать ситуацию с родителями на основе данных.”
            </p>
            <strong>Марина, классный руководитель</strong>
          </article>
          <article className="card testimonial-card">
            <p>
              “Платформа понятная, спокойная и не перегруженная. Дети не боятся проходить задания и тесты.”
            </p>
            <strong>Ержан, школьный психолог</strong>
          </article>
        </div>
      </section>

      <section className="cta-banner">
        <div>
          <p className="eyebrow">Начните сегодня</p>
          <h2>Подключитесь к платформе и получите современный инструмент поддержки ребёнка.</h2>
        </div>
        <a className="primary-link-button" href="/auth">
          Начать бесплатно
        </a>
      </section>

      <footer className="site-footer">
        <div>
          <strong>Safe School Platform</strong>
          <p>Современная платформа для обучения, диагностики и поддержки школьников.</p>
        </div>
        <div className="footer-links">
          <a href="mailto:support@safeschool.local">support@safeschool.local</a>
          <a href="https://t.me/" target="_blank" rel="noreferrer">Telegram</a>
          <a href="https://instagram.com/" target="_blank" rel="noreferrer">Instagram</a>
          <a href="/auth">Войти</a>
          <a href="/">Политика конфиденциальности</a>
        </div>
      </footer>
    </main>
  );
}

function AuthPage() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const teacher = loadSession("teacher");
    const student = loadSession("student");
    const admin = loadSession("admin");
    if (admin?.role === "ADMIN") {
      redirectToRole("ADMIN");
    } else if (teacher?.role === "TEACHER") {
      redirectToRole("TEACHER");
    } else if (student?.role === "STUDENT") {
      redirectToRole("STUDENT");
    }
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true);
    setAuthError(null);

    try {
      const result = await api.login({
        email: loginEmail.trim(),
        password: loginPassword
      });
      saveSession(result.role === "ADMIN" ? "admin" : result.role === "TEACHER" ? "teacher" : "student", result);
      redirectToRole(result.role);
    } catch (error: unknown) {
      setAuthError(getErrorMessage(error));
    } finally {
      setAuthBusy(false);
    }
  }

  return (
    <main className="shell route-shell">
      <GlobalHeader />

      <section className="card auth-card auth-home-card">
        <form className="stack" onSubmit={handleLogin}>
          <div className="section-heading">
            <p className="eyebrow">Login</p>
            <h2>Open your dashboard</h2>
          </div>

          <label className="field">
            <span>Email</span>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              required
            />
          </label>

          {authError ? <div className="banner error">{authError}</div> : null}

          <button className="primary-button" type="submit" disabled={authBusy}>
            {authBusy ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}

function TeacherPage() {
  const [session, setSession] = useState<AuthResponse | null>(() => loadSession("teacher"));
  const [authLoading, setAuthLoading] = useState<boolean>(Boolean(loadSession("teacher")));
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [testIdInput, setTestIdInput] = useState("1");
  const [minZone, setMinZone] = useState<RiskZone>("YELLOW");
  const [riskStudents, setRiskStudents] = useState<RiskStudent[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);
  const [attemptDetails, setAttemptDetails] = useState<TeacherAttemptDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  
  const [allStudents, setAllStudents] = useState<TeacherStudent[]>([]);
  const [loadingAllStudents, setLoadingAllStudents] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  useRoleSession("teacher", "TEACHER", setSession, setAuthLoading);

  useEffect(() => {
    if (!session) return;
    setLoadingAllStudents(true);
    api.getTeacherStudents(session.accessToken)
      .then(setAllStudents)
      .catch((error) => console.error("Failed to load students", error))
      .finally(() => setLoadingAllStudents(false));
  }, [session]);

  useEffect(() => {
    if (!session || !selectedAttemptId) return;
    setDetailsLoading(true);
    setDetailsError(null);
    api
      .getAttemptDetails(session.accessToken, selectedAttemptId)
      .then(setAttemptDetails)
      .catch((error: unknown) => {
        setAttemptDetails(null);
        setDetailsError(getErrorMessage(error));
      })
      .finally(() => setDetailsLoading(false));
  }, [selectedAttemptId, session]);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await handleRoleLogin(
      "teacher",
      "TEACHER",
      loginEmail,
      loginPassword,
      setLoginBusy,
      setLoginError,
      (result) => {
        setSession(result);
        setRiskStudents([]);
        setAttemptDetails(null);
        setSelectedAttemptId(null);
        setHasSearched(false);
      }
    );
  }

  async function handleLoadRiskStudents(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!session) return;

    const testId = Number(testIdInput);
    if (!Number.isInteger(testId) || testId <= 0) {
      setListError("Enter a valid testId.");
      return;
    }

    setListLoading(true);
    setListError(null);
    setHasSearched(true);

    try {
      const students = await api.getRiskStudents(session.accessToken, testId, minZone);
      setRiskStudents(students);
      if (students.length > 0) {
        setSelectedAttemptId(students[0].attemptId);
      } else {
        setSelectedAttemptId(null);
        setAttemptDetails(null);
      }
    } catch (error: unknown) {
      setRiskStudents([]);
      setAttemptDetails(null);
      setSelectedAttemptId(null);
      setListError(getErrorMessage(error));
    } finally {
      setListLoading(false);
    }
  }

  function handleLogout() {
    clearSession("teacher");
    setSession(null);
    setRiskStudents([]);
    setAttemptDetails(null);
    setSelectedAttemptId(null);
    setLoginPassword("");
    setHasSearched(false);
    setAllStudents([]);
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
          <a className="route-card compact-route-card" href="/auth">
            <h2>Go to login</h2>
            <p>Open the shared login and registration page.</p>
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
          <p className="eyebrow">Teacher Console</p>
          <h1>Teacher dashboard</h1>
        </div>
        <div className="topbar-actions">
          <div className="identity-card">
            <span>{session.fullName ? "Teacher" : "Teacher ID"}</span>
            <strong>{session.fullName || session.userId}</strong>
          </div>
          <button className="ghost-button" onClick={handleLogout} type="button">
            Log out
          </button>
        </div>
      </section>

      <section className="dashboard-grid">
        <aside className="card sidebar-card">
          <div className="section-heading">
            <p className="eyebrow">Filter</p>
            <h2>Risk students</h2>
          </div>
          <form className="stack" onSubmit={handleLoadRiskStudents}>
            <label className="field">
              <span>Test ID</span>
              <input
                type="number"
                min="1"
                step="1"
                value={testIdInput}
                onChange={(e) => setTestIdInput(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>Minimum risk zone</span>
              <select value={minZone} onChange={(e) => setMinZone(e.target.value as RiskZone)}>
                {zoneOptions.map((zone) => (
                  <option key={zone} value={zone}>
                    {zoneLabels[zone]}
                  </option>
                ))}
              </select>
            </label>
            <div className="banner info">
              Teacher API still does not expose a test catalog, so testId is entered manually.
            </div>
            {listError ? <div className="banner error">{listError}</div> : null}
            <button className="primary-button" type="submit" disabled={listLoading}>
              {listLoading ? "Loading..." : "Load students"}
            </button>
          </form>

          <div className="section-heading compact-heading">
            <p className="eyebrow">Results</p>
            <h2>Students</h2>
          </div>
          <div className="student-list">
            {!hasSearched ? (
              loadingAllStudents ? (
                <div className="empty-state">Loading your students...</div>
              ) : allStudents.length === 0 ? (
                <div className="empty-state">
                  <strong>No students</strong>
                  <p>You don't have any students registered under your account yet.</p>
                </div>
              ) : (
                allStudents.map((student) => (
                  <div key={student.id} className="student-card" style={{ cursor: "default" }}>
                    <div className="student-card-top">
                      <strong>{student.fullName}</strong>
                    </div>
                    <p>{student.className || "Class is not set"}</p>
                    <small>studentId: {student.id}</small>
                  </div>
                ))
              )
            ) : riskStudents.length === 0 ? (
              <div className="empty-state">
                <strong>No results yet</strong>
                <p>No students matched the selected test and risk criteria.</p>
              </div>
            ) : (
              riskStudents.map((student) => (
                <button
                  key={student.attemptId}
                  className={`student-card ${selectedAttemptId === student.attemptId ? "selected" : ""}`}
                  onClick={() => setSelectedAttemptId(student.attemptId)}
                  type="button"
                >
                  <div className="student-card-top">
                    <strong>{student.studentName}</strong>
                    <span className={`zone-pill zone-${student.maxZone.toLowerCase()}`}>{student.maxZone}</span>
                  </div>
                  <p>{student.className || "Class is not set"}</p>
                  <small>
                    studentId: {student.studentId} | attemptId: {student.attemptId}
                  </small>
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="card details-card">
          <div className="section-heading">
            <p className="eyebrow">Details</p>
            <h2>Attempt report</h2>
          </div>
          {detailsLoading ? <div className="empty-state">Loading attempt details...</div> : null}
          {detailsError ? <div className="banner error">{detailsError}</div> : null}
          {!detailsLoading && !detailsError && !attemptDetails ? (
            <div className="empty-state">
              <strong>No attempt selected</strong>
              <p>Select a student on the left to inspect category results and answers.</p>
            </div>
          ) : null}
          {!detailsLoading && !detailsError && attemptDetails ? (
            <div className="details-layout">
              <div className="summary-grid">
                <InfoBox label="Student" value={attemptDetails.studentName} />
                <InfoBox label="Test" value={attemptDetails.testTitle} />
                <InfoBox label="Class" value={attemptDetails.className || "Not set"} />
                <InfoBox label="Max zone" value={attemptDetails.maxZone} tone={attemptDetails.maxZone} />
                <InfoBox label="Started" value={formatDateTime(attemptDetails.startedAt)} />
                <InfoBox
                  label="Finished"
                  value={attemptDetails.finishedAt ? formatDateTime(attemptDetails.finishedAt) : "Not finished"}
                />
              </div>
              <div className="panel-block">
                <div className="panel-heading">
                  <h3>Category results</h3>
                </div>
                <div className="category-grid">
                  {attemptDetails.categoryResults.map((result) => (
                    <article key={result.categoryId} className="category-card">
                      <div className="student-card-top">
                        <strong>{result.categoryName}</strong>
                        <span className={`zone-pill zone-${result.zone.toLowerCase()}`}>{result.zone}</span>
                      </div>
                      <p>Total score: {result.totalScore}</p>
                    </article>
                  ))}
                </div>
              </div>
              <div className="panel-block">
                <div className="panel-heading">
                  <h3>Answers</h3>
                </div>
                <div className="answers-table-wrapper">
                  <table className="answers-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Category</th>
                        <th>Question</th>
                        <th>Answer</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attemptDetails.answers.map((answer) => (
                        <tr key={answer.questionId}>
                          <td>{answer.orderNumber}</td>
                          <td>{answer.categoryName}</td>
                          <td>{answer.questionText}</td>
                          <td>{answer.selectedOptionText}</td>
                          <td>{answer.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </section>
    </main>
  );
}

function StudentPage() {
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
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [lessonsLoading, setLessonsLoading] = useState(false);
  const [lessonsError, setLessonsError] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
  const [lessonDetails, setLessonDetails] = useState<Lesson | null>(null);
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

  useRoleSession("student", "STUDENT", setSession, setAuthLoading);

  useEffect(() => {
    if (!session) return;
    setCoursesLoading(true);
    setCoursesError(null);
    setTestsError(null);

    Promise.all([api.getCourses(), api.getStudentTests(session.accessToken)])
      .then(([loadedCourses, loadedTests]) => {
        setCourses(loadedCourses);
        setTests(loadedTests);
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
    if (!selectedCourseId) {
      setLessons([]);
      return;
    }
    setLessonsLoading(true);
    setLessonsError(null);
    api
      .getCourseLessons(selectedCourseId)
      .then((result) => {
        setLessons(result);
        if (result.length > 0) {
          setSelectedLessonId((current) =>
            current && result.some((lesson) => lesson.id === current) ? current : result[0].id
          );
        } else {
          setSelectedLessonId(null);
          setLessonDetails(null);
        }
      })
      .catch((error: unknown) => {
        setLessons([]);
        setLessonsError(getErrorMessage(error));
      })
      .finally(() => setLessonsLoading(false));
  }, [selectedCourseId]);

  useEffect(() => {
    if (!selectedLessonId) {
      setLessonDetails(null);
      return;
    }
    setLessonDetailsLoading(true);
    api
      .getLesson(selectedLessonId)
      .then(setLessonDetails)
      .catch(() => setLessonDetails(null))
      .finally(() => setLessonDetailsLoading(false));
  }, [selectedLessonId]);

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
      })
      .catch((error: unknown) => {
        setQuestions([]);
        setQuestionsError(getErrorMessage(error));
      })
      .finally(() => setQuestionsLoading(false));
  }, [selectedTestId, session]);

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
      const result = await api.completeLesson(session.accessToken, lessonDetails.id);
      setLessonActionMessage(`Lesson marked as ${result.status} at ${formatDateTime(result.completedAt)}`);
    } catch (error: unknown) {
      setLessonActionMessage(getErrorMessage(error));
    } finally {
      setLessonActionBusy(false);
    }
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
    } catch (error: unknown) {
      setTestActionError(getErrorMessage(error));
    } finally {
      setAnswerBusyQuestionId(null);
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
    setLessons([]);
    setLessonDetails(null);
    setQuestions([]);
    setAttemptId(null);
    setFinishResult(null);
  }

  if (authLoading) return <div className="shell loading-shell">Checking saved student session...</div>;

  if (!session) {
    return (
      <main className="shell route-shell">
        <GlobalHeader />
        <section className="hero-panel">
          <p className="eyebrow">Student Console</p>
          <h1>You need to sign in from the main page first.</h1>
          <p className="lead">Use the unified login on `/auth`, then the site will redirect students here automatically.</p>
          <a className="route-card compact-route-card" href="/auth">
            <h2>Go to login</h2>
            <p>Open the shared login and registration page.</p>
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
          <p className="eyebrow">Student Console</p>
          <h1>Student dashboard</h1>
        </div>
        <div className="topbar-actions">
          <div className="identity-card">
            <span>{session.fullName ? "Student" : "Student ID"}</span>
            <strong>{session.fullName || session.userId}</strong>
          </div>
          <button className="ghost-button" onClick={handleLogout} type="button">
            Log out
          </button>
        </div>
      </section>

      <section className="student-dashboard-grid">
        <aside className="card sidebar-card">
          <div className="section-heading">
            <p className="eyebrow">Courses</p>
            <h2>Learning content</h2>
          </div>
          {coursesLoading ? <div className="empty-state">Loading courses...</div> : null}
          {coursesError ? <div className="banner error">{coursesError}</div> : null}
          <div className="stack">
            {courses.map((course) => (
              <button
                key={course.id}
                className={`student-card ${selectedCourseId === course.id ? "selected" : ""}`}
                onClick={() => setSelectedCourseId(course.id)}
                type="button"
              >
                <div className="student-card-top">
                  <strong>{course.title}</strong>
                  <span className="mini-pill">{course.ageGroup || "All ages"}</span>
                </div>
                <p>{course.description || "No description provided."}</p>
              </button>
            ))}
          </div>

          <div className="section-heading compact-heading">
            <p className="eyebrow">Lessons</p>
            <h2>Course lessons</h2>
          </div>
          {lessonsLoading ? <div className="empty-state">Loading lessons...</div> : null}
          {lessonsError ? <div className="banner error">{lessonsError}</div> : null}
          <div className="stack">
            {lessons.map((lesson) => (
              <button
                key={lesson.id}
                className={`student-card ${selectedLessonId === lesson.id ? "selected" : ""}`}
                onClick={() => setSelectedLessonId(lesson.id)}
                type="button"
              >
                <div className="student-card-top">
                  <strong>{lesson.title}</strong>
                  <span className="mini-pill">#{lesson.orderNumber}</span>
                </div>
                <p>{lesson.textContent ? "Lesson text available" : "Text is not set"}</p>
              </button>
            ))}
          </div>
        </aside>

        <section className="card details-card">
          <div className="section-heading">
            <p className="eyebrow">Lesson</p>
            <h2>Selected lesson</h2>
          </div>
          {lessonDetailsLoading ? <div className="empty-state">Loading lesson details...</div> : null}
          {!lessonDetailsLoading && lessonDetails ? (
            <div className="details-layout">
              <div className="summary-grid">
                <InfoBox label="Title" value={lessonDetails.title} />
                <InfoBox label="Course ID" value={String(lessonDetails.courseId)} />
                <InfoBox label="Order" value={String(lessonDetails.orderNumber)} />
              </div>
              <div className="panel-block">
                <div className="panel-heading">
                  <h3>Lesson content</h3>
                </div>
                <div className="content-card">
                  <p>{lessonDetails.textContent || "No text content was provided for this lesson yet."}</p>
                  {lessonDetails.videoUrl ? (
                    <a className="inline-link" href={lessonDetails.videoUrl} target="_blank" rel="noreferrer">
                      Open lesson video
                    </a>
                  ) : (
                    <p className="muted-text">Video is not attached to this lesson.</p>
                  )}
                </div>
              </div>
              <div className="panel-block">
                <button className="primary-button" onClick={handleCompleteLesson} disabled={lessonActionBusy}>
                  {lessonActionBusy ? "Saving..." : "Mark lesson as completed"}
                </button>
                {lessonActionMessage ? <div className="banner info">{lessonActionMessage}</div> : null}
                <div className="banner info">
                  Scenario answering API exists, but there is no student endpoint yet for listing scenarios by lesson.
                </div>
              </div>
            </div>
          ) : null}
          {!lessonDetailsLoading && !lessonDetails ? (
            <div className="empty-state">
              <strong>No lesson selected</strong>
              <p>Choose a course and lesson on the left to view its content.</p>
            </div>
          ) : null}
        </section>
      </section>

      <section className="card tests-card">
        <div className="section-heading">
          <p className="eyebrow">Tests</p>
          <h2>Psychological tests</h2>
        </div>
        {testsError ? <div className="banner error">{testsError}</div> : null}
        <div className="test-tabs">
          {tests.map((test) => (
            <button
              key={test.id}
              className={`test-tab ${selectedTestId === test.id ? "selected" : ""}`}
              onClick={() => setSelectedTestId(test.id)}
              type="button"
            >
              {test.title}
            </button>
          ))}
        </div>

        {questionsLoading ? <div className="empty-state">Loading questions...</div> : null}
        {questionsError ? <div className="banner error">{questionsError}</div> : null}

        {!questionsLoading && selectedTestId && questions.length > 0 ? (
          <div className="details-layout">
            <div className="panel-block">
              <div className="panel-heading">
                <h3>Attempt controls</h3>
              </div>
              <div className="test-actions">
                <button className="primary-button" onClick={handleStartAttempt} disabled={testActionBusy}>
                  {testActionBusy ? "Preparing..." : attemptId ? `Attempt #${attemptId}` : "Start attempt"}
                </button>
                <button
                  className="ghost-button"
                  onClick={handleFinishAttempt}
                  disabled={!attemptId || testActionBusy}
                  type="button"
                >
                  Finish attempt
                </button>
              </div>
              {testActionError ? <div className="banner error">{testActionError}</div> : null}
            </div>

            <div className="question-list">
              {questions.map((question) => (
                <article key={question.id} className="question-card">
                  <div className="student-card-top">
                    <strong>
                      {question.orderNumber}. {question.text}
                    </strong>
                    <span className="mini-pill">{question.categoryName}</span>
                  </div>
                  <div className="option-list">
                    {question.options.map((option) => {
                      const isSelected = answersByQuestion[question.id] === option.id;
                      return (
                        <button
                          key={option.id}
                          className={`option-button ${isSelected ? "selected" : ""}`}
                          disabled={!attemptId || answerBusyQuestionId === question.id || Boolean(finishResult)}
                          onClick={() => handleAnswerQuestion(question.id, option.id)}
                          type="button"
                        >
                          {option.text}
                        </button>
                      );
                    })}
                  </div>
                </article>
              ))}
            </div>

            {finishResult ? (
              <div className="panel-block">
                <div className="panel-heading">
                  <h3>Attempt result</h3>
                </div>
                <div className="summary-grid">
                  <InfoBox label="Attempt ID" value={String(finishResult.attemptId)} />
                  <InfoBox label="Max zone" value={finishResult.maxZone} tone={finishResult.maxZone} />
                </div>
                <div className="category-grid">
                  {finishResult.results.map((result: CategoryResult) => (
                    <article key={result.categoryId} className="category-card">
                      <div className="student-card-top">
                        <strong>{result.categoryName}</strong>
                        <span className={`zone-pill zone-${result.zone.toLowerCase()}`}>{result.zone}</span>
                      </div>
                      <p>Total score: {result.totalScore}</p>
                    </article>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {!questionsLoading && selectedTestId && questions.length === 0 ? (
          <div className="empty-state">
            <strong>No questions found</strong>
            <p>This test has no questions in the current database.</p>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function NotFoundPage() {
  return (
    <main className="shell route-shell">
      <GlobalHeader />
      <section className="hero-panel">
        <p className="eyebrow">Not Found</p>
        <h1>This page does not exist.</h1>
        <p className="lead">Use one of the known routes below.</p>
        <div className="route-grid">
          <a className="route-card" href="/teachers">
            <h2>/teachers</h2>
            <p>Teacher workspace</p>
          </a>
          <a className="route-card" href="/students">
            <h2>/students</h2>
            <p>Student workspace</p>
          </a>
        </div>
      </section>
    </main>
  );
}



function InfoBox(props: { label: string; value: string; tone?: RiskZone }) {
  return (
    <div className={`info-box ${props.tone ? `tone-${props.tone.toLowerCase()}` : ""}`}>
      <span>{props.label}</span>
      <strong>{props.value}</strong>
    </div>
  );
}

function useRoleSession(
  scope: "teacher" | "student",
  expectedRole: UserRole,
  setSession: (value: AuthResponse | null) => void,
  setAuthLoading: (value: boolean) => void
) {
  useEffect(() => {
    const existing = loadSession(scope);
    if (!existing) {
      setAuthLoading(false);
      return;
    }

    api
      .me(existing.accessToken)
      .then(() => {
        if (existing.role !== expectedRole) {
          throw new Error(`This page is only available for ${expectedRole.toLowerCase()} users.`);
        }
        setSession(existing);
      })
      .catch(() => {
        clearSession(scope);
        setSession(null);
      })
      .finally(() => setAuthLoading(false));
  }, [expectedRole, scope, setAuthLoading, setSession]);
}

async function handleRoleLogin(
  scope: "teacher" | "student",
  expectedRole: UserRole,
  email: string,
  password: string,
  setBusy: (value: boolean) => void,
  setError: (value: string | null) => void,
  onSuccess: (result: AuthResponse) => void
) {
  setBusy(true);
  setError(null);
  try {
    const result = await api.login({ email: email.trim(), password });
    if (result.role !== expectedRole) {
      throw new Error(`Signed in user role is ${result.role}, not ${expectedRole}.`);
    }
    saveSession(scope, result);
    onSuccess(result);
  } catch (error: unknown) {
    setError(getErrorMessage(error));
  } finally {
    setBusy(false);
  }
}

function resolveRoute(pathname: string): AppRoute {
  if (pathname === "/") return "home";
  if (pathname === "/auth") return "auth";
  if (pathname === "/teachers") return "teachers";
  if (pathname === "/students") return "students";
  if (pathname === "/admin") return "admin";
  return "not-found";
}

function redirectToRole(role: UserRole) {
  const target = role === "ADMIN" ? "/admin" : role === "TEACHER" ? "/teachers" : role === "STUDENT" ? "/students" : "/";
  window.location.href = target;
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Unknown error";
}

function AdminPage() {
  const [session] = useState<AuthResponse | null>(() => loadSession("admin"));
  const [data, setData] = useState<AdminDashboardDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseDesc, setNewCourseDesc] = useState("");
  const [newCourseAge, setNewCourseAge] = useState("");
  const [creatingCourse, setCreatingCourse] = useState(false);

  const [editingCourseId, setEditingCourseId] = useState<number | null>(null);
  const [editCourseTitle, setEditCourseTitle] = useState("");
  const [editCourseDesc, setEditCourseDesc] = useState("");
  const [editCourseAge, setEditCourseAge] = useState("");

  useEffect(() => {
    if (!session) {
      setLoading(false);
      return;
    }
    api.getAdminDashboard(session.accessToken)
      .then(setData)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [session]);

  if (!session) {
    return (
      <main className="shell route-shell">
        <GlobalHeader />
        <section className="hero-panel">
          <p className="eyebrow">Admin Console</p>
          <h1>Access Denied</h1>
        </section>
      </main>
    );
  }

  function handleLogout() {
    clearSession("admin");
    window.location.href = "/";
  }

  async function handleCreateCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !data) return;
    setCreatingCourse(true);
    try {
      const resp = await api.createCourse(session.accessToken, {
        title: newCourseTitle.trim(),
        description: newCourseDesc.trim() || undefined,
        ageGroup: newCourseAge.trim() || undefined
      });
      setData({
        ...data,
        courses: [...data.courses, resp]
      });
      setNewCourseTitle("");
      setNewCourseDesc("");
      setNewCourseAge("");
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setCreatingCourse(false);
    }
  }

  async function handleDeleteCourse(id: number) {
    if (!session || !data) return;
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      await api.deleteCourse(session.accessToken, id);
      setData({ ...data, courses: data.courses.filter(c => c.id !== id) });
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  function startEditingCourse(course: AdminCourseDto) {
    setEditingCourseId(course.id);
    setEditCourseTitle(course.title);
    setEditCourseDesc(course.description || "");
    setEditCourseAge(course.ageGroup || "");
  }

  async function handleUpdateCourse(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !data || editingCourseId === null) return;
    try {
      const updated = await api.updateCourse(session.accessToken, editingCourseId, {
        title: editCourseTitle.trim(),
        description: editCourseDesc.trim() || undefined,
        ageGroup: editCourseAge.trim() || undefined
      });
      setData({ ...data, courses: data.courses.map(c => c.id === editingCourseId ? updated : c) });
      setEditingCourseId(null);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  // Lesson state
  const [newLessonCourseId, setNewLessonCourseId] = useState<number | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonVideo, setNewLessonVideo] = useState("");
  const [newLessonText, setNewLessonText] = useState("");
  const [creatingLesson, setCreatingLesson] = useState(false);

  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
  const [editLessonTitle, setEditLessonTitle] = useState("");
  const [editLessonVideo, setEditLessonVideo] = useState("");
  const [editLessonText, setEditLessonText] = useState("");

  async function handleCreateLesson(e: React.FormEvent, courseId: number) {
    e.preventDefault();
    if (!session || !data) return;
    setCreatingLesson(true);
    try {
      const resp = await api.createLesson(session.accessToken, {
        courseId,
        title: newLessonTitle.trim(),
        videoPath: newLessonVideo.trim() || undefined,
        textContent: newLessonText.trim() || undefined
      });
      setData({
        ...data,
        courses: data.courses.map(c => 
          c.id === courseId ? { ...c, lessons: [...c.lessons, resp] } : c
        )
      });
      setNewLessonCourseId(null);
      setNewLessonTitle("");
      setNewLessonVideo("");
      setNewLessonText("");
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setCreatingLesson(false);
    }
  }

  async function handleDeleteLesson(courseId: number, lessonId: number) {
    if (!session || !data) return;
    if (!confirm("Are you sure you want to delete this lesson?")) return;
    try {
      await api.deleteLesson(session.accessToken, lessonId);
      setData({
        ...data,
        courses: data.courses.map(c => 
          c.id === courseId ? { ...c, lessons: c.lessons.filter(l => l.id !== lessonId) } : c
        )
      });
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  function startEditingLesson(lesson: AdminLessonDto) {
    setEditingLessonId(lesson.id);
    setEditLessonTitle(lesson.title);
    setEditLessonVideo(lesson.videoPath || "");
    setEditLessonText(lesson.textContent || "");
  }

  async function handleUpdateLesson(e: React.FormEvent, courseId: number) {
    e.preventDefault();
    if (!session || !data || editingLessonId === null) return;
    try {
      const updated = await api.updateLesson(session.accessToken, editingLessonId, { 
        title: editLessonTitle.trim(),
        videoPath: editLessonVideo.trim() || undefined,
        textContent: editLessonText.trim() || undefined
      });
      setData({
        ...data,
        courses: data.courses.map(c => 
          c.id === courseId ? { ...c, lessons: c.lessons.map(l => l.id === editingLessonId ? updated : l) } : c
        )
      });
      setEditingLessonId(null);
    } catch (err) {
      alert(getErrorMessage(err));
    }
  }

  // ---- TEST STATE ----
  const [expandedTestId, setExpandedTestId] = useState<number | null>(null);
  const [expandedCategoryId, setExpandedCategoryId] = useState<number | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<number | null>(null);

  // New Test
  const [newTestTitle, setNewTestTitle] = useState("");
  const [newTestDesc, setNewTestDesc] = useState("");
  const [creatingTest, setCreatingTest] = useState(false);
  // Edit Test
  const [editingTestId, setEditingTestId] = useState<number | null>(null);
  const [editTestTitle, setEditTestTitle] = useState("");
  const [editTestDesc, setEditTestDesc] = useState("");

  // New Category
  const [newCatTestId, setNewCatTestId] = useState<number | null>(null);
  const [newCatName, setNewCatName] = useState("");
  const [newCatDesc, setNewCatDesc] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  // Edit Category
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editCatName, setEditCatName] = useState("");
  const [editCatDesc, setEditCatDesc] = useState("");

  // New Zone
  const [newZoneCatId, setNewZoneCatId] = useState<number | null>(null);
  const [newZoneType, setNewZoneType] = useState("GREEN");
  const [newZoneMin, setNewZoneMin] = useState("");
  const [newZoneMax, setNewZoneMax] = useState("");
  const [newZonePriority, setNewZonePriority] = useState("0");

  // New Question
  const [newQCatId, setNewQCatId] = useState<number | null>(null);
  const [newQTestId, setNewQTestId] = useState<number | null>(null);
  const [newQText, setNewQText] = useState("");
  const [newQOrder, setNewQOrder] = useState("1");
  const [creatingQ, setCreatingQ] = useState(false);
  // Edit Question
  const [editingQId, setEditingQId] = useState<number | null>(null);
  const [editQText, setEditQText] = useState("");

  // New Answer
  const [newAQId, setNewAQId] = useState<number | null>(null);
  const [newAText, setNewAText] = useState("");
  const [newAScore, setNewAScore] = useState("0");
  // Edit Answer
  const [editingAId, setEditingAId] = useState<number | null>(null);
  const [editAText, setEditAText] = useState("");
  const [editAScore, setEditAScore] = useState("0");

  function updateTestInState(updated: AdminTestDto) {
    if (!data) return;
    setData({ ...data, tests: data.tests.map(t => t.id === updated.id ? updated : t) });
  }

  function updateCategoryInState(testId: number, updated: AdminTestCategoryDto) {
    if (!data) return;
    setData({ ...data, tests: data.tests.map(t => t.id === testId ? {
      ...t, categories: t.categories.map(c => c.id === updated.id ? updated : c)
    } : t) });
  }

  async function handleCreateTest(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !data) return;
    setCreatingTest(true);
    try {
      const resp = await api.createTest(session.accessToken, { title: newTestTitle.trim(), description: newTestDesc.trim() || undefined });
      setData({ ...data, tests: [...data.tests, resp] });
      setNewTestTitle(""); setNewTestDesc("");
    } catch (err) { alert(getErrorMessage(err)); }
    finally { setCreatingTest(false); }
  }

  async function handleUpdateTest(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !data || editingTestId === null) return;
    try {
      const updated = await api.updateTest(session.accessToken, editingTestId, { title: editTestTitle.trim(), description: editTestDesc.trim() || undefined });
      updateTestInState(updated);
      setEditingTestId(null);
    } catch (err) { alert(getErrorMessage(err)); }
  }

  async function handleDeleteTest(id: number) {
    if (!session || !data) return;
    if (!confirm("Delete this test?")) return;
    try {
      await api.deleteTest(session.accessToken, id);
      setData({ ...data, tests: data.tests.filter(t => t.id !== id) });
    } catch (err) { alert(getErrorMessage(err)); }
  }

  async function handleCreateCategory(e: React.FormEvent, testId: number) {
    e.preventDefault();
    if (!session || !data) return;
    setCreatingCat(true);
    try {
      const resp = await api.createTestCategory(session.accessToken, { testId, name: newCatName.trim(), description: newCatDesc.trim() || undefined });
      setData({ ...data, tests: data.tests.map(t => t.id === testId ? { ...t, categories: [...t.categories, resp] } : t) });
      setNewCatTestId(null); setNewCatName(""); setNewCatDesc("");
    } catch (err) { alert(getErrorMessage(err)); }
    finally { setCreatingCat(false); }
  }

  async function handleUpdateCategory(e: React.FormEvent, testId: number) {
    e.preventDefault();
    if (!session || editingCatId === null) return;
    try {
      const updated = await api.updateTestCategory(session.accessToken, editingCatId, { name: editCatName.trim(), description: editCatDesc.trim() || undefined });
      updateCategoryInState(testId, updated);
      setEditingCatId(null);
    } catch (err) { alert(getErrorMessage(err)); }
  }

  async function handleDeleteCategory(testId: number, catId: number) {
    if (!session || !data) return;
    if (!confirm("Delete this category?")) return;
    try {
      await api.deleteTestCategory(session.accessToken, catId);
      setData({ ...data, tests: data.tests.map(t => t.id === testId ? { ...t, categories: t.categories.filter(c => c.id !== catId) } : t) });
    } catch (err) { alert(getErrorMessage(err)); }
  }

  async function handleCreateZone(e: React.FormEvent, testId: number, catId: number) {
    e.preventDefault();
    if (!session || !data) return;
    try {
      const resp = await api.createCategoryZone(session.accessToken, { categoryId: catId, zone: newZoneType, minScore: Number(newZoneMin), maxScore: Number(newZoneMax), priority: Number(newZonePriority) });
      setData({ ...data, tests: data.tests.map(t => t.id === testId ? { ...t, categories: t.categories.map(c => c.id === catId ? { ...c, zones: [...c.zones, resp] } : c) } : t) });
      setNewZoneCatId(null); setNewZoneType("GREEN"); setNewZoneMin(""); setNewZoneMax(""); setNewZonePriority("0");
    } catch (err) { alert(getErrorMessage(err)); }
  }

  async function handleDeleteZone(testId: number, catId: number, zoneId: number) {
    if (!session || !data) return;
    if (!confirm("Delete this zone?")) return;
    try {
      await api.deleteCategoryZone(session.accessToken, zoneId);
      setData({ ...data, tests: data.tests.map(t => t.id === testId ? { ...t, categories: t.categories.map(c => c.id === catId ? { ...c, zones: c.zones.filter(z => z.id !== zoneId) } : c) } : t) });
    } catch (err) { alert(getErrorMessage(err)); }
  }

  async function handleCreateQuestion(e: React.FormEvent, testId: number, catId: number) {
    e.preventDefault();
    if (!session || !data) return;
    setCreatingQ(true);
    try {
      const resp = await api.createTestQuestion(session.accessToken, { testId, categoryId: catId, text: newQText.trim(), orderNumber: Number(newQOrder) });
      setData({ ...data, tests: data.tests.map(t => t.id === testId ? { ...t, categories: t.categories.map(c => c.id === catId ? { ...c, questions: [...c.questions, resp] } : c) } : t) });
      setNewQCatId(null); setNewQText(""); setNewQOrder("1");
    } catch (err) { alert(getErrorMessage(err)); }
    finally { setCreatingQ(false); }
  }

  async function handleUpdateQuestion(e: React.FormEvent, testId: number, catId: number) {
    e.preventDefault();
    if (!session || editingQId === null) return;
    try {
      const updated = await api.updateTestQuestion(session.accessToken, editingQId, { text: editQText.trim() });
      setData(data ? { ...data, tests: data.tests.map(t => t.id === testId ? { ...t, categories: t.categories.map(c => c.id === catId ? { ...c, questions: c.questions.map(q => q.id === editingQId ? updated : q) } : c) } : t) } : null);
      setEditingQId(null);
    } catch (err) { alert(getErrorMessage(err)); }
  }

  async function handleDeleteQuestion(testId: number, catId: number, qId: number) {
    if (!session || !data) return;
    if (!confirm("Delete this question?")) return;
    try {
      await api.deleteTestQuestion(session.accessToken, qId);
      setData({ ...data, tests: data.tests.map(t => t.id === testId ? { ...t, categories: t.categories.map(c => c.id === catId ? { ...c, questions: c.questions.filter(q => q.id !== qId) } : c) } : t) });
    } catch (err) { alert(getErrorMessage(err)); }
  }

  async function handleCreateAnswer(e: React.FormEvent, testId: number, catId: number, qId: number) {
    e.preventDefault();
    if (!session || !data) return;
    try {
      const resp = await api.createTestAnswer(session.accessToken, { questionId: qId, text: newAText.trim(), score: Number(newAScore) });
      setData({ ...data, tests: data.tests.map(t => t.id === testId ? { ...t, categories: t.categories.map(c => c.id === catId ? { ...c, questions: c.questions.map(q => q.id === qId ? { ...q, answers: [...q.answers, resp] } : q) } : c) } : t) });
      setNewAQId(null); setNewAText(""); setNewAScore("0");
    } catch (err) { alert(getErrorMessage(err)); }
  }

  async function handleUpdateAnswer(e: React.FormEvent, testId: number, catId: number, qId: number) {
    e.preventDefault();
    if (!session || editingAId === null) return;
    try {
      const updated = await api.updateTestAnswer(session.accessToken, editingAId, { text: editAText.trim(), score: Number(editAScore) });
      setData(data ? { ...data, tests: data.tests.map(t => t.id === testId ? { ...t, categories: t.categories.map(c => c.id === catId ? { ...c, questions: c.questions.map(q => q.id === qId ? { ...q, answers: q.answers.map(a => a.id === editingAId ? updated : a) } : q) } : c) } : t) } : null);
      setEditingAId(null);
    } catch (err) { alert(getErrorMessage(err)); }
  }

  async function handleDeleteAnswer(testId: number, catId: number, qId: number, aId: number) {
    if (!session || !data) return;
    if (!confirm("Delete this answer?")) return;
    try {
      await api.deleteTestAnswer(session.accessToken, aId);
      setData({ ...data, tests: data.tests.map(t => t.id === testId ? { ...t, categories: t.categories.map(c => c.id === catId ? { ...c, questions: c.questions.map(q => q.id === qId ? { ...q, answers: q.answers.filter(a => a.id !== aId) } : q) } : c) } : t) });
    } catch (err) { alert(getErrorMessage(err)); }
  }

  return (
    <main className="dashboard-shell">
      <GlobalHeader />
      <section className="topbar">
        <div>
          <p className="eyebrow">Admin Console</p>
          <h1>Platform Administration</h1>
        </div>
        <div className="topbar-actions">
          <div className="identity-card">
            <div className="identity-avatar">AD</div>
            <div className="identity-text">
              <strong>{session.fullName || "Admin"}</strong>
              <span>Global Administrator</span>
            </div>
          </div>
          <button className="secondary-button outline" onClick={handleLogout}>Log out</button>
        </div>
      </section>

      {error ? (
        <div className="card" style={{ color: "red" }}>{error}</div>
      ) : loading ? (
        <div className="card"><p>Loading admin data...</p></div>
      ) : data ? (
        <div className="admin-dashboard stack">
          <section className="admin-section">
            <h2 className="section-title">Schools & Users</h2>
            <div className="admin-grid">
              {data.schools.map((school) => (
                <article key={school.id} className="card admin-school-card stack">
                  <h3>{school.name}</h3>
                  <div className="school-details">
                    <p>Teachers: {school.teachers.length}</p>
                    <ul className="admin-list">
                      {school.teachers.map((t) => (
                        <li key={t.id}>
                          <strong>{t.fullName}</strong>
                          <span className="badge">{t.students.length} students</span>
                          <ul className="admin-sublist">
                            {t.students.map((s) => (
                              <li key={s.id}>{s.fullName} {s.className ? `(${s.className})` : ""}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="admin-section">
            <h2 className="section-title">Courses</h2>
            <div className="admin-grid">
              <article className="card admin-school-card stack" style={{ border: "2px dashed var(--border-color)" }}>
                <h3>Add New Course</h3>
                <form className="stack" style={{ gap: "12px", marginTop: "12px" }} onSubmit={handleCreateCourse}>
                  <label className="field">
                    <span>Title</span>
                    <input type="text" value={newCourseTitle} onChange={e => setNewCourseTitle(e.target.value)} required placeholder="Safety Basics" />
                  </label>
                  <label className="field">
                    <span>Description</span>
                    <input type="text" value={newCourseDesc} onChange={e => setNewCourseDesc(e.target.value)} placeholder="Optional" />
                  </label>
                  <label className="field">
                    <span>Age Group</span>
                    <input type="text" value={newCourseAge} onChange={e => setNewCourseAge(e.target.value)} placeholder="e.g. 12-14" />
                  </label>
                  <button type="submit" className="primary-button" disabled={creatingCourse}>
                    {creatingCourse ? "Saving..." : "Create Course"}
                  </button>
                </form>
              </article>
              {data.courses.map(course => (
                 <article key={course.id} className="card">
                   {editingCourseId === course.id ? (
                     <form onSubmit={handleUpdateCourse} className="stack" style={{ gap: "8px" }}>
                       <input type="text" value={editCourseTitle} onChange={e => setEditCourseTitle(e.target.value)} required placeholder="Title" />
                       <input type="text" value={editCourseDesc} onChange={e => setEditCourseDesc(e.target.value)} placeholder="Description (optional)" />
                       <input type="text" value={editCourseAge} onChange={e => setEditCourseAge(e.target.value)} placeholder="Age Group (optional)" />
                       <div style={{ display: "flex", gap: "8px" }}>
                         <button type="submit" className="primary-button outline">Save</button>
                         <button type="button" className="secondary-button" onClick={() => setEditingCourseId(null)}>Cancel</button>
                       </div>
                     </form>
                   ) : (
                     <>
                       <h3>{course.title}</h3>
                       {course.ageGroup && <p className="eyebrow" style={{ marginTop: "4px" }}>Возраст: {course.ageGroup}</p>}
                       {course.description && <p style={{ marginTop: "8px", fontSize: "0.9rem", color: "var(--text-secondary)" }}>{course.description}</p>}
                       <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                         <button className="secondary-button outline" onClick={() => startEditingCourse(course)}>Edit</button>
                         <button className="secondary-button outline" onClick={() => handleDeleteCourse(course.id)} style={{ color: "red", borderColor: "red" }}>Delete</button>
                       </div>
                       
                       <section style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
                         <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "8px" }}>
                           <h4 style={{ margin: 0 }}>Lessons</h4>
                           <button className="secondary-button" onClick={() => setNewLessonCourseId(course.id)}>+ Add</button>
                         </div>
                         
                         {newLessonCourseId === course.id && (
                           <form onSubmit={e => handleCreateLesson(e, course.id)} className="stack" style={{ gap: "8px", marginBottom: "16px", padding: "12px", background: "var(--surface-bg)", borderRadius: "8px" }}>
                             <input type="text" placeholder="Lesson Title" value={newLessonTitle} onChange={e => setNewLessonTitle(e.target.value)} required />
                             <input type="text" placeholder="Video Path (optional)" value={newLessonVideo} onChange={e => setNewLessonVideo(e.target.value)} />
                             <textarea placeholder="Text Content (optional)" value={newLessonText} onChange={e => setNewLessonText(e.target.value)} rows={3} />
                             <div style={{ display: "flex", gap: "8px" }}>
                               <button type="submit" className="primary-button" disabled={creatingLesson}>{creatingLesson ? "Saving..." : "Save Lesson"}</button>
                               <button type="button" className="secondary-button" onClick={() => setNewLessonCourseId(null)}>Cancel</button>
                             </div>
                           </form>
                         )}

                         <ul className="admin-list" style={{ marginTop: 0 }}>
                           {course.lessons.map(lesson => (
                             <li key={lesson.id} style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                               {editingLessonId === lesson.id ? (
                                 <form onSubmit={e => handleUpdateLesson(e, course.id)} className="stack" style={{ gap: "8px" }}>
                                   <input type="text" value={editLessonTitle} onChange={e => setEditLessonTitle(e.target.value)} required />
                                   <input type="text" placeholder="Video Path" value={editLessonVideo} onChange={e => setEditLessonVideo(e.target.value)} />
                                   <textarea placeholder="Text content" value={editLessonText} onChange={e => setEditLessonText(e.target.value)} rows={2} />
                                   <div style={{ display: "flex", gap: "8px" }}>
                                     <button type="submit" className="primary-button outline">Save</button>
                                     <button type="button" className="secondary-button" onClick={() => setEditingLessonId(null)}>Cancel</button>
                                   </div>
                                 </form>
                               ) : (
                                 <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                   <div>
                                     <strong>{lesson.title}</strong>
                                     <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginTop: "2px" }}>
                                       {lesson.videoPath && <span>🎥 Video </span>}
                                       {lesson.textContent && <span>📝 Text </span>}
                                     </div>
                                   </div>
                                   <div style={{ display: "flex", gap: "4px" }}>
                                     <button className="secondary-button" style={{ padding: "4px 8px", fontSize: "0.8rem" }} onClick={() => startEditingLesson(lesson)}>Edit</button>
                                     <button className="secondary-button" style={{ padding: "4px 8px", fontSize: "0.8rem", color: "red" }} onClick={() => handleDeleteLesson(course.id, lesson.id)}>Del</button>
                                   </div>
                                 </div>
                               )}
                             </li>
                           ))}
                           {course.lessons.length === 0 && <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No lessons yet.</p>}
                         </ul>
                       </section>
                     </>
                   )}
                 </article>
              ))}
            </div>
          </section>

          <section className="admin-section">
            <h2 className="section-title">Tests &amp; Questionnaires</h2>
            <div className="admin-grid">

              {/* Add new test card */}
              <article className="card admin-school-card stack" style={{ border: "2px dashed var(--border-color)" }}>
                <h3>Add New Test</h3>
                <form className="stack" style={{ gap: "12px", marginTop: "12px" }} onSubmit={handleCreateTest}>
                  <input type="text" value={newTestTitle} onChange={e => setNewTestTitle(e.target.value)} required placeholder="Test title" />
                  <input type="text" value={newTestDesc} onChange={e => setNewTestDesc(e.target.value)} placeholder="Description (optional)" />
                  <button type="submit" className="primary-button" disabled={creatingTest}>{creatingTest ? "Saving..." : "Create Test"}</button>
                </form>
              </article>

              {data.tests.map(test => (
                <article key={test.id} className="card">
                  {editingTestId === test.id ? (
                    <form onSubmit={handleUpdateTest} className="stack" style={{ gap: "8px" }}>
                      <input type="text" value={editTestTitle} onChange={e => setEditTestTitle(e.target.value)} required placeholder="Title" />
                      <input type="text" value={editTestDesc} onChange={e => setEditTestDesc(e.target.value)} placeholder="Description" />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button type="submit" className="primary-button outline">Save</button>
                        <button type="button" className="secondary-button" onClick={() => setEditingTestId(null)}>Cancel</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <p className="eyebrow">Psychological Test</p>
                          <h3 style={{ margin: 0, cursor: "pointer" }} onClick={() => setExpandedTestId(expandedTestId === test.id ? null : test.id)}>
                            {expandedTestId === test.id ? "expanded" : "collapsed"} {test.title}
                          </h3>
                          {test.description && <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginTop: "4px" }}>{test.description}</p>}
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                          <button className="secondary-button" style={{ padding: "4px 10px", fontSize: "0.8rem" }} onClick={() => { setEditingTestId(test.id); setEditTestTitle(test.title); setEditTestDesc(test.description || ""); }}>Edit</button>
                          <button className="secondary-button" style={{ padding: "4px 10px", fontSize: "0.8rem", color: "red" }} onClick={() => handleDeleteTest(test.id)}>Del</button>
                        </div>
                      </div>

                      {expandedTestId === test.id && (
                        <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                            <strong>Categories / Scales</strong>
                            <button className="secondary-button" style={{ padding: "3px 8px", fontSize: "0.8rem" }} onClick={() => setNewCatTestId(newCatTestId === test.id ? null : test.id)}>+ Category</button>
                          </div>
                          {newCatTestId === test.id && (
                            <form onSubmit={e => handleCreateCategory(e, test.id)} className="stack" style={{ gap: "6px", marginBottom: "12px", padding: "10px", background: "var(--surface-bg)", borderRadius: "8px" }}>
                              <input type="text" placeholder="Category name" value={newCatName} onChange={e => setNewCatName(e.target.value)} required />
                              <input type="text" placeholder="Description (optional)" value={newCatDesc} onChange={e => setNewCatDesc(e.target.value)} />
                              <div style={{ display: "flex", gap: "6px" }}>
                                <button type="submit" className="primary-button" disabled={creatingCat}>{creatingCat ? "..." : "Add"}</button>
                                <button type="button" className="secondary-button" onClick={() => setNewCatTestId(null)}>Cancel</button>
                              </div>
                            </form>
                          )}
                          {test.categories.map(cat => (
                            <div key={cat.id} style={{ marginBottom: "10px", padding: "10px", border: "1px solid var(--border-color)", borderRadius: "8px" }}>
                              {editingCatId === cat.id ? (
                                <form onSubmit={e => handleUpdateCategory(e, test.id)} className="stack" style={{ gap: "6px" }}>
                                  <input type="text" value={editCatName} onChange={e => setEditCatName(e.target.value)} required />
                                  <input type="text" value={editCatDesc} onChange={e => setEditCatDesc(e.target.value)} placeholder="Description" />
                                  <div style={{ display: "flex", gap: "6px" }}>
                                    <button type="submit" className="primary-button outline">Save</button>
                                    <button type="button" className="secondary-button" onClick={() => setEditingCatId(null)}>Cancel</button>
                                  </div>
                                </form>
                              ) : (
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                  <div style={{ cursor: "pointer" }} onClick={() => setExpandedCategoryId(expandedCategoryId === cat.id ? null : cat.id)}>
                                    <strong>{cat.name}</strong>
                                    {cat.description && <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>{cat.description}</div>}
                                  </div>
                                  <div style={{ display: "flex", gap: "4px" }}>
                                    <button className="secondary-button" style={{ padding: "2px 7px", fontSize: "0.75rem" }} onClick={() => { setEditingCatId(cat.id); setEditCatName(cat.name); setEditCatDesc(cat.description || ""); }}>Edit</button>
                                    <button className="secondary-button" style={{ padding: "2px 7px", fontSize: "0.75rem", color: "red" }} onClick={() => handleDeleteCategory(test.id, cat.id)}>Del</button>
                                  </div>
                                </div>
                              )}
                              {expandedCategoryId === cat.id && (
                                <div style={{ marginTop: "10px" }}>
                                  <div style={{ marginBottom: "10px" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                      <small><strong>Risk Zones</strong></small>
                                      <button className="secondary-button" style={{ padding: "2px 7px", fontSize: "0.75rem" }} onClick={() => setNewZoneCatId(newZoneCatId === cat.id ? null : cat.id)}>+ Zone</button>
                                    </div>
                                    {newZoneCatId === cat.id && (
                                      <form onSubmit={e => handleCreateZone(e, test.id, cat.id)} className="stack" style={{ gap: "4px", marginBottom: "8px", padding: "8px", background: "var(--surface-bg)", borderRadius: "6px" }}>
                                        <select value={newZoneType} onChange={e => setNewZoneType(e.target.value)} style={{ padding: "6px", borderRadius: "4px", border: "1px solid var(--border-color)", background: "var(--card-bg)", color: "inherit" }}>
                                          <option value="GREEN">GREEN</option>
                                          <option value="YELLOW">YELLOW</option>
                                          <option value="RED">RED</option>
                                          <option value="BLACK">BLACK</option>
                                        </select>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                          <input type="number" placeholder="Min score" value={newZoneMin} onChange={e => setNewZoneMin(e.target.value)} required style={{ width: "90px" }} />
                                          <input type="number" placeholder="Max score" value={newZoneMax} onChange={e => setNewZoneMax(e.target.value)} required style={{ width: "90px" }} />
                                          <input type="number" placeholder="Priority" value={newZonePriority} onChange={e => setNewZonePriority(e.target.value)} style={{ width: "80px" }} />
                                        </div>
                                        <div style={{ display: "flex", gap: "6px" }}>
                                          <button type="submit" className="primary-button" style={{ padding: "4px 10px" }}>Add Zone</button>
                                          <button type="button" className="secondary-button" onClick={() => setNewZoneCatId(null)}>Cancel</button>
                                        </div>
                                      </form>
                                    )}
                                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                                      {cat.zones.map(z => (
                                        <div key={z.id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "3px 8px", borderRadius: "6px", fontSize: "0.8rem", background: z.zone === "GREEN" ? "#16a34a22" : z.zone === "YELLOW" ? "#ca8a0422" : z.zone === "RED" ? "#dc262622" : "#1a1a1a", border: "1px solid " + (z.zone === "GREEN" ? "#16a34a" : z.zone === "YELLOW" ? "#ca8a04" : z.zone === "RED" ? "#dc2626" : "#555") }}>
                                          <span>{z.zone} {z.minScore}-{z.maxScore}</span>
                                          <button onClick={() => handleDeleteZone(test.id, cat.id, z.id)} style={{ background: "none", border: "none", cursor: "pointer", color: "red", fontSize: "0.75rem" }}>x</button>
                                        </div>
                                      ))}
                                      {cat.zones.length === 0 && <small style={{ color: "var(--text-secondary)" }}>No zones yet</small>}
                                    </div>
                                  </div>
                                  <div>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                                      <small><strong>Questions ({cat.questions.length})</strong></small>
                                      <button className="secondary-button" style={{ padding: "2px 7px", fontSize: "0.75rem" }} onClick={() => { setNewQCatId(cat.id); setNewQTestId(test.id); }}>+ Question</button>
                                    </div>
                                    {newQCatId === cat.id && (
                                      <form onSubmit={e => handleCreateQuestion(e, test.id, cat.id)} className="stack" style={{ gap: "4px", marginBottom: "8px", padding: "8px", background: "var(--surface-bg)", borderRadius: "6px" }}>
                                        <textarea placeholder="Question text" value={newQText} onChange={e => setNewQText(e.target.value)} required rows={2} />
                                        <input type="number" placeholder="Order #" value={newQOrder} onChange={e => setNewQOrder(e.target.value)} style={{ width: "100px" }} />
                                        <div style={{ display: "flex", gap: "6px" }}>
                                          <button type="submit" className="primary-button" disabled={creatingQ} style={{ padding: "4px 10px" }}>{creatingQ ? "..." : "Add"}</button>
                                          <button type="button" className="secondary-button" onClick={() => setNewQCatId(null)}>Cancel</button>
                                        </div>
                                      </form>
                                    )}
                                    <ul className="admin-list" style={{ marginTop: 0 }}>
                                      {cat.questions.map(q => (
                                        <li key={q.id} style={{ flexDirection: "column", alignItems: "stretch" }}>
                                          {editingQId === q.id ? (
                                            <form onSubmit={e => handleUpdateQuestion(e, test.id, cat.id)} className="stack" style={{ gap: "6px" }}>
                                              <textarea value={editQText} onChange={e => setEditQText(e.target.value)} required rows={2} />
                                              <div style={{ display: "flex", gap: "6px" }}>
                                                <button type="submit" className="primary-button outline" style={{ padding: "4px 10px" }}>Save</button>
                                                <button type="button" className="secondary-button" onClick={() => setEditingQId(null)}>Cancel</button>
                                              </div>
                                            </form>
                                          ) : (
                                            <>
                                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                                <div style={{ cursor: "pointer", flex: 1 }} onClick={() => setExpandedQuestionId(expandedQuestionId === q.id ? null : q.id)}>
                                                  <span style={{ fontSize: "0.85rem" }}>{q.orderNumber}. {q.text}</span>
                                                </div>
                                                <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                                                  <button className="secondary-button" style={{ padding: "2px 6px", fontSize: "0.75rem" }} onClick={() => { setEditingQId(q.id); setEditQText(q.text); }}>Edit</button>
                                                  <button className="secondary-button" style={{ padding: "2px 6px", fontSize: "0.75rem", color: "red" }} onClick={() => handleDeleteQuestion(test.id, cat.id, q.id)}>Del</button>
                                                </div>
                                              </div>
                                              {expandedQuestionId === q.id && (
                                                <div style={{ marginTop: "8px", paddingLeft: "12px" }}>
                                                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                                                    <small><strong>Answer Options</strong></small>
                                                    <button className="secondary-button" style={{ padding: "2px 6px", fontSize: "0.75rem" }} onClick={() => setNewAQId(newAQId === q.id ? null : q.id)}>+ Answer</button>
                                                  </div>
                                                  {newAQId === q.id && (
                                                    <form onSubmit={e => handleCreateAnswer(e, test.id, cat.id, q.id)} style={{ display: "flex", gap: "6px", marginBottom: "6px", flexWrap: "wrap" }}>
                                                      <input type="text" placeholder="Answer text" value={newAText} onChange={e => setNewAText(e.target.value)} required style={{ flex: 1, minWidth: "120px" }} />
                                                      <input type="number" placeholder="Score" value={newAScore} onChange={e => setNewAScore(e.target.value)} style={{ width: "70px" }} />
                                                      <button type="submit" className="primary-button" style={{ padding: "4px 10px" }}>Add</button>
                                                      <button type="button" className="secondary-button" onClick={() => setNewAQId(null)}>x</button>
                                                    </form>
                                                  )}
                                                  {q.answers.map(a => (
                                                    <div key={a.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 8px", marginBottom: "4px", background: "var(--surface-bg)", borderRadius: "6px", fontSize: "0.82rem" }}>
                                                      {editingAId === a.id ? (
                                                        <form onSubmit={e => handleUpdateAnswer(e, test.id, cat.id, q.id)} style={{ display: "flex", gap: "6px", flex: 1 }}>
                                                          <input type="text" value={editAText} onChange={e => setEditAText(e.target.value)} required style={{ flex: 1 }} />
                                                          <input type="number" value={editAScore} onChange={e => setEditAScore(e.target.value)} style={{ width: "60px" }} />
                                                          <button type="submit" className="primary-button outline" style={{ padding: "2px 8px" }}>Save</button>
                                                          <button type="button" className="secondary-button" onClick={() => setEditingAId(null)}>x</button>
                                                        </form>
                                                      ) : (
                                                        <>
                                                          <span>{a.text}</span>
                                                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                                            <span style={{ fontWeight: 600, minWidth: "30px", textAlign: "right" }}>{a.score}pts</span>
                                                            <button className="secondary-button" style={{ padding: "1px 5px", fontSize: "0.7rem" }} onClick={() => { setEditingAId(a.id); setEditAText(a.text); setEditAScore(String(a.score)); }}>Edit</button>
                                                            <button className="secondary-button" style={{ padding: "1px 5px", fontSize: "0.7rem", color: "red" }} onClick={() => handleDeleteAnswer(test.id, cat.id, q.id, a.id)}>Del</button>
                                                          </div>
                                                        </>
                                                      )}
                                                    </div>
                                                  ))}
                                                  {q.answers.length === 0 && <small style={{ color: "var(--text-secondary)" }}>No answers yet</small>}
                                                </div>
                                              )}
                                            </>
                                          )}
                                        </li>
                                      ))}
                                      {cat.questions.length === 0 && <small style={{ color: "var(--text-secondary)" }}>No questions yet</small>}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                          {test.categories.length === 0 && <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>No categories yet.</p>}
                        </div>
                      )}
                    </>
                  )}
                </article>
              ))}

              {data.scenarios.map(scenario => (
                 <article key={scenario.id} className="card">
                   <p className="eyebrow">Scenario</p>
                   <h3>{scenario.title}</h3>
                 </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}
    </main>
  );
}

export default App;
