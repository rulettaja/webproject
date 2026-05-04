const app = document.querySelector('#app');

const state = {
  gigs: [],
  loadError: false,
  scores: [],
  scoresError: false,
  route: 'home',
  user: null,
  gigDetail: null
};

// Restore user from cookie if present
(function restoreSession() {
  const match = document.cookie.split('; ').find(r => r.startsWith('gigapp_user='));
  if (match) {
    try { state.user = JSON.parse(decodeURIComponent(match.split('=')[1])); } catch {}
  }
})();

function copy(fiText) {
  return fiText;
}

function getRoute() {
  const hash = window.location.hash.replace('#', '');
  const parts = hash.split('/');
  if (parts[0] === 'gig' && parts[1]) {
    return { type: 'gig', id: parts[1] };
  }
  if (parts[0] === 'match' && parts[1]) {
    return { type: 'match', id: parts[1] };
  }
  return hash || 'home';
}

/* =========================
   REGISTER VIEW (NEW)
========================= */
function renderRegister() {
  return `
    <section class="section">
      <div class="section-header">
        <h2 class="section-heading">${copy('Rekisteröityminen')}</h2>
      </div>

      <div class="form-card">
        <form class="form-stack" id="registerForm">
          <div>
            <label>${copy('Kayttajatunnus')}</label>
            <input name="username" required>
          </div>
          <div>
            <label>${copy('Salasana')}</label>
            <input type="password" name="password" required>
          </div>
          <button type="submit" class="primary-button">
            ${copy('Rekisteröidy')}
          </button>
          <p id="registerMessage"></p>
        </form>
      </div>
    </section>
  `;
}

function createGigsMarkup(gigs) {
  if (!gigs.length) {
    return `<p class="empty-state">${copy('Keikkoja ei loytynyt.')}</p>`;
  }

  return `
    <div class="performer-grid">
      ${gigs.map(g => {
    const date = new Date(g.gig_date).toLocaleDateString('fi-FI');

    return `
          <article class="performer-item">
            <span class="section-eyebrow">${g.city}</span>
            <h3>${g.band}</h3>
            <p class="meta-text">${copy('Paiva')}: ${date}</p>
            <button class="detail-button" data-gig-id="${g.gig_id}">${copy('Lisää tietoa')}</button>
          </article>
        `;
  }).join('')}
    </div>
  `;
}

/* =========================
   DRINK MENU (UNCHANGED)
========================= */
const drinkMenu = [
  {
    day: 'Maanantai',
    items: [
      { name: 'Kulman Lager 0,4 l', price: 7.50, tags: ['DRAFT', 'LOCAL'] },
      { name: 'Inkivaarilimonaadi', price: 5.50, tags: ['NA'] }
    ]
  },
  {
    day: 'Tiistai',
    items: [
      { name: 'Happy Hour Siideri 0,33 l', price: 6.00, tags: ['DRAFT'] },
      { name: 'Punaviini (lasi)', price: 8.50, tags: ['WINE'] }
    ]
  },
  {
    day: 'Keskiviikko',
    items: [
      { name: 'Kulman IPA 0,4 l', price: 8.00, tags: ['DRAFT', 'LOCAL'] },
      { name: 'Valkoviini (lasi)', price: 8.50, tags: ['WINE'] }
    ]
  },
  {
    day: 'Torstai',
    items: [
      { name: 'Lonkero 0,33 l', price: 6.50, tags: ['CAN'] },
      { name: 'Minttulimu (NA)', price: 5.00, tags: ['NA'] }
    ]
  },
  {
    day: 'Perjantai', highlight: true,
    items: [
      { name: 'Kulman Lager 0,5 l', price: 8.50, tags: ['DRAFT', 'LOCAL'] },
      { name: 'Gin & Tonic', price: 10.00, tags: ['COCKTAIL'] },
      { name: 'Alkoholiton Mojito', price: 7.00, tags: ['NA'] }
    ]
  },
  {
    day: 'Lauantai', highlight: true,
    items: [
      { name: 'Samppanja (lasi)', price: 12.00, tags: ['SPARKLING'] },
      { name: 'Kulman Tumma 0,4 l', price: 8.50, tags: ['DRAFT', 'LOCAL'] }
    ]
  },
  {
    day: 'Sunnuntai',
    items: [
      { name: 'Bloody Mary', price: 9.50, tags: ['COCKTAIL'] },
      { name: 'Appelsiinimehu', price: 4.50, tags: ['NA'] }
    ]
  }
];

function renderDrinkMenu() {
  return `
    <section class="section">
      <div class="section-header">
        <h1 class="section-heading">${copy('Kippistelijän Kulma')}</h1>
        <span class="badge">🍺 ${copy('Viikko')}</span>
      </div>
      <div class="menu-grid">
        ${drinkMenu.map(day => `
          <div class="menu-day${day.highlight ? ' menu-day--highlight' : ''}">
            <div class="menu-day__header">
              <h3>${day.day}</h3>
            </div>
            ${day.items.map(item => `
              <div class="menu-item">
                <div class="menu-item__top">
                  <strong>${item.name}</strong>
                  <span class="price">${item.price.toFixed(2)} €</span>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

function renderLogin() {
  return `
    <section class="section">
      <div class="section-header">
        <h2 class="section-heading">${copy('Kirjautuminen')}</h2>
      </div>

      <div class="form-card">
        <form class="form-stack" id="loginForm">
          <div>
            <label>${copy('Kayttajatunnus')}</label>
            <input name="username" required>
          </div>
          <div>
            <label>${copy('Salasana')}</label>
            <input type="password" name="password" required>
          </div>
          <button type="submit" class="primary-button">
            ${copy('Kirjaudu')}
          </button>
          <p id="loginMessage"></p>
        </form>
      </div>
    </section>
  `;
}

function createScoresMarkup(scores) {
  if (!scores.length) {
    return `<p class="empty-state">${copy('Ei tuloksia juuri nyt.')}</p>`;
  }

  return `
    <div class="performer-grid">
      ${scores.slice(0, 12).map((game) => {
    const timeText = new Date(game.commenceTime).toLocaleString('fi-FI');
    const scoreKnown = game.homeScore !== null && game.awayScore !== null;
    const scoreText = scoreKnown
      ? `${game.homeScore} - ${game.awayScore}`
      : copy('Ei pisteita viela');

    return `
          <article class="performer-item">
            <span class="section-eyebrow">${game.sport}</span>
            <h3>${game.homeTeam} vs ${game.awayTeam}</h3>
            <p class="meta-text">${timeText}</p>
            <p><strong>${copy('Tulos')}:</strong> ${scoreText}</p>
            <button class="detail-button" data-match-id="${game.id}">${copy('Lisää tietoa')}</button>
          </article>
        `;
  }).join('')}
    </div>
  `;
}

function renderGigDetail(gig) {
  if (!gig || !gig.length) {
    return `<p class="empty-state">${copy('Keikan tietoja ei löytynyt.')}</p>`;
  }

  const first = gig[0];
  const date = new Date(first.gig_date).toLocaleDateString('fi-FI');
  const bands = gig.map(g => g.band).join(', ');

  return `
    <section class="section">
      <div class="section-header">
        <h1 class="section-heading">${copy('Keikan Tiedot')}</h1>
        <a href="#home">${copy('Takaisin')}</a>
      </div>
      <div class="form-card">
        <p><strong>${copy('Kaupunki')}:</strong> ${first.city}</p>
        <p><strong>${copy('Päivä')}:</strong> ${date}</p>
        <p><strong>${copy('Bändit')}:</strong> ${bands}</p>
      </div>
    </section>
  `;
}

function renderMatchDetail(match) {
  if (!match) {
    return `<p class="empty-state">${copy('Ottelun tietoja ei löytynyt.')}</p>`;
  }

  const timeText = new Date(match.commenceTime).toLocaleString('fi-FI');
  const scoreKnown = match.homeScore !== null && match.awayScore !== null;
  const scoreText = scoreKnown
    ? `${match.homeScore} - ${match.awayScore}`
    : copy('Ei pisteita viela');
  const completedText = match.completed ? copy('Valmis') : copy('Ei valmis');
  const lastUpdateText = match.lastUpdate ? new Date(match.lastUpdate).toLocaleString('fi-FI') : copy('Ei päivitystä');

  return `
    <section class="section">
      <div class="section-header">
        <h1 class="section-heading">${copy('Ottelun Tiedot')}</h1>
        <a href="#home">${copy('Takaisin')}</a>
      </div>
      <div class="form-card">
        <p><strong>${copy('Urheilu')}:</strong> ${match.sport}</p>
        <p><strong>${copy('Kotijoukkue')}:</strong> ${match.homeTeam}</p>
        <p><strong>${copy('Vierasjoukkue')}:</strong> ${match.awayTeam}</p>
        <p><strong>${copy('Aloitusaika')}:</strong> ${timeText}</p>
        <p><strong>${copy('Tulos')}:</strong> ${scoreText}</p>
        <p><strong>${copy('Tila')}:</strong> ${completedText}</p>
        <p><strong>${copy('Viimeisin päivitys')}:</strong> ${lastUpdateText}</p>
      </div>
    </section>
  `;
}

/* =========================
   MAIN RENDER (ORIGINAL)
========================= */
function renderApp() {
  if (!app) return;

  state.route = getRoute();

  // Prevent non-admin access to mod
  if (state.route === 'mod' && (!state.user || state.user.role !== 'admin')) {
    window.location.hash = '#home';
    state.route = 'home';
  }

  let content = '';

  if (state.route === 'login') {
    content = renderLogin();
  } else if (state.route === 'register') {
    content = renderRegister();
  } else if (state.route === 'mod') {
    content = `
      <section class="hero">
        <article class="hero-card">
          <span class="hero-eyebrow">${copy('Hallinto')}</span>
          <h2>${copy('Hallinto Sivu')}</h2>
        </article>
      </section>

      <section class="section">
        <div class="section-header">
          <h1 class="section-heading">${copy('Keikkakärpästen Kulma')}</h1>
        </div>

        ${state.loadError
      ? `<p class="empty-state">${copy('Virhe keikkojen latauksessa')}</p>`
      : createGigsMarkup(state.gigs)}
      </section>
    `;
  } else if (state.route.type === 'gig') {
    const gigDetails = state.gigs.filter(g => g.gig_id == state.route.id);
    content = renderGigDetail(gigDetails);
  } else if (state.route.type === 'match') {
    const matchDetails = state.scores.filter(s => s.id == state.route.id);
    content = renderMatchDetail(matchDetails[0]);
  } else {
    content = `
      <section class="hero">
        <article class="hero-card">
          <h1>${copy('Kun tarvitset hyvän tyypin kulmaukseesi...')}</h1>
        </article>
      </section>

      ${renderDrinkMenu()}

      <section class="section">
        <div class="section-header">
          <h1 class="section-heading">${copy('Keikkakärpästen Kulma')}</h1>
        </div>

        ${state.loadError
      ? `<p class="empty-state">${copy('Virhe keikkojen latauksessa')}</p>`
      : createGigsMarkup(state.gigs)}
      </section>

      <section class="section">
        <div class="section-header">
          <h1>${copy('Pelimiehen Kulma')}</h1>
        </div>

        ${state.scoresError
      ? `<p class="empty-state">${copy('Tulosten lataus epaonnistui.')}</p>`
      : createScoresMarkup(state.scores)}
      </section>
    `;
  }

  app.innerHTML = `
    <div class="app-shell">
      <header class="site-header">
        <h1 class="brand-title">Kallion Kulma</h1>
        <h2 class="info"> Juomat | Live-musiikki | Urheilu</h2>
        <nav class="site-nav">
          <a href="#home">${copy('Etusivu')}</a>
          ${
    state.user
      ? `<span>👤 ${state.user.username}</span>
                 ${state.user.role === 'admin' ? `<a href="#mod">${copy('Hallintasivu')}</a>` : ''}
                 <a href="#" id="logoutBtn">${copy('Kirjaudu ulos')}</a>`
      : `<a href="#login">${copy('Kirjaudu')}</a>
                 <a href="#register">${copy('Rekisteröidy')}</a>`
  }
        </nav>
      </header>

      ${content}
    </div>
  `;
}

/* =========================
   LOAD DATA
========================= */
async function loadGigs() {
  try {
    const response = await fetch('http://127.0.0.1:3000/gigs');
    if (!response.ok) throw new Error();
    state.gigs = await response.json();
  } catch {
    state.loadError = true;
  }
  renderApp();
}

async function loadMajorScores() {
  try {
    const response = await fetch('http://127.0.0.1:3000/api/scores');
    if (!response.ok) throw new Error();
    const data = await response.json();
    state.scores = data.scores || [];
  } catch {
    state.scoresError = true;
  }
  renderApp();
}

/* =========================
   LOGIN
========================= */
document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'loginForm') return;

  e.preventDefault();

  const username = e.target.username.value;
  const password = e.target.password.value;

  const res = await fetch('http://127.0.0.1:3000/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  const msg = document.querySelector('#loginMessage');

  if (!res.ok) {
    msg.textContent = '❌ ' + data.message;
    return;
  }

  msg.textContent = '✅ OK';
  state.user = data.user;

  setTimeout(() => {
    if (data.user.role === 'admin') {
      window.location.hash = '#mod';
    } else {
      window.location.hash = '#home';
    }
  }, 1000);
});

/* =========================
   REGISTER (NEW)
========================= */
document.addEventListener('submit', async (e) => {
  if (e.target.id !== 'registerForm') return;

  e.preventDefault();

  const username = e.target.username.value;
  const password = e.target.password.value;

  const res = await fetch('http://127.0.0.1:3000/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  const msg = document.querySelector('#registerMessage');

  if (!res.ok) {
    msg.textContent = '❌ ' + data.message;
    return;
  }

  msg.textContent = '✅ Rekisteröinti onnistui';

  setTimeout(() => {
    window.location.hash = '#login';
  }, 1000);
});

/* =========================
   LOGOUT
========================= */
document.addEventListener('click', (e) => {
  if (e.target.id !== 'logoutBtn') return;

  document.cookie = 'gigapp_user=; expires=Thu, 01 Jan 1970 UTC; path=/;';
  state.user = null;
  window.location.hash = '#home';
  renderApp();
});

/* =========================
   GIG DETAIL
========================= */
document.addEventListener('click', (e) => {
  if (!e.target.classList.contains('detail-button')) return;

  const gigId = e.target.dataset.gigId;
  const matchId = e.target.dataset.matchId;

  if (gigId) {
    window.location.hash = `#gig/${gigId}`;
  } else if (matchId) {
    window.location.hash = `#match/${matchId}`;
  }
});

window.addEventListener('hashchange', renderApp);

renderApp();
loadGigs();
loadMajorScores();
