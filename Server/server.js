const express = require("express");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const PORT = process.env.PORT || 7000;
const mongoURL = process.env.MongoDB_URL;

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const petRoutes = require("./routes/petRoutes");
const adoptionRoutes = require("./routes/adoptionRoutes");

// Database connection
mongoose.connect(mongoURL)
  .then(() => 
    console.log("MongoDB connected"))
  .catch((error) => 
    console.log("Database connection failed:", error)
);

// Middleware
app.use(bodyParser.json());
app.use("/api/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/pet", petRoutes);
app.use("/adoption", adoptionRoutes);

// Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
