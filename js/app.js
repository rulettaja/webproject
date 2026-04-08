const app = document.querySelector('#app');

const state = {
  lang: 'fi',
  data: null,
  loadError: false,
};

const fallbackData = {
  restaurant: {
    name: 'Kallion Kulma',
    taglineFi: 'Korttelibaari, livemusiikkia ja viikon juomatarjoukset.',
    taglineEn: 'Neighborhood bar with live music and weekly drink specials.',
    address: 'Kallionkatu 8, 00530 Helsinki',
    openingHours: [],
  },
  announcements: [],
  weeklyMenus: [],
  performers: [],
  cartTemplate: { pickupWindow: '-', items: [] },
  adminTemplate: { sampleOrders: [] },
  transportPlaceholder: {
    provider: 'Open API placeholder',
    nearestStop: '-',
    walkMinutes: 0,
    noteFi: 'Lisää avoimen API:n data tähän.',
    noteEn: 'Add open API data here.',
  },
};

const weekdayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function copy(fiText, enText) {
  return state.lang === 'fi' ? fiText : enText;
}

function formatCurrency(value) {
  const locale = state.lang === 'fi' ? 'fi-FI' : 'en-GB';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function getDayName(menu) {
  return copy(menu.dayNameFi, menu.dayNameEn);
}

function getItemName(item) {
  return copy(item.nameFi, item.nameEn);
}

function getItemDescription(item) {
  return copy(item.descriptionFi, item.descriptionEn);
}

function getHighlightDetails(weeklyMenus) {
  if (!weeklyMenus.length) {
    return {
      key: '',
      label: copy('Ei dataa', 'No data'),
      note: copy('Lisää viikkolista JSON-tiedostoon tai API-vastaukseen.', 'Add weekly menu data to the JSON file or API response.'),
    };
  }

  const todayKey = weekdayKeys[new Date().getDay()];
  const todayMatch = weeklyMenus.find((menu) => menu.dayKey === todayKey);

  if (todayMatch) {
    return {
      key: todayMatch.dayKey,
      label: copy('Tänään', 'Today'),
      note: copy(
        'Nykyinen viikonpäivä korostuu automaattisesti käyttöliittymässä.',
        'The current weekday is highlighted automatically in the UI.'
      ),
    };
  }

  return {
    key: weeklyMenus[0].dayKey,
    label: copy('Seuraava kattaus', 'Next selection'),
    note: copy(
      'Jos tänään ei ole listaa, korostetaan seuraava saatavilla oleva juomalista.',
      'If no list is available today, the next available drink list is highlighted.'
    ),
  };
}

function getCartTotal(cartItems) {
  return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

function createAnnouncementsMarkup(announcements) {
  if (!announcements.length) {
    return `<p class="empty-state">${copy('Lisää tiedotteet JSON-dataan.', 'Add announcements to the JSON data.')}</p>`;
  }

  return `
    <ul class="info-list">
      ${announcements
        .map((announcement) => `<li>${copy(announcement.titleFi, announcement.titleEn)}</li>`)
        .join('')}
    </ul>
  `;
}

function createMenuMarkup(weeklyMenus, highlightDetails) {
  if (!weeklyMenus.length) {
    return `<p class="empty-state">${copy('Juomalistaa ei ole vielä lisätty.', 'No drinks have been added yet.')}</p>`;
  }

  return weeklyMenus
    .map((menu) => {
      const isHighlighted = menu.dayKey === highlightDetails.key;
      return `
        <article class="menu-day ${isHighlighted ? 'menu-day--highlight' : ''}">
          <div class="menu-day__header">
            <div>
              <span class="section-eyebrow">${getDayName(menu)}</span>
              <h3>${getDayName(menu)}</h3>
            </div>
            ${isHighlighted ? `<span class="badge">${highlightDetails.label}</span>` : ''}
          </div>
          ${menu.items
            .map(
              (item) => `
                <div class="menu-item">
                  <div class="menu-item__top">
                    <div>
                      <h4>${getItemName(item)}</h4>
                      <p class="meta-text">${getItemDescription(item)}</p>
                    </div>
                    <span class="price">${formatCurrency(item.price)}</span>
                  </div>
                  <div class="tag-list">
                    ${item.dietaryTags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
                  </div>
                </div>
              `
            )
            .join('')}
        </article>
      `;
    })
    .join('');
}

function createCartMarkup(cartTemplate) {
  if (!cartTemplate.items.length) {
    return `<p class="empty-state">${copy('Ostoskori on vielä tyhjä template-versiossa.', 'The cart is empty in the template version.')}</p>`;
  }

  return `
    <div class="form-card">
      <div class="inline-spread">
        <div>
          <span class="section-eyebrow">${copy('Noutoikkuna', 'Pickup window')}</span>
          <h3>${cartTemplate.pickupWindow}</h3>
        </div>
        <strong>${copy('Yhteensä', 'Total')}: ${formatCurrency(getCartTotal(cartTemplate.items))}</strong>
      </div>
      ${cartTemplate.items
        .map(
          (item) => `
            <div class="menu-item">
              <div class="menu-item__top">
                <div>
                  <h4>${copy(item.nameFi, item.nameEn)}</h4>
                  <p class="meta-text">${copy('Määrä', 'Quantity')}: ${item.quantity}</p>
                </div>
                <span class="price">${formatCurrency(item.price * item.quantity)}</span>
              </div>
            </div>
          `
        )
        .join('')}
      <div class="template-note">${copy(
        'Toteuta tähän seuraavaksi localStorage- tai backend-pohjainen ostoskorilogiikka.',
        'Next, implement a localStorage-based or backend-based cart flow here.'
      )}</div>
    </div>
  `;
}

function createOrdersMarkup(sampleOrders) {
  if (!sampleOrders.length) {
    return `<p class="empty-state">${copy('Tilauksia ei ole lisätty template-dataan.', 'No orders were added to the template data.')}</p>`;
  }

  return `
    <div class="table-card">
      <h3>${copy('Tilausten hallinta', 'Order management')}</h3>
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>${copy('Asiakas', 'Customer')}</th>
            <th>${copy('Nouto', 'Pickup')}</th>
            <th>${copy('Tila', 'Status')}</th>
          </tr>
        </thead>
        <tbody>
          ${sampleOrders
            .map(
              (order) => `
                <tr>
                  <td>${order.id}</td>
                  <td>${order.customer}</td>
                  <td>${order.pickup}</td>
                  <td><span class="status-pill">${copy(order.statusFi, order.statusEn)}</span></td>
                </tr>
              `
            )
            .join('')}
        </tbody>
      </table>
    </div>
  `;
}

function createPerformersMarkup(performers) {
  if (!performers || !performers.length) {
    return `<p class="empty-state">${copy('Esiintyjiä ei ole lisätty vielä.', 'No performers have been added yet.')}</p>`;
  }

  return `
    <div class="performer-grid">
      ${performers
        .map(
          (performer) => `
            <article class="performer-item">
              <span class="section-eyebrow">${copy(performer.genreFi, performer.genreEn)}</span>
              <h3>${performer.name}</h3>
              <p class="meta-text">${copy('Päivä', 'Day')}: ${copy(performer.dayFi, performer.dayEn)}</p>
              <p class="meta-text">${copy('Aika', 'Time')}: ${performer.time}</p>
              <p class="small-note">${copy(performer.noteFi, performer.noteEn)}</p>
            </article>
          `
        )
        .join('')}
    </div>
  `;
}

function renderApp() {
  if (!app) {
    return;
  }

  if (!state.data) {
    app.innerHTML = `
      <div class="app-shell">
        <section class="hero">
          <article class="hero-card">
            <span class="hero-eyebrow">${copy('Ladataan templatea', 'Loading template')}</span>
            <h2>${copy('Haetaan esimerkkidataa...', 'Fetching example data...')}</h2>
          </article>
        </section>
      </div>
    `;
    return;
  }

  const { restaurant, announcements, weeklyMenus, performers = [], cartTemplate, adminTemplate, transportPlaceholder } = state.data;
  const highlightDetails = getHighlightDetails(weeklyMenus);
  const highlightedMenu = weeklyMenus.find((menu) => menu.dayKey === highlightDetails.key);

  document.documentElement.lang = state.lang;
  document.title = copy('Kallion Kulma', 'Kallion Kulma');

  app.innerHTML = `
    <div class="app-shell">
      <header class="site-header">
        <div>
          <p class="brand-subtitle">${copy('Korttelibaari Helsingissa', 'Neighborhood bar in Helsinki')}</p>
          <h1 class="brand-title">${restaurant.name}</h1>
        </div>
        <nav class="site-nav" aria-label="Primary">
          <a href="#home">${copy('Etusivu', 'Home')}</a>
          <a href="#performers">${copy('Esiintyjat', 'Performers')}</a>
          <a href="#menu">${copy('Juomalista', 'Drinks')}</a>
          <a href="#customer">${copy('Asiakas', 'Customer')}</a>
          <a href="#cart">${copy('Ostoskori', 'Cart')}</a>
          <a href="#admin">${copy('Hallinta', 'Admin')}</a>
        </nav>
        <div class="lang-switcher" aria-label="Language switcher">
          <button type="button" class="lang-button ${state.lang === 'fi' ? 'is-active' : ''}" data-lang="fi">FI</button>
          <button type="button" class="lang-button ${state.lang === 'en' ? 'is-active' : ''}" data-lang="en">EN</button>
        </div>
      </header>

      <main>
        <section class="hero" id="home">
          <article class="hero-card">
            <span class="hero-eyebrow">${copy('Tervetuloa iltaan', 'Welcome to tonight')}</span>
            <h2>${copy(restaurant.taglineFi, restaurant.taglineEn)}</h2>
            <p class="section-intro">${copy(
              'Kallion Kulma on rento baari, jossa loydat viikon juomatarjoukset, tulevat keikat ja noutotilausmahdollisuuden yhdesta paikasta.',
              'Kallion Kulma is a relaxed bar where you can find weekly drink specials, upcoming live acts and pickup ordering in one place.'
            )}</p>
            <div class="hero-actions">
              <a class="primary-button" href="#menu">${copy('Avaa juomalista', 'Open drinks')}</a>
              <a class="secondary-button" href="#performers">${copy('Katso esiintyjat', 'View performers')}</a>
            </div>
            ${state.loadError ? `<p class="template-note">${copy('Esimerkkidatan lataus epäonnistui, joten näkymä käyttää varadataa.', 'Example data failed to load, so the view uses fallback data.')}</p>` : ''}
          </article>

          <aside class="panel">
            <span class="section-eyebrow">${copy('Baarin tiedot', 'Bar info')}</span>
            <h3>${copy('Sijainti ja aukiolo', 'Location and opening hours')}</h3>
            <ul class="info-list">
              <li>${restaurant.address}</li>
              ${restaurant.openingHours.map((item) => `<li>${item}</li>`).join('')}
            </ul>
            <h3>${copy('Ajankohtaista', 'Announcements')}</h3>
            ${createAnnouncementsMarkup(announcements)}
          </aside>
        </section>

        <section class="section" id="performers">
          <div class="section-header">
            <div>
              <span class="section-eyebrow">${copy('Viikon ohjelma', 'Weekly lineup')}</span>
              <h2 class="section-heading">${copy('Esiintyjalista', 'Performer list')}</h2>
            </div>
            <p class="section-intro">${copy(
              'Tahan osioon paivitat viikon DJ:t, trubaduurit ja teemalliset klubillat.',
              'Use this section to update weekly DJs, live artists and themed club nights.'
            )}</p>
          </div>
          ${createPerformersMarkup(performers)}
        </section>

        <section class="section" id="menu">
          <div class="section-header">
            <div>
              <span class="section-eyebrow">${copy('JSON-data + paivan nosto', 'JSON data + daily highlight')}</span>
              <h2 class="section-heading">${copy('Juomalista', 'Drink menu')}</h2>
            </div>
            <p class="section-intro">${copy(
              'Juomalista haetaan JSON-datasta. Voit vaihtaa lahteen myohemmin oman API:n endpointin, esimerkiksi `GET /api/menu`.',
              'The drink menu is loaded from JSON data. Later, you can switch to your own API endpoint such as `GET /api/menu`.'
            )}</p>
          </div>

          <div class="layout-grid">
            <article class="callout">
              <span class="badge">${highlightDetails.label}</span>
              <h3>${highlightedMenu ? getDayName(highlightedMenu) : copy('Ei valittua päivää', 'No selected day')}</h3>
              <p class="meta-text">${highlightDetails.note}</p>
              <div class="tag-list">
                <span class="tag">${copy('Hinnat nakyvissa', 'Pricing visible')}</span>
                <span class="tag">${copy('Juomatagit nakyvissa', 'Drink tags visible')}</span>
                <span class="tag">${copy('Paivan nosto automaattinen', 'Automatic daily highlight')}</span>
              </div>
            </article>
            <article class="panel">
              <span class="section-eyebrow">${copy('Juomatagit', 'Drink tags')}</span>
              <h3>${copy('Tagien selitteet', 'Tag legend')}</h3>
              <ul class="info-list">
                <li>DRAFT = ${copy('hanajuoma', 'draft')}</li>
                <li>COCKTAIL = ${copy('cocktail', 'cocktail')}</li>
                <li>NA = ${copy('alkoholiton', 'non-alcoholic')}</li>
                <li>LOCAL = ${copy('lahituottaja', 'local brewery')}</li>
                <li>HOT = ${copy('kuuma juoma', 'hot drink')}</li>
              </ul>
            </article>
          </div>

          <div class="menu-grid">
            ${createMenuMarkup(weeklyMenus, highlightDetails)}
          </div>
        </section>

        <section class="section" id="customer">
          <div class="section-header">
            <div>
              <span class="section-eyebrow">${copy('Asiakaspolku', 'Customer flow')}</span>
              <h2 class="section-heading">${copy('Kirjautuminen, rekisteröityminen ja profiili', 'Login, registration and profile')}</h2>
            </div>
            <p class="section-intro">${copy(
              'Nämä kortit ovat tarkoituksella placeholdereita. Lisää seuraavaksi validointi, backend-kutsut ja käyttäjän sessionhallinta.',
              'These cards are placeholders on purpose. Next, add validation, backend calls and user session management.'
            )}</p>
          </div>

          <div class="form-grid">
            <article class="form-card">
              <h3>${copy('Asiakkaan kirjautuminen', 'Customer login')}</h3>
              <form class="form-stack">
                <div>
                  <label class="field-label" for="customer-email">Email</label>
                  <input id="customer-email" type="email" placeholder="name@example.com">
                </div>
                <div>
                  <label class="field-label" for="customer-password">${copy('Salasana', 'Password')}</label>
                  <input id="customer-password" type="password" placeholder="••••••••">
                </div>
                <button type="button" class="primary-button">${copy('Lisää login-logiikka', 'Add login logic')}</button>
              </form>
              <p class="template-note">${copy(
                'TODO: POST /api/auth/login + token/session talteen.',
                'TODO: POST /api/auth/login + store token/session.'
              )}</p>
            </article>

            <article class="form-card">
              <h3>${copy('Rekisteröityminen', 'Registration')}</h3>
              <form class="form-stack">
                <div>
                  <label class="field-label" for="register-name">${copy('Nimi', 'Name')}</label>
                  <input id="register-name" type="text" placeholder="Ada Lovelace">
                </div>
                <div>
                  <label class="field-label" for="register-email">Email</label>
                  <input id="register-email" type="email" placeholder="ada@example.com">
                </div>
                <div>
                  <label class="field-label" for="register-password">${copy('Salasana', 'Password')}</label>
                  <input id="register-password" type="password" placeholder="••••••••">
                </div>
                <button type="button" class="secondary-button">${copy('Lisää register-logiikka', 'Add registration logic')}</button>
              </form>
            </article>

            <article class="feature-card">
              <h3>${copy('Asiakasprofiili', 'Customer profile')}</h3>
              <ul class="feature-list">
                <li>${copy('näytä omat tilaukset', 'show customer orders')}</li>
                <li>${copy('muokkaa noutoaikaa', 'edit pickup time')}</li>
                <li>${copy('hallinnoi suosikkeja tai allergioita', 'manage favorites or allergies')}</li>
                <li>${copy('näytä tilaushistoria', 'show order history')}</li>
              </ul>
              <div class="card-actions">
                <button type="button" class="ghost-button">${copy('Toteuta profiilisivu', 'Implement profile page')}</button>
              </div>
            </article>
          </div>
        </section>

        <section class="section" id="cart">
          <div class="section-header">
            <div>
              <span class="section-eyebrow">${copy('Ostoskori', 'Shopping cart')}</span>
              <h2 class="section-heading">${copy('Tilaus- ja noutojärjestelmän runko', 'Pickup ordering skeleton')}</h2>
            </div>
            <p class="section-intro">${copy(
              'Tässä näkyy esimerkkikori, mutta maksua tai tilauksen tallennusta ei ole vielä toteutettu.',
              'An example cart is shown here, but payment or persistent ordering is not implemented yet.'
            )}</p>
          </div>
          ${createCartMarkup(cartTemplate)}
        </section>

        <section class="section" id="admin">
          <div class="section-header">
            <div>
              <span class="section-eyebrow">${copy('Ylläpito', 'Administration')}</span>
              <h2 class="section-heading">${copy('Admin-kirjautuminen ja hallintapaneelin template', 'Admin login and dashboard template')}</h2>
            </div>
            <p class="section-intro">${copy(
              'Hallintasivu näyttää rakenteen menujen muokkaukselle ja tilausten hallinnalle, mutta ei tee vielä oikeita tallennuksia.',
              'The admin view shows the structure for menu editing and order management, but it does not yet save anything for real.'
            )}</p>
          </div>

          <div class="dashboard-grid">
            <article class="form-card">
              <h3>${copy('Ylläpidon kirjautuminen', 'Admin login')}</h3>
              <form class="form-stack">
                <div>
                  <label class="field-label" for="admin-email">Email</label>
                  <input id="admin-email" type="email" placeholder="admin@restaurant.fi">
                </div>
                <div>
                  <label class="field-label" for="admin-password">${copy('Salasana', 'Password')}</label>
                  <input id="admin-password" type="password" placeholder="••••••••">
                </div>
                <button type="button" class="primary-button">${copy('Lisää admin-auth', 'Add admin auth')}</button>
              </form>
            </article>

            <article class="form-card">
              <h3>${copy('Ruokalistan sisällön muokkaus', 'Menu content editing')}</h3>
              <form class="form-stack">
                <div>
                  <label class="field-label" for="menu-item-name">${copy('Annos', 'Dish')}</label>
                  <input id="menu-item-name" type="text" placeholder="${copy('Esim. päivän pasta', 'Example: pasta of the day')}">
                </div>
                <div>
                  <label class="field-label" for="menu-item-price">${copy('Hinta', 'Price')}</label>
                  <input id="menu-item-price" type="text" placeholder="12.90">
                </div>
                <div>
                  <label class="field-label" for="menu-item-diets">${copy('Ruokavaliotagit', 'Dietary tags')}</label>
                  <input id="menu-item-diets" type="text" placeholder="L, G, VE">
                </div>
                <button type="button" class="secondary-button">${copy('Lisää CRUD-logiikka', 'Add CRUD logic')}</button>
              </form>
              <p class="template-note">${copy(
                'TODO: liitä tämä admin-endpointteihin ja tallenna SQL-tietokantaan.',
                'TODO: connect this to admin endpoints and persist to SQL.'
              )}</p>
            </article>
          </div>

          ${createOrdersMarkup(adminTemplate.sampleOrders)}
        </section>

        <section class="section" id="roadmap">
          <div class="section-header">
            <div>
              <span class="section-eyebrow">${copy('Laajennuspolku', 'Extension path')}</span>
              <h2 class="section-heading">${copy('Backend-, SQL- ja testirunko', 'Backend, SQL and testing skeleton')}</h2>
            </div>
            <p class="section-intro">${copy(
              'Alla näkyvät suoraan ne osat, jotka kurssivaatimuksissa kannattaa toteuttaa tämän templaten jälkeen.',
              'Below are the parts you should implement next to satisfy the course requirements on top of this template.'
            )}</p>
          </div>

          <div class="feature-grid">
            <article class="feature-card">
              <span class="section-eyebrow">REST API</span>
              <h3>${copy('Oma API ruokalistalle ja tilauksille', 'Own API for menu and orders')}</h3>
              <ul class="feature-list">
                <li>GET /api/menu</li>
                <li>GET /api/menu/today</li>
                <li>POST /api/auth/login</li>
                <li>POST /api/orders</li>
                <li>PATCH /api/admin/menu/:id</li>
              </ul>
            </article>

            <article class="feature-card">
              <span class="section-eyebrow">SQL</span>
              <h3>${copy('Tietokantataulut', 'Database tables')}</h3>
              <ul class="feature-list">
                <li>users</li>
                <li>menu_days</li>
                <li>menu_items</li>
                <li>dietary_tags</li>
                <li>orders + order_items</li>
              </ul>
            </article>

            <article class="feature-card">
              <span class="section-eyebrow">Open API</span>
              <h3>${copy('HSL / Digitransit -integraatio', 'HSL / Digitransit integration')}</h3>
              <ul class="feature-list">
                <li>${transportPlaceholder.provider}</li>
                <li>${copy('Lähin pysäkki', 'Nearest stop')}: ${transportPlaceholder.nearestStop}</li>
                <li>${copy('Kävelyaika', 'Walking time')}: ${transportPlaceholder.walkMinutes} ${copy('min', 'min')}</li>
              </ul>
              <p class="small-note">${copy(transportPlaceholder.noteFi, transportPlaceholder.noteEn)}</p>
            </article>
          </div>

          <div class="layout-grid">
            <article class="timeline-card">
              <h3>${copy('Testausrunko', 'Testing skeleton')}</h3>
              <ul class="feature-list">
                <li>${copy('5 integraatiotestiä: auth, menu, order, admin, open API adapter', '5 integration tests: auth, menu, order, admin, open API adapter')}</li>
                <li>${copy('5 E2E-testiä: etusivu, menu, login, cart, admin workflow', '5 E2E tests: home, menu, login, cart, admin workflow')}</li>
                <li>${copy('Lighthouse tarkistus responsiivisuudelle ja suorituskyvylle', 'Lighthouse checks for responsiveness and performance')}</li>
              </ul>
            </article>

            <article class="todo-card">
              <h3>${copy('Tilannekatsauksen muistilista', 'Checkpoint checklist')}</h3>
              <ol class="checkpoint-list">
                <li>${copy('Mitä saatu aikaan?', 'What has been completed?')}</li>
                <li>${copy('Kuka on tehnyt mitäkin?', 'Who has done what?')}</li>
                <li>${copy('Isoimmat ongelmat tähän asti?', 'What are the biggest issues so far?')}</li>
                <li>${copy('Mitkä ovat seuraavat askeleet?', 'What are the next steps?')}</li>
              </ol>
            </article>
          </div>
        </section>
      </main>

      <footer class="site-footer">
        <p>${copy(
          'Tämä on tarkoituksella keskeneräinen template. Täydennä tästä oma backend, tietokanta, autentikointi, testit ja julkaisu.',
          'This is intentionally an unfinished template. Build your backend, database, authentication, tests and deployment on top of it.'
        )}</p>
      </footer>
    </div>
  `;
}

async function loadTemplateData() {
  renderApp();

  try {
    const response = await fetch('data/menu.template.json');

    if (!response.ok) {
      throw new Error(`Template data request failed with status ${response.status}`);
    }

    state.data = await response.json();
  } catch (error) {
    state.data = fallbackData;
    state.loadError = true;
    console.error(error);
  }

  renderApp();
}

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-lang]');

  if (!trigger) {
    return;
  }

  state.lang = trigger.dataset.lang;
  renderApp();
});

loadTemplateData();

