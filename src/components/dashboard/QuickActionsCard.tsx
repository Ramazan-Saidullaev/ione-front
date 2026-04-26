import type { ReactNode } from "react";

export type QuickAction = {
  label: string;
  onClick?: () => void;
  href?: string;
  icon?: ReactNode;
  tone?: "primary" | "ghost";
};

type Props = {
  title: string;
  eyebrow?: string;
  actions: QuickAction[];
};

export function QuickActionsCard({ title, eyebrow = "Быстрые действия", actions }: Props) {
  return (
    <section className="card compact-card" aria-label={title}>
      <div className="section-heading" style={{ marginBottom: 12 }}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 style={{ fontSize: "1.15rem" }}>{title}</h2>
      </div>
      <div className="quick-actions">
        {actions.map((a) => {
          const className = a.tone === "primary" ? "primary-link-button" : "ghost-link-button";
          if (a.href) {
            return (
              <a key={a.label} className={className} href={a.href}>
                {a.icon ? <span className="qa-icon">{a.icon}</span> : null}
                {a.label}
              </a>
            );
          }
          return (
            <button key={a.label} type="button" className={a.tone === "primary" ? "primary-button" : "ghost-button"} onClick={a.onClick}>
              {a.icon ? <span className="qa-icon">{a.icon}</span> : null}
              {a.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
