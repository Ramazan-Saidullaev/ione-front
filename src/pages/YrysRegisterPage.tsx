import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { GlobalHeader } from "../components/GlobalHeader";
import { useLang } from "../hooks/useLang";

export function YrysRegisterPage() {
  const { t } = useTranslation();
  const lang = useLang();
  const navigate = useNavigate();

  return (
    <main className="shell">
      <div style={{ gridColumn: "1 / -1" }}>
        <GlobalHeader />
      </div>

      <section className="card" style={{ alignSelf: "stretch", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ border: "4px solid #5b21b6", borderRadius: "16px", overflow: "hidden", maxWidth: "100%" }}>
          <img 
            src="/Gemini_Generated_Image_d5qdamd5qdamd5qd.png" 
            alt="Yrys" 
            style={{ width: "100%", height: "auto", display: "block" }}
          />
        </div>
      </section>

      <section className="card auth-card auth-home-card">
        <div className="stack">
          <div className="section-heading">
            <p className="eyebrow">{t("registerType.registerEyebrow")}</p>
            <h2>{t("registerType.whoAreYou")}</h2>
            <p style={{ color: "#666", marginTop: "8px" }}>{t("registerType.chooseRoleHint")}</p>
          </div>

          <div className="register-type-actions">
            <button
              className="primary-button"
              onClick={() => navigate(`/${lang}/auth/register/teacher`)}
            >
              <div style={{ marginBottom: "8px", fontSize: "24px" }}>👨‍🏫</div>
              {t("registerType.iAmTeacher")}
            </button>

            <button
              className="primary-button"
              onClick={() => navigate(`/${lang}/auth/register/student`)}
            >
              <div style={{ marginBottom: "8px", fontSize: "24px" }}>👨‍🎓</div>
              {t("registerType.iAmStudent")}
            </button>
          </div>

          <p style={{ textAlign: "center", color: "#999", marginTop: "20px", fontSize: "14px" }}>
            {t("registerType.alreadyHaveAccount")}{" "}
            <a href={`/yrys/auth`} style={{ color: "#5b21b6", textDecoration: "none", fontWeight: "500" }}>
              {t("common.login")}
            </a>
          </p>
        </div>
      </section>
    </main>
  );
}
