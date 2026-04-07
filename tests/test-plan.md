# Test plan template

Tämä ei ole vielä varsinainen testitoteutus, vaan lista kurssin vaatimusten täyttämiseen sopivista testeistä.

## Integraatiotestit (vähintään 5)
1. `POST /api/auth/register` luo uuden käyttäjän onnistuneesti
2. `POST /api/auth/login` palauttaa kirjautumistiedon validilla käyttäjällä
3. `GET /api/menu` palauttaa viikon listan ja hinnat
4. `POST /api/orders` tallentaa tilauksen ja order itemit
5. `PATCH /api/admin/menu/:id` päivittää annoksen admin-oikeuksilla

## E2E-testit (vähintään 5)
1. Etusivu latautuu ja näyttää ravintolan perustiedot
2. Ruokalista latautuu ja tämän päivän lista on korostettu
3. Asiakas voi avata rekisteröitymis- ja kirjautumisnäkymän
4. Ostoskorinäkymä näyttää tuotteet ja kokonaissumman
5. Admin voi avata hallintasivun ja nähdä tilaustaulukon

## Lighthouse / tekninen tarkistus
- suorituskyky
- saavutettavuus
- best practices
- SEO
- mobiiliresponsiivisuus

## Manuaalinen tarkistuslista
- kielenvaihto FI/EN toimii
- navigaatiolinkit vievät oikeisiin osioihin
- hinnat näkyvät kaikissa annoksissa
- erityisruokavaliot näkyvät tageina
- layout ei hajoa mobiilissa

