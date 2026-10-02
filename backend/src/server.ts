import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.ts";
import businessRoutes from "./routes/businesses.ts";
import analyticsRoutes from "./routes/analytics.ts";
import publicRoutes from "./routes/public.ts";
import { authMiddleware } from "./middlewares/auth.ts";
import { runSeed } from "../../database/src/seed.ts";

const app = express();
const PORT = process.env.PORT || 5000;

// Permissive CORS for local development and custom domains
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:5000",
  "http://127.0.0.1:5000",
  ...(process.env.APP_URL ? [process.env.APP_URL] : [])
];

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith(".replit.dev") || origin.endsWith(".oneqr.app")) {
      return callback(null, true);
    }
    // Allow any localhost port in dev
    if (/^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true,
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach user session if cookie exists
app.use(authMiddleware);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api", authRoutes);
app.use("/api", businessRoutes);
app.use("/api", analyticsRoutes);
app.use("/api", publicRoutes);

// Direct QR code redirect endpoint: /r/:id
app.use(publicRoutes);

// Auto-seed database if empty
try {
  runSeed();
} catch (e) {
  console.log("Database initialized.");
}

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║  🚀 OneQR Backend API Server Running Successfully        ║
║  📡 Local URL:  http://localhost:${PORT}                   ║
║  🔒 Auth:       http://localhost:${PORT}/api/auth/me       ║
║  💼 Business:   http://localhost:${PORT}/api/b/brew-and-bite ║
║  📊 Analytics:  http://localhost:${PORT}/api/analytics     ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

export default app;
