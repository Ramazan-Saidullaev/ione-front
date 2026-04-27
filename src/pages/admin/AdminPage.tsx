import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { useLang } from "../../hooks/useLang";
import { loadSession, clearSession } from "../../storage";
import { AdminOverview } from "./AdminOverview";
import { AdminCourses } from "./AdminCourses";
import { AdminSchools } from "./AdminSchools";
import { AdminTests } from "./AdminTests";
import type { AuthResponse } from "../../types";

export function AdminPage() {
  const { t, i18n } = useTranslation();
  const lang = useLang();
  const navigate = useNavigate();
  const [session] = useState<AuthResponse | null>(() => loadSession("admin"));
  const location = useLocation();
  const [showLangMenu, setShowLangMenu] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setShowLangMenu(false);
      }
    }
    if (showLangMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showLangMenu]);

  function switchLang(newLang: string) {
    i18n.changeLanguage(newLang);
    const newPath = location.pathname.replace(`/${lang}`, `/${newLang}`);
    navigate(newPath + location.search + location.hash, { replace: true });
    setShowLangMenu(false);
  }

  function handleLogout() {
    clearSession("admin");
    window.location.href = `/${lang}`;
  }

  if (!session) {
    return (
      <main style={{ display: "flex", height: "100vh", alignItems: "center", justifyContent: "center", background: "#f9fafb", fontFamily: "system-ui, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "2rem", color: "#111827", margin: "0 0 16px 0" }}>{t("admin.accessDenied")}</h1>
          <p style={{ color: "#6b7280" }}>{t("admin.noPermission")}</p>
        </div>
      </main>
    );
  }

  const navItems = [
    { path: `/${lang}/admin`, label: t("admin.panel"), icon: "📊" },
    { path: `/${lang}/admin/schools`, label: t("admin.schoolsAndUsers"), icon: "🏫" },
    { path: `/${lang}/admin/courses`, label: t("admin.courses"), icon: "📚" },
    { path: `/${lang}/admin/tests`, label: t("admin.testsAndScales"), icon: "🧠" },
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
            const isActive = location.pathname === item.path || (item.path !== `/${lang}/admin` && location.pathname.startsWith(item.path));
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
            {/* Language Switcher */}
            <div ref={langMenuRef} style={{ position: "relative" }}>
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "6px", border: "none", background: "transparent", cursor: "pointer", fontSize: "0.9rem", color: "#374151" }}
              >
                <span style={{ fontSize: "1.25rem" }}>{{ ru: "\u{1F1F7}\u{1F1FA}", kz: "\u{1F1F0}\u{1F1FF}", en: "\u{1F1FA}\u{1F1F8}" }[lang]}</span>
                <span style={{ fontSize: "0.7rem", transition: "transform 0.2s", transform: showLangMenu ? "rotate(180deg)" : "rotate(0)" }}>&#9662;</span>
              </button>
              {showLangMenu && (
                <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "6px", background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px", boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden", zIndex: 100, minWidth: "160px" }}>
                  {([["kz", "\u{1F1F0}\u{1F1FF}", "\u049A\u0430\u0437\u0430\u049B\u0448\u0430"], ["ru", "\u{1F1F7}\u{1F1FA}", "\u0420\u0443\u0441\u0441\u043A\u0438\u0439"], ["en", "\u{1F1FA}\u{1F1F8}", "English"]] as [string, string, string][]).map(([code, flag, label]) => (
                    <button
                      key={code}
                      onClick={() => switchLang(code)}
                      style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%", padding: "10px 16px", border: "none", background: code === lang ? "#f0f4ff" : "#fff", cursor: "pointer", fontSize: "0.9rem", fontWeight: code === lang ? 600 : 400, color: "#111827", textAlign: "left" }}
                    >
                      <span style={{ fontSize: "1.2rem" }}>{flag}</span>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}>{session.fullName || t("admin.administrator")}</div>
              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{t("admin.sysAdmin")}</div>
            </div>
            <button onClick={handleLogout} style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #d1d5db", background: "#fff", cursor: "pointer", fontSize: "0.85rem", fontWeight: 500, color: "#374151" }}>
              {t("common.logout")}
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