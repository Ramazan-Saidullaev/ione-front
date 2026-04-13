import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import type { AuthResponse, TeacherStudentLatestAttempt } from "../../types";
import { formatDateTime, getErrorMessage } from "../../utils/helpers";

type Props = {
  session: AuthResponse;
};

export function TeacherAutoTestResultsPage({ session }: Props) {
  const [items, setItems] = useState<TeacherStudentLatestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getTeacherStudentsLatestAttempts(session.accessToken)
      .then(setItems)
      .catch((e: unknown) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [session.accessToken]);

  const completed = useMemo(() => items.filter((x) => x.latestAttempt), [items]);

  return (
    <section className="dashboard-grid">
      <aside className="card sidebar-card">
        <div className="section-heading">
          <p className="eyebrow">Auto results</p>
          <h2>Students</h2>
        </div>

        {loading ? <div className="empty-state">Loading latest results...</div> : null}
        {error ? <div className="banner error">{error}</div> : null}
        {!loading && !error && completed.length === 0 ? (
          <div className="empty-state">
            <strong>No completed tests yet</strong>
            <p>Your students haven't finished any psychological tests.</p>
          </div>
        ) : null}

        <div className="student-list">
          {completed.map((row) => (
            <Link key={row.studentId} className="student-card" to={`/teachers/tests/${row.studentId}/results`}>
              <div className="student-card-top">
                <strong>{row.studentName}</strong>
                <span className={`zone-pill zone-${row.latestAttempt!.maxZone.toLowerCase()}`}>
                  {row.latestAttempt!.maxZone}
                </span>
              </div>
              <p>{row.className || "Class is not set"}</p>
              <small>
                Last test: {row.latestAttempt!.testTitle}
                {row.latestAttempt!.finishedAt ? ` · ${formatDateTime(row.latestAttempt!.finishedAt)}` : ""}
              </small>
            </Link>
          ))}
        </div>
      </aside>

      <section className="card details-card">
        <div className="section-heading">
          <p className="eyebrow">How it works</p>
          <h2>Latest finished attempt</h2>
        </div>
        <div className="empty-state">
          <strong>Pick a student</strong>
          <p>
            This page shows the latest completed psychological test per student. Open a student to see the latest results
            per test, grouped by categories and risk zones.
          </p>
        </div>
      </section>
    </section>
  );
}

