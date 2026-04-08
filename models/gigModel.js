const db = require("../db/db");

const getAllGigs = (callback) => {
  const sql = `
    SELECT g.gig_id, g.city, g.gig_date, b.name AS band
    FROM gig g
    JOIN band_gig_mapping bgm ON g.gig_id = bgm.gig_id
    JOIN band b ON b.band_id = bgm.band_id
    ORDER BY g.gig_date
  `;

  db.query(sql, callback);
};

const getGigById = (id, callback) => {
  const sql = `
    SELECT g.gig_id, g.city, g.gig_date, b.name AS band
    FROM gig g
    JOIN band_gig_mapping bgm ON g.gig_id = bgm.gig_id
    JOIN band b ON b.band_id = bgm.band_id
    WHERE g.gig_id = ?
  `;

  db.query(sql, [id], callback);
};

module.exports = { getAllGigs, getGigById };
