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
    <main className="shell">
      <div style={{ gridColumn: "1 / -1" }}>
        <GlobalHeader />
      </div>

      <section className="card" style={{ alignSelf: "stretch" }}>
        <div className="section-heading">
          <p className="eyebrow">SanaU</p>
          <h2 style={{ marginTop: 0 }}>Панель учителя и аналитика.</h2>
        </div>
        <p className="lead" style={{ marginTop: 0 }}>
          Регистрация учителя даёт доступ к мониторингу прогресса, результатам тестов и зонам риска по ученикам.
        </p>
        <ul className="clean-list" style={{ margin: 0 }}>
          <li>Список учеников и результаты</li>
          <li>Зоны риска по тестам</li>
          <li>Прогресс по курсам и урокам</li>
        </ul>
        <div className="highlight-box" style={{ marginTop: "18px" }}>
          <strong>Подсказка</strong>
          <p style={{ marginBottom: 0 }}>
            Укажите «классный руководитель» (например 7А), чтобы ученики могли зарегистрироваться в ваш класс.
          </p>
        </div>
      </section>

      <section className="card auth-card auth-home-card">
        <form className="stack" onSubmit={handleRegister}>
          <div className="section-heading">
            <p className="eyebrow">Регистрация</p>
            <h2>Регистрация учителя</h2>
          </div>

          <label className="field">
            <span>ФИО</span>
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
            <span>Пароль</span>
            <PasswordToggleField value={password} onChange={setPassword} required />
          </label>

          <label className="field">
            <span>Класс (классный руководитель), напр. 7А, 8Б</span>
            <input
              type="text"
              value={homeroomClass}
              onChange={(e) => setHomeroomClass(e.target.value)}
              placeholder="Напр: 7А"
              required
            />
          </label>

          <label className="field">
            <span>Школа</span>
            {loading ? (
              <p style={{ color: "#666", margin: 0 }}>Загрузка школ...</p>
            ) : (
              <select
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value ? parseInt(e.target.value) : "")}
                required
              >
                <option value="">Выберите школу</option>
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
            {registering ? "Создание аккаунта..." : "Зарегистрироваться"}
          </button>
        </form>
      </section>
    </main>
  );
}
