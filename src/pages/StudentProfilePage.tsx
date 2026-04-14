import { useState } from "react";
import { Link } from "react-router-dom";
import { GlobalHeader } from "../components/GlobalHeader";
import { InfoBox } from "../components/InfoBox";
import { loadSession } from "../storage";
import type { AuthResponse } from "../types";

export function StudentProfilePage() {
  const [session] = useState<AuthResponse | null>(() => loadSession("student"));

  if (!session) {
    return (
      <main className="shell route-shell">
        <GlobalHeader />
        <section className="hero-panel">
          <p className="eyebrow">Профиль</p>
          <h1>Вам необходимо войти</h1>
          <p className="lead">После входа вы сможете увидеть профиль ученика.</p>
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
          <p className="eyebrow">Профиль ученика</p>
          <h1>{session.fullName || "Ученик"}</h1>
        </div>
        <div className="topbar-actions">
          <Link className="ghost-button" to="/students">
            ← Назад
          </Link>
        </div>
      </section>

      <section style={{ padding: "0 32px 32px" }}>
        <div style={{ display: "grid", gap: "14px", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
          <InfoBox label="Роль" value="Ученик" />
          <InfoBox label="Школа" value={session.schoolName || "—"} />
          <InfoBox label="Ваш класс" value={session.className || "—"} />
          <InfoBox label="Ваш учитель" value={session.teacherFullName || "—"} />
        </div>
      </section>
    </main>
  );
}

