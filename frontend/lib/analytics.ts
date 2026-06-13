type AnalyticsEvent =
  | { event: "dupr_flow_started" }
  | { event: "standard_flow_started" }
  | { event: "dupr_rating_entered"; duprRating: number; bandId: string; bandLabel: string }
  | { event: "recommendation_shown"; recommendedPaddle: string; duprOverridden: boolean; flow: "dupr" | "standard" }
  | { event: "paddle_cta_clicked"; paddleName: string; url: string };

type AnalyticsHandler = (payload: AnalyticsEvent) => void;

declare global {
  interface Window {
    __paddleAnalytics?: AnalyticsHandler;
  }
}

export function trackEvent(payload: AnalyticsEvent): void {
  if (typeof window === "undefined") return;
  window.__paddleAnalytics?.(payload);
}
