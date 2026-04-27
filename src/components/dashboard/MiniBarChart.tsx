type BarItem = {
  label: string;
  value: number;
  color?: string;
};

type Props = {
  title: string;
  eyebrow?: string;
  items: BarItem[];
};

export function MiniBarChart({ title, eyebrow = "Сводка", items }: Props) {
  const max = Math.max(1, ...items.map((x) => x.value));

  return (
    <section className="card compact-card" aria-label={title}>
      <div className="section-heading" style={{ marginBottom: 12 }}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 style={{ fontSize: "1.15rem" }}>{title}</h2>
      </div>
      <div className="mini-bars">
        {items.map((x, i) => (
          <div key={i} className="mini-bar-row">
            <div className="mini-bar-meta">
              <span>{x.label}</span>
              <strong>{x.value}</strong>
            </div>
            <div className="mini-bar-track" aria-hidden="true">
              <div
                className="mini-bar-fill"
                style={{ width: `${Math.round((x.value / max) * 100)}%`, background: x.color ?? undefined }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
