import { GlobalHeader } from "../components/GlobalHeader";

export function NotFoundPage() {
  return (
    <main className="shell route-shell">
      <GlobalHeader />
      <section className="hero-panel">
        <p className="eyebrow">Страница не найдена</p>
        <h1>Такой страницы не существует.</h1>
        <p className="lead">Перейдите в один из доступных разделов ниже.</p>
        <div className="route-grid">
          <a className="route-card" href="/teachers">
            <h2>/teachers</h2>
            <p>Раздел учителя</p>
          </a>
          <a className="route-card" href="/students">
            <h2>/students</h2>
            <p>Раздел ученика</p>
          </a>
        </div>
      </section>
    </main>
  );
}