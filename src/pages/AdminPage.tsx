import { useState } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import { loadSession, clearSession } from "../storage";
import { AdminOverview } from "./AdminOverview";
import { AdminCourses } from "./AdminCourses";
import { AdminSchools } from "./AdminSchools";
import { AdminTests } from "./AdminTests";
import type { AuthResponse } from "../types";

export function AdminPage() {
  const [session] = useState<AuthResponse | null>(() => loadSession("admin"));
  const location = useLocation();

  function handleLogout() {
    clearSession("admin");
    window.location.href = "/";
  }

  if (!session) {
    return (
      <main style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", color: "#111827", margin: "0 0 16px 0" }}>Доступ запрещён</h1>
          <p style={{ color: "#6b7280" }}>У вас нет прав для просмотра панели администратора.</p>
        </div>
      </main>
    );
  }

  const navItems = [
    { path: "/admin", label: "Панель", icon: "📊" },
    { path: "/admin/schools", label: "Школы и пользователи", icon: "🏫" },
    { path: "/admin/courses", label: "Курсы", icon: "📚" },
    { path: "/admin/tests", label: "Тесты и шкалы", icon: "🧠" },
  ];

  return (
    <div style={{ display: "flex", height: "100vh", backgroundColor: "#f3f4f6", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* SIDEBAR */}
      <aside style={{ width: "260px", backgroundColor: "#ffffff", borderRight: "1px solid #e5e7eb", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "32px", height: "32px", backgroundColor: "#2563eb", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "bold" }}>S</div>
          <span style={{ fontSize: "1.2rem", fontWeight: 700, color: "#111827" }}>SanaU</span>
        </div>
        <nav style={{ flex: 1, padding: "20px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map(item => {
            const isActive = location.pathname === item.path || (item.path !== "/admin" && location.pathname.startsWith(item.path));
            return (
              <Link key={item.path} to={item.path} style={{
                padding: "10px 12px", borderRadius: "8px", textDecoration: "none", fontSize: "0.95rem",
                backgroundColor: isActive ? "#eff6ff" : "transparent",
                color: isActive ? "#1d4ed8" : "#4b5563",
                fontWeight: isActive ? 600 : 500,
                display: "flex", alignItems: "center", gap: "12px", transition: "background-color 0.2s"
              }}>
                <span style={{ fontSize: "1.2rem", opacity: isActive ? 1 : 0.6 }}>{item.icon}</span> {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* TOPBAR */}
        <header style={{ height: "64px", backgroundColor: "#ffffff", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>{session.fullName || "Администратор"}</div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Системный администратор</div>
            </div>
            <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>
              Выйти
            </button>
          </div>
        </header>

        {/* SCROLLABLE PAGE AREA */}
        <div style={{ flex: 1, overflowY: "auto", padding: "32px", backgroundColor: "#f9fafb" }}>
          <Routes>
            <Route path="/" element={<AdminOverview />} />
            <Route path="/schools" element={<AdminSchools />} />
            <Route path="/courses/*" element={<AdminCourses />} />
            <Route path="/tests/*" element={<AdminTests />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}