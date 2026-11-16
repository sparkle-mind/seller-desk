import express from "express";
const app = express();

// Middleware
app.use(express.json());
// Routes
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Express Server",
  });
});

export default app;
