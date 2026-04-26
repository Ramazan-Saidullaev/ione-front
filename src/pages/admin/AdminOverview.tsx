import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../../api";
import { loadSession } from "../../storage";

export function AdminOverview() {
  const [session] = useState(() => loadSession("admin"));
  
  const { data, isLoading } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: () => api.getAdminDashboard(session!.accessToken),
    enabled: !!session,
  });

  if (isLoading) return <div style={{ color: "#6b7280" }}>Загрузка...</div>;
  if (!data) return <div style={{ color: "red" }}>Ошибка загрузки данных</div>;

  const stats = [
    { label: "Всего школ", value: data.schools.length, color: "#3b82f6" },
    { label: "Всего курсов", value: data.courses.length, color: "#10b981" },
    { label: "Всего тестов", value: data.tests.length, color: "#8b5cf6" },
    { label: "Сценариев", value: data.scenarios.length, color: "#f59e0b" }
  ];

  return (
    <div>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "24px", color: "#111827" }}>Обзор</h1>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px" }}>
        {stats.map((stat, idx) => (
          <div key={idx} style={{ background: "#fff", padding: "24px", borderRadius: "12px", border: "1px solid #e5e7eb", boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)" }}>
            <p style={{ color: "#6b7280", fontSize: "0.85rem", textTransform: "uppercase", fontWeight: 600, letterSpacing: "0.05em" }}>{stat.label}</p>
            <p style={{ fontSize: "2.5rem", fontWeight: "bold", margin: "8px 0 0 0", color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}