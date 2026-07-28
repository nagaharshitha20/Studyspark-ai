import "dotenv/config";
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import studyRoutes from "./routes/study.js";

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || /(^|\.)vercel\.app$/i.test(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "200kb" }));

// Basic protection against someone hammering the /generate endpoint and
// burning through API credits. Adjust for your actual traffic needs.
const generateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "TOO_MANY_REQUESTS", message: "Too many requests. Please slow down." },
});

app.get("/", (_req, res) => {
  res.send("StudySpark backend is running. Visit the frontend at http://localhost:5173/");
});

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api/study", generateLimiter, studyRoutes);

// Fallback error handler for anything unhandled (e.g. malformed JSON body)
app.use((err, _req, res, _next) => {
  console.error("[unhandled]", err);
  res.status(500).json({ error: "SERVER_ERROR", message: "Unexpected server error." });
});

app.listen(PORT, () => {
  console.log(`StudySpark server listening on http://localhost:${PORT}`);
  if (!process.env.GROQ_API_KEY && !process.env.GEMINI_API_KEY) {
    console.warn("⚠️  GROQ_API_KEY or GEMINI_API_KEY is not set. Requests to /api/study/generate will fail.");
  }
});
