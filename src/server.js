const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

const normalizeOrigin = (value) => {
  if (!value) return "";
  return value.replace(/\/$/, "");
};

const normalizedAllowedOrigins = new Set(
  allowedOrigins.map((origin) => normalizeOrigin(origin))
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (normalizedAllowedOrigins.size === 0) {
        return callback(null, true);
      }

      const normalizedOrigin = normalizeOrigin(origin);
      const isConfiguredOrigin = normalizedAllowedOrigins.has(normalizedOrigin);
      const isLocalhostDevOrigin = /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(
        normalizedOrigin
      );
      const isVercelOrigin = /^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(
        normalizedOrigin
      );

      if (isConfiguredOrigin || isLocalhostDevOrigin || isVercelOrigin) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Backend is running" });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/messages", require("./routes/messageRoutes"));

app.use("/auth", require("./routes/authRoutes"));
app.use("/users", require("./routes/userRoutes"));
app.use("/messages", require("./routes/messageRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  if (normalizedAllowedOrigins.size === 0) {
    console.warn("CLIENT_URL is not configured. CORS is currently open to all origins.");
  }
});