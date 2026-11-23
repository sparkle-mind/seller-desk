import express from "express";
import authRoutes from "./routes/auth.routes.js";
import cors from "cors";

const app = express();
const BASE_URL = "/api/v1";

// CORS Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    // credentials: true,
  }),
);

// Middleware
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Express Server",
  });
});

app.use(BASE_URL, authRoutes);

export default app;
