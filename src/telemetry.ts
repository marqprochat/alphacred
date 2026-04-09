const telemetryEndpoint = import.meta.env.VITE_FORM_LOG_WEBHOOK_URL?.trim();
const storageKey = 'alphacred_form_session_id';

type TelemetryPayload = Record<string, unknown>;

const createSessionId = () => {
  const randomPart = Math.random().toString(36).slice(2, 10);
  return `sess_${Date.now()}_${randomPart}`;
};

const getSessionId = () => {
  if (typeof window === 'undefined') {
    return createSessionId();
  }

  try {
    const existing = window.sessionStorage.getItem(storageKey);
    if (existing) return existing;

    const created = createSessionId();
    window.sessionStorage.setItem(storageKey, created);
    return created;
  } catch {
    return createSessionId();
  }
};

const basePayload = () => ({
  sessionId: getSessionId(),
  page: typeof window !== 'undefined' ? window.location.pathname : '',
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
  timestamp: new Date().toISOString(),
});

const emitToConsole = (event: string, payload: TelemetryPayload) => {
  console.info(`[telemetry] ${event}`, payload);
};

const emitToWebhook = (body: string) => {
  if (!telemetryEndpoint) return;

  if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
    const blob = new Blob([body], { type: 'application/json' });
    const queued = navigator.sendBeacon(telemetryEndpoint, blob);
    if (queued) return;
  }

  void fetch(telemetryEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
    keepalive: true,
  }).catch(() => {
    // Avoid recursive logging if the telemetry endpoint itself fails.
  });
};

export const trackEvent = (event: string, payload: TelemetryPayload = {}) => {
  const enrichedPayload = {
    event,
    ...basePayload(),
    ...payload,
  };

  emitToConsole(event, enrichedPayload);
  emitToWebhook(JSON.stringify(enrichedPayload));
};

export const trackError = (event: string, error: unknown, payload: TelemetryPayload = {}) => {
  const normalizedError =
    error instanceof Error
      ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        }
      : {
          message: String(error),
        };

  trackEvent(event, {
    level: 'error',
    error: normalizedError,
    ...payload,
  });
};

export const getTelemetrySessionId = () => getSessionId();
