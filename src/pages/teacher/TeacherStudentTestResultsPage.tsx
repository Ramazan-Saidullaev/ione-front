import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../api";
import type { AuthResponse, TeacherAttemptDetails, TeacherStudent, TeacherStudentTestAttemptSummary } from "../../types";
import { formatDateTime, getErrorMessage } from "../../utils/helpers";

type Props = {
  session: AuthResponse;
};

export function TeacherStudentTestResultsPage({ session }: Props) {
  const params = useParams();
  const studentId = Number(params.studentId);

  const [student, setStudent] = useState<TeacherStudent | null>(null);
  const [summaries, setSummaries] = useState<TeacherStudentTestAttemptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedAttemptId, setExpandedAttemptId] = useState<number | null>(null);
  const [detailsByAttemptId, setDetailsByAttemptId] = useState<Record<number, TeacherAttemptDetails>>({});
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(studentId) || studentId <= 0) {
      setError("Invalid studentId.");
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
      })
      .catch((e: unknown) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [session.accessToken, studentId]);

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
    return `Student ${studentId}`;
  }, [student?.fullName, studentId]);

  return (
    <section className="dashboard-grid">
      <aside className="card sidebar-card">
        <div className="section-heading">
          <p className="eyebrow">Psych tests</p>
          <h2>{title}</h2>
        </div>

        <div className="page-nav">
          <Link to="/teachers/tests">← Back to students</Link>
        </div>

        {loading ? <div className="empty-state">Loading results...</div> : null}
        {error ? <div className="banner error">{error}</div> : null}
        {!loading && !error && summaries.length === 0 ? (
          <div className="empty-state">
            <strong>No results</strong>
            <p>This student hasn't finished any psychological tests yet.</p>
          </div>
        ) : null}

        <div className="student-list">
          {summaries.map((test) => (
            <button
              key={test.attemptId}
              type="button"
              className={`student-card ${expandedAttemptId === test.attemptId ? "selected" : ""}`}
              onClick={() => setExpandedAttemptId((prev) => (prev === test.attemptId ? null : test.attemptId))}
            >
              <div className="student-card-top">
                <strong>{test.testTitle}</strong>
                <span className={`zone-pill zone-${test.maxZone.toLowerCase()}`}>{test.maxZone}</span>
              </div>
              <p>
                Finished: {test.finishedAt ? formatDateTime(test.finishedAt) : "—"}
              </p>
              <small>attemptId: {test.attemptId}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="card details-card">
        <div className="section-heading">
          <p className="eyebrow">Dashboard</p>
          <h2>Categories & risk zones</h2>
        </div>

        {!expandedAttemptId ? (
          <div className="empty-state">
            <strong>Select a test attempt</strong>
            <p>Pick a test on the left to view category-level zones and (optionally) the full answer table.</p>
          </div>
        ) : null}

        {expandedAttemptId ? (
          <>
            {detailsError ? <div className="banner error">{detailsError}</div> : null}
            {detailsLoading && !detailsByAttemptId[expandedAttemptId] ? (
              <div className="empty-state">Loading attempt details...</div>
            ) : null}

            {(() => {
              const summary = summaries.find((s) => s.attemptId === expandedAttemptId);
              if (!summary) return null;

              const details = detailsByAttemptId[expandedAttemptId];

              return (
                <div className="details-layout">
                  <div className="summary-grid">
                    <div className="info-box">
                      <span>Test</span>
                      <strong>{summary.testTitle}</strong>
                    </div>
                    <div className="info-box">
                      <span>Finished</span>
                      <strong>{summary.finishedAt ? formatDateTime(summary.finishedAt) : "—"}</strong>
                    </div>
                    <div className={`info-box tone-${summary.maxZone.toLowerCase()}`}>
                      <span>Max zone</span>
                      <strong>{summary.maxZone}</strong>
                    </div>
                  </div>

                  <div className="panel-block">
                    <div className="panel-heading">
                      <h3>Category results</h3>
                    </div>
                    <div className="category-grid">
                      {summary.categoryResults.map((result) => (
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
                      <span className="mini-pill">
                        {details ? `${details.answers.length} answers` : "Expand to load"}
                      </span>
                    </div>

                    {!details ? (
                      <div className="empty-state">
                        <strong>Answers are loading</strong>
                        <p>We fetch the full table only when you open a specific attempt.</p>
                      </div>
                    ) : (
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
                            {details.answers.map((answer) => (
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
                    )}
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

