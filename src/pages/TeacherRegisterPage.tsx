import { useEffect, useState } from "react";
import { api } from "../api";
import { saveSession } from "../storage";
import { GlobalHeader } from "../components/GlobalHeader";
import { PasswordToggleField } from "../components/PasswordToggleField";
import { getErrorMessage, redirectToRole } from "../utils/helpers";
import type { PublicSchoolDto } from "../types";

export function TeacherRegisterPage() {
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
      setError("Пожалуйста, выберите школу");
      return;
    }
    if (!homeroomClass.trim()) {
      setError("Пожалуйста, укажите класс (классный руководитель), например 7A");
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
    <main className="shell route-shell">
      <GlobalHeader />
      <section className="card auth-card auth-home-card">
        <form className="stack" onSubmit={handleRegister}>
          <div className="section-heading">
            <p className="eyebrow">Registration</p>
            <h2>Sign up as a teacher</h2>
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
            <span>Homeroom class (e.g., 7A, 8B)</span>
            <input
              type="text"
              value={homeroomClass}
              onChange={(e) => setHomeroomClass(e.target.value)}
              placeholder="e.g., 7A"
              required
            />
          </label>

          <label className="field">
            <span>School</span>
            {loading ? (
              <p style={{ color: "#666", margin: 0 }}>Loading schools...</p>
            ) : (
              <select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value ? parseInt(e.target.value) : "")}
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

          {error ? <div className="banner error">{error}</div> : null}

          <button className="primary-button" type="submit" disabled={registering || loading}>
            {registering ? "Creating account..." : "Register"}
          </button>
        </form>
      </section>
    </main>
  );
}
