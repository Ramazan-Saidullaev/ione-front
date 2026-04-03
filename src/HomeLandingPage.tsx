import { GlobalHeader } from "./GlobalHeader";

export function HomeLandingPage() {
  return (
    <main className="landing-shell">
      <GlobalHeader />

      <section className="landing-hero">
        <div className="hero-panel landing-panel">
          <p className="eyebrow">Платформа для школьников, родителей и учителей</p>
          <h1>Забота о развитии, обучении и психологическом состоянии ребенка в одной безопасной среде.</h1>
          <p className="lead">
            Онлайн-курсы, образовательные и психологические тесты, аналитика состояния ребенка и рекомендации
            для родителей и учителей в современном и понятном цифровом формате.
          </p>
          <div className="landing-actions">
            <a className="primary-link-button" href="/auth">
              Начать бесплатно
            </a>
            <a className="secondary-link-button" href="#about">
              О платформе
            </a>
          </div>
          <div className="trust-strip">
            <span>Дружелюбный интерфейс</span>
            <span>Безопасность и доверие</span>
            <span>Поддержка семьи и школы</span>
          </div>
        </div>

        <div className="landing-feature-grid hero-side-grid">
          <article className="card signal-card">
            <p className="eyebrow">Что получает пользователь</p>
            <h2>Единую картину обучения и эмоционального состояния ребенка без хаоса и догадок.</h2>
            <ul className="clean-list">
              <li>Онлайн-курсы для школьников</li>
              <li>Образовательные и психологические тесты</li>
              <li>Аналитика и рекомендации для взрослых</li>
            </ul>
          </article>

          <div className="stats-grid">
            <article className="stat-card">
              <strong>Курсы</strong>
              <span>Пошаговое обучение и развитие навыков</span>
            </article>
            <article className="stat-card">
              <strong>Тесты</strong>
              <span>Проверка знаний и состояния школьника</span>
            </article>
            <article className="stat-card">
              <strong>Аналитика</strong>
              <span>Понятные выводы для родителей и учителей</span>
            </article>
            <article className="stat-card">
              <strong>Рекомендации</strong>
              <span>Практические действия без перегруза</span>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-sections two-column" id="about">
        <div className="card feature-card">
          <div className="section-heading">
            <p className="eyebrow">О платформе</p>
            <h2>Единое пространство для обучения, диагностики и поддержки школьника</h2>
          </div>
          <p className="lead compact-lead">
            Платформа объединяет учебные материалы, тестирование и психологическую аналитику, чтобы взрослые
            вовремя замечали изменения, а дети получали поддержку в спокойной и понятной цифровой среде.
          </p>
          <div className="bullet-grid">
            <div className="mini-feature">
              <strong>Для школьников</strong>
              <p>Интересные курсы, понятные тесты и современный интерфейс без лишней сложности.</p>
            </div>
            <div className="mini-feature">
              <strong>Для родителей</strong>
              <p>Прозрачная картина прогресса, состояния и зон внимания по ребенку.</p>
            </div>
            <div className="mini-feature">
              <strong>Для учителей</strong>
              <p>Отчеты и ориентиры, которые помогают быстрее замечать важные сигналы.</p>
            </div>
          </div>
        </div>

        <div className="card feature-card">
          <div className="section-heading">
            <p className="eyebrow">Преимущества</p>
            <h2>Доверие, безопасность и практическая польза в одном решении</h2>
          </div>
          <div className="bullet-grid">
            <div className="mini-feature">
              <strong>Безопасность данных</strong>
              <p>Бережное отношение к персональным данным, истории результатов и приватности семьи.</p>
            </div>
            <div className="mini-feature">
              <strong>Научный подход</strong>
              <p>Диагностика и интерпретация строятся на понятной и структурной методике.</p>
            </div>
            <div className="mini-feature">
              <strong>Удобство использования</strong>
              <p>Комфортный интерфейс для детей и взрослых без перегруженных экранов.</p>
            </div>
          </div>
          <div className="highlight-box">
            <strong>Поддержка без давления</strong>
            <p>Сервис помогает принимать решения на основе данных и мягко сопровождать развитие ребенка.</p>
          </div>
        </div>
      </section>

      <section className="landing-sections" id="features">
        <div className="section-header-block">
          <p className="eyebrow">Функционал</p>
          <h2>Все ключевые возможности на одной платформе</h2>
        </div>
        <div className="feature-grid-wide">
          <article className="card feature-card">
            <h3>Онлайн-курсы</h3>
            <p>Образовательные материалы для школьников с пошаговым прохождением уроков.</p>
          </article>
          <article className="card feature-card">
            <h3>Образовательные тесты</h3>
            <p>Удобная проверка знаний и дополнительная вовлеченность в учебный процесс.</p>
          </article>
          <article className="card feature-card">
            <h3>Психологическая диагностика</h3>
            <p>Тесты и сценарии, которые помогают оценить эмоциональное состояние ребенка.</p>
          </article>
          <article className="card feature-card">
            <h3>Отчеты и рекомендации</h3>
            <p>Понятные выводы и практические советы для родителей, учителей и специалистов.</p>
          </article>
        </div>
      </section>

      <section className="landing-sections" id="steps">
        <div className="section-header-block">
          <p className="eyebrow">Как это работает</p>
          <h2>Простой путь от входа до полезных рекомендаций</h2>
        </div>
        <div className="steps-grid">
          <article className="step-card">
            <span>01</span>
            <h3>Регистрация</h3>
            <p>Пользователь входит в систему и получает доступ к своему разделу платформы.</p>
          </article>
          <article className="step-card">
            <span>02</span>
            <h3>Прохождение</h3>
            <p>Школьник изучает курсы и проходит образовательные или психологические тесты.</p>
          </article>
          <article className="step-card">
            <span>03</span>
            <h3>Анализ</h3>
            <p>Система собирает результаты и формирует ясную аналитику по прогрессу и состоянию.</p>
          </article>
          <article className="step-card">
            <span>04</span>
            <h3>Рекомендации</h3>
            <p>Родители и учителя получают практические советы по дальнейшей поддержке ребенка.</p>
          </article>
        </div>
      </section>

      <section className="landing-sections" id="reviews">
        <div className="section-header-block">
          <p className="eyebrow">Отзывы</p>
          <h2>Что говорят родители и учителя</h2>
        </div>
        <div className="feature-grid-wide">
          <article className="card testimonial-card">
            <p>"Стало намного проще понимать, как ребенок чувствует себя в школе и где ему нужна поддержка."</p>
            <strong>Айгуль, мама ученика 7 класса</strong>
          </article>
          <article className="card testimonial-card">
            <p>"Отчеты помогают замечать риски раньше и обсуждать ситуацию с родителями на основе данных."</p>
            <strong>Марина, классный руководитель</strong>
          </article>
          <article className="card testimonial-card">
            <p>"Платформа понятная, спокойная и не перегруженная. Дети комфортно проходят задания и тесты."</p>
            <strong>Ержан, школьный психолог</strong>
          </article>
        </div>
      </section>

      <section className="cta-banner">
        <div>
          <p className="eyebrow">Начните сегодня</p>
          <h2>Подключитесь к платформе и получите современный инструмент поддержки ребенка.</h2>
        </div>
        <a className="primary-link-button" href="/auth">
          Начать бесплатно
        </a>
      </section>

      <footer className="site-footer" id="privacy">
        <div className="footer-brand">
          <strong>Safe School Platform</strong>
          <p>Современная платформа для обучения, диагностики и поддержки школьников.</p>
        </div>
        <div className="footer-links">
          <a href="mailto:support@safeschool.local">support@safeschool.local</a>
          <a href="https://t.me/" target="_blank" rel="noreferrer">
            Telegram
          </a>
          <a href="https://instagram.com/" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="/auth">Войти</a>
          <a href="#privacy">Политика конфиденциальности</a>
        </div>
      </footer>
    </main>
  );
}
