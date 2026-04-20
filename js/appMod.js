const app = document.querySelector('#app');

const state = {
  lang: 'fi',
  gigs: [],
  loadError: false,
  route: 'mod',
  user: null
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
  return hash || 'mod';
}


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

const drinkMenu = [
  {
    dayFi: 'Maanantai', dayEn: 'Monday',
    items: [
      { nameFi: 'Kulman Lager 0,4 l', nameEn: 'Corner Lager 0.4 l', price: 7.50, tags: ['DRAFT', 'LOCAL'] },
      { nameFi: 'Inkivaarilimonaadi', nameEn: 'Ginger Lemonade', price: 5.50, tags: ['NA'] }
    ]
  },
  {
    dayFi: 'Tiistai', dayEn: 'Tuesday',
    items: [
      { nameFi: 'Happy Hour Siideri 0,33 l', nameEn: 'Happy Hour Cider 0.33 l', price: 6.00, tags: ['DRAFT'] },
      { nameFi: 'Punaviini (lasi)', nameEn: 'Red Wine (glass)', price: 8.50, tags: ['WINE'] }
    ]
  },
  {
    dayFi: 'Keskiviikko', dayEn: 'Wednesday',
    items: [
      { nameFi: 'Kulman IPA 0,4 l', nameEn: 'Corner IPA 0.4 l', price: 8.00, tags: ['DRAFT', 'LOCAL'] },
      { nameFi: 'Valkoviini (lasi)', nameEn: 'White Wine (glass)', price: 8.50, tags: ['WINE'] }
    ]
  },
  {
    dayFi: 'Torstai', dayEn: 'Thursday',
    items: [
      { nameFi: 'Lonkero 0,33 l', nameEn: 'Long Drink 0.33 l', price: 6.50, tags: ['CAN'] },
      { nameFi: 'Minttulimu (NA)', nameEn: 'Mint Lemonade (NA)', price: 5.00, tags: ['NA'] }
    ]
  },
  {
    dayFi: 'Perjantai', dayEn: 'Friday', highlight: true,
    items: [
      { nameFi: 'Kulman Lager 0,5 l', nameEn: 'Corner Lager 0.5 l', price: 8.50, tags: ['DRAFT', 'LOCAL'] },
      { nameFi: 'Gin & Tonic', nameEn: 'Gin & Tonic', price: 10.00, tags: ['COCKTAIL'] },
      { nameFi: 'Alkoholiton Mojito', nameEn: 'Virgin Mojito', price: 7.00, tags: ['NA'] }
    ]
  },
  {
    dayFi: 'Lauantai', dayEn: 'Saturday', highlight: true,
    items: [
      { nameFi: 'Samppanja (lasi)', nameEn: 'Champagne (glass)', price: 12.00, tags: ['SPARKLING'] },
      { nameFi: 'Kulman Tumma 0,4 l', nameEn: 'Corner Dark Ale 0.4 l', price: 8.50, tags: ['DRAFT', 'LOCAL'] }
    ]
  },
  {
    dayFi: 'Sunnuntai', dayEn: 'Sunday',
    items: [
      { nameFi: 'Bloody Mary', nameEn: 'Bloody Mary', price: 9.50, tags: ['COCKTAIL'] },
      { nameFi: 'Appelsiinimehu', nameEn: 'Orange Juice', price: 4.50, tags: ['NA'] }
    ]
  }
];

function renderDrinkMenu() {
  return `
    <section class="section">
      <div class="section-header">
        <h2 class="section-heading">${copy('Viikon Juomalista', 'Weekly Drink Menu')}</h2>
        <span class="badge">🍺 ${copy('Viikko', 'Week')}</span>
      </div>
      <div class="menu-grid">
        ${drinkMenu.map(day => `
          <div class="menu-day${day.highlight ? ' menu-day--highlight' : ''}">
            <div class="menu-day__header">
              <h3>${copy(day.dayFi, day.dayEn)}</h3>
              ${day.highlight ? `<span class="badge">⭐ ${copy('Suosittu', 'Popular')}</span>` : ''}
            </div>
            ${day.items.map(item => `
              <div class="menu-item">
                <div class="menu-item__top">
                  <strong>${copy(item.nameFi, item.nameEn)}</strong>
                  <span class="price">${item.price.toFixed(2)} €</span>
                </div>
                <div class="tag-list">
                  ${item.tags.map(t => `<span class="tag">${t}</span>`).join('')}
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
        <h2 class="section-heading">${copy('Kirjautuminen', 'Login')}</h2>
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
          <h2>${copy('Hallinto Sivu', 'Upcoming gigs in one place')}</h2>
        </article>
      </section>

                   <!-- juoma -->
      ${renderDrinkMenu()}

      <!-- GIGS -->
      <section class="section">
        <div class="section-header">
          <h2 class="section-heading">${copy('Keikkalista', 'Gig list')}</h2>
        </div>

        ${state.loadError
      ? `<p class="empty-state">${copy('Virhe keikkojen latauksessa')}</p>`
      : createGigsMarkup(state.gigs)}
      </section>
    `;
  }

  app.innerHTML = `
    <div class="app-shell">

      <!-- HEADER -->
      <header class="site-header">
        <h1 class="brand-title">Kallion Kulma</h1>

        <nav class="site-nav">
          <a href="#home">${copy('Etusivu')}</a>
          ${state.user
    ? `<span>👤 ${state.user.username}</span> <a href="#mod">${copy('Hallintasivu')}</a> <a href="#" id="logoutBtn">${copy('Kirjaudu ulos')}</a>`
    : `<a href="#login">${copy('Kirjaudu')}</a>`}
        </nav>
      </header>

      ${content}

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


document.addEventListener('submit', async (e) => {
  if (e.target.id !== "loginForm") return;

  e.preventDefault();

  const username = e.target.username.value;
  const password = e.target.password.value;

  try {
    const res = await fetch('http://127.0.0.1:3000/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    const msg = document.querySelector("#loginMessage");

    if (!res.ok) {
      msg.textContent = "❌ " + data.message;
      return;
    }

    // SUCCESS
    msg.textContent = '✅ ' + copy('Kirjautuminen onnistui');

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
   LOGOUT HANDLER
========================= */
document.addEventListener('click', (e) => {
  if (e.target.id !== 'logoutBtn') return;
  e.preventDefault();
  // Clear the cookie
  document.cookie = 'gigapp_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  state.user = null;
  window.location.hash = '#home';
  renderApp();
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
