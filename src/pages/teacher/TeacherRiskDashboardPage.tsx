import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import type { AuthResponse, RiskStudent, RiskZone, TeacherAttemptDetails, TeacherStudent } from "../../types";
import { getErrorMessage, formatDateTime } from "../../utils/helpers";
import { InfoBox } from "../../components/InfoBox";
import { zoneLabels, zoneOptions } from "../../utils/riskZones";

type Props = {
  session: AuthResponse;
};

export function TeacherRiskDashboardPage({ session }: Props) {
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

  useEffect(() => {
    setLoadingAllStudents(true);
    api.getTeacherStudents(session.accessToken)
      .then(setAllStudents)
      .catch((error) => console.error("Failed to load students", error))
      .finally(() => setLoadingAllStudents(false));
  }, [session.accessToken]);

  useEffect(() => {
    if (!selectedAttemptId) return;
    setDetailsLoading(true);
    setDetailsError(null);
    api.getAttemptDetails(session.accessToken, selectedAttemptId)
      .then(setAttemptDetails)
      .catch((error: unknown) => {
        setAttemptDetails(null);
        setDetailsError(getErrorMessage(error));
      })
      .finally(() => setDetailsLoading(false));
  }, [selectedAttemptId, session.accessToken]);

  async function handleLoadRiskStudents(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
      if (students.length > 0) setSelectedAttemptId(students[0].attemptId);
      else {
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

  const studentsList = useMemo(() => {
    if (!hasSearched) return null;
    if (riskStudents.length === 0) {
      return (
        <div className="empty-state">
          <strong>No results yet</strong>
          <p>No students matched the selected test and risk criteria.</p>
        </div>
      );
    }

    return riskStudents.map((student) => (
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
    ));
  }, [hasSearched, riskStudents, selectedAttemptId]);

  return (
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
            Teacher API still does not expose a test catalog here, so testId is entered manually.
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
          ) : (
            studentsList
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
  );
}

