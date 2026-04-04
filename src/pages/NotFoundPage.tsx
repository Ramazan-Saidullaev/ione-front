import { GlobalHeader } from "../components/GlobalHeader";

export function NotFoundPage() {
  return (
    <main className="shell route-shell">
      <GlobalHeader />
      <section className="hero-panel">
        <p className="eyebrow">Not Found</p>
        <h1>This page does not exist.</h1>
        <p className="lead">Use one of the known routes below.</p>
        <div className="route-grid">
          <a className="route-card" href="/teachers">
            <h2>/teachers</h2>
            <p>Teacher workspace</p>
          </a>
          <a className="route-card" href="/students">
            <h2>/students</h2>
            <p>Student workspace</p>
          </a>
        </div>
      </section>
    </main>
  );
}