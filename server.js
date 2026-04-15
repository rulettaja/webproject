const express = require("express");
const cors = require("cors");

const app = express();

const gigController = require("./controllers/gigController");

app.use(cors());
app.use(express.json());

// ALL ROUTES COME FROM CONTROLLER NOW
app.use("/", gigController);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
