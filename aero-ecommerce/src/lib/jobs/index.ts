import { jobQueue, type JobName, type JobData } from "./queue";
import { logger } from "@/lib/logger";

// ─── enqueueJob — with in-process fallback for critical jobs ──────────────────

export async function enqueueJob<N extends JobName>(
  name: N,
  data: JobData[N]
): Promise<void> {
  if (jobQueue) {
    try {
      await jobQueue.add(name, data);
      logger.debug({ jobName: name }, "[jobs] job enqueued");
      return;
    } catch (err) {
      logger.error({ err, jobName: name }, "[jobs] failed to enqueue job — falling back to in-process");
    }
  }

  // In-process fallback
  await runJobInProcess(name, data);
}

async function runJobInProcess<N extends JobName>(
  name: N,
  data: JobData[N]
): Promise<void> {
  switch (name) {
    case "send-order-confirmation": {
      // Critical — run synchronously
      const { sendOrderConfirmationById } = await import("@/lib/services/notification.service");
      const d = data as JobData["send-order-confirmation"];
      await sendOrderConfirmationById(d.orderId, d.to, d.customerName).catch((err: unknown) => {
        logger.error({ err }, "[jobs] in-process send-order-confirmation failed");
      });
      break;
    }

    case "send-low-stock-alert":
    case "reconcile-payment":
    case "expire-stock-reservations":
      // Non-critical — skip with warning when no queue
      logger.warn({ jobName: name }, "[jobs] non-critical job skipped — no job queue available");
      break;

    default:
      logger.warn({ jobName: name }, "[jobs] unknown job type in in-process fallback");
  }
}
