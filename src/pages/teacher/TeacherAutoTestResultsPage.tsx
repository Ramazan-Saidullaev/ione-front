import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { api } from "../../api";
import type { AuthResponse, TeacherStudentLatestAttempt } from "../../types";
import { formatDateTime, getErrorMessage } from "../../utils/helpers";
import { useLang } from "../../hooks/useLang";
import { KpiGrid } from "../../components/dashboard/KpiGrid";
import { MiniBarChart } from "../../components/dashboard/MiniBarChart";
import { QuickActionsCard } from "../../components/dashboard/QuickActionsCard";

type Props = {
  session: AuthResponse;
};

export function TeacherAutoTestResultsPage({ session }: Props) {
  const { t } = useTranslation();
  const lang = useLang();
  const [items, setItems] = useState<TeacherStudentLatestAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api.getTeacherStudentsLatestAttempts(session.accessToken)
      .then(setItems)
      .catch((e: unknown) => setError(getErrorMessage(e)))
      .finally(() => setLoading(false));
  }, [session.accessToken]);

  const completed = useMemo(() => items.filter((x) => x.latestAttempt), [items]);

  const zoneCounts = useMemo(() => {
    const counts = { GREEN: 0, YELLOW: 0, RED: 0, BLACK: 0 };
    for (const row of completed) {
      const zone = row.latestAttempt?.maxZone;
      if (!zone) continue;
      if (zone in counts) counts[zone as keyof typeof counts] += 1;
    }
    return counts;
  }, [completed]);

  return (
    <section className="dashboard-grid">
      <aside className="card sidebar-card">
        <div className="section-heading">
          <p className="eyebrow">{t("teacherAutoTests.autoResultsEyebrow")}</p>
          <h2>{t("teacherAutoTests.studentsTitle")}</h2>
        </div>

        {loading ? <div className="empty-state">{t("teacherAutoTests.loadingResults")}</div> : null}
        {error ? <div className="banner error">{error}</div> : null}
        {!loading && !error && completed.length === 0 ? (
          <div className="empty-state">
            <strong>{t("teacherAutoTests.noCompletedTests")}</strong>
            <p>{t("teacherAutoTests.noCompletedTestsHint")}</p>
          </div>
        ) : null}

        <div className="student-list list-animate">
          {completed.map((row) => (
            <Link key={row.studentId} className="student-card" to={`/${lang}/teachers/tests/${row.studentId}/results`}>
              <div className="student-card-top">
                <strong>{row.studentName}</strong>
                <span className={`zone-pill zone-${row.latestAttempt!.maxZone.toLowerCase()}`}>
                  {row.latestAttempt!.maxZone}
                </span>
              </div>
              <p>{row.className || t("teacherAutoTests.classNotSpecified")}</p>
              <small>
                {t("teacherAutoTests.lastTest")}: {row.latestAttempt!.testTitle}
                {row.latestAttempt!.finishedAt ? ` · ${formatDateTime(row.latestAttempt!.finishedAt)}` : ""}
              </small>
            </Link>
          ))}
        </div>
      </aside>

      <section className="card details-card">
        <div className="section-heading">
          <p className="eyebrow">{t("teacherAutoTests.overviewEyebrow")}</p>
          <h2>{t("teacherAutoTests.panelTitle")}</h2>
        </div>

        <KpiGrid
          items={[
            {
              label: t("teacherAutoTests.studentsTitle"),
              value: items.length,
              hint: t("teacherAutoTests.studentsInList")
            },
            {
              label: t("teacherAutoTests.hasResult"),
              value: completed.length,
              hint: t("teacherAutoTests.completedAtLeastOne"),
              tone: completed.length > 0 ? "success" : "warning"
            },
            {
              label: t("teacherAutoTests.riskZone"),
              value: zoneCounts.BLACK + zoneCounts.RED,
              hint: "BLACK + RED",
              tone: zoneCounts.BLACK + zoneCounts.RED > 0 ? "danger" : "success"
            },
            {
              label: t("teacherAutoTests.waiting"),
              value: Math.max(0, items.length - completed.length),
              hint: t("teacherAutoTests.noResults"),
              tone: items.length - completed.length > 0 ? "warning" : "default"
            }
          ]}
        />

        <div className="details-layout">
          <MiniBarChart
            title={t("teacherAutoTests.zoneDistribution")}
            items={[
              { label: "GREEN", value: zoneCounts.GREEN, color: "#22c55e" },
              { label: "YELLOW", value: zoneCounts.YELLOW, color: "#eab308" },
              { label: "RED", value: zoneCounts.RED, color: "#ef4444" },
              { label: "BLACK", value: zoneCounts.BLACK, color: "#0f172a" }
            ]}
          />

          <QuickActionsCard
            title={t("teacherAutoTests.quickActions")}
            actions={[
              { label: t("teacherAutoTests.openRiskPanel"), href: `/${lang}/teachers`, tone: "ghost" },
              { label: t("teacherAutoTests.courseProgress"), href: `/${lang}/teachers/progress`, tone: "ghost" }
            ]}
          />
        </div>
      </section>
    </section>
  );
}

