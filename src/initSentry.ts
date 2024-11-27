import * as Sentry from '@sentry/react'

export function initSentry() {
  if (!import.meta.env.PROD) return // Don't init Sentry in development

  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
      Sentry.browserProfilingIntegration(),
    ],
    tracesSampleRate: 1.0,
    tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
    replaysSessionSampleRate: 1, // for demo only (should be lower in prod)
    replaysOnErrorSampleRate: 1.0,
    profilesSampleRate: 1.0, // for demo only (should be lower in prod)
  })
}
