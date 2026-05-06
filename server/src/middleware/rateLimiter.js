import rateLimit from "express-rate-limit";

/**
 * Custom Rate Limiter for Authentication routes
 * Prevents brute-force attacks and OTP/Email bombing
 */
export const authRateLimiter = rateLimit({
  windowMs: parseInt(process.env.AUTH_LIMIT_WINDOW) || 15 * 60 * 1000, // Default 15 minutes
  max: parseInt(process.env.AUTH_LIMIT_MAX) || 5, // Default 5 attempts per window
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again after 15 minutes.",
    error: "RATE_LIMIT_EXCEEDED"
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next, options) => {
    res.status(429).json(options.message);
  }
});
