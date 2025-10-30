const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ⬇️ CORS Configuration - รองรับทั้ง Local และ Production
app.use(
  cors({
    origin: [
      "http://localhost:5173", // Vite default
      "http://localhost:3000", // React default / Your current frontend
      "http://localhost:5001", // Backend self-call
      "https://pj-handy-bridge-interac-kihqv8k9j-nns-projects-2b017ccc.vercel.app", // Production Frontend
      "https://handy-bridge-backend-3huzrxhx2-nns-projects-2b017ccc.vercel.app", // Production Backend
      process.env.FRONTEND_URL, // จาก .env
    ].filter(Boolean), // ลบ undefined ออก
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⬇️ Logging Middleware
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// ⬇️ Import routes
const tslPhraseRoutes = require("./src/routes/tslPhrases");
const progressRoutes = require("./src/routes/progress");
const adminRoutes = require("./src/routes/admin");
const newsRoutes = require("./src/routes/news");

// ⬇️ Root Route - Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Handy Bridge Backend is running",
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
    endpoints: {
      health: "/api/health",
      phrases: "/api/phrases",
      progress: "/api/progress",
      admin: "/api/admin",
      news: "/api/news",
    },
  });
});

// ⬇️ API Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ⬇️ API Routes
app.use("/api/phrases", tslPhraseRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/news", newsRoutes);

// ⬇️ Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong!",
    error:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err.stack,
  });
});

// ⬇️ 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
    requestedPath: req.originalUrl,
    availableEndpoints: [
      "/api/health",
      "/api/phrases",
      "/api/progress",
      "/api/admin",
      "/api/news",
    ],
  });
});

// ⬇️ Export สำหรับ Vercel (สำคัญ!)
module.exports = app;

// ⬇️ Start server (Local Development เท่านั้น)
if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5001;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on: http://localhost:${PORT}`);
    console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(
      `🌐 Frontend URL: ${process.env.FRONTEND_URL || "http://localhost:3000"}`
    );
  });
}
