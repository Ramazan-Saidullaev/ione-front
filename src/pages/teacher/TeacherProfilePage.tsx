import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api";
import { GlobalHeader } from "../../components/GlobalHeader";
import { InfoBox } from "../../components/InfoBox";
import { loadSession } from "../../storage";
import type { AuthResponse, TeacherStudent } from "../../types";
import { getErrorMessage } from "../../utils/helpers";

export function TeacherProfilePage() {
  const [session] = useState<AuthResponse | null>(() => loadSession("teacher"));
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!session) return;
    setLoading(true);
    setError(null);
    api
      .getTeacherStudents(session.accessToken)
      .then(setStudents)
      .catch((e: unknown) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [session]);

  if (!session) {
    return (
      <main className="shell route-shell">
        <GlobalHeader />
        <section className="hero-panel">
          <p className="eyebrow">Профиль</p>
          <h1>Вам необходимо войти</h1>
          <p className="lead">После входа вы сможете увидеть профиль учителя.</p>
          <a className="route-card compact-route-card" href="/auth">
            <h2>Войти в аккаунт</h2>
            <p>Открыть страницу авторизации.</p>
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
          <p className="eyebrow">Профиль учителя</p>
          <h1>{session.fullName || "Учитель"}</h1>
        </div>
        <div className="topbar-actions">
          <Link className="ghost-button" to="/teachers">
            ← Назад
          </Link>
        </div>
      </section>

      <section style={{ padding: "0 0 24px" }}>
        <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <InfoBox label="Роль" value="Учитель" />
          <InfoBox label="Школа" value={session.schoolName || "—"} />
          <InfoBox label="Классный руководитель" value={session.homeroomClass || "—"} />
          <InfoBox label="Учеников" value={loading ? "…" : String(students.length)} />
        </div>
      </section>

      <section style={{ padding: "0 0 32px" }}>
        <div className="card" style={{ padding: "18px 18px" }}>
          <div className="section-heading" style={{ marginBottom: "12px" }}>
            <p className="eyebrow">Список</p>
            <h2>Ваши ученики</h2>
          </div>

          {error ? <div className="banner error">{error}</div> : null}
          {loading ? <div className="empty-state">Загрузка учеников...</div> : null}
          {!loading && students.length === 0 ? (
            <div className="empty-state">
              <strong>Пока нет учеников</strong>
              <p>Ученики появятся здесь после регистрации в ваш класс.</p>
            </div>
          ) : null}

          {!loading && students.length > 0 ? (
            <div style={{ display: "grid", gap: "10px", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
              {students.map((s) => (
                <div key={s.id} className="hero-note">
                  <span>Ученик</span>
                  <strong>{s.fullName}</strong>
                  <span style={{ marginTop: "6px" }}>Класс: {s.className || "—"}</span>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>
    </main>
  );
}

