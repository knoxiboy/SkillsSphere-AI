import express from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { authRateLimiter } from "../../middleware/rateLimiter.js";
import {
  forgotPassword,
  getMe,
  googleLogin,
  googleOAuthCallback,
  login,
  logout,
  register,
  resendOTP,
  resetPassword,
  verifyEmail,
} from "./controller.js";

const router = express.Router();

// 👤 Get Current User
router.get("/me", protect, getMe);

// Initiate Google OAuth
router.get("/google", (req, res) => {
  const envFrontendOrigin = process.env.FRONTEND_URL || "http://localhost:5173";
  const refererHeader = req.get("referer");
  let inferredFrontendOrigin = envFrontendOrigin;

  if (refererHeader) {
    try {
      inferredFrontendOrigin = new URL(refererHeader).origin;
    } catch {
      inferredFrontendOrigin = envFrontendOrigin;
    }
  }

  const fallbackCallback = `${inferredFrontendOrigin}/auth/callback`;
  const requestedRedirect = req.query.redirect;
  const redirectTarget =
    typeof requestedRedirect === "string" && requestedRedirect.length > 0
      ? requestedRedirect
      : fallbackCallback;
  const state = encodeURIComponent(
    Buffer.from(redirectTarget, "utf8").toString("base64"),
  );
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_CALLBACK_URL}&response_type=code&scope=email%20profile&state=${state}`;
  res.redirect(url);
});

// Callback from Google
router.get("/google/callback", googleOAuthCallback);

// 📝 Register & Auth (Rate Limited)
router.post("/register", authRateLimiter, register);
router.post("/verify-email", authRateLimiter, verifyEmail);
router.post("/forgot-password", authRateLimiter, forgotPassword);
router.post("/reset-password", authRateLimiter, resetPassword);
router.post("/resend-otp", authRateLimiter, resendOTP);
router.post("/login", authRateLimiter, login);

// 🚪 Logout
router.post("/logout", logout);

// 🔐 Google Login
router.post("/google", googleLogin);

export default router;
