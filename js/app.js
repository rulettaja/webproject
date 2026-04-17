const app = document.querySelector('#app');

const state = {
  lang: 'fi',
  gigs: [],
  loadError: false,
  route: 'home',
  user: null // NEW (for login state)
};

function copy(fiText, enText) {
  return state.lang === 'fi' ? fiText : enText;
}

/* =========================
   ROUTING
========================= */
function getRoute() {
  const hash = window.location.hash.replace('#', '');
  return hash || 'home';
}

/* =========================
   GIGS VIEW
========================= */
function createGigsMarkup(gigs) {
  if (!gigs.length) {
    return `<p class="empty-state">${copy('Keikkoja ei löytynyt.', 'No gigs found.')}</p>`;
  }

  return `
    <div class="performer-grid">
      ${gigs.map(g => {
        const date = new Date(g.gig_date).toLocaleDateString('fi-FI');

        return `
          <article class="performer-item">
            <span class="section-eyebrow">${g.city}</span>
            <h3>${g.band}</h3>
            <p class="meta-text">${copy('Päivä', 'Date')}: ${date}</p>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

/* =========================
   LOGIN VIEW
========================= */
function renderLogin() {
  return `
    <section class="section">
      <div class="section-header">
        <h2 class="section-heading">${copy('Kirjautuminen', 'Login')}</h2>
      </div>

      <div class="form-card">
        <form class="form-stack" id="loginForm">
          <div>
            <label>Username</label>
            <input name="username" required>
          </div>
          <div>
            <label>${copy('Salasana', 'Password')}</label>
            <input type="password" name="password" required>
          </div>
          <button type="submit" class="primary-button">
            ${copy('Kirjaudu', 'Login')}
          </button>
          <p id="loginMessage"></p>
        </form>
      </div>
    </section>
  `;
}

/* =========================
   MAIN RENDER
========================= */
function renderApp() {
  if (!app) return;

  state.route = getRoute();

  let content = '';

  if (state.route === 'login') {
    content = renderLogin();
  } else {
    content = `
      <!-- HERO -->
      <section class="hero">
        <article class="hero-card">
          <span class="hero-eyebrow">${copy('Tervetuloa', 'Welcome')}</span>
          <h2>${copy('Tulevat keikat yhdestä paikasta', 'Upcoming gigs in one place')}</h2>
        </article>
      </section>

      <!-- GIGS -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-heading">${copy('Keikkalista', 'Gig list')}</h2>
        </div>

        ${state.loadError
          ? `<p class="empty-state">Error loading gigs</p>`
          : createGigsMarkup(state.gigs)}
      </section>
    `;
  }

  app.innerHTML = `
    <div class="app-shell">

      <!-- HEADER -->
      <header class="site-header">
        <h1>GigApp</h1>

        <nav class="site-nav">
          <a href="#home">Home</a>
          <a href="#login">Login</a>
        </nav>
      </header>

      ${content}

    </div>
  `;
}

/* =========================
   LOAD GIGS
========================= */
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

/* =========================
   LOGIN HANDLER (IMPORTANT)
========================= */
document.addEventListener('submit', async (e) => {
  if (e.target.id !== "loginForm") return;

  e.preventDefault();

  const username = e.target.username.value;
  const password = e.target.password.value;

  try {
    const res = await fetch('http://127.0.0.1:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    const msg = document.querySelector("#loginMessage");

    if (!res.ok) {
      msg.textContent = "❌ " + data.message;
      return;
    }

    // SUCCESS
    msg.textContent = "✅ Login successful";

    state.user = data.user;

    // redirect to home after login
    setTimeout(() => {
      window.location.hash = '#home';
    }, 1000);

  } catch (err) {
    console.error(err);
  }
});

/* =========================
   ROUTE CHANGE
========================= */
window.addEventListener('hashchange', renderApp);

/* =========================
   INIT
========================= */
renderApp();
loadGigs();
