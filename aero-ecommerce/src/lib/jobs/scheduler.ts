import { jobQueue } from "./queue";
import { logger } from "@/lib/logger";

// ─── Schedule recurring jobs ──────────────────────────────────────────────────

export async function startScheduler(): Promise<void> {
  if (!jobQueue) {
    logger.warn("[scheduler] job queue unavailable — recurring jobs disabled");
    return;
  }

  try {
    // Expire stock reservations every 15 minutes
    await jobQueue.add(
      "expire-stock-reservations",
      {},
      {
        repeat: { every: 15 * 60 * 1000 }, // 15 minutes in ms
        jobId: "expire-stock-reservations-recurring",
      }
    );

    logger.info("[scheduler] recurring jobs scheduled");
  } catch (err) {
    logger.error({ err }, "[scheduler] failed to schedule recurring jobs");
  }
}
