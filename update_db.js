const db = require("./db/db");

db.query("ALTER TABLE band_gig_mapping DROP PRIMARY KEY, ADD COLUMN mapping_id INT AUTO_INCREMENT PRIMARY KEY FIRST", (err) => {
  if (err) throw err;
  console.log("Updated table");
  db.end();
});
