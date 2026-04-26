import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
};

export function LandingFeatureCard({ title, children }: Props) {
  return (
    <article className="card feature-card">
      <h3>{title}</h3>
      <p>{children}</p>
    </article>
  );
}
