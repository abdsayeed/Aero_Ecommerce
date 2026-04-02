import { Queue } from "bullmq";
import { logger } from "@/lib/logger";

// ─── Job type definitions ─────────────────────────────────────────────────────

export type JobName =
  | "send-order-confirmation"
  | "send-low-stock-alert"
  | "reconcile-payment"
  | "expire-stock-reservations";

export interface JobData {
  "send-order-confirmation": { orderId: string; to: string; customerName?: string };
  "send-low-stock-alert": { variantId: string; productName: string; sku: string; inStock: number; threshold: number };
  "reconcile-payment": { stripeSessionId: string };
  "expire-stock-reservations": Record<string, never>;
}

// ─── Queue singleton — null when REDIS_URL is absent ─────────────────────────

let jobQueue: Queue | null = null;

const url = process.env.REDIS_URL;

if (url) {
  try {
    jobQueue = new Queue("aero-jobs", {
      connection: { url },
      defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 2000 },
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 500 },
      },
    });
    logger.info("[jobs] BullMQ queue initialised");
  } catch (err) {
    logger.warn({ err }, "[jobs] BullMQ queue failed to initialise — falling back to in-process");
    jobQueue = null;
  }
} else {
  logger.warn("[jobs] REDIS_URL not set — job queue disabled, critical jobs run in-process");
}

export { jobQueue };
