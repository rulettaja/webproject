const app = document.querySelector('#app');

const state = {
  lang: 'fi',
  gigs: [],
  loadError: false
};

function copy(fiText, enText) {
  return state.lang === 'fi' ? fiText : enText;
}

function createGigsMarkup(gigs) {
  if (!gigs.length) {
    return `<p class="empty-state">${copy('Keikkoja ei löytynyt.', 'No gigs found.')}</p>`;
  }

  return `
    <div class="performer-grid">
      ${gigs.map(g => `
        <article class="performer-item">
          <span class="section-eyebrow">${g.city}</span>
          <h3>${g.band}</h3>
          <p class="meta-text">${copy('Päivä', 'Date')}: ${g.gig_date}</p>
          <p class="small-note">ID: ${g.gig_id}</p>
        </article>
      `).join('')}
    </div>
  `;
}

function renderApp() {
  if (!app) return;

  app.innerHTML = `
    <div class="app-shell">

      <!-- HEADER -->
      <header class="site-header">
        <div>
          <p class="brand-subtitle">${copy('Livekeikat Suomessa', 'Live gigs in Finland')}</p>
          <h1 class="brand-title">GigApp</h1>
        </div>

        <nav class="site-nav">
          <a href="#home">${copy('Etusivu', 'Home')}</a>
          <a href="#gigs">${copy('Keikat', 'Gigs')}</a>
          <a href="#login">${copy('Kirjautuminen', 'Login')}</a>
        </nav>

        <div class="lang-switcher">
          <button class="${state.lang === 'fi' ? 'is-active' : ''}" data-lang="fi">FI</button>
          <button class="${state.lang === 'en' ? 'is-active' : ''}" data-lang="en">EN</button>
        </div>
      </header>

      <!-- HERO -->
      <section class="hero" id="home">
        <article class="hero-card">
          <span class="hero-eyebrow">${copy('Tervetuloa', 'Welcome')}</span>
          <h2>${copy('Tulevat keikat yhdestä paikasta', 'Upcoming gigs in one place')}</h2>
          <p class="section-intro">
            ${copy(
              'Kaikki keikat haetaan suoraan tietokannasta API:n kautta.',
              'All gigs are fetched directly from the database via API.'
            )}
          </p>
        </article>
      </section>

      <!-- GIGS -->
      <section class="section" id="gigs">
        <div class="section-header">
          <div>
            <span class="section-eyebrow">${copy('Tulevat keikat', 'Upcoming gigs')}</span>
            <h2 class="section-heading">${copy('Keikkalista', 'Gig list')}</h2>
          </div>
        </div>

        ${state.loadError
          ? `<p class="empty-state">Error loading gigs</p>`
          : createGigsMarkup(state.gigs)}
      </section>

      <!-- LOGIN -->
      <section class="section" id="login">
        <div class="section-header">
          <h2 class="section-heading">${copy('Kirjautuminen', 'Login')}</h2>
        </div>

        <div class="form-card">
          <form class="form-stack">
            <div>
              <label>Email</label>
              <input type="email" placeholder="email@example.com">
            </div>
            <div>
              <label>${copy('Salasana', 'Password')}</label>
              <input type="password" placeholder="••••••••">
            </div>
            <button type="button" class="primary-button">
              ${copy('Kirjaudu', 'Login')}
            </button>
          </form>
        </div>
      </section>

      <!-- FOOTER -->
      <footer class="site-footer">
        <p>GigApp</p>
      </footer>
    </div>
  `;
}

async function loadGigs() {
  try {
    const response = await fetch('http://127.0.0.1:3000/gigs');

    if (!response.ok) throw new Error("API error");

    state.gigs = await response.json();

  } catch (error) {
    console.error(error);
    state.loadError = true;
  }

  renderApp();
}

/* Language switch */
document.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-lang]');
  if (!btn) return;

  state.lang = btn.dataset.lang;
  renderApp();
});

/* INIT */
renderApp();
loadGigs();
