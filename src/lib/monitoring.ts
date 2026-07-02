import * as Sentry from "@sentry/react";

// Error monitoring is opt-in: it activates only when VITE_SENTRY_DSN is set
// (Vercel env for production). Without it the app behaves exactly as before.
const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

export function initMonitoring() {
  if (!DSN) return;
  Sentry.init({
    dsn: DSN,
    environment: import.meta.env.MODE,
    // Errors only — no performance tracing or session replay, keeping the
    // free-tier quota for what matters and the bundle lean.
    tracesSampleRate: 0,
    // Noise that isn't actionable from our code.
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
    ],
  });
}

export function reportError(error: unknown, context?: Record<string, unknown>) {
  if (!DSN) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}
