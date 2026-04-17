const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const app = express();

const gigController = require("./controllers/gigController");

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// ALL ROUTES COME FROM CONTROLLER NOW
app.use("/", gigController);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
