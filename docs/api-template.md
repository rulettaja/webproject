# API template

Tämä tiedosto kuvaa **suositellun REST-rungon** ravintolaprojektin backendiin.

## Base URL
- Development: `http://localhost:3000/api`
- Production: päätetään julkaisuympäristön mukaan

## 1) Public menu

### `GET /menu`
Palauttaa koko viikkolistan.

Esimerkkivaste:

```json
{
  "restaurant": { "name": "Bistro Aurora" },
  "weeklyMenus": [
    {
      "dayKey": "monday",
      "items": [
        {
          "id": 1,
          "nameFi": "Paahdettu tomaattikeitto",
          "nameEn": "Roasted tomato soup",
          "price": 11.5,
          "dietaryTags": ["L", "G*"]
        }
      ]
    }
  ]
}
```

### `GET /menu/today`
Palauttaa tämän päivän lounaan korostettuna näkymää varten.

## 2) Customer auth

### `POST /auth/register`
Luo uuden asiakkaan.

Pyynnön body:

```json
{
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "secret123"
}
```

### `POST /auth/login`
Kirjaa asiakkaan sisään.

### `GET /auth/me`
Palauttaa kirjautuneen asiakkaan profiilin.

## 3) Cart and ordering

### `POST /cart/items`
Lisää tuotteen ostoskoriin.

### `PATCH /cart/items/:id`
Päivittää määrän.

### `DELETE /cart/items/:id`
Poistaa tuotteen korista.

### `POST /orders`
Luo noutotilauksen.

### `GET /orders/me`
Näyttää asiakkaan omat tilaukset.

## 4) Admin auth

### `POST /admin/login`
Kirjaa ylläpidon sisään.

## 5) Admin management

### `POST /admin/menu`
Lisää uuden ruoka-annoksen.

### `PATCH /admin/menu/:id`
Muokkaa annosta.

### `DELETE /admin/menu/:id`
Poistaa annoksen.

### `GET /admin/orders`
Listaa kaikki tilaukset.

### `PATCH /admin/orders/:id`
Päivittää tilauksen tilan.

## 6) Open API adapter

### `GET /transport/nearby`
Palauttaa ravintolan sijaintiin liittyvän avoimen API:n datan.

Suositus:
- käytä HSL / Digitransit -rajapintaa
- näytä esim. lähin pysäkki, kävelyaika tai reittiehdotus
- kapseloi ulkoinen API omaan palveluluokkaansa, esim. `services/hslService.js`

## Tietoturva- ja validointimuistio
- hashää salasanat
- validoi inputit
- tarkista admin-oikeudet middlewarella
- älä palauta salasanoja vastauksissa
- lisää virhepalautuksiin selkeä statuskoodi + viesti

