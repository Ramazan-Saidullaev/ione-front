import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { GlobalHeader } from "../components/GlobalHeader";
import type { Course } from "../types";

export function HomeLandingPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  useEffect(() => {
    setCoursesLoading(true);
    setCoursesError(null);
    api
      .getCourses()
      .then(setCourses)
      .catch((e: unknown) => {
        setCourses([]);
        setCoursesError(e instanceof Error ? e.message : "Не удалось загрузить курсы");
      })
      .finally(() => setCoursesLoading(false));
  }, []);

  const ageGroups = useMemo(() => {
    const set = new Set<string>();
    for (const c of courses) {
      const v = c.ageGroup?.trim();
      if (v) set.add(v);
    }
    return Array.from(set);
  }, [courses]);

  const featuredCourses = useMemo(() => courses.slice(0, 6), [courses]);

  return (
    <main className="landing-shell byjus-landing">
      <GlobalHeader />

      <section className="byjus-hero" id="product">
        <div className="byjus-hero-inner">
          <div className="byjus-hero-copy">
            <div className="byjus-badges">
              <span className="byjus-badge">6–16 лет</span>
              <span className="byjus-badge">микро‑уроки</span>
              <span className="byjus-badge">практика</span>
            </div>

            <h1 className="byjus-h1">Жизненные навыки, которые действительно закрепляются.</h1>
            <p className="byjus-lead">
              Короткие уроки по 2–3 минуты + квиз + сценарий. Формируем финансовую грамотность, кибербезопасность,
              основы права и коммуникацию — в удобном мобильном формате.
            </p>

            <div className="byjus-cta">
              <a className="byjus-btn byjus-btn-primary" href="/auth">Начать бесплатно</a>
              <a className="byjus-btn byjus-btn-ghost" href="/public-courses">Смотреть курсы</a>
            </div>

            <div className="byjus-trust">
              <div className="byjus-trust-item">
                <strong>{coursesLoading ? "…" : courses.length}</strong>
                <span>курсов в каталоге</span>
              </div>
              <div className="byjus-trust-item">
                <strong>{coursesLoading ? "…" : ageGroups.length || "—"}</strong>
                <span>возрастных групп</span>
              </div>
              <div className="byjus-trust-item">
                <strong>2–3 минуты</strong>
                <span>на урок</span>
              </div>
            </div>

            {coursesError ? <div className="byjus-inline-error">{coursesError}</div> : null}
          </div>

          <div className="byjus-hero-media" aria-hidden="true">
            <div className="byjus-media-card">
              <img className="byjus-hero-img" src="/landing-hero.svg" alt="" />
            </div>
            <div className="byjus-float byjus-float-1">
              <strong>Прогресс</strong>
              <span>видно учителю</span>
            </div>
            <div className="byjus-float byjus-float-2">
              <strong>Обратная связь</strong>
              <span>без перегруза</span>
            </div>
          </div>
        </div>
      </section>

      <section className="byjus-section" id="catalog">
        <div className="byjus-section-head">
          <p className="byjus-kicker">Каталог</p>
          <h2 className="byjus-h2">Популярные курсы</h2>
          <p className="byjus-text">Показываем реальные курсы из вашего сервера: /api/public/courses.</p>
        </div>

        {coursesLoading ? (
          <div className="byjus-course-grid" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="byjus-course-skeleton" />
            ))}
          </div>
        ) : featuredCourses.length === 0 ? (
          <div className="byjus-empty">
            <strong>Пока нет курсов</strong>
            <span>Добавь курсы в админке — и они появятся на лендинге автоматически.</span>
          </div>
        ) : (
          <div className="byjus-course-grid">
            {featuredCourses.map((course) => (
              <a key={course.id} className="byjus-course-card" href="/public-courses">
                <div className="byjus-course-top">
                  <strong>{course.title}</strong>
                  <span className="byjus-pill">{course.ageGroup || "Для всех"}</span>
                </div>
                <p>{course.description || "Короткие уроки + квиз + сценарии для закрепления навыков."}</p>
                <div className="byjus-course-cta">
                  <span>Открыть</span>
                  <span className="byjus-arrow">→</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section className="byjus-section" id="features">
        <div className="byjus-section-head">
          <p className="byjus-kicker">Как работает</p>
          <h2 className="byjus-h2">Смотрим. Проверяем. Применяем.</h2>
          <p className="byjus-text">
            Мы сделали простой цикл обучения: микро‑урок → квиз → сценарий. Он помогает превратить знания в
            действие и удерживать регулярность.
          </p>
        </div>

        <div className="byjus-split">
          <div className="byjus-split-copy">
            <div className="byjus-step">
              <div className="byjus-step-dot">1</div>
              <div>
                <strong>Микро‑урок 2–3 минуты</strong>
                <span>Коротко и по делу — без перегруза.</span>
              </div>
            </div>
            <div className="byjus-step">
              <div className="byjus-step-dot">2</div>
              <div>
                <strong>Квиз с обратной связью</strong>
                <span>Закрепляем понимание сразу после просмотра.</span>
              </div>
            </div>
            <div className="byjus-step">
              <div className="byjus-step-dot">3</div>
              <div>
                <strong>Сценарий «как в жизни»</strong>
                <span>Выбираем вариант и видим последствия.</span>
              </div>
            </div>
            <div className="byjus-note">
              Психологический модуль — ранний «сигнал» для внимания, не медицинский диагноз.
            </div>
          </div>

          <div className="byjus-split-media" aria-hidden="true">
            <img className="byjus-figure" src="/landing-learning.svg" alt="" />
          </div>
        </div>

        <div className="byjus-grid">
          <div className="byjus-card">
            <strong>Финансовая грамотность</strong>
            <span>Бюджет, ценность денег, ежедневные решения.</span>
          </div>
          <div className="byjus-card">
            <strong>Кибербезопасность</strong>
            <span>Пароли, фишинг, защита данных.</span>
          </div>
          <div className="byjus-card">
            <strong>Право и ответственность</strong>
            <span>Понятные основы для онлайн и офлайн.</span>
          </div>
          <div className="byjus-card">
            <strong>Коммуникация</strong>
            <span>Этикет и здоровое общение.</span>
          </div>
          <div className="byjus-card">
            <strong>Учительская панель</strong>
            <span>Прогресс, результаты, зоны риска.</span>
          </div>
          <div className="byjus-card">
            <strong>Рекомендации</strong>
            <span>Подсказки по следующему шагу обучения.</span>
          </div>
        </div>
      </section>

      <section className="byjus-section" id="audience">
        <div className="byjus-section-head">
          <p className="byjus-kicker">Для кого</p>
          <h2 className="byjus-h2">Одна платформа — разные роли</h2>
        </div>

        <div className="byjus-audience">
          <div className="byjus-audience-card">
            <strong>Школьникам</strong>
            <span>Короткие уроки + практика, чтобы реально запомнить.</span>
          </div>
          <div className="byjus-audience-card">
            <strong>Учителям</strong>
            <span>Обзор прогресса и результатов без ручных таблиц.</span>
          </div>
          <div className="byjus-audience-card">
            <strong>Родителям</strong>
            <span>Понимание, что ребенок учится полезным навыкам.</span>
          </div>
        </div>

        <div className="byjus-split byjus-split-tight">
          <div className="byjus-split-media" aria-hidden="true">
            <img className="byjus-figure" src="/landing-teacher.svg" alt="" />
          </div>
          <div className="byjus-split-copy">
            <h3 className="byjus-h3">Учителю — понятная аналитика</h3>
            <p className="byjus-text">
              Кто учится регулярно, кто пропускает, какие темы вызывают трудности — всё в одном месте.
            </p>
            <div className="byjus-mini">
              <strong>Сигналы риска</strong>
              <span>Помогают заметить проблему раньше, чем она станет большой.</span>
            </div>
          </div>
        </div>
      </section>

      <section className="byjus-cta">
        <div className="byjus-cta-inner">
          <div>
            <p className="byjus-kicker">Готовы начать?</p>
            <h2 className="byjus-h2">Попробуйте бесплатно и покажите результат.</h2>
            <p className="byjus-text" style={{ margin: 0 }}>
              Для демонстрации диплома важно первое впечатление — этот экран делает его сильным.
            </p>
          </div>
          <div className="byjus-cta-actions">
            <a className="byjus-btn byjus-btn-primary" href="/auth">Регистрация</a>
            <a className="byjus-btn byjus-btn-ghost" href="/public-courses">Открыть курсы</a>
          </div>
        </div>
      </section>

      <footer className="site-footer" id="privacy">
        <div className="footer-brand">
          <strong>SanaU</strong>
          <p>Практическое микро‑обучение жизненным навыкам — с панелью учителя.</p>
        </div>
        <div className="footer-links">
          <a href="mailto:support@sanau.local">support@sanau.local</a>
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
