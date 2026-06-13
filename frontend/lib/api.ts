import type { Session, AIChatSession, AIChatMessageResponse } from "./types";

const API_BASE = "/api/paddle-selector";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
      (data as { error?: { message?: string } })?.error?.message ??
        `Request failed: ${res.status}`
    );
  }

  return data as T;
}

export function createSession(): Promise<Session> {
  return request<Session>("/sessions", {
    method: "POST",
    body: JSON.stringify({ source: "web", locale: "en-US" }),
  });
}

export function submitAnswer(
  sessionId: string,
  questionId: string,
  answerValue: string
): Promise<Session> {
  return request<Session>(`/sessions/${sessionId}/answer`, {
    method: "POST",
    body: JSON.stringify({ questionId, answerValue }),
  });
}

export function restartSession(sessionId: string): Promise<Session> {
  return request<Session>(`/sessions/${sessionId}/restart`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function getSession(sessionId: string): Promise<Session> {
  return request<Session>(`/sessions/${sessionId}`);
}

// ── AI Chat ─────────────────────────────────────────────────

export function createChatSession(): Promise<AIChatSession> {
  return request<AIChatSession>("/chat/sessions", {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function sendChatMessage(
  sessionId: string,
  message: string
): Promise<AIChatMessageResponse> {
  return request<AIChatMessageResponse>(
    `/chat/sessions/${sessionId}/message`,
    {
      method: "POST",
      body: JSON.stringify({ message }),
    }
  );
}
