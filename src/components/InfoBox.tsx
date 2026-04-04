import type { RiskZone } from "../types";

export function InfoBox(props: { label: string; value: string; tone?: RiskZone }) {
  return (
    <div className={`info-box ${props.tone ? `tone-${props.tone.toLowerCase()}` : ""}`}>
      <span>{props.label}</span>
      <strong>{props.value}</strong>
    </div>
  );
}