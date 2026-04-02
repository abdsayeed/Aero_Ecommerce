import Redis from "ioredis";
import { logger } from "@/lib/logger";

// ─── Redis singleton — null when REDIS_URL is absent ─────────────────────────

let redis: Redis | null = null;

const url = process.env.REDIS_URL;

if (url) {
  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      enableReadyCheck: false,
      lazyConnect: true,
    });

    redis.on("error", (err) => {
      logger.error({ err }, "[redis] connection error");
    });

    redis.on("connect", () => {
      logger.info("[redis] connected");
    });
  } catch (err) {
    logger.warn({ err }, "[redis] failed to initialise — cache disabled");
    redis = null;
  }
} else {
  logger.warn("[redis] REDIS_URL not set — cache disabled, falling back to DB");
}

export { redis };
