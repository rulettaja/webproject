# Backend template

Tähän kansioon kannattaa rakentaa Node.js + Express -backend.

## Suositeltu rakenne

```text
server/
├── app.js
├── routes/
│   ├── menuRoutes.js
│   ├── authRoutes.js
│   ├── orderRoutes.js
│   └── adminRoutes.js
├── controllers/
├── services/
├── middleware/
└── db/
```

## Ensimmäiset toteutettavat asiat
1. `GET /api/menu`
2. `GET /api/menu/today`
3. `POST /api/auth/register`
4. `POST /api/auth/login`
5. `POST /api/orders`
6. `GET /api/admin/orders`

## TODO
- lisää `express`
- lisää tietokantakirjasto (esim. `sqlite3`, `better-sqlite3`, `mysql2` tai `pg`)
- lisää ympäristömuuttujat
- lisää autentikointimiddleware
- lisää validointi
- lisää integraatiotestit

