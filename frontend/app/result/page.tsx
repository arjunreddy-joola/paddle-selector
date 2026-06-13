"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { getSession } from "@/lib/api";
import type { Recommendation, Product } from "@/lib/types";

function PaddleCard({
  productName,
  product,
  badge,
  featured,
}: {
  productName: string;
  product: Product | null;
  badge: string;
  featured?: boolean;
}) {
  return (
    <div
      style={{
        background: featured ? "var(--surface)" : "var(--surface-2)",
        border: featured
          ? "1px solid rgba(214,24,42,0.3)"
          : "1px solid var(--border)",
        borderRadius: "var(--radius-card)",
        padding: featured ? "1.5rem" : "1rem 1.25rem",
        display: "flex",
        gap: "1rem",
        alignItems: "flex-start",
      }}
    >
      {/* Product image */}
      <div
        style={{
          flexShrink: 0,
          width: featured ? "96px" : "72px",
          height: featured ? "96px" : "72px",
          borderRadius: "10px",
          background: "var(--surface-3, #262632)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {product?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.imageUrl}
            alt={productName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <Image
            src="/joola-trinity.png"
            alt=""
            width={40}
            height={40}
            style={{ opacity: 0.3 }}
          />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {badge && (
          <span
            className="label-overline"
            style={{ display: "block", marginBottom: "0.35rem" }}
          >
            {badge}
          </span>
        )}
        <h3
          style={{
            margin: "0 0 0.25rem",
            fontWeight: 700,
            fontSize: featured ? "1.0625rem" : "0.9375rem",
            color: "var(--text)",
            lineHeight: 1.3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {productName || product?.name || "Unknown Paddle"}
        </h3>

        {product?.price != null && (
          <p
            style={{
              margin: "0 0 0.5rem",
              fontSize: "0.875rem",
              color: "var(--text-2)",
            }}
          >
            ${product.price.toFixed(0)}
          </p>
        )}

        {product?.tags?.length ? (
          <div style={{ display: "flex", gap: "0.375rem", flexWrap: "wrap" }}>
            {product.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: "0.7rem",
                  fontFamily: '"FK Grotesk Mono", monospace',
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  color: "var(--text-muted)",
                  background: "var(--surface-3, #262632)",
                  borderRadius: "4px",
                  padding: "0.2rem 0.4rem",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        {product?.productUrl && (
          <a
            href={product.productUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              marginTop: "0.75rem",
              fontWeight: 600,
              fontSize: "0.8125rem",
              color: featured ? "#fff" : "var(--text)",
              background: featured ? "var(--joola-red)" : "transparent",
              border: featured
                ? "none"
                : "1px solid var(--border-strong)",
              borderRadius: "var(--radius-pill)",
              padding: "0.4rem 0.875rem",
              textDecoration: "none",
              transition: "opacity 0.15s",
            }}
          >
            View paddle →
          </a>
        )}
      </div>
    </div>
  );
}

function ResultContent() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("sessionId");

  const [rec, setRec] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setError("No session found. Please start over.");
      setLoading(false);
      return;
    }

    getSession(sessionId)
      .then((session) => {
        if (session.status === "completed") {
          setRec(session.recommendation);
        } else {
          router.replace(`/quiz`);
        }
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load results");
      })
      .finally(() => setLoading(false));
  }, [sessionId, router]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            border: "3px solid var(--surface-3, #262632)",
            borderTopColor: "var(--joola-red)",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <p style={{ color: "var(--text-2)", fontSize: "0.875rem" }}>
          Loading your match…
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !rec) {
    return (
      <div
        style={{
          minHeight: "100dvh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          textAlign: "center",
          flexDirection: "column",
          gap: "1rem",
        }}
      >
        <p style={{ color: "#ff6b7a" }}>{error ?? "No recommendation found."}</p>
        <button
          onClick={() => router.push("/")}
          style={{
            background: "var(--joola-red)",
            color: "#fff",
            border: "none",
            borderRadius: "var(--radius-pill)",
            padding: "0.75rem 2rem",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: "0.9375rem",
          }}
        >
          Start over
        </button>
      </div>
    );
  }

  const hasDifferentBestSeller =
    rec.bestSeller &&
    rec.recommendedForYou?.productName !== rec.bestSeller.productName;

  return (
    <main
      style={{
        minHeight: "100dvh",
        padding: "0 0 3rem",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.875rem 1.25rem",
          background: "rgba(11,11,15,0.8)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid var(--border)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <button
          onClick={() => router.push("/")}
          aria-label="Back"
          style={{
            background: "none",
            border: "none",
            color: "var(--text-2)",
            cursor: "pointer",
            fontSize: "1.25rem",
            padding: "0.25rem",
          }}
        >
          ←
        </button>
        <Image
          src="/joola-logo-white.svg"
          alt="JOOLA"
          width={56}
          height={17}
          style={{ opacity: 0.8 }}
        />
      </div>

      {/* Hero */}
      <div
        style={{
          padding: "2rem 1.25rem 1.5rem",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(214,24,42,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <span
          className="label-overline"
          style={{ display: "block", marginBottom: "0.5rem" }}
        >
          Your Match
        </span>
        <h1
          style={{
            fontWeight: 900,
            fontSize: "clamp(1.875rem, 6vw, 2.75rem)",
            letterSpacing: "-0.02em",
            lineHeight: 1.1,
            margin: "0 0 0.5rem",
          }}
        >
          We found your
          <br />
          <span style={{ color: "var(--joola-red)" }}>perfect paddle.</span>
        </h1>
        {rec.metadata.fallbackUsed && (
          <p
            style={{
              fontSize: "0.8125rem",
              color: "var(--text-muted)",
              margin: "0.5rem 0 0",
            }}
          >
            Based on your closest profile — a few great options below.
          </p>
        )}
      </div>

      {/* Cards */}
      <div
        style={{
          padding: "0 1.25rem",
          display: "flex",
          flexDirection: "column",
          gap: "0.875rem",
        }}
      >
        {/* Primary recommendation */}
        {rec.recommendedForYou && (
          <div className="animate-fade-up">
            <PaddleCard
              productName={rec.recommendedForYou.productName}
              product={rec.recommendedForYou.product}
              badge={rec.recommendedForYou.badge || "Recommended for you"}
              featured
            />
          </div>
        )}

        {/* Best seller (if different) */}
        {hasDifferentBestSeller && rec.bestSeller && (
          <div className="animate-fade-up" style={{ animationDelay: "80ms" }}>
            <PaddleCard
              productName={rec.bestSeller.productName}
              product={rec.bestSeller.product}
              badge={rec.bestSeller.badge || "Best seller"}
            />
          </div>
        )}

        {/* Other paddles */}
        {rec.otherPaddles.length > 0 && (
          <>
            <p
              className="label-overline"
              style={{ marginTop: "0.5rem", paddingLeft: "0.25rem" }}
            >
              Also consider
            </p>
            {rec.otherPaddles.slice(0, 4).map((p, i) => {
              const name =
                (p as { productName?: string }).productName ??
                (p as { name?: string }).name ??
                "Paddle Option";
              return (
                <div
                  key={i}
                  className="animate-fade-up"
                  style={{ animationDelay: `${(i + 1) * 60}ms` }}
                >
                  <div
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      padding: "0.875rem 1.25rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{ fontWeight: 500, fontSize: "0.9375rem" }}
                    >
                      {name}
                    </span>
                    {(p as { productUrl?: string }).productUrl && (
                      <a
                        href={(p as { productUrl: string }).productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: "0.8125rem",
                          color: "var(--joola-red)",
                          textDecoration: "none",
                          fontWeight: 600,
                        }}
                      >
                        View →
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Start over */}
      <div
        style={{
          padding: "2rem 1.25rem 0",
          textAlign: "center",
        }}
      >
        <button
          onClick={() => router.push("/")}
          style={{
            background: "none",
            border: "1px solid var(--border-strong)",
            borderRadius: "var(--radius-pill)",
            color: "var(--text-2)",
            fontFamily: '"FK Grotesk Neue", sans-serif',
            fontWeight: 500,
            fontSize: "0.9rem",
            padding: "0.625rem 1.75rem",
            cursor: "pointer",
          }}
        >
          Start over
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </main>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              border: "3px solid #262632",
              borderTopColor: "#d6182a",
              animation: "spin 0.7s linear infinite",
            }}
          />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
