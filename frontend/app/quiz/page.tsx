"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  createSession,
  submitAnswer,
  restartSession,
} from "@/lib/api";
import type {
  ChatMessage,
  Question,
  QuestionOption,
  Progress,
  Session,
  SubmittedAnswer,
} from "@/lib/types";

type Phase = "loading" | "active" | "undoing" | "error";

let msgCounter = 0;
function nextId() {
  return `msg-${++msgCounter}`;
}

function questionToMessage(q: Question): ChatMessage {
  return {
    id: nextId(),
    type: "question",
    category: q.category,
    text: q.questionText,
    questionId: q.id,
  };
}

/* ─── Sub-components ─────────────────────────────────────────── */

function QuestionBubble({ msg, delay }: { msg: ChatMessage; delay?: number }) {
  return (
    <div
      className="animate-fade-up"
      style={{
        display: "flex",
        gap: "0.75rem",
        alignItems: "flex-start",
        animationDelay: delay ? `${delay}ms` : undefined,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          flexShrink: 0,
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "#1c1c26",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "2px",
          overflow: "hidden",
        }}
      >
        <Image
          src="/joola-trinity.png"
          alt="JOOLA"
          width={20}
          height={20}
          style={{ opacity: 0.85 }}
        />
      </div>

      {/* Bubble */}
      <div style={{ flex: 1, maxWidth: "calc(100% - 44px)" }}>
        {msg.category && (
          <p
            className="label-overline"
            style={{ marginBottom: "0.4rem" }}
          >
            {msg.category}
          </p>
        )}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "4px 18px 18px 18px",
            padding: "0.75rem 1rem",
            fontSize: "0.9375rem",
            lineHeight: 1.45,
            color: "var(--text)",
          }}
        >
          {msg.text}
        </div>
      </div>
    </div>
  );
}

function AnswerBubble({ msg, delay }: { msg: ChatMessage; delay?: number }) {
  return (
    <div
      className="animate-fade-up"
      style={{
        display: "flex",
        justifyContent: "flex-end",
        animationDelay: delay ? `${delay}ms` : undefined,
      }}
    >
      <span
        style={{
          display: "inline-block",
          background: "var(--joola-red)",
          color: "#fff",
          borderRadius: "18px 4px 18px 18px",
          padding: "0.5rem 1.125rem",
          fontSize: "0.875rem",
          fontWeight: 500,
          maxWidth: "75%",
        }}
      >
        {msg.text}
      </span>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div
      className="animate-fade-in"
      style={{
        display: "flex",
        gap: "0.75rem",
        alignItems: "flex-start",
      }}
    >
      <div
        style={{
          flexShrink: 0,
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          background: "#1c1c26",
          border: "1px solid rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Image
          src="/joola-trinity.png"
          alt=""
          width={20}
          height={20}
          style={{ opacity: 0.5 }}
        />
      </div>
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "4px 18px 18px 18px",
          padding: "0.875rem 1.25rem",
          display: "flex",
          gap: "5px",
          alignItems: "center",
        }}
      >
        {[0, 0.18, 0.36].map((d, i) => (
          <span
            key={i}
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "var(--text-2)",
              display: "block",
              animation: `pulse-dot 1.2s ease-in-out ${d}s infinite`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ─── Main Quiz Component ─────────────────────────────────────── */

export default function QuizPage() {
  const router = useRouter();
  const chatRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const [phase, setPhase] = useState<Phase>("loading");
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [submittedAnswers, setSubmittedAnswers] = useState<SubmittedAnswer[]>([]);
  const [error, setError] = useState<string | null>(null);

  /* Scroll to bottom whenever messages change */
  useEffect(() => {
    const el = bottomRef.current;
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "end" }), 50);
    }
  }, [messages, phase]);

  /* Initialize session */
  useEffect(() => {
    createSession()
      .then((session) => {
        if (session.status === "in_progress" && session.currentQuestion) {
          setSessionId(session.sessionId);
          setCurrentQuestion(session.currentQuestion);
          setProgress(session.progress);
          setMessages([questionToMessage(session.currentQuestion)]);
          setPhase("active");
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to start session");
        setPhase("error");
      });
  }, []);

  /* Submit answer */
  const handleAnswer = useCallback(
    async (option: QuestionOption) => {
      if (!currentQuestion || phase !== "active") return;

      setPhase("loading");

      const answerMsg: ChatMessage = {
        id: nextId(),
        type: "answer",
        text: option.label,
        questionId: currentQuestion.id,
      };

      const submitted: SubmittedAnswer = {
        questionId: currentQuestion.id,
        answerValue: option.value,
        answerLabel: option.label,
        category: currentQuestion.category,
        questionText: currentQuestion.questionText,
      };

      setMessages((m) => [...m, answerMsg]);
      setSubmittedAnswers((prev) => [...prev, submitted]);

      try {
        const result: Session = await submitAnswer(
          sessionId,
          currentQuestion.id,
          option.value
        );

        if (result.status === "completed") {
          router.push(`/result?sessionId=${result.sessionId}`);
          return;
        }

        if (result.currentQuestion) {
          setMessages((m) => [...m, questionToMessage(result.currentQuestion!)]);
          setCurrentQuestion(result.currentQuestion);
          setProgress(result.progress);
        }
        setPhase("active");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to submit answer");
        setPhase("error");
      }
    },
    [currentQuestion, phase, sessionId, router]
  );

  /* Undo last answer */
  const handleUndo = useCallback(async () => {
    if (submittedAnswers.length === 0 || phase !== "active") return;

    setPhase("undoing");
    const answersToReplay = submittedAnswers.slice(0, -1);

    // Remove last 2 messages: answer chip + current question bubble
    setMessages((m) => m.slice(0, -2));
    setSubmittedAnswers(answersToReplay);

    try {
      let current: Session = await restartSession(sessionId);

      if (answersToReplay.length > 0) {
        for (const ans of answersToReplay) {
          current = await submitAnswer(
            current.sessionId,
            ans.questionId,
            ans.answerValue
          );
        }
      }

      if (current.status === "in_progress" && current.currentQuestion) {
        setCurrentQuestion(current.currentQuestion);
        setProgress(current.progress);
      }
      setPhase("active");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to undo");
      setPhase("error");
    }
  }, [submittedAnswers, phase, sessionId]);

  /* ─── Render ─────────────────────────────────────────────────── */

  const progressPct =
    progress && progress.total > 0
      ? Math.round((progress.answered / progress.total) * 100)
      : 0;

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        background: "var(--bg)",
        overflow: "hidden",
      }}
    >
      {/* ── Header ── */}
      <header
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.875rem 1.25rem",
          background: "rgba(11,11,15,0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
          position: "relative",
          zIndex: 10,
        }}
      >
        <button
          onClick={() => router.push("/")}
          aria-label="Back to home"
          style={{
            background: "none",
            border: "none",
            color: "var(--text-2)",
            cursor: "pointer",
            padding: "0.25rem",
            lineHeight: 1,
            fontSize: "1.25rem",
            display: "flex",
          }}
        >
          ←
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flex: 1 }}>
          <Image
            src="/joola-logo-white.svg"
            alt="JOOLA"
            width={56}
            height={17}
            style={{ opacity: 0.8 }}
          />
          <span
            style={{
              color: "var(--border-strong)",
              fontSize: "0.875rem",
              userSelect: "none",
            }}
          >
            |
          </span>
          <span
            style={{
              fontFamily: '"FK Grotesk Mono", monospace',
              fontSize: "0.6875rem",
              fontWeight: 500,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--text-2)",
            }}
          >
            Paddle Selector
          </span>
        </div>

        {/* Progress bar */}
        {progress && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                fontFamily: '"FK Grotesk Mono", monospace',
                fontSize: "0.6875rem",
                color: "var(--text-muted)",
                letterSpacing: "0.05em",
              }}
            >
              {progress.answered}/{progress.total}
            </span>
            <div
              style={{
                width: "64px",
                height: "3px",
                background: "var(--surface-3)",
                borderRadius: "2px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${progressPct}%`,
                  background: "var(--joola-red)",
                  borderRadius: "2px",
                  transition: "width 0.4s ease",
                }}
              />
            </div>
          </div>
        )}
      </header>

      {/* ── Chat area ── */}
      <div
        ref={chatRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {messages.map((msg, i) =>
          msg.type === "question" ? (
            <QuestionBubble key={msg.id} msg={msg} delay={i === 0 ? 0 : 80} />
          ) : (
            <AnswerBubble key={msg.id} msg={msg} delay={40} />
          )
        )}

        {(phase === "loading" || phase === "undoing") && <ThinkingBubble />}

        {phase === "error" && (
          <div
            className="animate-fade-up"
            style={{
              background: "rgba(214,24,42,0.12)",
              border: "1px solid rgba(214,24,42,0.3)",
              borderRadius: "12px",
              padding: "1rem",
              color: "#ff6b7a",
              fontSize: "0.875rem",
            }}
          >
            <strong>Something went wrong</strong>
            <br />
            {error}
            <br />
            <button
              onClick={() => {
                setPhase("loading");
                setError(null);
                setMessages([]);
                setSubmittedAnswers([]);
                createSession()
                  .then((s) => {
                    if (s.status === "in_progress" && s.currentQuestion) {
                      setSessionId(s.sessionId);
                      setCurrentQuestion(s.currentQuestion);
                      setProgress(s.progress);
                      setMessages([questionToMessage(s.currentQuestion)]);
                      setPhase("active");
                    }
                  })
                  .catch(() => setPhase("error"));
              }}
              style={{
                marginTop: "0.5rem",
                background: "none",
                border: "1px solid rgba(214,24,42,0.4)",
                borderRadius: "6px",
                color: "#ff6b7a",
                cursor: "pointer",
                padding: "0.375rem 0.75rem",
                fontSize: "0.8125rem",
              }}
            >
              Try again
            </button>
          </div>
        )}

        <div ref={bottomRef} style={{ height: "1px" }} />
      </div>

      {/* ── Bottom answer bar ── */}
      {phase === "active" && currentQuestion && (
        <div
          style={{
            flexShrink: 0,
            borderTop: "1px solid var(--border)",
            background: "rgba(11,11,15,0.9)",
            backdropFilter: "blur(12px)",
            padding: "0.75rem 1rem 1rem",
          }}
        >
          {/* Change last answer */}
          {submittedAnswers.length > 0 && (
            <button
              onClick={handleUndo}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                fontSize: "0.8125rem",
                cursor: "pointer",
                padding: "0 0.25rem 0.625rem",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <span style={{ fontSize: "0.75em" }}>←</span>
              Change last answer
            </button>
          )}

          {/* Option chips */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              flexWrap: "wrap",
            }}
          >
            {currentQuestion.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleAnswer(opt)}
                style={{
                  fontFamily: '"FK Grotesk Neue", sans-serif',
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  color: "var(--text)",
                  background: "var(--surface-2)",
                  border: "1px solid var(--border-strong)",
                  borderRadius: "var(--radius-pill)",
                  padding: "0.5625rem 1.125rem",
                  cursor: "pointer",
                  transition:
                    "background 0.15s ease, border-color 0.15s ease, color 0.15s ease",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  const b = e.currentTarget;
                  b.style.background = "var(--joola-red)";
                  b.style.borderColor = "var(--joola-red)";
                  b.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  const b = e.currentTarget;
                  b.style.background = "var(--surface-2)";
                  b.style.borderColor = "var(--border-strong)";
                  b.style.color = "var(--text)";
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 0.3; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
