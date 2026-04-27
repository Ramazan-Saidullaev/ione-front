import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../api";
import { saveSession } from "../../storage";
import { GlobalHeader } from "../../components/GlobalHeader";
import { PasswordToggleField } from "../../components/PasswordToggleField";
import { getErrorMessage, redirectToRole } from "../../utils/helpers";
import type { PublicSchoolDto } from "../../types";

export function TeacherRegisterPage() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [homeroomClass, setHomeroomClass] = useState("");
  const [schoolId, setSchoolId] = useState<number | "">("");
  const [schools, setSchools] = useState<PublicSchoolDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSchools();
  }, []);

  async function fetchSchools() {
    try {
      setLoading(true);
      const data = await api.getSchools();
      setSchools(data);
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (schoolId === "") {
      setError(t("teacherRegister.selectSchoolError"));
      return;
    }
    if (!homeroomClass.trim()) {
      setError(t("teacherRegister.specifyClassError"));
      return;
    }

    setRegistering(true);
    setError(null);

    try {
      const result = await api.registerTeacher({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        homeroomClass: homeroomClass.trim().toUpperCase().replace(/\s+/g, ""),
        schoolId: typeof schoolId === "number" ? schoolId : parseInt(schoolId)
      });
      saveSession("teacher", result);
      redirectToRole("TEACHER");
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setRegistering(false);
    }
  }

  return (
    <main className="shell">
      <div style={{ gridColumn: "1 / -1" }}>
        <GlobalHeader />
      </div>

      <section className="card" style={{ alignSelf: "stretch" }}>
        <div className="section-heading">
          <p className="eyebrow">SanaU</p>
          <h2 style={{ marginTop: 0 }}>{t("teacherRegister.panelTitle")}</h2>
        </div>
        <p className="lead" style={{ marginTop: 0 }}>
          {t("teacherRegister.description")}
        </p>
        <ul className="clean-list" style={{ margin: 0 }}>
          <li>{t("teacherRegister.feature1")}</li>
          <li>{t("teacherRegister.feature2")}</li>
          <li>{t("teacherRegister.feature3")}</li>
        </ul>
        <div className="highlight-box" style={{ marginTop: "18px" }}>
          <strong>{t("teacherRegister.hint")}</strong>
          <p style={{ marginBottom: 0 }}>
            {t("teacherRegister.hintText")}
          </p>
        </div>
      </section>

      <section className="card auth-card auth-home-card">
        <form className="stack" onSubmit={handleRegister}>
          <div className="section-heading">
            <p className="eyebrow">{t("teacherRegister.registerEyebrow")}</p>
            <h2>{t("teacherRegister.registerTitle")}</h2>
          </div>

          <label className="field">
            <span>{t("common.fullName")}</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>{t("common.email")}</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>{t("common.password")}</span>
            <PasswordToggleField value={password} onChange={setPassword} required />
          </label>

          <label className="field">
            <span>{t("teacherRegister.homeroomClass")}</span>
            <input
              type="text"
              value={homeroomClass}
              onChange={(e) => setHomeroomClass(e.target.value)}
              placeholder={t("teacherRegister.homeroomPlaceholder")}
              required
            />
          </label>

          <label className="field">
            <span>{t("common.school")}</span>
            {loading ? (
              <p style={{ color: "#666", margin: 0 }}>{t("teacherRegister.loadingSchools")}</p>
            ) : (
              <select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value ? parseInt(e.target.value) : "")}
                required
              >
                <option value="">{t("teacherRegister.selectSchool")}</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            )}
          </label>

          {error ? <div className="banner error">{error}</div> : null}

          <button className="primary-button" type="submit" disabled={registering || loading}>
            {registering ? t("teacherRegister.creatingAccount") : t("teacherRegister.registerButton")}
          </button>
        </form>
      </section>
    </main>
  );
}
