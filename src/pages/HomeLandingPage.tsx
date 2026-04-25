import { GlobalHeader } from "../components/GlobalHeader";

export function HomeLandingPage() {
  return (
    <main className="landing-shell">
      <GlobalHeader />

      <section className="landing-hero">
        <div className="hero-panel landing-panel">
          <p className="eyebrow">Қазақстандағы оқушылар, ата-аналар және мұғалімдер үшін</p>
          <h1>Өмірге қажет дағдылар — күніне бірнеше минутта.</h1>
          <p className="lead">Қысқа видеолар, жылдам тесттер және шешім қабылдау тапсырмалары 6–16 жас аралығындағы оқушыларға қаржылық сауаттылық пен өмірлік ойлауды дамытуға көмектеседі — мұғалімдер үшін түсінікті прогресс бақылауымен.</p>
          <div className="landing-actions">
            <a className="primary-link-button" href="/auth">
              Тегін бастау
            </a>
            <a className="secondary-link-button" href="/public-courses">
              Курстарды қарау
            </a>
            <a className="secondary-link-button" href="#about">
              Қалай жұмыс істейді
            </a>
          </div>
          <div className="trust-strip">
            <span>Смартфонға бейімделген микрооқу</span>
            <span>2–3 минуттық сабақтар</span>
            <span>Теория емес — практика</span>
          </div>
        </div>

        <div className="landing-feature-grid hero-side-grid">
          <article className="card signal-card">
            <p className="eyebrow">Сіз не аласыз</p>
            <h2>Оқу прогресі анық көрінеді — пайдалы дағдылар тез бекітіледі.</h2>
            <ul className="clean-list">
              <li>Смартфонға арналған микро-сабақтар</li>
              <li>Әр сабақтан кейін тест және шешім тапсырмасы</li>
              <li>Мұғалімдерге арналған панель және жеңіл аналитика</li>
            </ul>
          </article>

          <div className="stats-grid">
            <article className="stat-card">
              <strong>Дағдылар</strong>
              <span>Ақша, таңдау, күнделікті ойлау</span>
            </article>
            <article className="stat-card">
              <strong>Тексеру</strong>
              <span>Бекітуге арналған жылдам тесттер</span>
            </article>
            <article className="stat-card">
              <strong>Түсінік</strong>
              <span>Оңай қадағаланатын прогресс</span>
            </article>
            <article className="stat-card">
              <strong>Бағыт</strong>
              <span>Ережеге негізделген оқу жолдары</span>
            </article>
          </div>
        </div>
      </section>

      <section className="landing-sections two-column" id="about">
        <div className="card feature-card">
          <div className="section-heading">
            <p className="eyebrow">Мәселе</p>
            <h2>Оқушыларға өмірлік дағдылар керек — бірақ оқу әлі де тым теориялық.</h2>
          </div>
          <p className="lead compact-lead">
            Көптеген оқушылардың қаржылық сауаттылығы мен шешім қабылдау дағдылары жеткіліксіз. 
          </p>
          <div className="bullet-grid">
            <div className="mini-feature">
              <strong>Қызығушылық төмен</strong>
              <p>Ұзақ, теорияға негізделген сабақтар қазіргі оқу әдетіне сай емес.</p>
            </div>
            <div className="mini-feature">
              <strong>Дағды алшақтығы</strong>
              <p>Ақша, таңдау және нақты жағдайлар үшін практикалық ойлау керек.</p>
            </div>
            <div className="mini-feature">
              <strong>Қадағалау қиын</strong>
              <p>Қарапайым панельсіз прогресс пен әл-ауқат сигналдарын байқамай қалу оңай.</p>
            </div>
          </div>
        </div>

        <div className="card feature-card">
          <div className="section-heading">
            <p className="eyebrow">Шешім</p>
            <h2>Табиғи қабылданатын микрооқу — маңызды дағдыларды қалыптастырады.</h2>
          </div>
          <div className="bullet-grid">
            <div className="mini-feature">
              <strong>2–3 минуттық сабақтар</strong>
              <p>Назарды ұстап, қарқынды сақтайтын қысқа видеолар.</p>
            </div>
            <div className="mini-feature">
              <strong>Дереу практика</strong>
              <p>Әр сабақтан кейін тест және шешім тапсырмасы.</p>
            </div>
            <div className="mini-feature">
              <strong>Жекелендірілген жол</strong>
              <p>Ережеге негізделген ұсыныстар оқуды мақсатты әрі қолжетімді етеді.</p>
            </div>
          </div>
          <div className="highlight-box">
            <strong>Мұғалімге ыңғайлы</strong>
            <p>Панельдер прогресті оңай бақылауға және дер кезінде қолдауға мүмкіндік береді.</p>
          </div>
        </div>
      </section>

      <section className="landing-sections" id="features">
        <div className="section-header-block">
          <p className="eyebrow">Негізгі мүмкіндіктер</p>
          <h2>Практикалық оқу үшін қажетінің бәрі — бір платформада.</h2>
        </div>
        <div className="feature-grid-wide">
          <article className="card feature-card">
            <h3>Интерактивті микрооқу</h3>
            <p>Аяқтауға да, қайталауға да оңай қысқа сабақтар.</p>
          </article>
          <article className="card feature-card">
            <h3>Тесттер және шешім тапсырмалары</h3>
            <p>Жылдам тексеріспен білімді әрекетке айналдырыңыз.</p>
          </article>
          <article className="card feature-card">
            <h3>Әл-ауқатты скрининг (прототип)</h3>
            <p>Оқушының жағдайын бақылап, тәуекелді ерте байқауға арналған жеңіл модуль.</p>
          </article>
          <article className="card feature-card">
            <h3>Мұғалім панелі</h3>
            <p>Прогресті бақылаңыз, аяқталғанын көріңіз, оқушыға тезірек көмектесіңіз.</p>
          </article>
        </div>
      </section>

      <section className="landing-sections" id="steps">
        <div className="section-header-block">
          <p className="eyebrow">Қалай жұмыс істейді</p>
          <h2>Оқушыға түсінікті жол — мұғалімге бақыланатын процесс.</h2>
        </div>
        <div className="steps-grid">
          <article className="step-card">
            <span>01</span>
            <h3>Бағыт таңдаңыз</h3>
            <p>Тақырып таңдаңыз немесе ұсынылған оқу жолымен жүріңіз.</p>
          </article>
          <article className="step-card">
            <span>02</span>
            <h3>Бірнеше минутта үйреніңіз</h3>
            <p>Смартфонға лайық 2–3 минуттық видеоны қараңыз.</p>
          </article>
          <article className="step-card">
            <span>03</span>
            <h3>Практика және тексеру</h3>
            <p>Материалды бекіту үшін тест пен шешім тапсырмасын орындаңыз.</p>
          </article>
          <article className="step-card">
            <span>04</span>
            <h3>Прогресті бақылаңыз</h3>
            <p>Мұғалім панельден прогресті көріп, дер кезінде қолдай алады.</p>
          </article>
        </div>
      </section>

      <section className="landing-sections" id="reviews">
        <div className="section-header-block">
          <p className="eyebrow">Пайдасы</p>
          <h2>Оқушыға арналған — мұғалімге де пайдалы.</h2>
        </div>
        <div className="feature-grid-wide">
          <article className="card testimonial-card">
            <p>"Балам оқуын ұнататын болды — қысқа сабақтар тұрақты оқуға көмектеседі."</p>
            <strong>7-сынып оқушысының ата-анасы</strong>
          </article>
          <article className="card testimonial-card">
            <p>"Панель кімге қолдау керек екенін болжаусыз-ақ түсінуге көмектеседі."</p>
            <strong>Сынып жетекшісі</strong>
          </article>
          <article className="card testimonial-card">
            <p>"Шешім тапсырмалары жаттаудан гөрі өмірлік ойлауды дамытады."</p>
            <strong>Педагог</strong>
          </article>
        </div>
      </section>

      <section className="cta-banner">
        <div>
          <p className="eyebrow">Бастауға дайынсыз ба?</p>
          <h2>Оқуды практикалық, қызықты және өмірге жақын етіңіз.</h2>
        </div>
        <a className="primary-link-button" href="/auth">
          Тегін бастау
        </a>
      </section>

      <footer className="site-footer" id="privacy">
        <div className="footer-brand">
          <strong>SanaU</strong>
          <p>Оқушыларға арналған практикалық микрооқу — мұғалімдерге арналған құралдармен.</p>
        </div>
        <div className="footer-links">
          <a href="mailto:support@sanau.local">support@sanau.local</a>
          <a href="https://t.me/" target="_blank" rel="noreferrer">
            Telegram
          </a>
          <a href="https://instagram.com/" target="_blank" rel="noreferrer">
            Instagram
          </a>
          <a href="/auth">Кіру</a>
          <a href="#privacy">Құпиялық саясаты</a>
        </div>
      </footer>
    </main>
  );
}
