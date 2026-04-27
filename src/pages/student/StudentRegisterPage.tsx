import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../api";
import { saveSession } from "../../storage";
import { GlobalHeader } from "../../components/GlobalHeader";
import { PasswordToggleField } from "../../components/PasswordToggleField";
import { getErrorMessage, redirectToRole } from "../../utils/helpers";
import type { PublicClassDto, PublicSchoolDto } from "../../types";

export function StudentRegisterPage() {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [className, setClassName] = useState("");
  const [schoolId, setSchoolId] = useState<number | "">("");
  const [schools, setSchools] = useState<PublicSchoolDto[]>([]);
  const [classes, setClasses] = useState<PublicClassDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingClasses, setLoadingClasses] = useState(false);
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

  async function handleSchoolChange(newSchoolId: number | string) {
    setSchoolId(newSchoolId as number | "");
    setClassName("");
    setClasses([]);

    if (newSchoolId === "") {
      return;
    }

    try {
      setLoadingClasses(true);
      const data = await api.getClassesBySchool(newSchoolId as number);
      setClasses(data);
      setError(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingClasses(false);
    }
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (schoolId === "") {
      setError(t("studentRegister.selectSchoolError"));
      return;
    }

    if (!className.trim()) {
      setError(t("studentRegister.selectClassError"));
      return;
    }

    setRegistering(true);
    setError(null);

    try {
      const result = await api.registerStudent({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        schoolId: typeof schoolId === "number" ? schoolId : parseInt(schoolId),
        className: className.trim().toUpperCase().replace(/\s+/g, "")
      });
      saveSession("student", result);
      redirectToRole("STUDENT");
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
          <h2 style={{ marginTop: 0 }}>{t("studentRegister.panelTitle")}</h2>
        </div>
        <p className="lead" style={{ marginTop: 0 }}>
          {t("studentRegister.description")}
        </p>
        <ul className="clean-list" style={{ margin: 0 }}>
          <li>{t("studentRegister.feature1")}</li>
          <li>{t("studentRegister.feature2")}</li>
          <li>{t("studentRegister.feature3")}</li>
        </ul>
        <div className="highlight-box" style={{ marginTop: "18px" }}>
          <strong>{t("studentRegister.important")}</strong>
          <p style={{ marginBottom: 0 }}>
            {t("studentRegister.importantDesc")}
          </p>
        </div>
      </section>

      <section className="card auth-card auth-home-card">
        <form className="stack" onSubmit={handleRegister}>
          <div className="section-heading">
            <p className="eyebrow">{t("common.register")}</p>
            <h2>{t("studentRegister.registerTitle")}</h2>
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
            <span>{t("common.school")}</span>
            {loading ? (
              <p style={{ color: "#666", margin: 0 }}>{t("studentRegister.loadingSchools")}</p>
            ) : (
              <select
                value={schoolId}
                onChange={(e) => handleSchoolChange(e.target.value ? parseInt(e.target.value) : "")}
                required
              >
                <option value="">{t("studentRegister.selectSchool")}</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="field">
            <span>{t("common.class")}</span>
            {schoolId === "" ? (
              <p style={{ color: "#999", margin: 0 }}>{t("studentRegister.firstSelectSchool")}</p>
            ) : loadingClasses ? (
              <p style={{ color: "#666", margin: 0 }}>{t("studentRegister.loadingClasses")}</p>
            ) : classes.length === 0 ? (
              <p style={{ color: "#999", margin: 0 }}>{t("studentRegister.noClassesForSchool")}</p>
            ) : (
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
              >
                <option value="">{t("studentRegister.selectClass")}</option>
                {classes.map((c) => (
                  <option key={c.className} value={c.className}>
                    {c.className}
                  </option>
                ))}
              </select>
            )}
          </label>

          {error ? <div className="banner error">{error}</div> : null}

          <button className="primary-button" type="submit" disabled={registering || loading}>
            {registering ? t("studentRegister.creatingAccount") : t("studentRegister.registerButton")}
          </button>
        </form>
      </section>
    </main>
  );
}
