import { Worker, type Job } from "bullmq";
import { logger } from "@/lib/logger";
import type { JobName, JobData } from "./queue";

// ─── Job handlers ─────────────────────────────────────────────────────────────

async function handleJob(job: Job<JobData[JobName]>): Promise<void> {
  const jobLogger = logger.child({ jobId: job.id, jobName: job.name });
  jobLogger.info("[jobs] processing job");

  switch (job.name as JobName) {
    case "send-order-confirmation": {
      const { orderId, to, customerName } = job.data as JobData["send-order-confirmation"];
      const { sendOrderConfirmationById } = await import("@/lib/services/notification.service");
      await sendOrderConfirmationById(orderId, to, customerName);
      break;
    }

    case "send-low-stock-alert": {
      const data = job.data as JobData["send-low-stock-alert"];
      const { sendLowStockAlertById } = await import("@/lib/services/notification.service");
      await sendLowStockAlertById(data);
      break;
    }

    case "expire-stock-reservations": {
      const { expireStockReservations } = await import("@/lib/services/checkout.service");
      await expireStockReservations();
      break;
    }

    case "reconcile-payment": {
      const { stripeSessionId } = job.data as JobData["reconcile-payment"];
      jobLogger.info({ stripeSessionId }, "[jobs] reconcile-payment — not yet implemented");
      break;
    }

    default:
      jobLogger.warn({ jobName: job.name }, "[jobs] unknown job type — skipping");
  }

  jobLogger.info("[jobs] job completed");
}

// ─── Worker factory — only created when REDIS_URL is present ─────────────────

export function createWorker(): Worker | null {
  const url = process.env.REDIS_URL;
  if (!url) return null;

  const worker = new Worker("aero-jobs", handleJob, {
    connection: { url },
    concurrency: 5,
  });

  worker.on("failed", (job, err) => {
    const attempts = job?.attemptsMade ?? 0;
    logger.error(
      { jobId: job?.id, jobName: job?.name, attempts, err },
      "[jobs] job failed"
    );

    // After max retries, capture to Sentry if available
    if (attempts >= 3) {
      import("@sentry/nextjs")
        .then(({ captureException }) => captureException(err, { extra: { jobId: job?.id, jobName: job?.name } }))
        .catch(() => null);
    }
  });

  worker.on("error", (err) => {
    logger.error({ err }, "[jobs] worker error");
  });

  logger.info("[jobs] BullMQ worker started");
  return worker;
}
