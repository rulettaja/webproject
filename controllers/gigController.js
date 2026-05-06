const express = require("express");
const router = express.Router();
const db = require("../db/db");

function getSessionUser(req) {
  const rawUser = req.cookies?.gigapp_user;

  if (!rawUser) return null;

  try {
    return JSON.parse(rawUser);
  } catch {
    return null;
  }
}

function requireAdmin(req, res) {
  const user = getSessionUser(req);

  if (!user || (user.username !== "admin" && !user.isAdmin)) {
    res.status(403).json({ message: "Admin access required" });
    return false;
  }

  return true;
}

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

router.post("/gigs", (req, res) => {
  if (!requireAdmin(req, res)) return;

  const { city, gig_date: gigDate, band } = req.body;
  const allowedCities = ["Helsinki", "Turku", "Tampere"];
  const bandName = String(band || "").trim();

  if (!allowedCities.includes(city) || !gigDate || !bandName) {
    return res.status(400).json({ message: "City, date and band are required" });
  }

  db.beginTransaction((transactionErr) => {
    if (transactionErr) return res.status(500).json(transactionErr);

    const rollback = (err) => {
      db.rollback(() => res.status(500).json(err));
    };

    db.query(
      "INSERT INTO gig (city, gig_date) VALUES (?, ?)",
      [city, gigDate],
      (gigErr, gigResult) => {
        if (gigErr) return rollback(gigErr);

        const gigId = gigResult.insertId;

        db.query(
          "SELECT band_id FROM band WHERE name = ? LIMIT 1",
          [bandName],
          (bandErr, bands) => {
            if (bandErr) return rollback(bandErr);

            const linkBand = (bandId) => {
              db.query(
                "INSERT INTO band_gig_mapping (band_id, gig_id) VALUES (?, ?)",
                [bandId, gigId],
                (mappingErr) => {
                  if (mappingErr) return rollback(mappingErr);

                  db.commit((commitErr) => {
                    if (commitErr) return rollback(commitErr);

                    res.status(201).json({
                      message: "Gig created",
                      gig_id: gigId,
                      city,
                      gig_date: gigDate,
                      band: bandName
                    });
                  });
                }
              );
            };

            if (bands.length > 0) {
              linkBand(bands[0].band_id);
              return;
            }

            db.query(
              "INSERT INTO band (name) VALUES (?)",
              [bandName],
              (newBandErr, newBandResult) => {
                if (newBandErr) return rollback(newBandErr);
                linkBand(newBandResult.insertId);
              }
            );
          }
        );
      }
    );
  });
});

router.delete("/gigs/:id", (req, res) => {
  if (!requireAdmin(req, res)) return;

  const gigId = Number(req.params.id);

  if (!Number.isInteger(gigId) || gigId <= 0) {
    return res.status(400).json({ message: "Invalid gig id" });
  }

  db.beginTransaction((transactionErr) => {
    if (transactionErr) return res.status(500).json(transactionErr);

    const rollback = (err, status = 500) => {
      db.rollback(() => res.status(status).json(err));
    };

    db.query("DELETE FROM band_gig_mapping WHERE gig_id = ?", [gigId], (mappingErr) => {
      if (mappingErr) return rollback(mappingErr);

      db.query("DELETE FROM gig WHERE gig_id = ?", [gigId], (gigErr, result) => {
        if (gigErr) return rollback(gigErr);

        if (result.affectedRows === 0) {
          return rollback({ message: "Gig not found" }, 404);
        }

        db.commit((commitErr) => {
          if (commitErr) return rollback(commitErr);

          res.json({ message: "Gig deleted" });
        });
      });
    });
  });
});

router.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const checkSql = `SELECT * FROM users WHERE username = ?`;

  db.query(checkSql, [username], (err, results) => {
    if (err) return res.status(500).json(err);

    if (results.length > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const insertSql = `
      INSERT INTO users (username, password)
      VALUES (?, ?)
    `;

    db.query(insertSql, [username, password], (err) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "User registered successfully" });
    });
  });
});

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
    const sessionUser = {
      id: user.user_id,
      username: user.username,
      isAdmin: user.username === "admin"
    };

    res.cookie('gigapp_user', JSON.stringify(sessionUser), {
      httpOnly: false,
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
      sameSite: 'lax'
    });

    res.json({ message: "Login successful", user: sessionUser });
  });
});

module.exports = router;
