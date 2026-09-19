const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const apiRoutes = require("./routes/api.js");

// Load environment variables
dotenv.config();

// Safely load puppeteer (may not be available in minimal serverless environments)
let puppeteer = null;
try {
  puppeteer = require("puppeteer");
} catch (err) {
  console.warn("⚠️ Puppeteer not loaded:", err.message);
}

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/ai_resume";

// Make puppeteer accessible
app.set("puppeteer", puppeteer);

// Flexible CORS setup supporting comma-separated origins and *.vercel.app domains
const configuredOrigins = FRONTEND_ORIGIN.split(",").map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (
        configuredOrigins.includes("*") ||
        configuredOrigins.includes(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-id"],
  }),
);
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false, limit: "5mb" }));

// Serve static files from the 'data' directory
app.use("/data", express.static("data"));

// Cached MongoDB connection helper for both standard and serverless runtimes
let cachedDbPromise = null;
async function connectDB() {
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }
  if (!cachedDbPromise) {
    cachedDbPromise = mongoose
      .connect(MONGO_URI)
      .then((m) => {
        console.log("✅ MongoDB connected");
        return m;
      })
      .catch((err) => {
        cachedDbPromise = null;
        console.error("❌ MongoDB connection error:", err);
        throw err;
      });
  }
  return cachedDbPromise;
}

// Middleware to ensure DB connection is active before servicing requests
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("MongoDB Connection Middleware Error:", err);
    next(err);
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    dbState: mongoose.connection.readyState,
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api", apiRoutes);

// Global error handler
app.use((err, req, res, _next) => {
  console.error("Global Error:", err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

// Only listen if executed directly (e.g. node index.js)
if (require.main === module) {
  connectDB().catch(() => {});
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
