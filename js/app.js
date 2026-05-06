const app = document.querySelector('#app');

const state = {
  gigs: [],
  loadError: false,
  scores: [],
  scoresError: false,
  route: 'home',
  user: null,
  gigDetail: null,
  tickets: JSON.parse(localStorage.getItem('tickets') || '[]')
};

const API_HOST = window.location.hostname || '127.0.0.1';
const API_BASE_URL = `http://${API_HOST}:3000`;

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

// Restore user from cookie if present
(function restoreSession() {
  const match = document.cookie.split('; ').find(r => r.startsWith('gigapp_user='));
  if (match) {
    try {
      state.user = JSON.parse(decodeURIComponent(match.split('=')[1]));
    } catch {}
  }
})();

function copy(fiText) {
  return fiText;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDateForInput(value) {
  if (!value) return '';
  return new Date(value).toISOString().slice(0, 10);
}

function isAdmin() {
  return state.user?.isAdmin || state.user?.username === 'admin';
}

function getRoute() {
  const hash = window.location.hash.replace('#', '');
  const parts = hash.split('/');

  if (parts[0] === 'gig' && parts[1]) {
    return { type: 'gig', id: parts[1] };
  }

  if (parts[0] === 'qr' && parts[1]) {
    return { type: 'qr', id: parts[1] };
  }

  if (parts[0] === 'match' && parts[1]) {
    return { type: 'match', id: parts[1] };
  }

  return hash || 'home';
}

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
            <button class="detail-button" data-gig-id="${g.gig_id}">
              ${copy('Lisää tietoa')}
            </button>
          </article>
        `;
  }).join('')}
    </div>
  `;
}

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
    day: 'Perjantai',
    highlight: true,
    items: [
      { name: 'Kulman Lager 0,5 l', price: 8.50, tags: ['DRAFT', 'LOCAL'] },
      { name: 'Gin & Tonic', price: 10.00, tags: ['COCKTAIL'] },
      { name: 'Alkoholiton Mojito', price: 7.00, tags: ['NA'] }
    ]
  },
  {
    day: 'Lauantai',
    highlight: true,
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

function createScoresMarkup(scores) {
  if (!scores.length) {
    return `<p class="empty-state">${copy('Ei tuloksia juuri nyt.')}</p>`;
  }

  return `
    <div class="performer-grid">
      ${scores.slice(0, 12).map(game => {
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
            <button class="detail-button" data-match-id="${game.id}">
              ${copy('Lisää tietoa')}
            </button>
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

  const alreadyBought = state.tickets.some(
    t => t.gig_id == first.gig_id && t.username === state.user?.username
  );

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

        ${
    !state.user
      ? `<p>${copy('Kirjaudu sisään ostaaksesi lipun')}</p>`
      : alreadyBought
        ? `<p>✅ ${copy('Sinulla on jo lippu tähän keikkaan')}</p>
                 <button class="qr-btn" data-gig-id="${first.gig_id}">Näytä QR</button>`
        : `<button class="primary-button buy-ticket-btn" data-gig-id="${first.gig_id}">
                   🎟️ ${copy('Osta lippu')}
                 </button>
                 <p id="ticketMessage"></p>`
  }
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
  const lastUpdateText = match.lastUpdate
    ? new Date(match.lastUpdate).toLocaleString('fi-FI')
    : copy('Ei päivitystä');

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

function renderQR(ticketId) {
  const ticket = state.tickets.find(t => t.id == ticketId);

  if (!ticket) {
    return `<p class="empty-state">QR ei löytynyt</p>`;
  }

  const qrData = `ticket:${ticket.id}|user:${ticket.username}|gig:${ticket.gig_id}`;

  return `
    <section class="section">
      <div class="section-header">
        <h1 class="section-heading">🎟️ QR Lippu</h1>
        <a href="#home">${copy('Takaisin')}</a>
      </div>

      <div class="form-card" style="text-align:center">
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrData)}"
          alt="QR lippu"
        >
        <p>${ticket.username}</p>
      </div>
    </section>
  `;
}

function getGigSummary() {
  const gigsById = new Map();

  state.gigs.forEach(gig => {
    const current = gigsById.get(gig.gig_id) || {
      gig_id: gig.gig_id,
      city: gig.city,
      gig_date: gig.gig_date,
      bands: []
    };

    current.bands.push(gig.band);
    gigsById.set(gig.gig_id, current);
  });

  return Array.from(gigsById.values()).sort(
    (a, b) => new Date(a.gig_date) - new Date(b.gig_date)
  );
}

function renderAdminPanel() {
  if (!isAdmin()) {
    return `
      <section class="section">
        <div class="section-header">
          <h1 class="section-heading">${copy('Admin')}</h1>
          <a href="#home">${copy('Takaisin')}</a>
        </div>
        <p class="empty-state">${copy('Sinulla ei ole oikeuksia admin-paneeliin.')}</p>
      </section>
    `;
  }

  const gigs = getGigSummary();
  const users = [...new Set(state.tickets.map(ticket => ticket.username))];
  const soldTickets = state.tickets.length;

  return `
    <section class="section">
      <div class="section-header">
        <div>
          <span class="section-eyebrow">${copy('Admin')}</span>
          <h1 class="section-heading">${copy('Hallintapaneeli')}</h1>
        </div>
        <a href="#home">${copy('Takaisin')}</a>
      </div>

      <div class="admin-stats">
        <article class="stat-card">
          <span class="meta-text">${copy('Keikat')}</span>
          <strong>${gigs.length}</strong>
        </article>
        <article class="stat-card">
          <span class="meta-text">${copy('Myydyt liput')}</span>
          <strong>${soldTickets}</strong>
        </article>
        <article class="stat-card">
          <span class="meta-text">${copy('Lipun ostaneet käyttäjät')}</span>
          <strong>${users.length}</strong>
        </article>
      </div>

      <section class="form-card admin-create-card">
        <div class="inline-spread">
          <h3>${copy('Luo uusi keikka')}</h3>
          <span class="status-pill">${copy('Tallentuu tietokantaan')}</span>
        </div>
        <form class="form-stack" id="adminGigForm">
          <div class="form-grid">
            <div>
              <label class="field-label" for="gigCity">${copy('Kaupunki')}</label>
              <select id="gigCity" name="city" required>
                <option value="Helsinki">Helsinki</option>
                <option value="Turku">Turku</option>
                <option value="Tampere">Tampere</option>
              </select>
            </div>
            <div>
              <label class="field-label" for="gigDate">${copy('Paiva')}</label>
              <input id="gigDate" type="date" name="gig_date" required>
            </div>
            <div>
              <label class="field-label" for="gigBand">${copy('Bandi')}</label>
              <input id="gigBand" name="band" placeholder="Electric Suns" required>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="primary-button">${copy('Luo keikka')}</button>
          </div>
          <p id="adminGigMessage" class="small-note"></p>
        </form>
      </section>

      <div class="dashboard-grid admin-dashboard">
        <section class="table-card">
          <div class="inline-spread">
            <h3>${copy('Tulevat keikat')}</h3>
            <span class="status-pill">${copy('Tietokannasta')}</span>
          </div>
          <table class="table">
            <thead>
              <tr>
                <th>${copy('Päivä')}</th>
                <th>${copy('Kaupunki')}</th>
                <th>${copy('Bändit')}</th>
                <th>${copy('Liput')}</th>
                <th>${copy('Toiminnot')}</th>
              </tr>
            </thead>
            <tbody>
              ${gigs.length ? gigs.map(gig => {
    const ticketCount = state.tickets.filter(ticket => ticket.gig_id == gig.gig_id).length;
    const date = new Date(gig.gig_date).toLocaleDateString('fi-FI');

    return `
                <tr>
                  <td>${date}</td>
                  <td>${escapeHtml(gig.city)}</td>
                  <td>${escapeHtml(gig.bands.join(', '))}</td>
                  <td>${ticketCount}</td>
                  <td>
                    <button
                      type="button"
                      class="secondary-button danger-button admin-delete-gig"
                      data-gig-id="${gig.gig_id}"
                      data-gig-label="${escapeHtml(`${gig.city} ${formatDateForInput(gig.gig_date)}`)}"
                    >
                      ${copy('Poista')}
                    </button>
                  </td>
                </tr>
              `;
  }).join('') : `
                <tr>
                  <td colspan="5">${copy('Keikkoja ei ole viela.')}</td>
                </tr>
              `}
            </tbody>
          </table>
        </section>

        <section class="table-card">
          <div class="inline-spread">
            <h3>${copy('Lipputilaukset')}</h3>
            <span class="status-pill">${copy('Selaimen tallennus')}</span>
          </div>
          ${
    state.tickets.length
      ? `
          <table class="table">
            <thead>
              <tr>
                <th>${copy('ID')}</th>
                <th>${copy('Käyttäjä')}</th>
                <th>${copy('Keikka')}</th>
              </tr>
            </thead>
            <tbody>
              ${state.tickets.map(ticket => `
                <tr>
                  <td>${ticket.id}</td>
                  <td>${ticket.username}</td>
                  <td>#${ticket.gig_id}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `
      : `<p class="empty-state">${copy('Lipputilauksia ei ole vielä.')}</p>`
  }
        </section>
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
  } else if (state.route === 'register') {
    content = renderRegister();
  } else if (state.route.type === 'qr') {
    content = renderQR(state.route.id);
  } else if (state.route === 'admin') {
    content = renderAdminPanel();
  } else if (state.route === 'mod') {
    content = `
      <section class="hero">
        <article class="hero-card">
          <span class="hero-eyebrow">${copy('Liput')}</span>
          <h2>${copy('Liput')}</h2>
        </article>
      </section>

      <section class="section">
        <div class="section-header">
          <h1 class="section-heading">${copy('Keikkakärpästen Kulma')}</h1>
        </div>

        ${
      state.loadError
        ? `<p class="empty-state">${copy('Virhe keikkojen latauksessa')}</p>`
        : createGigsMarkup(state.gigs)
    }
      </section>
    `;
  } else if (state.route.type === 'gig') {
    const gigDetails = state.gigs.filter(g => g.gig_id == state.route.id);
    content = renderGigDetail(gigDetails);
  } else if (state.route.type === 'match') {
    const matchDetails = state.scores.find(s => s.id == state.route.id);
    content = renderMatchDetail(matchDetails);
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

        ${
      state.loadError
        ? `<p class="empty-state">${copy('Virhe keikkojen latauksessa')}</p>`
        : createGigsMarkup(state.gigs)
    }
      </section>

      <section class="section">
        <div class="section-header">
          <h1>${copy('Pelimiehen Kulma')}</h1>
        </div>

        ${
      state.scoresError
        ? `<p class="empty-state">${copy('Tulosten lataus epaonnistui.')}</p>`
        : createScoresMarkup(state.scores)
    }
      </section>
    `;
  }

  app.innerHTML = `
    <div class="app-shell">
      <header class="site-header">
        <h1 class="brand-title">Kallion Kulma</h1>
        <h2 class="info">Juomat | Live-musiikki | Urheilu</h2>

        <nav class="site-nav">
          <a href="#home">${copy('Etusivu')}</a>

          ${
    state.user
      ? `<span>👤 ${state.user.username}</span>
                 <a href="#mod">${copy('Liput')}</a>
                 ${isAdmin() ? `<a href="#admin">${copy('Admin')}</a>` : ''}
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

async function loadGigs() {
  try {
    const response = await fetch(apiUrl('/gigs'));

    if (!response.ok) throw new Error();

    state.gigs = await response.json();
    state.loadError = false;
  } catch {
    state.loadError = true;
  }

  renderApp();
}

async function loadMajorScores() {
  try {
    const response = await fetch(apiUrl('/api/scores'));

    if (!response.ok) throw new Error();

    const data = await response.json();
    state.scores = data.scores || [];
    state.scoresError = false;
  } catch {
    state.scoresError = true;
  }

  renderApp();
}

document.addEventListener('click', async e => {
  if (e.target.classList.contains('buy-ticket-btn')) {
    const gigId = e.target.dataset.gigId;
    const msg = document.querySelector('#ticketMessage');

    const exists = state.tickets.some(
      t => t.gig_id == gigId && t.username === state.user.username
    );

    if (exists) {
      msg.textContent = '❌ Lippu on jo ostettu';
      return;
    }

    const ticket = {
      id: Date.now(),
      gig_id: gigId,
      username: state.user.username
    };

    state.tickets.push(ticket);
    localStorage.setItem('tickets', JSON.stringify(state.tickets));

    msg.textContent = '✅ Lippu ostettu!';

    setTimeout(() => {
      window.location.hash = `#qr/${ticket.id}`;
    }, 800);
  }

  if (e.target.classList.contains('qr-btn')) {
    const gigId = e.target.dataset.gigId;

    const ticket = state.tickets.find(
      t => t.gig_id == gigId && t.username === state.user.username
    );

    if (ticket) {
      window.location.hash = `#qr/${ticket.id}`;
    }
  }

  if (e.target.classList.contains('admin-delete-gig')) {
    const gigId = e.target.dataset.gigId;
    const label = e.target.dataset.gigLabel || `#${gigId}`;

    if (!window.confirm(`${copy('Poistetaanko keikka')} ${label}?`)) {
      return;
    }

    e.target.disabled = true;

    try {
      const res = await fetch(apiUrl(`/gigs/${gigId}`), {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || copy('Keikan poisto epaonnistui'));
      }

      state.tickets = state.tickets.filter(ticket => ticket.gig_id != gigId);
      localStorage.setItem('tickets', JSON.stringify(state.tickets));
      await loadGigs();
    } catch (err) {
      window.alert(err.message || copy('Keikan poisto epaonnistui'));
      e.target.disabled = false;
    }

    return;
  }

  if (e.target.classList.contains('detail-button')) {
    const gigId = e.target.dataset.gigId;
    const matchId = e.target.dataset.matchId;

    if (gigId) {
      window.location.hash = `#gig/${gigId}`;
    } else if (matchId) {
      window.location.hash = `#match/${matchId}`;
    }
  }

  if (e.target.id === 'logoutBtn') {
    e.preventDefault();

    document.cookie = 'gigapp_user=; expires=Thu, 01 Jan 1970 UTC; path=/;';
    state.user = null;
    window.location.hash = '#home';
    renderApp();
  }
});

document.addEventListener('submit', async e => {
  if (e.target.id !== 'adminGigForm') return;

  e.preventDefault();

  const msg = document.querySelector('#adminGigMessage');
  const submitButton = e.target.querySelector('button[type="submit"]');
  const payload = {
    city: e.target.city.value,
    gig_date: e.target.gig_date.value,
    band: e.target.band.value.trim()
  };

  msg.textContent = '';
  submitButton.disabled = true;

  try {
    const res = await fetch(apiUrl('/gigs'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.message || copy('Keikan luonti epaonnistui'));
    }

    e.target.reset();
    msg.textContent = copy('Keikka luotu tietokantaan.');
    await loadGigs();
  } catch (err) {
    msg.textContent = err.message || copy('Keikan luonti epaonnistui');
  } finally {
    submitButton.disabled = false;
  }
});

document.addEventListener('submit', async e => {
  if (e.target.id !== 'loginForm') return;

  e.preventDefault();

  const username = e.target.username.value;
  const password = e.target.password.value;
  const msg = document.querySelector('#loginMessage');

  try {
    const res = await fetch(apiUrl('/login'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = '❌ ' + data.message;
      return;
    }

    msg.textContent = '✅ OK';
    state.user = data.user;

    setTimeout(() => {
      window.location.hash = isAdmin() ? '#admin' : '#mod';
    }, 1000);
  } catch {
    msg.textContent = '❌ Kirjautuminen epäonnistui';
  }
});

document.addEventListener('submit', async e => {
  if (e.target.id !== 'registerForm') return;

  e.preventDefault();

  const username = e.target.username.value;
  const password = e.target.password.value;
  const msg = document.querySelector('#registerMessage');

  try {
    const res = await fetch(apiUrl('/register'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    if (!res.ok) {
      msg.textContent = '❌ ' + data.message;
      return;
    }

    msg.textContent = '✅ Rekisteröinti onnistui';

    setTimeout(() => {
      window.location.hash = '#login';
    }, 1000);
  } catch {
    msg.textContent = '❌ Rekisteröinti epäonnistui';
  }
});

window.addEventListener('hashchange', renderApp);

renderApp();
loadGigs();
loadMajorScores();
