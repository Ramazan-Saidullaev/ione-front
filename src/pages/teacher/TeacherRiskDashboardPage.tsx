import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { api } from "../../api";
import type { AuthResponse, RiskStudent, RiskZone, TeacherAttemptDetails, TeacherStudent, TestListItem } from "../../types";
import { getErrorMessage, formatDateTime } from "../../utils/helpers";
import { InfoBox } from "../../components/InfoBox";
import { zoneLabels, zoneOptions } from "../../utils/riskZones";

type Props = {
  session: AuthResponse;
};

const zoneSeverity: Record<RiskZone, number> = {
  BLACK: 3,
  RED: 2,
  YELLOW: 1,
  GREEN: 0
};

function zoneToneStyles(zone: RiskZone): { bg: string; fg: string; border: string } {
  switch (zone) {
    case "BLACK":
      return { bg: "#0f172a", fg: "#ffffff", border: "#0f172a" };
    case "RED":
      return { bg: "#fee2e2", fg: "#991b1b", border: "#fecaca" };
    case "YELLOW":
      return { bg: "#fef9c3", fg: "#854d0e", border: "#fde68a" };
    case "GREEN":
      return { bg: "#dcfce7", fg: "#166534", border: "#bbf7d0" };
  }
}

export function TeacherRiskDashboardPage({ session }: Props) {
  const { t } = useTranslation();
  const [testIdInput, setTestIdInput] = useState<number | null>(null);
  const [tests, setTests] = useState<TestListItem[]>([]);
  const [testsLoading, setTestsLoading] = useState(false);
  const [minZone, setMinZone] = useState<RiskZone>("GREEN");
  const [riskStudents, setRiskStudents] = useState<RiskStudent[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = useState<number | null>(null);
  const [attemptDetails, setAttemptDetails] = useState<TeacherAttemptDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);
  const [allStudents, setAllStudents] = useState<TeacherStudent[]>([]);
  const [loadingAllStudents, setLoadingAllStudents] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  useEffect(() => {
    setLoadingAllStudents(true);
    api.getTeacherStudents(session.accessToken)
      .then(setAllStudents)
      .catch((error) => console.error(t("teacherRisk.failedLoadStudents"), error))
      .finally(() => setLoadingAllStudents(false));
  }, [session.accessToken]);

  useEffect(() => {
    setTestsLoading(true);
    api.getTests(session.accessToken)
      .then((data) => {
        setTests(data);
        if (data.length > 0 && !testIdInput) {
          setTestIdInput(data[0].id);
        }
      })
      .catch((error) => console.error(t("teacherRisk.failedLoadTests"), error))
      .finally(() => setTestsLoading(false));
  }, [session.accessToken]);

  useEffect(() => {
    if (!selectedAttemptId) return;
    setDetailsLoading(true);
    setDetailsError(null);
    api.getAttemptDetails(session.accessToken, selectedAttemptId)
      .then(setAttemptDetails)
      .catch((error: unknown) => {
        setAttemptDetails(null);
        setDetailsError(getErrorMessage(error));
      })
      .finally(() => setDetailsLoading(false));
  }, [selectedAttemptId, session.accessToken]);

  // Auto-load on first open (so teacher immediately sees the "state of students")
  useEffect(() => {
    const testId = testIdInput;
    if (!testId) return;
    setListLoading(true);
    setListError(null);
    setHasSearched(true);
    api
      .getRiskStudents(session.accessToken, testId, minZone)
      .then((students) => {
        setRiskStudents(students);
        setSelectedAttemptId(students[0]?.attemptId ?? null);
        if (!students[0]?.attemptId) setAttemptDetails(null);
      })
      .catch((error: unknown) => {
        setRiskStudents([]);
        setAttemptDetails(null);
        setSelectedAttemptId(null);
        setListError(getErrorMessage(error));
      })
      .finally(() => setListLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.accessToken]);

  async function handleLoadRiskStudents(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const testId = testIdInput;
    if (!testId) {
      setListError(t("teacherRisk.selectTest"));
      return;
    }
    setListLoading(true);
    setListError(null);
    setHasSearched(true);
    try {
      const students = await api.getRiskStudents(session.accessToken, testId, minZone);
      setRiskStudents(students);
      if (students.length > 0) setSelectedAttemptId(students[0].attemptId);
      else {
        setSelectedAttemptId(null);
        setAttemptDetails(null);
      }
    } catch (error: unknown) {
      setRiskStudents([]);
      setAttemptDetails(null);
      setSelectedAttemptId(null);
      setListError(getErrorMessage(error));
    } finally {
      setListLoading(false);
    }
  }

  const sortedRiskStudents = useMemo(() => {
    const copy = [...riskStudents];
    copy.sort((a, b) => {
      const za = a.maxZone as RiskZone;
      const zb = b.maxZone as RiskZone;
      const dz = (zoneSeverity[zb] ?? -1) - (zoneSeverity[za] ?? -1);
      if (dz !== 0) return dz;
      return a.studentName.localeCompare(b.studentName);
    });
    return copy;
  }, [riskStudents]);

  const zoneCounts = useMemo(() => {
    const counts: Record<RiskZone, number> = { BLACK: 0, RED: 0, YELLOW: 0, GREEN: 0 };
    for (const s of sortedRiskStudents) {
      const z = s.maxZone as RiskZone;
      if (counts[z] != null) counts[z] += 1;
    }
    return counts;
  }, [sortedRiskStudents]);

  const studentsList = useMemo(() => {
    if (!hasSearched) return null;
    if (riskStudents.length === 0) {
      return (
        <div className="empty-state">
          <strong>{t("teacherRisk.noResults")}</strong>
          <p>{t("teacherRisk.noResultsHint")}</p>
        </div>
      );
    }

    const grouped: Record<RiskZone, RiskStudent[]> = { BLACK: [], RED: [], YELLOW: [], GREEN: [] };
    for (const s of sortedRiskStudents) {
      grouped[s.maxZone as RiskZone]?.push(s);
    }
    const order: RiskZone[] = ["BLACK", "RED", "YELLOW", "GREEN"];

    return (
      <div style={{ display: "grid", gap: "16px" }}>
        {order.map((zone) => {
          const items = grouped[zone];
          if (!items || items.length === 0) return null;
          const tone = zoneToneStyles(zone);
          return (
            <div key={zone}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "6px 2px 10px" }}>
                <div style={{ fontWeight: 800, color: "#0f172a" }}>
                  {zoneLabels[zone]} <span style={{ fontWeight: 700, color: "#64748b" }}>({items.length})</span>
                </div>
                <span style={{ padding: "4px 10px", borderRadius: "9999px", background: tone.bg, color: tone.fg, border: `1px solid ${tone.border}`, fontWeight: 800, fontSize: "0.85rem" }}>
                  {zone}
                </span>
              </div>
              <div className="student-list list-animate" style={{ gap: "10px" }}>
                {items.map((student) => (
                  <button
                    key={student.attemptId}
                    className={`student-card ${selectedAttemptId === student.attemptId ? "selected" : ""}`}
                    onClick={() => setSelectedAttemptId(student.attemptId)}
                    type="button"
                    style={{
                      borderLeft: `6px solid ${tone.border}`
                    }}
                  >
                    <div className="student-card-top">
                      <strong>{student.studentName}</strong>
                      <span
                        style={{
                          padding: "4px 10px",
                          borderRadius: "9999px",
                          background: tone.bg,
                          color: tone.fg,
                          border: `1px solid ${tone.border}`,
                          fontWeight: 800,
                          fontSize: "0.85rem"
                        }}
                      >
                        {zoneLabels[zone]}
                      </span>
                    </div>
                    <p style={{ marginBottom: "6px" }}>{student.className || t("teacherRisk.classNotSpecified")}</p>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [hasSearched, riskStudents.length, selectedAttemptId, sortedRiskStudents]);

  return (
    <section className="dashboard-grid">
      <aside className="card sidebar-card">
        <div className="section-heading">
          <p className="eyebrow">{t("teacherRisk.monitoringEyebrow")}</p>
          <h2>{t("teacherRisk.riskGroupsTitle")}</h2>
        </div>
        <form className="stack" onSubmit={handleLoadRiskStudents}>
          <label className="field">
            <span>{t("teacherRisk.psychTest")}</span>
            <select
              value={testIdInput ?? ""}
              onChange={(e) => setTestIdInput(Number(e.target.value) || null)}
              required
              disabled={testsLoading}
            >
              {testsLoading ? (
                <option value="">{t("teacherRisk.testLoading")}</option>
              ) : tests.length === 0 ? (
                <option value="">{t("teacherRisk.noTests")}</option>
              ) : (
                tests.map((test) => (
                  <option key={test.id} value={test.id}>
                    {test.title}
                  </option>
                ))
              )}
            </select>
          </label>
          <label className="field">
            <span>{t("teacherRisk.showZonesFrom")}</span>
            <select value={minZone} onChange={(e) => setMinZone(e.target.value as RiskZone)}>
              {zoneOptions.map((zone) => (
                <option key={zone} value={zone}>
                  {zoneLabels[zone]}
                </option>
              ))}
            </select>
          </label>
          {listError ? <div className="banner error">{listError}</div> : null}
          <button className="primary-button" type="submit" disabled={listLoading}>
            {listLoading ? t("teacherRisk.updating") : t("teacherRisk.update")}
          </button>
        </form>

        {hasSearched ? (
          <div style={{ marginTop: "18px" }}>
            <div className="section-heading compact-heading">
              <p className="eyebrow">{t("teacherRisk.summaryEyebrow")}</p>
              <h2>{t("teacherRisk.summaryTitle")}</h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
              {(["BLACK", "RED", "YELLOW", "GREEN"] as RiskZone[]).map((z) => {
                const tone = zoneToneStyles(z);
                return (
                  <div
                    key={z}
                    style={{
                      background: "#fff",
                      border: `1px solid ${tone.border}`,
                      borderRadius: "12px",
                      padding: "10px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center"
                    }}
                  >
                    <span style={{ fontWeight: 800, color: "#0f172a" }}>{zoneLabels[z]}</span>
                    <span style={{ padding: "3px 10px", borderRadius: "9999px", background: tone.bg, color: tone.fg, fontWeight: 900 }}>
                      {zoneCounts[z]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="section-heading compact-heading">
          <p className="eyebrow">{t("teacherRisk.resultsEyebrow")}</p>
          <h2>{t("teacherRisk.studentsTitle")}</h2>
        </div>
        <div className="student-list">
          {!hasSearched ? (
            loadingAllStudents ? (
              <div className="empty-state">{t("teacherRisk.loadingStudents")}</div>
            ) : allStudents.length === 0 ? (
              <div className="empty-state">
                <strong>{t("teacherRisk.noStudents")}</strong>
                <p>{t("teacherRisk.noStudentsHint")}</p>
              </div>
            ) : (
              allStudents.map((student) => (
                <div key={student.id} className="student-card" style={{ cursor: "default" }}>
                  <div className="student-card-top">
                    <strong>{student.fullName}</strong>
                  </div>
                  <p>{student.className || t("teacherRisk.classNotSpecified")}</p>
                  <small>studentId: {student.id}</small>
                </div>
              ))
            )
          ) : (
            studentsList
          )}
        </div>
      </aside>

      <section className="card details-card panel-animate" key={`attempt-${selectedAttemptId ?? 'none'}`}>
        <div className="section-heading">
          <p className="eyebrow">{t("teacherRisk.detailsEyebrow")}</p>
          <h2>{t("teacherRisk.attemptReport")}</h2>
        </div>
        {detailsLoading ? <div className="empty-state">{t("teacherRisk.loadingDetails")}</div> : null}
        {detailsError ? <div className="banner error">{detailsError}</div> : null}
        {!detailsLoading && !detailsError && !attemptDetails ? (
          <div className="empty-state">
            <strong>{t("teacherRisk.noAttemptSelected")}</strong>
            <p>{t("teacherRisk.noAttemptHint")}</p>
          </div>
        ) : null}
        {!detailsLoading && !detailsError && attemptDetails ? (
          <div className="details-layout results-animate">
            <div className="summary-grid">
              <InfoBox label={t("teacherRisk.student")} value={attemptDetails.studentName} />
              <InfoBox label={t("teacherRisk.test")} value={attemptDetails.testTitle} />
              <InfoBox label={t("common.class")} value={attemptDetails.className || t("common.notSpecified")} />
              <InfoBox label={t("teacherRisk.maxZone")} value={attemptDetails.maxZone} tone={attemptDetails.maxZone} />
              <InfoBox label={t("teacherRisk.start")} value={formatDateTime(attemptDetails.startedAt)} />
              <InfoBox
                label={t("teacherRisk.finish")}
                value={attemptDetails.finishedAt ? formatDateTime(attemptDetails.finishedAt) : t("teacherRisk.notFinished")}
              />
            </div>
            <div className="panel-block">
              <div className="panel-heading">
                <h3>{t("teacherRisk.categoryResults")}</h3>
              </div>
              <div className="category-grid">
                {attemptDetails.categoryResults.map((result) => (
                  <article key={result.categoryId} className="category-card">
                    <div className="student-card-top">
                      <strong>{result.categoryName}</strong>
                      <span className={`zone-pill zone-${result.zone.toLowerCase()}`}>{result.zone}</span>
                    </div>
                    <p>{t("teacherRisk.totalScore")}: {result.totalScore}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </section>
  );
}

