require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const next = require("next");
const path = require("path");

const { connectDatabase } = require("./config/db");
const authRoutes = require("./routes/authRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

// Next.js configuration
const frontendPath = path.join(__dirname, "../frontend");

const nextApp = next({
  dev: false,
  dir: frontendPath,
});

const handle = nextApp.getRequestHandler();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// API
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
  });
});

app.use("/api/auth", authRoutes);

async function startServer() {
  await connectDatabase();

  await nextApp.prepare();

app.use((req, res) => {
  return handle(req, res);
});

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();