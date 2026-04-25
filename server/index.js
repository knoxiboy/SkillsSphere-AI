import express from "express";
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import connectDB from "./src/database/db.js";
import authRoutes from "./src/modules/auth/routes.js";
import resumeRoutes from "./src/modules/resumes/routes.js";
import globalErrorHandler from "./src/middleware/errorMiddleware.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/uploads", express.static(path.resolve("src", "uploads")));

await connectDB();

app.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

app.post("/api/chat", (req, res) => {
  try {
    const { message } = req.body;

    // validation
    if (!message) {
      return res.status(400).json({ error: "Message required" });
    }

    let reply = "I didn’t understand that.";

    const msg = message.toLowerCase();

    if (msg.includes("hello") || msg.includes("hi")) {
      reply = "Hi! How can I help you?";
    } else if (msg.includes("help")) {
      reply = "Sure! Tell me what you need help with.";
    } else if (msg.includes("resume")) {
      reply = "You can upload or manage your resumes here.";
    }

    res.json({ reply });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/resume", resumeRoutes);

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});