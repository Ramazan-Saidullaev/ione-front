import type { ReactNode } from "react";

export type KpiItem = {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger";
};

type Props = {
  items: KpiItem[];
};

export function KpiGrid({ items }: Props) {
  return (
    <section className="kpi-grid" aria-label="Ключевые показатели">
      {items.map((x) => (
        <article key={x.label} className={`kpi-card ${x.tone ? `tone-${x.tone}` : ""}`.trim()}>
          <span className="kpi-label">{x.label}</span>
          <strong className="kpi-value">{x.value}</strong>
          {x.hint ? <small className="kpi-hint">{x.hint}</small> : null}
        </article>
      ))}
    </section>
  );
}
