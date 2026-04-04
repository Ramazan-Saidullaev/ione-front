import { useEffect, useState } from "react";
import { api } from "../api";
import { loadSession, clearSession } from "../storage";
import { GlobalHeader } from "../components/GlobalHeader";
import type {
  AuthResponse,
  CategoryResult,
  Course,
  FinishAttemptResponse,
  Lesson,
  TestListItem,
  TestQuestion
} from "../types";
import { getErrorMessage, formatDateTime } from "../utils/helpers";
import { useRoleSession, handleRoleLogin } from "../hooks/authHooks";
import { InfoBox } from "../components/InfoBox";

export function StudentPage() {
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