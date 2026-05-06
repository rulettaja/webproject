const app = document.querySelector('#app');

const state = {
  lang: 'fi',
  gigs: [],
  loadError: false,
  route: 'tickets',
  user: null
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
    try { state.user = JSON.parse(decodeURIComponent(match.split('=')[1])); } catch {}
  }
})();

function copy(fiText) {
  return fiText;
}

function getRoute() {
  const hash = window.location.hash.replace('#', '');
  return hash || 'tickets';
}

function renderTickets() {
  return `
    <section class="section">
      <div class="section-header">
        <h2 class="section-heading">🎟️ Liput</h2>
      </div>

      <div class="form-card">
        <p>Valitse keikka ja osta liput:</p>
        ${createGigsMarkup(state.gigs)}
        <button class="primary-button">Osta liput</button>
      </div>
    </section>
  `;
}

function createGigsMarkup(gigs) {
  if (!gigs.length) {
    return `<p class="empty-state">Keikkoja ei löytynyt.</p>`;
  }

  return `
    <div class="performer-grid">
      ${gigs.map(g => {
        const date = new Date(g.gig_date).toLocaleDateString('fi-FI');

        return `
          <article class="performer-item">
            <span class="section-eyebrow">${g.city}</span>
            <h3>${g.band}</h3>
            <p class="meta-text">Päivä: ${date}</p>
          </article>
        `;
      }).join('')}
    </div>
  `;
}

function renderLogin() {
  return `
    <section class="section">
      <div class="section-header">
        <h2 class="section-heading">Kirjautuminen</h2>
      </div>

      <div class="form-card">
        <form class="form-stack" id="loginForm">
          <input name="username" placeholder="Käyttäjätunnus" required>
          <input type="password" name="password" placeholder="Salasana" required>
          <button type="submit" class="primary-button">Kirjaudu</button>
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
    content = renderTickets();
  }

  app.innerHTML = `
    <div class="app-shell">

      <header class="site-header">
        <h1 class="brand-title">Kallion Kulma</h1>

        <nav class="site-nav">
          <a href="#home">Etusivu</a>
          ${
            state.user
              ? `<span>👤 ${state.user.username}</span>
                 <a href="#tickets">Liput</a>
                 <a href="#" id="logoutBtn">Kirjaudu ulos</a>`
              : `<a href="#login">Kirjaudu</a>`
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
    state.gigs = await response.json();
  } catch {
    state.loadError = true;
  }
  renderApp();
}

document.addEventListener('submit', async (e) => {
  if (e.target.id !== "loginForm") return;

  e.preventDefault();

  const username = e.target.username.value;
  const password = e.target.password.value;

  const res = await fetch(apiUrl('/login'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (!res.ok) return;

  state.user = data.user;

  setTimeout(() => {
    window.location.hash = '#tickets';
  }, 500);
});

document.addEventListener('click', (e) => {
  if (e.target.id !== 'logoutBtn') return;

  document.cookie = 'gigapp_user=; expires=Thu, 01 Jan 1970 UTC; path=/;';
  state.user = null;
  window.location.hash = '#home';
  renderApp();
});

window.addEventListener('hashchange', renderApp);

renderApp();
loadGigs();
