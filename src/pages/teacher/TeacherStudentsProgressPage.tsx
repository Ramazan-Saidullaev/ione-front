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
  const [expandedCourseId, setExpandedCourseId] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getTeacherStudentsCourseProgress(session.accessToken)
      .then((data) => {
        setRows(data);
        if (data.length > 0) {
          setExpandedStudentId(data[0].studentId);
          setExpandedCourseId(data[0].courses[0]?.courseId ?? null);
        }
      })
      .catch((e: unknown) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [session.accessToken]);

  const selected = useMemo(
    () => rows.find((s) => s.studentId === expandedStudentId) ?? null,
    [expandedStudentId, rows]
  );
  const selectedCourse = useMemo(
    () => selected?.courses.find((c) => c.courseId === expandedCourseId) ?? null,
    [selected, expandedCourseId]
  );

  return (
    <section className="dashboard-grid">
      <aside className="card sidebar-card">
        <div className="section-heading">
          <p className="eyebrow">Обучение</p>
          <h2>Прогресс учеников</h2>
        </div>

        {loading ? <div className="empty-state">Загрузка прогресса...</div> : null}
        {error ? <div className="banner error">{error}</div> : null}
        {!loading && !error && rows.length === 0 ? (
          <div className="empty-state">
            <strong>Нет учеников</strong>
            <p>Пока что за вашим аккаунтом не закреплено ни одного ученика.</p>
          </div>
        ) : null}

        <div className="student-list list-animate">
          {rows.map((student) => (
            <button
              key={student.studentId}
              type="button"
              className={`student-card ${expandedStudentId === student.studentId ? "selected" : ""}`}
              onClick={() => {
                setExpandedStudentId(student.studentId);
                setExpandedCourseId(student.courses[0]?.courseId ?? null);
              }}
            >
              <div className="student-card-top">
                <strong>{student.studentName}</strong>
                <span className="mini-pill">{student.courses.filter((c) => c.completed).length} завершено</span>
              </div>
              <p>{student.className || "Класс не указан"}</p>
              <small>studentId: {student.studentId}</small>
            </button>
          ))}
        </div>
      </aside>

      <section className="card details-card panel-animate" key={`student-${expandedStudentId ?? 'none'}`}>
        <div className="section-heading">
          <p className="eyebrow">Курсы</p>
          <h2>Панель прогресса</h2>
        </div>

        {!selected ? (
          <div className="empty-state">
            <strong>Выберите ученика</strong>
            <p>Выберите ученика слева, чтобы увидеть прогресс по курсам.</p>
          </div>
        ) : (
          <div className="details-layout results-animate">
            <div className="summary-grid">
              <div className="info-box">
                <span>Ученик</span>
                <strong>{selected.studentName}</strong>
              </div>
              <div className="info-box">
                <span>Класс</span>
                <strong>{selected.className || "Не указан"}</strong>
              </div>
              <div className="info-box">
                <span>Завершено курсов</span>
                <strong>
                  {selected.courses.filter((c) => c.completed).length} / {selected.courses.length}
                </strong>
              </div>
              <div className="info-box">
                <span>Ситуационные тесты</span>
                <strong>
                  {selected.courses.reduce((sum, c) => sum + c.completedScenarios, 0)} / {selected.courses.reduce((sum, c) => sum + c.totalScenarios, 0)}
                </strong>
              </div>
            </div>

            <div className="panel-block">
              <div className="panel-heading">
                <h3>Разбивка по курсам</h3>
              </div>
              <div className="progress-grid">
                {selected.courses.map((course) => {
                  const percent =
                    course.totalLessons === 0 ? 0 : Math.round((course.completedLessons / course.totalLessons) * 100);
                  const scenarioPercent =
                    course.totalScenarios === 0 ? 0 : Math.round((course.completedScenarios / course.totalScenarios) * 100);
                  return (
                    <article
                      key={course.courseId}
                      className={`content-card ${expandedCourseId === course.courseId ? "selected" : ""}`}
                      style={{
                        cursor: "pointer"
                      }}
                      onClick={() => setExpandedCourseId(course.courseId)}
                    >
                      <div className="progress-card-top">
                        <strong>{course.courseTitle}</strong>
                        <span className="mini-pill">
                          {course.completedLessons}/{course.totalLessons}
                        </span>
                      </div>
                      <div className="progress-bar" aria-label={`Прогресс ${percent}%`}>
                        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
                      </div>
                      <p className="muted-text">{course.completed ? "Завершён" : `В процессе · ${percent}%`}</p>
                      <div style={{ marginTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <small style={{ color: "#64748b", fontWeight: 600 }}>Ситуационные тесты</small>
                        <span className="mini-pill">{course.completedScenarios}/{course.totalScenarios}</span>
                      </div>
                      <div className="progress-bar" aria-label={`Прогресс сценариев ${scenarioPercent}%`}>
                        <div className="progress-bar-fill" style={{ width: `${scenarioPercent}%`, background: "#8b5cf6" }} />
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            <div className="panel-block">
              <div className="panel-heading">
                <h3>Детали по ситуационным тестам</h3>
              </div>
              {!selectedCourse ? (
                <p className="muted-text">Выберите карточку курса выше, чтобы посмотреть результаты по сценариям.</p>
              ) : selectedCourse.totalScenarios === 0 ? (
                <p className="muted-text">Для этого курса ситуационные тесты пока не настроены.</p>
              ) : (
                <div style={{ display: "grid", gap: "12px" }}>
                  {selectedCourse.lessonScenarioProgress.map((lesson) => (
                    <article key={lesson.lessonId} className="content-card">
                      <div className="progress-card-top" style={{ marginBottom: "8px" }}>
                        <strong>{lesson.lessonTitle}</strong>
                        <span className="mini-pill">{lesson.completedScenarios}/{lesson.totalScenarios}</span>
                      </div>
                      {lesson.totalScenarios === 0 ? (
                        <p className="muted-text">В этом уроке нет ситуационных тестов.</p>
                      ) : (
                        <div style={{ display: "grid", gap: "8px" }}>
                          {lesson.scenarios.map((sc) => (
                            <div key={sc.scenarioId} style={{ border: "1px solid #e5e7eb", borderRadius: "10px", padding: "10px 12px", background: "#fff" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                                <strong>{sc.title}</strong>
                                <span
                                  className="mini-pill"
                                  style={{
                                    background: sc.completed ? "#dcfce7" : "#f3f4f6",
                                    color: sc.completed ? "#166534" : "#4b5563"
                                  }}
                                >
                                  {sc.completed ? "Пройден" : "Не пройден"}
                                </span>
                              </div>
                              {sc.completed ? (
                                <div style={{ marginTop: "8px", color: "#374151" }}>
                                  <div>
                                    <strong>Выбран ответ:</strong> {sc.selectedOptionText || "—"}
                                    {typeof sc.selectedOptionScore === "number" ? (
                                      <span style={{ marginLeft: "8px", fontWeight: 700, color: "#166534" }}>
                                        (+{sc.selectedOptionScore})
                                      </span>
                                    ) : null}
                                  </div>
                                  {sc.resultText ? <div style={{ marginTop: "4px" }}><strong>Результат:</strong> {sc.resultText}</div> : null}
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </section>
  );
}

