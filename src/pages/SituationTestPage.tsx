import { useEffect, useState, type CSSProperties } from "react";
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { loadSession } from "../storage";
import { GlobalHeader } from "../components/GlobalHeader";
import { useLang } from "../hooks/useLang";
import type { AuthResponse, StudentLessonScenario, StudentLessonScenarios } from "../types";
import { getErrorMessage } from "../utils/helpers";
import { resolveStudentMediaSrc } from "../utils/mediaUrl";

type Step = "list" | "intro" | "test" | "result";

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
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    maxWidth: "640px"
  };
}

export function SituationTestPage() {
  const { t } = useTranslation();
  const lang = useLang();
  const { courseId: courseIdParam, lessonId: lessonIdParam } = useParams();
  const courseId = Number(courseIdParam);
  const lessonId = Number(lessonIdParam);

  const [session] = useState<AuthResponse | null>(() => loadSession("student"));
  const [lessonTitle, setLessonTitle] = useState("");
  const [scenariosBundle, setScenariosBundle] = useState<StudentLessonScenarios | null>(null);
  const [activeScenarioId, setActiveScenarioId] = useState<number | null>(null);
  const [scenario, setScenario] = useState<StudentLessonScenario | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("list");
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [outcome, setOutcome] = useState<ScenarioOutcome | null>(null);

  const paramsInvalid = !Number.isFinite(courseId) || !Number.isFinite(lessonId) || courseId <= 0 || lessonId <= 0;

  const backHref = `/${lang}/students`;

  useEffect(() => {
    if (paramsInvalid) {
      setLoadError(t("situationTest.invalidLink"));
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

    Promise.all([api.getLesson(lessonId), api.getLessonScenarios(session.accessToken, courseId, lessonId)])
      .then(([lesson, bundle]) => {
        if (cancelled) return;
        setLessonTitle(lesson.title);
        setScenariosBundle(bundle);

        const list = bundle.scenarios || [];
        if (!bundle.hasScenarios || list.length === 0) {
          setActiveScenarioId(null);
          setScenario(null);
          setStep("list");
          return;
        }

        const preferred = list.find((s) => s.available) ?? list[0];
        setActiveScenarioId(preferred.scenarioId ?? null);
        setScenario(preferred);
        setOutcome(null);
        setSelectedOptionId(null);
        setSubmitError(null);
        setStep("list");
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
        t("situationTest.confirmSubmit")
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
      setScenariosBundle((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          scenarios: (prev.scenarios || []).map((s) =>
            s.scenarioId === scenario.scenarioId
              ? {
                  ...s,
                  available: false,
                  completed: true,
                  selectedOptionText: res.selectedOptionText,
                  resultText: res.resultText,
                  resultImageUrl: res.resultImageUrl
                }
              : s
          )
        };
      });
      setScenario((prev) =>
        prev && prev.scenarioId === scenario.scenarioId
          ? {
              ...prev,
              available: false,
              completed: true,
              selectedOptionText: res.selectedOptionText,
              resultText: res.resultText,
              resultImageUrl: res.resultImageUrl
            }
          : prev
      );
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
        <section className="card" style={{ padding: "24px" }}>
          <p>{loadError || t("situationTest.invalidLinkShort")}</p>
          <Link to={backHref}>{t("situationTest.backToCabinet")}</Link>
        </section>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="dashboard-shell">
        <GlobalHeader />
        <section className="card" style={{ padding: "24px", maxWidth: "520px" }}>
          <h1 style={{ marginTop: 0 }}>{t("situationTest.eyebrow")}</h1>
          <p>{t("situationTest.loginRequired")}</p>
          <Link className="primary-link-button" to={`/${lang}/auth`} style={{ display: "inline-block", marginTop: "12px" }}>
            {t("common.login")}
          </Link>
        </section>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="shell loading-shell">
        <GlobalHeader />
        <p style={{ padding: "24px" }}>{t("situationTest.loadingTest")}</p>
      </main>
    );
  }

  if (loadError || !scenariosBundle) {
    return (
      <main className="dashboard-shell">
        <GlobalHeader />
        <section className="card" style={{ padding: "24px" }}>
          <p className="banner error" style={{ marginBottom: "16px" }}>
            {loadError || t("situationTest.failedLoad")}
          </p>
          <Link to={backHref}>{t("situationTest.backToCabinet")}</Link>
        </section>
      </main>
    );
  }

  if (!scenariosBundle.hasScenarios) {
    return (
      <main className="dashboard-shell">
        <GlobalHeader />
        <section className="card" style={{ padding: "24px" }}>
          <h1 style={{ marginTop: 0 }}>{t("situationTest.eyebrow")}</h1>
          <p>{t("situationTest.noScenariosConfigured")}</p>
          <Link to={backHref}>{t("situationTest.backToCabinet")}</Link>
        </section>
      </main>
    );
  }

  const showUnavailable = !!scenario && !scenario.available && !scenario.completed;
  const displayOutcome: ScenarioOutcome | null =
    outcome ??
    (scenario && scenario.completed
      ? {
          selectedOptionText: scenario.selectedOptionText,
          resultText: scenario.resultText,
          resultImageUrl: scenario.resultImageUrl
        }
      : null);

  const list = scenariosBundle.scenarios || [];
  const currentScenarioIndex =
    scenario?.scenarioId != null ? list.findIndex((s) => s.scenarioId === scenario.scenarioId) : -1;
  const nextScenario =
    currentScenarioIndex >= 0 && currentScenarioIndex < list.length - 1 ? list[currentScenarioIndex + 1] : null;

  function goToScenario(target: StudentLessonScenario) {
    setActiveScenarioId(target.scenarioId ?? null);
    setScenario(target);
    setSelectedOptionId(null);
    setSubmitError(null);
    setOutcome(null);
    if (target.completed) setStep("result");
    else if (target.available) setStep("intro");
    else setStep("intro");
  }

  return (
    <main className="dashboard-shell">
      <GlobalHeader />
      <section style={{ padding: "24px 32px", maxWidth: "720px" }}>
        <p className="eyebrow">{t("situationTest.eyebrow")}</p>
        <h1 style={{ marginTop: "4px", color: "#1e3a8a" }}>{scenario?.title || t("situationTest.scenariosOfLesson")}</h1>
        <p style={{ color: "#64748b", marginBottom: "24px" }}>
          {t("situationTest.lesson")}: <strong>{lessonTitle}</strong>
        </p>

        {step === "list" ? (
          <div className="content-card animate-fade-in" key="step-list" style={{ padding: "20px", marginBottom: "20px" }}>
            <p style={{ marginTop: 0, color: "#334155", lineHeight: 1.6 }}>
              <span dangerouslySetInnerHTML={{ __html: t("situationTest.selectOneTest") }} />
            </p>
            <div className="list-animate" style={{ display: "grid", gap: "12px", marginTop: "16px" }}>
              {list.map((s) => {
                const isActive = (s.scenarioId ?? null) === activeScenarioId;
                const statusLabel = s.completed ? t("situationTest.passed") : s.available ? t("situationTest.available") : t("situationTest.unavailable");
                const statusBg = s.completed ? "#dcfce7" : s.available ? "#e0e7ff" : "#f3f4f6";
                const statusColor = s.completed ? "#166534" : s.available ? "#1d4ed8" : "#374151";
                return (
                  <div
                    key={String(s.scenarioId ?? s.title ?? "scenario")}
                    style={{
                      border: isActive ? "2px solid #2563eb" : "1px solid #e5e7eb",
                      borderRadius: "12px",
                      padding: "14px 16px",
                      background: "#fff"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 800, color: "#0f172a" }}>{s.title || t("situationTest.scenario")}</div>
                        {s.description ? (
                          <div style={{ color: "#475569", marginTop: "6px", whiteSpace: "pre-wrap" }}>
                            {s.description.length > 180 ? `${s.description.slice(0, 180)}…` : s.description}
                          </div>
                        ) : null}
                        {s.message && !s.available && !s.completed ? (
                          <div style={{ marginTop: "8px", color: "#64748b" }}>{s.message}</div>
                        ) : null}
                      </div>
                      <span
                        style={{
                          background: statusBg,
                          color: statusColor,
                          padding: "4px 10px",
                          borderRadius: "9999px",
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {statusLabel}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setActiveScenarioId(s.scenarioId ?? null);
                          setScenario(s);
                          setSelectedOptionId(null);
                          setSubmitError(null);
                          setOutcome(null);
                          if (s.completed) setStep("result");
                          else if (s.available) setStep("intro");
                          else setStep("intro");
                        }}
                        className="primary-button"
                        style={{ padding: "10px 16px" }}
                        disabled={!s.scenarioId}
                      >
                        {s.completed ? t("situationTest.openResult") : s.available ? t("situationTest.start") : t("common.open")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        {showUnavailable ? (
          <div className="content-card animate-fade-in" key="step-unavailable" style={{ padding: "20px", marginBottom: "20px" }}>
            <p style={{ margin: 0, color: "#334155", lineHeight: 1.6 }}>
              {scenario?.message || t("situationTest.testUnavailable")}
            </p>
          </div>
        ) : null}

        {step === "intro" && scenario?.available && !scenario.completed ? (
          <div className="content-card animate-fade-in" key="step-intro" style={{ padding: "24px", marginBottom: "20px", lineHeight: 1.65 }}>
            <p style={{ marginTop: 0, color: "#334155" }}>
              <span dangerouslySetInnerHTML={{ __html: t("situationTest.introText", { lesson: lessonTitle }) }} />
            </p>
            <button type="button" className="primary-button" onClick={() => setStep("test")} style={{ marginTop: "16px" }}>
              {t("situationTest.goToSituation")}
            </button>
            <button type="button" className="ghost-button" onClick={() => setStep("list")} style={{ marginTop: "12px" }}>
              {t("situationTest.backToList")}
            </button>
          </div>
        ) : null}

        {step === "test" && scenario?.available && !scenario.completed ? (
          <div className="content-card animate-fade-in" key={`step-test-${scenario?.scenarioId}`} style={{ padding: "24px", marginBottom: "20px" }}>
            {scenario.baseImageUrl ? (
              <img
                src={resolveStudentMediaSrc(api.baseUrl, scenario.baseImageUrl)}
                alt={t("situationTest.illustrationAlt")}
                style={scenarioImageStyle}
              />
            ) : null}
            {scenario.description ? (
              <p style={{ whiteSpace: "pre-wrap", color: "#374151", marginBottom: "20px" }}>{scenario.description}</p>
            ) : null}
            <p style={{ fontWeight: 600, color: "#111827", marginBottom: "12px" }}>{t("situationTest.chooseAction")}</p>
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
              {submitBusy ? t("situationTest.submitting") : t("situationTest.confirmChoice")}
            </button>
            <button type="button" className="ghost-button" onClick={() => setStep("list")} style={{ marginTop: "12px" }}>
              {t("situationTest.backToList")}
            </button>
          </div>
        ) : null}

        {step === "result" && displayOutcome ? (
          <div
            className="content-card animate-fade-in"
            key={`step-result-${scenario?.scenarioId}`}
            style={{
              padding: "24px",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px"
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: "1.25rem", color: "#0f172a" }}>{t("situationTest.resultTitle")}</h2>
            {scenario?.baseImageUrl ? (
              <img
                src={resolveStudentMediaSrc(api.baseUrl, scenario.baseImageUrl)}
                alt=""
                style={scenarioImageStyle}
              />
            ) : null}
            {scenario?.description ? (
              <p style={{ color: "#475569", marginBottom: "12px" }}>
                <strong>{t("situationTest.situationLabel")}</strong> {scenario.description}
              </p>
            ) : null}
            <p style={{ color: "#475569", marginBottom: "12px" }}>
              <strong>{t("situationTest.yourChoice")}</strong> {displayOutcome.selectedOptionText || "—"}
            </p>
            <p style={{ color: "#1e293b", whiteSpace: "pre-wrap", marginBottom: "12px" }}>
              <strong>{t("situationTest.answerComment")}</strong> {displayOutcome.resultText || t("situationTest.answerSaved")}
            </p>
            {displayOutcome.resultImageUrl ? (
              <img
                src={resolveStudentMediaSrc(api.baseUrl, displayOutcome.resultImageUrl)}
                alt={t("situationTest.resultImageAlt")}
                style={scenarioImageStyle}
              />
            ) : null}
            {nextScenario ? (
              <button
                type="button"
                className="primary-button"
                onClick={() => goToScenario(nextScenario)}
                style={{ marginTop: "16px", width: "100%", maxWidth: "420px" }}
              >
                {t("situationTest.goToNextTest")}
              </button>
            ) : null}
            <button type="button" className="ghost-button" onClick={() => setStep("list")} style={{ marginTop: "16px" }}>
              {t("situationTest.backToList")}
            </button>
          </div>
        ) : null}

        <div style={{ marginTop: "28px" }}>
          <Link to={backHref} className="ghost-button" style={{ display: "inline-block", padding: "10px 20px" }}>
            {t("situationTest.backToLessons")}
          </Link>
        </div>
      </section>
    </main>
  );
}
