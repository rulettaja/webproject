# Restaurant project template

Tämä repo on **kurssiprojektin template**, ei valmis sovellus.

Se antaa valmiin rungon seuraaville kokonaisuuksille:
- etusivu
- ravintolan viikkolista JSON-datasta
- päivän lounaan korostus
- hinnat ja erityisruokavaliot
- fi/en-kielenvaihdon perusrakenne
- asiakasnäkymän placeholderit (kirjautuminen, rekisteröityminen, ostoskori)
- admin-näkymän placeholderit (kirjautuminen, menun hallinta, tilausten hallinta)
- HSL / avoin API -integraation paikka
- backend-, SQL- ja testisuunnitelman rungot

## Mitä tässä templaatissa on oikeasti toteutettu?

### Valmiina
- responsiivinen yksi-sivuinen käyttöliittymärunko `index.html` + `js/app.js`
- mock-menu `data/menu.template.json`
- päivän listan automaattinen korostus viikonpäivän perusteella
- hinnat, annoskuvaukset ja ruokavaliotagit näkyvät listassa
- dokumentoitu API-, tietokanta- ja testirunko

### Jätetty tarkoituksella TODO-tilaan
- oikea asiakasautentikointi
- oikea adminautentikointi
- pysyvä ostoskori
- oikea Node/Express REST API
- SQL-tietokantayhteys
- tilausten tallennus ja hallinta
- avoimen API:n oikea integraatio
- integraatio- ja E2E-testien toteutus

## Projektin rakenne

```text
webproject/
├── css/style.css
├── data/menu.template.json
├── database/schema.template.sql
├── docs/api-template.md
├── index.html
├── js/app.js
├── server/README.md
├── tests/template-structure.test.js
└── tests/test-plan.md
```

## Käynnistys

Asenna riippuvuudet ja käynnistä dev-versio:

```powershell
npm install
npm start
```

Tee tuotantobuild:

```powershell
npm run build
```

Aja templaten perusrakennetesti:

```powershell
npm test
```

## Suositeltu seuraava vaiheistus

1. **Erottele frontti moduuleihin**
   - `js/components/`
   - `js/pages/`
   - `js/services/`
   - `js/i18n/`
2. **Toteuta backend-runko**
   - Express-sovellus
   - REST-reitit `menu`, `auth`, `orders`, `admin`
3. **Lisää SQL**
   - käyttäjät
   - ruokalista
   - tilaukset
4. **Liitä oikea avoin API**
   - HSL / Digitransit lähin pysäkki tai reititys
5. **Kirjoita testit**
   - vähintään 5 integraatiotestiä
   - vähintään 5 end-to-end-testiä

## Vinkki esitykseen ja tilannekatsauksiin

Voitte käyttää tätä jakoa:
- henkilö 1: etusivu + menu + responsiivisuus
- henkilö 2: auth + asiakastili + ostoskori
- henkilö 3: backend + admin + testit

## Tiedostot, joista kannattaa aloittaa
- `js/app.js` – käyttöliittymän template-logiikka
- `data/menu.template.json` – esimerkkidata
- `docs/api-template.md` – REST API -sopimusrunko
- `database/schema.template.sql` – SQL-taulujen runko
- `tests/test-plan.md` – kurssin testitavoitteiden pohja

## The Odds API integration (major scores)

Backend now exposes a proxy route:
- `GET /api/scores`

It fetches major leagues (NFL, NBA, MLB, NHL, Premier League) from The Odds API and returns normalized score cards for the frontend.

### Setup

1. Copy `.env.example` to `.env`
2. Add your API key from The Odds API:

```powershell
ODDS_API_KEY=your_real_key_here
```

> On Windows PowerShell, if you run without `.env` loading, you can also set it before starting server:

```powershell
$env:ODDS_API_KEY="your_real_key_here"
node server.js
```

### Quick test

```powershell
curl.exe http://localhost:3000/api/scores
```

If configured correctly, you will get JSON with `{ source, scores }` and scores will appear on the home page under **Major League Scores**.
