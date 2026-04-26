import { useEffect, useState } from "react";
import { api } from "../api";
import { loadSession, saveSession } from "../storage";
import { GlobalHeader } from "../components/GlobalHeader";
import { PasswordToggleField } from "../components/PasswordToggleField";
import { getErrorMessage, redirectToRole } from "../utils/helpers";

export function AuthPage() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const teacher = loadSession("teacher");
    const student = loadSession("student");
    const admin = loadSession("admin");
    if (admin?.role === "ADMIN") redirectToRole("ADMIN");
    else if (teacher?.role === "TEACHER") redirectToRole("TEACHER");
    else if (student?.role === "STUDENT") redirectToRole("STUDENT");
  }, []);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAuthBusy(true); setAuthError(null);
    try {
      const result = await api.login({ email: loginEmail.trim(), password: loginPassword });
      saveSession(result.role === "ADMIN" ? "admin" : result.role === "TEACHER" ? "teacher" : "student", result);
      redirectToRole(result.role);
    } catch (error: unknown) { setAuthError(getErrorMessage(error)); } finally { setAuthBusy(false); }
  }

  return (
    <main className="shell">
      <div style={{ gridColumn: "1 / -1" }}>
        <GlobalHeader />
      </div>

      <section className="card" style={{ alignSelf: "stretch" }}>
        <div className="section-heading">
          <p className="eyebrow">Добро пожаловать в SanaU</p>
          <h2 style={{ marginTop: 0 }}>Практическое обучение для реальной жизни.</h2>
        </div>
        <p className="lead" style={{ marginTop: 0 }}>
          Уроки по 2–3 минуты, квизы и ситуационные задания для учеников (6–16) — с отслеживанием прогресса для учителей.
        </p>
        <ul className="clean-list" style={{ margin: 0 }}>
          <li>Микрообучение, удобное на телефоне</li>
          <li>Финансовая грамотность и практическое мышление</li>
          <li>Панель учителя и аналитика</li>
        </ul>
        <div className="highlight-box" style={{ marginTop: "18px" }}>
          <strong>Начните за пару минут</strong>
          <p style={{ marginBottom: 0 }}>Войдите, чтобы открыть личный кабинет и продолжить обучение.</p>
        </div>
      </section>

      <section className="card auth-card auth-home-card">
        <form className="stack" onSubmit={handleLogin}>
          <div className="section-heading">
            <p className="eyebrow">Вход</p>
            <h2>Откройте личный кабинет</h2>
          </div>
          <label className="field">
            <span>Email</span>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
          </label>
          <label className="field">
            <span>Пароль</span>
            <PasswordToggleField value={loginPassword} onChange={setLoginPassword} required />
          </label>
          {authError ? <div className="banner error">{authError}</div> : null}
          <button className="primary-button" type="submit" disabled={authBusy}>{authBusy ? "Выполняется вход..." : "Войти"}</button>
        </form>
      </section>

    </main>
  );
}