import posthog from "posthog-js";

const DEFAULT_POSTHOG_HOST = "https://us.i.posthog.com";

let isInitialized = false;

export function getPostHogConfig() {
  const token =
    import.meta.env.VITE_POSTHOG_PROJECT_TOKEN ||
    (typeof window !== "undefined"
      ? (window as unknown as { __POSTHOG_TOKEN__?: string }).__POSTHOG_TOKEN__
      : undefined);

  const api_host =
    import.meta.env.VITE_POSTHOG_HOST ||
    DEFAULT_POSTHOG_HOST;

  return {
    token: token?.trim(),
    api_host: api_host?.trim() || DEFAULT_POSTHOG_HOST,
  };
}

export function initPostHogClient(): typeof posthog | null {
  if (typeof window === "undefined") return null;
  if (isInitialized) return posthog;

  const { token, api_host } = getPostHogConfig();

  if (!token) {
    if (import.meta.env.DEV) {
      console.info("[PostHog] Token não configurado; inicialização ignorada.");
    }
    return null;
  }

  posthog.init(token, {
    api_host,
    autocapture: true,
    capture_pageview: "history_change",
    capture_pageleave: true,
    capture_dead_clicks: true,
    capture_performance: true,
    person_profiles: "identified_only",
    session_recording: {
      maskAllInputs: true,
    },
    loaded: (ph) => {
      if (import.meta.env.DEV) {
        ph.debug();
      }
    },
  });

  isInitialized = true;
  return posthog;
}

export type SimulatorName =
  | "estrutura-do-plano"
  | "estrategia-lance"
  | "zona-contemplacao"
  | "custo-cancelamento"
  | "venda-carta-contemplada"
  | "lance-livre"
  | "proporcao-taxa"
  | "auto-pagavel"
  | "panorama";

export interface SimulatorEventProps {
  simulator: SimulatorName;
  stage?: string | number;
  stageName?: string;
  action?: string;
  timeSpentSeconds?: number;
  [key: string]: unknown;
}

export function trackSimulatorStart(props: SimulatorEventProps) {
  if (typeof window === "undefined") return;
  initPostHogClient();
  const { simulator, ...rest } = props;
  posthog.capture("simulator_started", {
    path: window.location.pathname,
    search: window.location.search,
    started_at: new Date().toISOString(),
    simulator,
    ...rest,
  });
}

export function trackSimulatorStep(props: SimulatorEventProps) {
  if (typeof window === "undefined") return;
  initPostHogClient();
  const { simulator, ...rest } = props;
  posthog.capture("simulator_step_viewed", {
    path: window.location.pathname,
    stage: props.stage,
    stage_name: props.stageName,
    simulator,
    ...rest,
  });
}

export function trackSimulatorComplete(props: SimulatorEventProps) {
  if (typeof window === "undefined") return;
  initPostHogClient();
  const { simulator, ...rest } = props;
  posthog.capture("simulator_completed", {
    path: window.location.pathname,
    completed_at: new Date().toISOString(),
    simulator,
    ...rest,
  });
}

export function trackSimulatorAbandon(props: SimulatorEventProps) {
  if (typeof window === "undefined") return;
  initPostHogClient();
  const { simulator, ...rest } = props;
  posthog.capture("simulator_abandoned", {
    path: window.location.pathname,
    abandoned_at: new Date().toISOString(),
    simulator,
    ...rest,
  });
}

export function trackCustomEvent(eventName: string, properties: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  initPostHogClient();
  posthog.capture(eventName, {
    path: window.location.pathname,
    search: window.location.search,
    ...properties,
  });
}

export { posthog };
