# Kallion Kulma - käyttöohje

Kallion Kulma on selainpohjainen sivu korttelibaarille. Sivulla voi selata juomalistaa, tulevia keikkoja ja urheilutuloksia. Käyttäjä voi rekisteröityä, kirjautua sisään, ostaa keikkalipun ja näyttää lipun QR-koodina. Admin-käyttäjä voi hallita keikkoja.

Projektia voi testata osoitteessa: http://10.120.32.89/app/

## What the project does

Kallion Kulma tarjoaa baarin verkkosivun, jossa käyttäjä voi:

- katsoa viikon juomalistan
- selata tulevia keikkoja
- tarkastella urheilutuloksia
- rekisteröityä ja kirjautua sisään
- ostaa keikkalipun
- näyttää ostetun lipun QR-koodina
- käyttää admin-paneelia keikkojen hallintaan

## Why the project is useful

Projekti kokoaa baarin tärkeimmät asiakastoiminnot yhteen sivuun. Asiakas näkee juomat, tapahtumat ja liput helposti samasta paikasta. Admin-käyttäjä voi lisätä ja poistaa keikkoja ilman, että tietokantaa tarvitsee muokata käsin.

Projekti on hyödyllinen myös oppimisprojektina, koska siinä yhdistyvät frontend, Node.js/Express-backend, MySQL-tietokanta, kirjautuminen, selaimen tallennus ja ulkoinen API-integraatio.

## How users can get started with the project

Nopein tapa aloittaa on:

1. Asenna riippuvuudet komennolla `npm install`.
2. Luo MySQL-tietokanta tiedoston `db/Database_creation.txt` ohjeilla.
3. Tarkista tietokantatunnukset tiedostosta `db/db.js`.
4. Käynnistä palvelin komennolla `node server.js`.
5. Avaa selain osoitteessa `http://localhost:3000`.

Tarkemmat asennus- ja käyttöohjeet löytyvät alempaa tästä README-tiedostosta.

## Vaatimukset

- Node.js ja npm
- MySQL-palvelin
- Projektin riippuvuudet asennettuna komennolla `npm install`
- Tietokanta `band_gigs`, jonka rakenne löytyy tiedostosta `db/Database_creation.txt`
- Halutessasi urheilutuloksia varten The Odds API -avain

## Asennus

1. Avaa terminaali projektikansiossa.

```powershell
cd C:\Users\elias\Downloads\webproject
```

2. Asenna riippuvuudet.

```powershell
npm install
```

3. Luo MySQL-tietokanta ja taulut tiedoston `db/Database_creation.txt` ohjeilla.

4. Tarkista tietokantayhteys tiedostosta `db/db.js`.

Oletusasetukset ovat:

```js
host: "localhost"
user: "root"
database: "band_gigs"
```

Vaihda käyttäjä, salasana tai tietokannan nimi omalle koneellesi sopivaksi.

## Käynnistys

Käynnistä backend-palvelin:

```powershell
node server.js
```

Kun palvelin käynnistyy oikein, terminaalissa näkyy:

```text
Server running on http://localhost:3000
Connected to MySQL
```

Avaa sivu selaimessa:

```text
http://localhost:3000
```

## Sivun peruskäyttö

### Etusivu

Etusivulla näkyvät:

- Kallion Kulman pääotsikko
- viikon juomalista
- tulevat keikat
- urheilutulokset, jos API-avain on käytössä

Ylävalikosta pääsee etusivulle, kirjautumiseen ja rekisteröitymiseen. Kirjautuneelle käyttäjälle näkyy myös liput-näkymä.

### Rekisteröityminen

1. Valitse ylävalikosta `Rekisteröidy`.
2. Syötä käyttäjätunnus ja salasana.
3. Paina `Rekisteröidy`.
4. Onnistuneen rekisteröinnin jälkeen sivu ohjaa kirjautumiseen.

Käyttäjät tallennetaan MySQL-tietokannan `users`-tauluun.

### Kirjautuminen

1. Valitse ylävalikosta `Kirjaudu`.
2. Syötä käyttäjätunnus ja salasana.
3. Paina `Kirjaudu`.

Kirjautumisen jälkeen sivu tallentaa käyttäjän selaimen evästeeseen. Uloskirjautuminen tapahtuu ylävalikon `Kirjaudu ulos` -linkistä.

### Keikkojen selaaminen

Keikat näkyvät etusivulla ja liput-näkymässä. Jokaisesta keikasta näytetään:

- kaupunki
- päivämäärä
- esiintyjä tai esiintyjät

Keikan lisätiedot avautuvat painikkeesta `Lisää tietoa`.

### Lipun ostaminen

1. Kirjaudu sisään.
2. Avaa keikan lisätiedot.
3. Paina `Osta lippu`.
4. Sivusto luo lipun ja ohjaa QR-lippunäkymään.

Liput tallentuvat selaimen `localStorage`-muistiin. Tämä tarkoittaa, että liput ovat selain- ja laitekohtaisia.

### QR-lippu

Oston jälkeen sivu näyttää QR-koodin. Jos käyttäjä on jo ostanut lipun samaan keikkaan, keikan tiedoissa näkyy painike `Näytä QR`.

QR-koodi luodaan ulkoisen palvelun kautta osoitteesta:

```text
https://api.qrserver.com
```

## Admin-käyttö

Admin-paneeliin pääsee käyttäjällä:

```text
käyttäjätunnus: admin
salasana: admin
```

Admin-käyttäjällä ylävalikkoon ilmestyy `Admin`-linkki.

Admin-paneelissa voi:

- nähdä keikkojen määrän
- nähdä myytyjen lippujen määrän
- luoda uuden keikan
- poistaa keikan
- tarkastella selaimeen tallentuneita lipputilauksia

Uuden keikan luonti tallentaa keikan MySQL-tietokantaan. Poisto poistaa keikan ja sen bändikytkennät tietokannasta.

## Urheilutulokset

Urheilutulokset haetaan backendin kautta reitistä:

```text
GET /api/scores
```

Jos haluat tulokset näkyviin, lisää `.env`-tiedostoon The Odds API -avain:

```powershell
ODDS_API_KEY=oma_api_avain
```

Käynnistä palvelin uudelleen muutoksen jälkeen.

Jos avainta ei ole tai haku epäonnistuu, sivu näyttää virheilmoituksen urheilutulosten kohdalla. Muu sivu toimii silti.

## Hyödylliset komennot

Käynnistä sovellus backendin kautta:

```powershell
node server.js
```

Käynnistä webpack-kehityspalvelin:

```powershell
npm start
```

Huomio: webpack-kehityspalvelin avaa frontendin erikseen, mutta sovellus hakee API-dataa edelleen osoitteesta `http://localhost:3000`. Pidä siis myös `node server.js` käynnissä, jos haluat kirjautumisen, keikat ja urheilutulokset toimimaan.

Tee tuotantobuild:

```powershell
npm run build
```

Aja rakennetesti:

```powershell
npm test
```

## Projektin tärkeät tiedostot

- `index.html` - sivun HTML-runko
- `css/style.css` - sivun tyylit
- `js/app.js` - käyttöliittymän logiikka
- `server.js` - Express-palvelimen käynnistys
- `controllers/gigController.js` - keikat, kirjautuminen ja rekisteröinti
- `controllers/oddsController.js` - urheilutulosten haku
- `db/db.js` - MySQL-yhteys
- `db/Database_creation.txt` - tietokannan luontiohje

## Yleisimmät ongelmat

### Sivu aukeaa, mutta keikat eivät näy

Tarkista, että `node server.js` on käynnissä ja MySQL-yhteys toimii.

### Palvelin ei käynnisty

Tarkista, että MySQL on käynnissä ja `db/db.js` sisältää oikeat tunnukset.

### Kirjautuminen ei onnistu

Tarkista, että `users`-taulu on luotu ja että siellä on käyttäjä. Admin-käyttäjä lisätään `db/Database_creation.txt`-tiedoston lopussa.

### Urheilutulokset eivät näy

Tarkista `.env`-tiedoston `ODDS_API_KEY`. Ilman kelvollista API-avainta urheilutulokset eivät lataudu.

## Where users can get help with your project

Apua saa tästä README-tiedostosta sekä sähköpostitse:

```text
eliaskko@metropolia.fi
```

## Who maintains and contributes to the project

Projektia ylläpitävät ja siihen osallistuvat:

- Roope Rajala
- Elias Koistinen
