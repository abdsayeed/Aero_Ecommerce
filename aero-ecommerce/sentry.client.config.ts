import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN;

if (!dsn) {
  console.warn("[sentry] SENTRY_DSN not set — Sentry disabled");
} else {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    sampleRate: 1.0,
    debug: false,
  });
}
