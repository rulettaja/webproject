const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const app = express();

const gigController = require("./controllers/gigController");
const menuController = require("./controllers/menuController");
const oddsController = require("./controllers/oddsController");

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/css", express.static(path.join(__dirname, "css")));
app.use("/js", express.static(path.join(__dirname, "js")));
app.use("/img", express.static(path.join(__dirname, "img")));
app.use("/data", express.static(path.join(__dirname, "data")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/favicon.ico", (req, res) => {
  res.sendFile(path.join(__dirname, "favicon.ico"));
});

app.get("/icon.svg", (req, res) => {
  res.sendFile(path.join(__dirname, "icon.svg"));
});

app.get("/icon.png", (req, res) => {
  res.sendFile(path.join(__dirname, "icon.png"));
});

app.get("/site.webmanifest", (req, res) => {
  res.sendFile(path.join(__dirname, "site.webmanifest"));
});

app.get("/robots.txt", (req, res) => {
  res.sendFile(path.join(__dirname, "robots.txt"));
});

app.use("/", gigController);
app.use("/menu", menuController);
app.use("/api", oddsController);

if (require.main === module) {
  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
}

module.exports = app;
