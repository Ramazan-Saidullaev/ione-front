import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api";
import type {
  AuthResponse,
  TeacherAttemptDetails,
  TeacherAttemptListItem,
  TeacherStudent,
  TeacherStudentTestAttemptSummary
} from "../../types";
import { formatDateTime, getErrorMessage } from "../../utils/helpers";
import { useLang } from "../../hooks/useLang";

type Props = {
  session: AuthResponse;
};

export function TeacherStudentTestResultsPage({ session }: Props) {
  const { t } = useTranslation();
  const lang = useLang();
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
      setError(t("teacherStudentTests.invalidStudentId"));
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
    return `${t("teacherStudentTests.studentPrefix")} ${studentId}`;
  }, [student?.fullName, studentId]);

  const selectedTestSummary = useMemo(() => {
    if (!selectedTestId) return null;
    return summaries.find((s) => s.testId === selectedTestId) ?? null;
  }, [selectedTestId, summaries]);

  return (
    <section className="dashboard-grid">
      <aside className="card sidebar-card">
        <div className="section-heading">
          <p className="eyebrow">{t("teacherStudentTests.psychTestsEyebrow")}</p>
          <h2>{title}</h2>
        </div>

        <div className="page-nav">
          <Link to={`/${lang}/teachers/tests`}>{t("teacherStudentTests.backToStudents")}</Link>
        </div>

        {loading ? <div className="empty-state">{t("teacherStudentTests.loadingResults")}</div> : null}
        {error ? <div className="banner error">{error}</div> : null}
        {!loading && !error && summaries.length === 0 ? (
          <div className="empty-state">
            <strong>{t("teacherStudentTests.noResults")}</strong>
            <p>{t("teacherStudentTests.noResultsHint")}</p>
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
                <p>{t("teacherStudentTests.lastCompletion")}: {test.finishedAt ? formatDateTime(test.finishedAt) : "—"}</p>
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
                {t("teacherStudentTests.backToTests")}
              </button>

              <div className="empty-state" style={{ marginTop: 8 }}>
                <strong>{selectedTestSummary?.testTitle ?? `${t("teacherStudentTests.testLabel")} ${selectedTestId}`}</strong>
                <p>{t("teacherStudentTests.attemptsLatestFirst")}</p>
              </div>

              {attemptsError ? <div className="banner error">{attemptsError}</div> : null}
              {attemptsLoading ? <div className="empty-state">{t("teacherStudentTests.loadingAttempts")}</div> : null}

              {!attemptsLoading && !attemptsError && attempts.length === 0 ? (
                <div className="empty-state">
                  <strong>{t("teacherStudentTests.noAttempts")}</strong>
                  <p>{t("teacherStudentTests.noAttemptsHint")}</p>
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
                      {t("teacherStudentTests.attemptOf", { current: attempts.length - idx, total: attempts.length })}
                    </strong>
                    <span className={`zone-pill zone-${a.maxZone.toLowerCase()}`}>{a.maxZone}</span>
                  </div>
                  <p>{t("teacherStudentTests.startedAt")}: {formatDateTime(a.startedAt)}</p>
                  <p>{t("teacherStudentTests.finishedAt")}: {a.finishedAt ? formatDateTime(a.finishedAt) : "—"}</p>
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
          <p className="eyebrow">{t("teacherStudentTests.panelEyebrow")}</p>
          <h2>{t("teacherStudentTests.categoriesAndZones")}</h2>
        </div>

        {!expandedAttemptId ? (
          <div className="empty-state">
            <strong>{selectedTestId ? t("teacherStudentTests.selectAttempt") : t("teacherStudentTests.selectTest")}</strong>
            <p>
              {selectedTestId
                ? t("teacherStudentTests.selectAttemptHint")
                : t("teacherStudentTests.selectTestHint")}
            </p>
          </div>
        ) : null}

        {expandedAttemptId ? (
          <>
            {detailsError ? <div className="banner error">{detailsError}</div> : null}
            {detailsLoading && !detailsByAttemptId[expandedAttemptId] ? (
              <div className="empty-state">{t("teacherStudentTests.loadingAttemptDetails")}</div>
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
                      <span>{t("teacherStudentTests.testLabel")}</span>
                      <strong>{summary.testTitle}</strong>
                    </div>
                    <div className="info-box">
                      <span>{t("teacherStudentTests.completion")}</span>
                      <strong>{summary.finishedAt ? formatDateTime(summary.finishedAt) : "—"}</strong>
                    </div>
                    <div className={`info-box tone-${summary.maxZone.toLowerCase()}`}>
                      <span>{t("teacherStudentTests.maxZone")}</span>
                      <strong>{summary.maxZone}</strong>
                    </div>
                  </div>

                  <div className="panel-block">
                    <div className="panel-heading">
                      <h3>{t("teacherStudentTests.categoryResults")}</h3>
                    </div>
                    <div className="category-grid">
                      {summary.categoryResults.map((result) => (
                        <article key={result.categoryId} className="category-card">
                          <div className="student-card-top">
                            <strong>{result.categoryName}</strong>
                            <span className={`zone-pill zone-${result.zone.toLowerCase()}`}>{result.zone}</span>
                          </div>
                          <p>{t("teacherStudentTests.totalScore")}: {result.totalScore}</p>
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

