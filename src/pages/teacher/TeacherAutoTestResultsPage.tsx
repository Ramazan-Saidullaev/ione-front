import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import type { AuthResponse, TeacherStudentLatestAttempt } from "../../types";
import { formatDateTime, getErrorMessage } from "../../utils/helpers";
import { KpiGrid } from "../../components/dashboard/KpiGrid";
import { MiniBarChart } from "../../components/dashboard/MiniBarChart";
import { QuickActionsCard } from "../../components/dashboard/QuickActionsCard";

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

  const zoneCounts = useMemo(() => {
    const counts = { GREEN: 0, YELLOW: 0, RED: 0, BLACK: 0 };
    for (const row of completed) {
      const zone = row.latestAttempt?.maxZone;
      if (!zone) continue;
      if (zone in counts) counts[zone as keyof typeof counts] += 1;
    }
    return counts;
  }, [completed]);

  const recentFinished = useMemo(() => {
    const copy = [...completed];
    copy.sort((a, b) => {
      const da = a.latestAttempt?.finishedAt ? new Date(a.latestAttempt.finishedAt).getTime() : 0;
      const db = b.latestAttempt?.finishedAt ? new Date(b.latestAttempt.finishedAt).getTime() : 0;
      return db - da;
    });
    return copy.slice(0, 6);
  }, [completed]);

  return (
    <section className="dashboard-grid">
      <aside className="card sidebar-card">
        <div className="section-heading">
          <p className="eyebrow">Авто‑результаты</p>
          <h2>Ученики</h2>
        </div>

        {loading ? <div className="empty-state">Загрузка последних результатов...</div> : null}
        {error ? <div className="banner error">{error}</div> : null}
        {!loading && !error && completed.length === 0 ? (
          <div className="empty-state">
            <strong>Пока нет завершённых тестов</strong>
            <p>Ваши ученики ещё не завершили психологические тесты.</p>
          </div>
        ) : null}

        <div className="student-list list-animate">
          {completed.map((row) => (
            <Link key={row.studentId} className="student-card" to={`/teachers/tests/${row.studentId}/results`}>
              <div className="student-card-top">
                <strong>{row.studentName}</strong>
                <span className={`zone-pill zone-${row.latestAttempt!.maxZone.toLowerCase()}`}>
                  {row.latestAttempt!.maxZone}
                </span>
              </div>
              <p>{row.className || "Класс не указан"}</p>
              <small>
                Последний тест: {row.latestAttempt!.testTitle}
                {row.latestAttempt!.finishedAt ? ` · ${formatDateTime(row.latestAttempt!.finishedAt)}` : ""}
              </small>
            </Link>
          ))}
        </div>
      </aside>

      <section className="card details-card">
        <div className="section-heading">
          <p className="eyebrow">Обзор</p>
          <h2>Панель по психологическим тестам</h2>
        </div>

        <KpiGrid
          items={[
            {
              label: "Ученики",
              value: items.length,
              hint: "в списке"
            },
            {
              label: "Есть результат",
              value: completed.length,
              hint: "завершили хотя бы один тест",
              tone: completed.length > 0 ? "success" : "warning"
            },
            {
              label: "Зона риска",
              value: zoneCounts.BLACK + zoneCounts.RED,
              hint: "BLACK + RED",
              tone: zoneCounts.BLACK + zoneCounts.RED > 0 ? "danger" : "success"
            },
            {
              label: "Ожидают",
              value: Math.max(0, items.length - completed.length),
              hint: "без результатов",
              tone: items.length - completed.length > 0 ? "warning" : "default"
            }
          ]}
        />

        <div className="details-layout">
          <MiniBarChart
            title="Распределение по зонам"
            items={[
              { label: "GREEN", value: zoneCounts.GREEN, color: "#22c55e" },
              { label: "YELLOW", value: zoneCounts.YELLOW, color: "#eab308" },
              { label: "RED", value: zoneCounts.RED, color: "#ef4444" },
              { label: "BLACK", value: zoneCounts.BLACK, color: "#0f172a" }
            ]}
          />

          <section className="card compact-card" aria-label="Последние действия">
            <div className="section-heading" style={{ marginBottom: 12 }}>
              <p className="eyebrow">Активность</p>
              <h2 style={{ fontSize: "1.15rem" }}>Последние завершения</h2>
            </div>

            {recentFinished.length === 0 ? (
              <div className="empty-state">
                <strong>Пока нет завершённых тестов</strong>
                <p>Как только ученик пройдет тест, здесь появится история последних попыток.</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "10px" }}>
                {recentFinished.map((row) => (
                  <div key={row.studentId} className="content-card" style={{ background: "rgba(255,255,255,0.72)" }}>
                    <div className="progress-card-top">
                      <strong>{row.studentName}</strong>
                      <span className={`zone-pill zone-${row.latestAttempt!.maxZone.toLowerCase()}`}>{row.latestAttempt!.maxZone}</span>
                    </div>
                    <p style={{ marginTop: 8 }}>
                      {row.latestAttempt!.testTitle}
                      {row.latestAttempt!.finishedAt ? ` · ${formatDateTime(row.latestAttempt!.finishedAt)}` : ""}
                    </p>
                    <div style={{ marginTop: 10 }}>
                      <Link className="inline-link" to={`/teachers/tests/${row.studentId}/results`}>
                        Открыть результаты
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <QuickActionsCard
            title="Быстрые действия"
            actions={[
              { label: "Открыть панель рисков", href: "/teachers", tone: "ghost" },
              { label: "Прогресс по курсам", href: "/teachers/progress", tone: "ghost" }
            ]}
          />
        </div>
      </section>
    </section>
  );
}

