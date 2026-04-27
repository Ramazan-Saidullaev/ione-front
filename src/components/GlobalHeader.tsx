import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { loadSession } from "../storage";
import { useLang } from "../hooks/useLang";
import type { AuthResponse } from "../types";

function ChevronDown() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export function GlobalHeader() {
  const { t, i18n } = useTranslation();
  const lang = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const [showAuthMenu, setShowAuthMenu] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const [student, setStudent] = useState<AuthResponse | null>(() => loadSession("student"));
  const [teacher, setTeacher] = useState<AuthResponse | null>(() => loadSession("teacher"));

  function switchLang(newLang: string) {
    i18n.changeLanguage(newLang);
    const newPath = location.pathname.replace(`/${lang}`, `/${newLang}`);
    navigate(newPath + location.search + location.hash, { replace: true });
    setShowLangMenu(false);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAuthMenu(false);
      }
    }

    if (showAuthMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showAuthMenu]);

  useEffect(() => {
    function handleClickOutsideLang(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    }
    if (showLangMenu) {
      document.addEventListener("mousedown", handleClickOutsideLang);
      return () => document.removeEventListener("mousedown", handleClickOutsideLang);
    }
  }, [showLangMenu]);

  useEffect(() => {
    function handleStorage() {
      setStudent(loadSession("student"));
      setTeacher(loadSession("teacher"));
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const profileLink = student ? `/${lang}/students/profile` : teacher ? `/${lang}/teachers/profile` : null;

  return (
    <header className="global-header">
      <div className="global-header-left">
        <Link to={`/${lang}`} className="global-brand">
          <div className="brand-logo-card">
            <img className="brand-logo-img" src="/sanau-logo.png" alt="SanaU" />
          </div>
        </Link>
        <nav className="global-nav">
          <a href={`/${lang}#product`} className="nav-dropdown-btn">{t("header.aboutPlatform")}</a>
          <a href={`/${lang}#features`} className="nav-dropdown-btn">{t("header.features")}</a>
          <a href={`/${lang}#audience`} className="nav-dropdown-btn">{t("header.forWhom")}</a>
          <a href={`/${lang}#privacy`} className="nav-dropdown-btn">{t("header.contacts")}</a>
        </nav>
      </div>
      <div className="global-header-right">
        <div className="auth-menu-container" ref={menuRef}>
          <button
            className="icon-action-btn"
            title={t("header.menu")}
            onClick={() => setShowAuthMenu(!showAuthMenu)}
          >
            <UserIcon />
          </button>
          
          {showAuthMenu && (
            <div className="auth-dropdown-menu">
              {profileLink ? (
                <Link to={profileLink} className="auth-menu-item" onClick={() => setShowAuthMenu(false)}>
                  {t("common.profile")}
                </Link>
              ) : (
                <>
                  <Link to={`/${lang}/auth`} className="auth-menu-item" onClick={() => setShowAuthMenu(false)}>
                    {t("common.login")}
                  </Link>
                  <Link to={`/${lang}/auth/register`} className="auth-menu-item" onClick={() => setShowAuthMenu(false)}>
                    {t("common.register")}
                  </Link>
                </>
              )}
            </div>
          )}
        </div>

        <div className="auth-menu-container" ref={langMenuRef}>
          <button className="lang-selector-btn" onClick={() => setShowLangMenu(!showLangMenu)}>
            <span style={{ fontSize: "1.25rem" }}>{{ ru: "\u{1F1F7}\u{1F1FA}", kz: "\u{1F1F0}\u{1F1FF}", en: "\u{1F1FA}\u{1F1F8}" }[lang]}</span>
            <ChevronDown />
          </button>
          {showLangMenu && (
            <div className="auth-dropdown-menu">
              {([["kz", "\u{1F1F0}\u{1F1FF}", "\u049A\u0430\u0437\u0430\u049B\u0448\u0430"], ["ru", "\u{1F1F7}\u{1F1FA}", "\u0420\u0443\u0441\u0441\u043A\u0438\u0439"], ["en", "\u{1F1FA}\u{1F1F8}", "English"]] as [string, string, string][]).map(([code, flag, label]) => (
                <button
                  key={code}
                  className={`auth-menu-item${code === lang ? " active" : ""}`}
                  onClick={() => switchLang(code)}
                  type="button"
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <span style={{ fontSize: "1.1rem" }}>{flag}</span>
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
