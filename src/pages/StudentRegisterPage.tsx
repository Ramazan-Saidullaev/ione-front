import { useEffect, useState } from "react";
import { api } from "../api";
import { saveSession } from "../storage";
import { GlobalHeader } from "../components/GlobalHeader";
import { PasswordToggleField } from "../components/PasswordToggleField";
import { getErrorMessage, redirectToRole } from "../utils/helpers";
import type { PublicClassDto, PublicSchoolDto } from "../types";

export function StudentRegisterPage() {
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
      setError("Пожалуйста, выберите школу");
      return;
    }

    if (!className.trim()) {
      setError("Пожалуйста, выберите класс");
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
    <main className="shell route-shell">
      <GlobalHeader />
      <section className="card auth-card auth-home-card">
        <form className="stack" onSubmit={handleRegister}>
          <div className="section-heading">
            <p className="eyebrow">Registration</p>
            <h2>Sign up as a student</h2>
          </div>

          <label className="field">
            <span>Full Name</span>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <PasswordToggleField value={password} onChange={setPassword} required />
          </label>

          <label className="field">
            <span>School</span>
            {loading ? (
              <p style={{ color: "#666", margin: 0 }}>Loading schools...</p>
            ) : (
              <select
                value={schoolId}
                onChange={(e) => handleSchoolChange(e.target.value ? parseInt(e.target.value) : "")}
                required
              >
                <option value="">Select a school</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            )}
          </label>

          <label className="field">
            <span>Class</span>
            {schoolId === "" ? (
              <p style={{ color: "#999", margin: 0 }}>Please select a school first</p>
            ) : loadingClasses ? (
              <p style={{ color: "#666", margin: 0 }}>Loading classes...</p>
            ) : classes.length === 0 ? (
              <p style={{ color: "#999", margin: 0 }}>No classes found for this school</p>
            ) : (
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                required
              >
                <option value="">Select a class</option>
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
            {registering ? "Creating account..." : "Register"}
          </button>
        </form>
      </section>
    </main>
  );
}
