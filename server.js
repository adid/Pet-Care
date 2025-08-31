const express = require("express");
const path = require("path");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();
const PORT = Number(process.env.PORT) || 7000;
const mongoURL = process.env.MongoDB_URL || process.env.MONGO_URL;

const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const petRoutes = require("./routes/petRoutes");
const adoptionRoutes = require("./routes/adoptionRoutes");
const shopRoutes = require("./routes/shopRoutes");
const careRoutes = require("./routes/careRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const favoriteRoutes = require("./routes/favoriteRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
// Database connection
mongoose
  .connect(mongoURL)
  .then(() => console.log("MongoDB connected"))
  .catch((error) => console.log("Database connection failed:", error));

// Frontend CORS configuration (permissive for dev)
app.use(
  cors({
    origin: (origin, cb) => cb(null, true),
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files from uploads directory
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/profile", profileRoutes);
app.use("/pet", petRoutes);
app.use("/adoption", adoptionRoutes);
app.use("/shop", shopRoutes);
app.use("/api/care", careRoutes);
app.use("/notifications", notificationRoutes);
app.use("/favorite", favoriteRoutes);

app.use("/api/bookings", bookingRoutes);

// Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
