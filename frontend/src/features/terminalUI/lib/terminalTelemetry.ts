export type TerminalTelemetryTone = "info" | "success" | "error";

export type TerminalTelemetryDetail = {
  lines: string[];
  tone?: TerminalTelemetryTone;
};

const TERMINAL_TELEMETRY_EVENT = "portfolio:terminal-telemetry";

function isTerminalTelemetryDetail(value: unknown): value is TerminalTelemetryDetail {
  if (!value || typeof value !== "object") {
    return false;
  }

  const detail = value as TerminalTelemetryDetail;
  return Array.isArray(detail.lines) && detail.lines.every((line) => typeof line === "string");
}

export function publishTerminalTelemetry(detail: TerminalTelemetryDetail): void {
  if (typeof window === "undefined" || detail.lines.length === 0) {
    return;
  }

  window.dispatchEvent(new CustomEvent<TerminalTelemetryDetail>(TERMINAL_TELEMETRY_EVENT, { detail }));
}

export function subscribeTerminalTelemetry(
  listener: (detail: TerminalTelemetryDetail) => void,
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleEvent = (event: Event) => {
    const customEvent = event as CustomEvent<unknown>;

    if (!isTerminalTelemetryDetail(customEvent.detail)) {
      return;
    }

    listener(customEvent.detail);
  };

  window.addEventListener(TERMINAL_TELEMETRY_EVENT, handleEvent);

  return () => {
    window.removeEventListener(TERMINAL_TELEMETRY_EVENT, handleEvent);
  };
}
