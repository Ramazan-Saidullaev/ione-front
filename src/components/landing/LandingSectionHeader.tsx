type Props = {
  eyebrow: string;
  title: string;
  subtitle?: string;
};

export function LandingSectionHeader({ eyebrow, title, subtitle }: Props) {
  return (
    <div className="section-header-block">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      {subtitle ? <p className="lead" style={{ margin: 0, maxWidth: "72ch" }}>{subtitle}</p> : null}
    </div>
  );
}
