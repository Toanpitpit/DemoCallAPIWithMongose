// server.js
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const connectDB = require("./config/db");
const apiRouter = require("./routes/api");
const errorHandler = require("./middleware/errorMiddleware");

// Load environment variables (.env)
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for images
app.use("/assets", express.static(path.join(__dirname, "assets")));

// Load all models
require("./models/User");
require("./models/Category");
require("./models/Chef");
require("./models/Ingredient");
require("./models/Dish");

// Routes
app.use("/api", apiRouter);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running healthy",
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 9999;
app.listen(PORT, () => {
  console.log(`🚀 Restaurant API Server running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
});

