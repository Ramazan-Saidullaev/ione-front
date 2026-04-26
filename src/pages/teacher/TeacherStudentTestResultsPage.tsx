import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api";
import type {
  AuthResponse,
  TeacherAttemptDetails,
  TeacherAttemptListItem,
  TeacherStudent,
  TeacherStudentTestAttemptSummary
} from "../../types";
import { formatDateTime, getErrorMessage } from "../../utils/helpers";

type Props = {
  session: AuthResponse;
};

export function TeacherStudentTestResultsPage({ session }: Props) {
  const params = useParams();
  const studentId = Number(params.studentId);

  const [student, setStudent] = useState<TeacherStudent | null>(null);
  // Latest finished attempt per test (dashboard view)
  const [summaries, setSummaries] = useState<TeacherStudentTestAttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedTestId, setSelectedTestId] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<TeacherAttemptListItem[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(false);
  const [attemptsError, setAttemptsError] = useState<string | null>(null);

  const [expandedAttemptId, setExpandedAttemptId] = useState<number | null>(null);
  const [detailsByAttemptId, setDetailsByAttemptId] = useState<Record<number, TeacherAttemptDetails>>({});
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(studentId) || studentId <= 0) {
      setError("Некорректный studentId.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    Promise.all([
      api.getTeacherStudents(session.accessToken),
      api.getTeacherStudentLatestTestResults(session.accessToken, studentId)
    ])
      .then(([students, results]) => {
        setStudent(students.find((s) => s.id === studentId) ?? null);
        setSummaries(results);
        setSelectedTestId(null);
        setAttempts([]);
        setExpandedAttemptId(null);
      })
      .catch((e: unknown) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [session.accessToken, studentId]);

  useEffect(() => {
    if (!selectedTestId) return;

    setAttemptsLoading(true);
    setAttemptsError(null);
    api.getTeacherStudentTestAttempts(session.accessToken, studentId, selectedTestId)
      .then((data) => {
        setAttempts(data);
        setExpandedAttemptId(data[0]?.attemptId ?? null);
      })
      .catch((e: unknown) => setAttemptsError(getErrorMessage(e)))
      .finally(() => setAttemptsLoading(false));
  }, [selectedTestId, session.accessToken, studentId]);

  useEffect(() => {
    if (!expandedAttemptId) return;
    if (detailsByAttemptId[expandedAttemptId]) return;

    setDetailsLoading(true);
    setDetailsError(null);
    api.getAttemptDetails(session.accessToken, expandedAttemptId)
      .then((d) => setDetailsByAttemptId((prev) => ({ ...prev, [expandedAttemptId]: d })))
      .catch((e: unknown) => setDetailsError(getErrorMessage(e)))
      .finally(() => setDetailsLoading(false));
  }, [detailsByAttemptId, expandedAttemptId, session.accessToken]);

  const title = useMemo(() => {
    if (student?.fullName) return student.fullName;
    return `Ученик ${studentId}`;
  }, [student?.fullName, studentId]);

  const selectedTestSummary = useMemo(() => {
    if (!selectedTestId) return null;
    return summaries.find((s) => s.testId === selectedTestId) ?? null;
  }, [selectedTestId, summaries]);

  return (
    <section className="dashboard-grid">
      <aside className="card sidebar-card">
        <div className="section-heading">
          <p className="eyebrow">Психологические тесты</p>
          <h2>{title}</h2>
        </div>

        <div className="page-nav">
          <Link to="/teachers/tests">← Назад к ученикам</Link>
        </div>

        {loading ? <div className="empty-state">Загрузка результатов...</div> : null}
        {error ? <div className="banner error">{error}</div> : null}
        {!loading && !error && summaries.length === 0 ? (
          <div className="empty-state">
            <strong>Нет результатов</strong>
            <p>Этот ученик ещё не завершил психологические тесты.</p>
          </div>
        ) : null}

        <div className="student-list list-animate">
          {!selectedTestId ? (
            summaries.map((test) => (
              <button
                key={test.testId}
                type="button"
                className={`student-card ${selectedTestId === test.testId ? "selected" : ""}`}
                onClick={() => setSelectedTestId(test.testId)}
              >
                <div className="student-card-top">
                  <strong>{test.testTitle}</strong>
                  <span className={`zone-pill zone-${test.maxZone.toLowerCase()}`}>{test.maxZone}</span>
                </div>
                <p>Последнее завершение: {test.finishedAt ? formatDateTime(test.finishedAt) : "—"}</p>
                <small>testId: {test.testId}</small>
              </button>
            ))
          ) : (
            <>
              <button
                type="button"
                className={`student-card ${selectedTestId === null ? "selected" : ""}`}
                onClick={() => {
                  setSelectedTestId(null);
                  setAttempts([]);
                  setExpandedAttemptId(null);
                  setAttemptsError(null);
                }}
              >
                ← Назад к тестам
              </button>

              <div className="empty-state" style={{ marginTop: 8 }}>
                <strong>{selectedTestSummary?.testTitle ?? `Тест ${selectedTestId}`}</strong>
                <p>Попытки (сначала последние)</p>
              </div>

              {attemptsError ? <div className="banner error">{attemptsError}</div> : null}
              {attemptsLoading ? <div className="empty-state">Загрузка попыток...</div> : null}

              {!attemptsLoading && !attemptsError && attempts.length === 0 ? (
                <div className="empty-state">
                  <strong>Нет попыток</strong>
                  <p>Для этого теста не найдено завершённых попыток.</p>
                </div>
              ) : null}

              <div className="list-animate">
              {attempts.map((a, idx) => (
                <button
                  key={a.attemptId}
                  type="button"
                  className={`student-card ${expandedAttemptId === a.attemptId ? "selected" : ""}`}
                  onClick={() => setExpandedAttemptId(a.attemptId)}
                >
                  {/**
                   * Attempts are sorted latest-first.
                   * We still show the ordinal as 1..N in chronological order for readability.
                   */}
                  <div className="student-card-top">
                    <strong>
                      Попытка #{attempts.length - idx} из {attempts.length}
                    </strong>
                    <span className={`zone-pill zone-${a.maxZone.toLowerCase()}`}>{a.maxZone}</span>
                  </div>
                  <p>Начало: {formatDateTime(a.startedAt)}</p>
                  <p>Завершение: {a.finishedAt ? formatDateTime(a.finishedAt) : "—"}</p>
                  <small>attemptId: {a.attemptId}</small>
                </button>
              ))}
              </div>
            </>
          )}
        </div>
      </aside>

      <section className="card details-card panel-animate" key={`attempt-${expandedAttemptId ?? 'none'}`}>
        <div className="section-heading">
          <p className="eyebrow">Панель</p>
          <h2>Категории и зоны риска</h2>
        </div>

        {!expandedAttemptId ? (
          <div className="empty-state">
            <strong>{selectedTestId ? "Выберите попытку" : "Выберите тест"}</strong>
            <p>
              {selectedTestId
                ? "Выберите попытку слева, чтобы посмотреть зоны по категориям."
                : "Выберите тест слева, чтобы увидеть все попытки, затем откройте одну попытку для деталей."}
            </p>
          </div>
        ) : null}

        {expandedAttemptId ? (
          <>
            {detailsError ? <div className="banner error">{detailsError}</div> : null}
            {detailsLoading && !detailsByAttemptId[expandedAttemptId] ? (
              <div className="empty-state">Загрузка деталей попытки...</div>
            ) : null}

            {(() => {
              const details = detailsByAttemptId[expandedAttemptId];
              const summary =
                summaries.find((s) => s.attemptId === expandedAttemptId) ??
                (details
                  ? ({
                      attemptId: details.attemptId,
                      testId: details.testId,
                      testTitle: details.testTitle,
                      startedAt: details.startedAt,
                      finishedAt: details.finishedAt,
                      maxZone: details.maxZone,
                      categoryResults: details.categoryResults
                    } satisfies TeacherStudentTestAttemptSummary)
                  : null);
              if (!summary) return null;

              return (
                <div className="details-layout results-animate">
                  <div className="summary-grid">
                    <div className="info-box">
                      <span>Тест</span>
                      <strong>{summary.testTitle}</strong>
                    </div>
                    <div className="info-box">
                      <span>Завершение</span>
                      <strong>{summary.finishedAt ? formatDateTime(summary.finishedAt) : "—"}</strong>
                    </div>
                    <div className={`info-box tone-${summary.maxZone.toLowerCase()}`}>
                      <span>Макс. зона</span>
                      <strong>{summary.maxZone}</strong>
                    </div>
                  </div>

                  <div className="panel-block">
                    <div className="panel-heading">
                      <h3>Результаты по категориям</h3>
                    </div>
                    <div className="category-grid">
                      {summary.categoryResults.map((result) => (
                        <article key={result.categoryId} className="category-card">
                          <div className="student-card-top">
                            <strong>{result.categoryName}</strong>
                            <span className={`zone-pill zone-${result.zone.toLowerCase()}`}>{result.zone}</span>
                          </div>
                          <p>Сумма баллов: {result.totalScore}</p>
                        </article>
                      ))}
                    </div>
                  </div>

                </div>
              );
            })()}
          </>
        ) : null}
      </section>
    </section>
  );
}

