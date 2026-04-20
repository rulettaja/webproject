const express = require("express");
const router = express.Router();
const db = require("../db/db");

router.get("/gigs", (req, res) => {
  const sql = `
    SELECT g.gig_id, g.city, g.gig_date, b.name AS band
    FROM gig g
    JOIN band_gig_mapping bgm ON g.gig_id = bgm.gig_id
    JOIN band b ON b.band_id = bgm.band_id
    ORDER BY g.gig_date
  `;

  db.query(sql, (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

router.get("/gigs/:id", (req, res) => {
  const sql = `
    SELECT g.gig_id, g.city, g.gig_date, b.name AS band
    FROM gig g
    JOIN band_gig_mapping bgm ON g.gig_id = bgm.gig_id
    JOIN band b ON b.band_id = bgm.band_id
    WHERE g.gig_id = ?
  `;

  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) {
      return res.status(404).json({ message: "Not found" });
    }
    res.json(results);
  });
});

module.exports = router;


router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const sql = `
    SELECT * FROM users
    WHERE username = ? AND password = ?
  `;

  db.query(sql, [username, password], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = results[0];

    // Set a cookie that expires in 1 day
    res.cookie('admin', JSON.stringify({ id: user.user_id, username: user.username }), {
      httpOnly: false,   // false so JS can read it on the frontend
      maxAge: 24 * 60 * 60 * 1000, // 1 day in ms
      sameSite: 'lax'
    });

    res.json({ message: "Login successful", user });
  });
});

module.exports = router;

