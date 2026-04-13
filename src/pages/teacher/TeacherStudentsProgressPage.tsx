import { useEffect, useMemo, useState } from "react";
import { api } from "../../api";
import type { AuthResponse, TeacherStudentCourseProgress } from "../../types";
import { getErrorMessage } from "../../utils/helpers";

type Props = {
  session: AuthResponse;
};

export function TeacherStudentsProgressPage({ session }: Props) {
  const [rows, setRows] = useState<TeacherStudentCourseProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedStudentId, setExpandedStudentId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getTeacherStudentsCourseProgress(session.accessToken)
      .then((data) => {
        setRows(data);
        if (data.length > 0) setExpandedStudentId(data[0].studentId);
      })
      .catch((e: unknown) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [session.accessToken]);

  const selected = useMemo(
    () => rows.find((s) => s.studentId === expandedStudentId) ?? null,
    [expandedStudentId, rows]
  );

  return (
    <section className="dashboard-grid">
      <aside className="card sidebar-card">
        <div className="section-heading">
          <p className="eyebrow">Learning</p>
          <h2>Student progress</h2>
        </div>

        {loading ? <div className="empty-state">Loading progress...</div> : null}
        {error ? <div className="banner error">{error}</div> : null}
        {!loading && !error && rows.length === 0 ? (
          <div className="empty-state">
            <strong>No students</strong>
            <p>You don't have any students registered under your account yet.</p>
          </div>
        ) : null}

        <div className="student-list">
          {rows.map((student) => (
            <button
              key={student.studentId}
              type="button"
              className={`student-card ${expandedStudentId === student.studentId ? "selected" : ""}`}
              onClick={() => setExpandedStudentId(student.studentId)}
            >
              <div className="student-card-top">
                <strong>{student.studentName}</strong>
                <span className="mini-pill">{student.courses.filter((c) => c.completed).length} done</span>
              </div>
              <p>{student.className || "Class is not set"}</p>
              <small>studentId: {student.studentId}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="card details-card">
        <div className="section-heading">
          <p className="eyebrow">Courses</p>
          <h2>Progress dashboard</h2>
        </div>

        {!selected ? (
          <div className="empty-state">
            <strong>Select a student</strong>
            <p>Pick a student on the left to see progress per course.</p>
          </div>
        ) : (
          <div className="details-layout">
            <div className="summary-grid">
              <div className="info-box">
                <span>Student</span>
                <strong>{selected.studentName}</strong>
              </div>
              <div className="info-box">
                <span>Class</span>
                <strong>{selected.className || "Not set"}</strong>
              </div>
              <div className="info-box">
                <span>Completed courses</span>
                <strong>
                  {selected.courses.filter((c) => c.completed).length} / {selected.courses.length}
                </strong>
              </div>
            </div>

            <div className="panel-block">
              <div className="panel-heading">
                <h3>Course breakdown</h3>
              </div>
              <div className="progress-grid">
                {selected.courses.map((course) => {
                  const percent =
                    course.totalLessons === 0 ? 0 : Math.round((course.completedLessons / course.totalLessons) * 100);
                  return (
                    <article key={course.courseId} className="content-card">
                      <div className="progress-card-top">
                        <strong>{course.courseTitle}</strong>
                        <span className="mini-pill">
                          {course.completedLessons}/{course.totalLessons}
                        </span>
                      </div>
                      <div className="progress-bar" aria-label={`Progress ${percent}%`}>
                        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                      </div>
                      <p className="muted-text">{course.completed ? "Completed" : `In progress · ${percent}%`}</p>
                    </article>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </section>
    </section>
  );
}

