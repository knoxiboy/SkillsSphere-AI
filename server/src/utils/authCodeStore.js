import crypto from "crypto";
import redisClient from "../config/redis.js";

const CODE_TTL_S = 60;
const CODE_TTL_MS = CODE_TTL_S * 1000;

const fallbackStore = new Map();

setInterval(() => {
  const now = Date.now();
  for (const [code, entry] of fallbackStore) {
    if (entry.expiresAt <= now) {
      fallbackStore.delete(code);
    }
  }
}, 30 * 1000);

export const generateAuthCode = async (userId) => {
  const code = crypto.randomBytes(24).toString("hex");

  if (redisClient?.isReady) {
    try {
      await redisClient.setEx(`auth:code:${code}`, CODE_TTL_S, userId);
      return code;
    } catch {
      // Redis unavailable — fall through to in-memory store
    }
  }

  fallbackStore.set(code, { userId, expiresAt: Date.now() + CODE_TTL_MS });
  return code;
};

export const consumeAuthCode = async (code) => {
  if (redisClient?.isReady) {
    try {
      const userId = await redisClient.get(`auth:code:${code}`);
      if (userId) {
        await redisClient.del(`auth:code:${code}`);
        return userId;
      }
      return null;
    } catch {
      // Redis unavailable — fall through to in-memory store
    }
  }

  const entry = fallbackStore.get(code);
  if (!entry) return null;
  if (entry.expiresAt <= Date.now()) {
    fallbackStore.delete(code);
    return null;
  }
  fallbackStore.delete(code);
  return entry.userId;
};
