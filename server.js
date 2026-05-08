const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

const app = express();

const gigController = require("./controllers/gigController");
const menuController = require("./controllers/menuController");
const oddsController = require("./controllers/oddsController");

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('.'));

app.use("/", gigController);
app.use("/menu", menuController);
app.use("/api", oddsController);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
