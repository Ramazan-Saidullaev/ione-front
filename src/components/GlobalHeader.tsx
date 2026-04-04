import { Link } from "react-router-dom";

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
  return (
    <header className="global-header">
      <div className="global-header-left">
        <Link to="/" className="global-brand">
          <div className="brand-logo-card">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
          </div>
          <div className="brand-text">
            <strong>SAFE</strong>
            <span>SCHOOL</span>
          </div>
        </Link>
        <nav className="global-nav">
          <a href="/#about" className="nav-dropdown-btn">О платформе</a>
          <a href="/#features" className="nav-dropdown-btn">Функционал</a>
          <a href="/#steps" className="nav-dropdown-btn">Как это работает</a>
          <a href="/#reviews" className="nav-dropdown-btn">Отзывы</a>
        </nav>
      </div>
      <div className="global-header-right">
        <Link to="/auth" className="icon-action-btn" title="Войти">
          <UserIcon />
        </Link>

        <button className="lang-selector-btn">
          <div className="ru-flag"></div>
          <ChevronDown />
        </button>
      </div>
    </header>
  );
}
