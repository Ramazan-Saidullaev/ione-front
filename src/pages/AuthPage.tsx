import { useEffect, useState } from "react";
import { api } from "../api";
import { loadSession, saveSession } from "../storage";
import { GlobalHeader } from "../components/GlobalHeader";
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
    <main className="shell route-shell">
      <GlobalHeader />
      <section className="card auth-card auth-home-card">
        <form className="stack" onSubmit={handleLogin}>
          <div className="section-heading">
            <p className="eyebrow">Login</p>
            <h2>Open your dashboard</h2>
          </div>
          <label className="field">
            <span>Email</span>
            <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
          </label>
          <label className="field">
            <span>Password</span>
            <input type="password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
          </label>
          {authError ? <div className="banner error">{authError}</div> : null}
          <button className="primary-button" type="submit" disabled={authBusy}>{authBusy ? "Signing in..." : "Sign in"}</button>
        </form>
      </section>
    </main>
  );
}