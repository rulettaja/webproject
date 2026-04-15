const express = require("express");
const cors = require("cors");

const app = express();
const gigRoutes = require("./routes/gigRoutes");

app.use(cors()); // 👈 ADD THIS
app.use(express.json());
app.use("/", gigRoutes);

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});
