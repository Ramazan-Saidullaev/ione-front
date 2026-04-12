import { useEffect, useState, type CSSProperties } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { loadSession } from "../storage";
import { GlobalHeader } from "../components/GlobalHeader";
import type { AuthResponse, StudentLessonScenario } from "../types";
import { getErrorMessage } from "../utils/helpers";
import { resolveStudentMediaSrc } from "../utils/mediaUrl";

type Step = "intro" | "test" | "result";

type ScenarioOutcome = {
  selectedOptionText: string | null;
  resultText: string | null;
  resultImageUrl: string | null;
};

const scenarioImageStyle: CSSProperties = {
  display: "block",
  margin: "0 auto 16px",
  maxWidth: "min(100%, 520px)",
  maxHeight: "min(42vh, 380px)",
  width: "auto",
  height: "auto",
  objectFit: "contain",
  borderRadius: "12px",
  border: "1px solid #e5e7eb"
};

function optionButtonStyle(selected: boolean): CSSProperties {
  return {
    padding: "14px 16px",
    borderRadius: "12px",
    border: selected ? "2px solid #2563eb" : "1px solid #d1d5db",
    background: selected ? "#eff6ff" : "#fff",
    color: "#111827",
    fontWeight: 600,
    textAlign: "left" as const,
    cursor: "pointer",
    minHeight: "52px",
    transition: "border-color 0.15s, background 0.15s"
  };
}

function optionsGridStyle(total: number): CSSProperties {
  if (total <= 1) {
    return { display: "grid", gap: "12px", gridTemplateColumns: "1fr", maxWidth: "560px" };
  }
  return {
    display: "grid",
    gap: "12px",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    maxWidth: "640px"
  };
}

export function SituationTestPage() {
  const { courseId: courseIdParam, lessonId: lessonIdParam } = useParams();
  const courseId = Number(courseIdParam);
  const lessonId = Number(lessonIdParam);

  const [session] = useState<AuthResponse | null>(() => loadSession("student"));
  const [lessonTitle, setLessonTitle] = useState("");
  const [scenario, setScenario] = useState<StudentLessonScenario | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("intro");
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<ScenarioOutcome | null>(null);

  const paramsInvalid = !Number.isFinite(courseId) || !Number.isFinite(lessonId) || courseId <= 0 || lessonId <= 0;

  const backHref = "/students";

  useEffect(() => {
    if (paramsInvalid) {
      setLoadError("Некорректная ссылка на тест.");
      setLoading(false);
      return;
    }
    if (!session) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    Promise.all([api.getLesson(lessonId), api.getLessonScenario(session.accessToken, courseId, lessonId)])
      .then(([lesson, scen]) => {
        if (cancelled) return;
        setLessonTitle(lesson.title);
        setScenario(scen);
        if (scen.completed) {
          setOutcome({
            selectedOptionText: scen.selectedOptionText,
            resultText: scen.resultText,
            resultImageUrl: scen.resultImageUrl
          });
          setStep("result");
        } else if (scen.available) {
          setStep("intro");
        } else {
          setStep("intro");
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) setLoadError(getErrorMessage(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session, courseId, lessonId, paramsInvalid]);

  async function handleConfirmSubmit() {
    if (!session || !scenario?.scenarioId || selectedOptionId == null) return;
    setSubmitError(null);
    if (
      !window.confirm(
        "Вы уверены, что хотите подтвердить выбранный ответ? После отправки изменить выбор будет нельзя."
      )
    ) {
      return;
    }
    setSubmitBusy(true);
    try {
      const res = await api.answerScenario(session.accessToken, scenario.scenarioId, selectedOptionId);
      setOutcome({
        selectedOptionText: res.selectedOptionText,
        resultText: res.resultText,
        resultImageUrl: res.resultImageUrl
      });
      setStep("result");
    } catch (e: unknown) {
      setSubmitError(getErrorMessage(e));
    } finally {
      setSubmitBusy(false);
    }
  }

  if (paramsInvalid) {
    return (
      <main className="dashboard-shell">
        <GlobalHeader />
        <section className="card" style={{ margin: "24px 32px", padding: "24px" }}>
          <p>{loadError || "Некорректная ссылка."}</p>
          <Link to={backHref}>Вернуться в кабинет</Link>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="dashboard-shell">
        <GlobalHeader />
        <section className="card" style={{ margin: "24px 32px", padding: "24px", maxWidth: "520px" }}>
          <h1 style={{ marginTop: 0 }}>Ситуационный тест</h1>
          <p>Чтобы пройти тест, войдите как ученик. Прямая ссылка для других пользователей не даёт доступа к вашему прогрессу.</p>
          <Link className="primary-link-button" to="/auth" style={{ display: "inline-block", marginTop: "12px" }}>
            Войти
          </Link>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="shell loading-shell">
        <GlobalHeader />
        <p style={{ padding: "24px 32px" }}>Загрузка ситуационного теста…</p>
      </main>
    );
  }

  if (loadError || !scenario) {
    return (
      <main className="dashboard-shell">
        <GlobalHeader />
        <section className="card" style={{ margin: "24px 32px", padding: "24px" }}>
          <p className="banner error" style={{ marginBottom: "16px" }}>
            {loadError || "Не удалось загрузить тест."}
          </p>
          <Link to={backHref}>Вернуться в кабинет</Link>
        </section>
      </main>
    );
  }

  if (!scenario.hasScenario) {
    return (
      <main className="dashboard-shell">
        <GlobalHeader />
        <section className="card" style={{ margin: "24px 32px", padding: "24px" }}>
          <h1 style={{ marginTop: 0 }}>Ситуационный тест</h1>
          <p>Для этого урока ситуационный тест не настроен.</p>
          <Link to={backHref}>Вернуться в кабинет</Link>
        </section>
      </main>
    );
  }

  const showUnavailable = !scenario.available && !scenario.completed;
  const displayOutcome: ScenarioOutcome | null =
    outcome ??
    (scenario.completed
      ? {
          selectedOptionText: scenario.selectedOptionText,
          resultText: scenario.resultText,
          resultImageUrl: scenario.resultImageUrl
        }
      : null);

  return (
    <main className="dashboard-shell">
      <GlobalHeader />
      <section style={{ padding: "24px 32px", maxWidth: "720px" }}>
        <p className="eyebrow">Ситуационный тест</p>
        <h1 style={{ marginTop: "4px", color: "#1e3a8a" }}>{scenario.title || "Сценарий"}</h1>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>
          Урок: <strong>{lessonTitle}</strong>
        </p>

        {showUnavailable ? (
          <div className="content-card" style={{ padding: "20px", marginBottom: "20px" }}>
            <p style={{ margin: 0, color: "#334155", lineHeight: 1.6 }}>
              {scenario.message || "Ситуационный тест сейчас недоступен."}
            </p>
          </div>
        ) : null}

        {step === "intro" && scenario.available && !scenario.completed ? (
          <div className="content-card" style={{ padding: "24px", marginBottom: "20px", lineHeight: 1.65 }}>
            <p style={{ marginTop: 0, color: "#334155" }}>
              Вы завершили урок «{lessonTitle}». Вам доступен ситуационный тест: короткая ситуация и выбор действия. Его можно
              пройти <strong>один раз</strong>; после отправки ответа повторно пройти тот же тест будет нельзя.
            </p>
            <button type="button" className="primary-button" onClick={() => setStep("test")} style={{ marginTop: "16px" }}>
              Перейти к ситуации
            </button>
          </div>
        ) : null}

        {step === "test" && scenario.available && !scenario.completed ? (
          <div className="content-card" style={{ padding: "24px", marginBottom: "20px" }}>
            {scenario.baseImageUrl ? (
              <img
                src={resolveStudentMediaSrc(api.baseUrl, scenario.baseImageUrl)}
                alt="Иллюстрация к ситуации"
                style={scenarioImageStyle}
              />
            ) : null}
            {scenario.description ? (
              <p style={{ whiteSpace: "pre-wrap", color: "#374151", marginBottom: "20px" }}>{scenario.description}</p>
            ) : null}
            <p style={{ fontWeight: 600, color: "#111827", marginBottom: "12px" }}>Выберите действие:</p>
            <div style={optionsGridStyle(scenario.options.length)}>
              {scenario.options.map((option, idx) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedOptionId(option.id === selectedOptionId ? null : option.id)}
                  style={{
                    ...optionButtonStyle(selectedOptionId === option.id),
                    ...(scenario.options.length === 3 && idx === 2 ? { gridColumn: "1 / -1" } : {})
                  }}
                >
                  {option.optionText}
                </button>
              ))}
            </div>
            {submitError ? (
              <p className="banner error" style={{ marginTop: "16px" }}>
                {submitError}
              </p>
            ) : null}
            <button
              type="button"
              className="primary-button"
              disabled={selectedOptionId == null || submitBusy}
              onClick={handleConfirmSubmit}
              style={{ marginTop: "20px", width: "100%", maxWidth: "320px" }}
            >
              {submitBusy ? "Отправка…" : "Подтвердить выбор и посмотреть ответ"}
            </button>
          </div>
        ) : null}

        {step === "result" && displayOutcome ? (
          <div
            className="content-card"
            style={{
              padding: "24px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px"
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: "1.25rem", color: "#0f172a" }}>Итог</h2>
            {scenario.baseImageUrl ? (
              <img
                src={resolveStudentMediaSrc(api.baseUrl, scenario.baseImageUrl)}
                alt=""
                style={scenarioImageStyle}
              />
            ) : null}
            {scenario.description ? (
              <p style={{ color: "#475569", marginBottom: "12px" }}>
                <strong>Ситуация:</strong> {scenario.description}
              </p>
            ) : null}
            <p style={{ color: "#475569", marginBottom: "12px" }}>
              <strong>Ваш выбор:</strong> {displayOutcome.selectedOptionText || "—"}
            </p>
            <p style={{ color: "#1e293b", whiteSpace: "pre-wrap", marginBottom: "12px" }}>
              <strong>Комментарий к ответу:</strong> {displayOutcome.resultText || "Ответ сохранён."}
            </p>
            {displayOutcome.resultImageUrl ? (
              <img
                src={resolveStudentMediaSrc(api.baseUrl, displayOutcome.resultImageUrl)}
                alt="Иллюстрация к результату"
                style={scenarioImageStyle}
              />
            ) : null}
          </div>
        ) : null}

        <div style={{ marginTop: "28px" }}>
          <Link to={backHref} className="ghost-button" style={{ display: "inline-block", padding: "10px 20px" }}>
            ← Вернуться к урокам
          </Link>
        </div>
      </section>
    </main>
  );
}
