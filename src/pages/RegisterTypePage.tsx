import { useNavigate } from "react-router-dom";
import { GlobalHeader } from "../components/GlobalHeader";

export function RegisterTypePage() {
  const navigate = useNavigate();

  return (
    <main className="shell route-shell">
      <GlobalHeader />
      <section className="card auth-card auth-home-card">
        <div className="stack">
          <div className="section-heading">
            <p className="eyebrow">Registration</p>
            <h2>Who are you?</h2>
            <p style={{ color: "#666", marginTop: "8px" }}>Choose your role to create an account</p>
          </div>

          <div style={{ display: "flex", gap: "20px", marginTop: "30px" }}>
            <button
              className="primary-button"
              onClick={() => navigate("/auth/register/teacher")}
              style={{ flex: 1 }}
            >
              <div style={{ marginBottom: "8px", fontSize: "24px" }}>👨‍🏫</div>
              I am a Teacher
            </button>

            <button
              className="primary-button"
              onClick={() => navigate("/auth/register/student")}
              style={{ flex: 1 }}
            >
              <div style={{ marginBottom: "8px", fontSize: "24px" }}>👨‍🎓</div>
              I am a Student
            </button>
          </div>

          <p style={{ textAlign: "center", color: "#999", marginTop: "20px", fontSize: "14px" }}>
            Already have an account?{" "}
            <a href="/auth" style={{ color: "#5b21b6", textDecoration: "none", fontWeight: "500" }}>
              Sign in
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
