import { useNavigate } from "react-router-dom";
import { GlobalHeader } from "../components/GlobalHeader";

export function RegisterTypePage() {
  const navigate = useNavigate();

  return (
    <main className="shell">
      <div style={{ gridColumn: "1 / -1" }}>
        <GlobalHeader />
      </div>

      <section className="card" style={{ alignSelf: "stretch" }}>
        <div className="section-heading">
          <p className="eyebrow">SanaU</p>
          <h2 style={{ marginTop: 0 }}>Одна платформа — разные роли.</h2>
        </div>
        <p className="lead" style={{ marginTop: 0 }}>
          Выберите роль, чтобы создать аккаунт и получить доступ к нужному кабинету.
        </p>
        <ul className="clean-list" style={{ margin: 0 }}>
          <li>Ученикам — уроки, тесты, прогресс</li>
          <li>Учителям — мониторинг, результаты, аналитика</li>
        </ul>
      </section>

      <section className="card auth-card auth-home-card">
        <div className="stack">
          <div className="section-heading">
            <p className="eyebrow">Регистрация</p>
            <h2>Кто вы?</h2>
            <p style={{ color: "#666", marginTop: "8px" }}>Выберите роль, чтобы создать аккаунт</p>
          </div>

          <div className="register-type-actions">
            <button
              className="primary-button"
              onClick={() => navigate("/auth/register/teacher")}
            >
              <div style={{ marginBottom: "8px", fontSize: "24px" }}>👨‍🏫</div>
              Я учитель
            </button>

            <button
              className="primary-button"
              onClick={() => navigate("/auth/register/student")}
            >
              <div style={{ marginBottom: "8px", fontSize: "24px" }}>👨‍🎓</div>
              Я ученик
            </button>
          </div>

          <p style={{ textAlign: "center", color: "#999", marginTop: "20px", fontSize: "14px" }}>
            Уже есть аккаунт?{" "}
            <a href="/auth" style={{ color: "#5b21b6", textDecoration: "none", fontWeight: "500" }}>
              Войти
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
