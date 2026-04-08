const gigModel = require("../models/gigModel");

const getAllGigs = (req, res) => {
  gigModel.getAllGigs((err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
};

const getGigById = (req, res) => {
  const id = req.params.id;

  gigModel.getGigById(id, (err, results) => {
    if (err) return res.status(500).json(err);
    if (results.length === 0) return res.status(404).json({ message: "Not found" });

    res.json(results);
  });
};

module.exports = { getAllGigs, getGigById };
