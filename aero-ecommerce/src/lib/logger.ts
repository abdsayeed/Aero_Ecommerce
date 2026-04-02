import pino from "pino";

// ─── Logger singleton ─────────────────────────────────────────────────────────

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  ...(process.env.NODE_ENV !== "production"
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard", ignore: "pid,hostname" },
        },
      }
    : {}),
});

// ─── Request-scoped child logger ──────────────────────────────────────────────

export function createRequestLogger(traceId: string) {
  return logger.child({ traceId });
}

export type Logger = ReturnType<typeof createRequestLogger>;
