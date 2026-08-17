"use client"

import { useEffect, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

/**
 * The hero visual: a payment moving from customer to merchant.
 *
 * Deliberately shows what actually happens rather than a generic abstract
 * graphic — the whole product is "one integration instead of five", and
 * that is easier to show than to say.
 *
 * Pure SVG and CSS. No canvas, no animation library, no images.
 */

const NETWORKS = [
  { id: "mpesa", label: "M-Pesa", short: "M" },
  { id: "tigo", label: "Mixx", short: "T" },
  { id: "airtel", label: "Airtel", short: "A" },
  { id: "halopesa", label: "Halo", short: "H" },
  { id: "azampesa", label: "Azam", short: "Z" },
]

const STEPS = [
  { label: "Charge created", detail: "POST /v1/charges" },
  { label: "Prompt sent", detail: "Customer enters PIN" },
  { label: "Payment confirmed", detail: "charge.success" },
]

export function PaymentFlow() {
  const [step, setStep] = useState(0)
  const [activeNetwork, setActiveNetwork] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setStep((current) => {
        const next = (current + 1) % STEPS.length
        // Move to a different network each time the cycle restarts, so the
        // aggregator idea reads without needing a caption.
        if (next === 0) {
          setActiveNetwork((n) => (n + 1) % NETWORKS.length)
        }
        return next
      })
    }, 2200)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="relative w-full max-w-lg">
      <div className="rounded-2xl border bg-card/80 p-6 shadow-xl backdrop-blur">
        {/* Networks fanning in */}
        <div className="flex items-center justify-between gap-2">
          {NETWORKS.map((network, index) => {
            const active = index === activeNetwork
            return (
              <div
                key={network.id}
                className="flex flex-1 flex-col items-center gap-1.5"
              >
                <div className="relative">
                  {active ? (
                    <span
                      aria-hidden
                      className="bg-primary/30 absolute inset-0 rounded-xl"
                      style={{
                        animation: "xerin-ripple 1.6s ease-out infinite",
                      }}
                    />
                  ) : null}
                  <div
                    className={cn(
                      "relative flex size-9 items-center justify-center rounded-xl border text-xs font-semibold transition-all duration-500",
                      active
                        ? "border-primary bg-primary text-primary-foreground scale-110"
                        : "bg-muted/50 text-muted-foreground",
                    )}
                  >
                    {network.short}
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[10px] transition-colors duration-500",
                    active ? "text-foreground font-medium" : "text-muted-foreground",
                  )}
                >
                  {network.label}
                </span>
              </div>
            )
          })}
        </div>

        {/* Converging lines */}
        <svg
          viewBox="0 0 320 56"
          className="mt-2 h-14 w-full"
          aria-hidden
          preserveAspectRatio="none"
        >
          {NETWORKS.map((_, index) => {
            const x = 32 + index * 64
            const active = index === activeNetwork
            return (
              <path
                key={index}
                d={`M ${x} 0 C ${x} 28, 160 28, 160 56`}
                fill="none"
                stroke={active ? "var(--primary)" : "var(--border)"}
                strokeWidth={active ? 2 : 1}
                className="transition-all duration-500"
                strokeDasharray={active ? undefined : "3 3"}
              />
            )
          })}
        </svg>

        {/* XerinPay */}
        <div className="border-primary/30 bg-primary/5 relative -mt-1 rounded-xl border p-3 text-center">
          <div
            aria-hidden
            className="absolute inset-0 rounded-xl opacity-40"
            style={{
              background:
                "linear-gradient(110deg, transparent 20%, var(--primary) 50%, transparent 80%)",
              backgroundSize: "200% 100%",
              animation: "xerin-shimmer 3s linear infinite",
              maskImage: "linear-gradient(black, black)",
              opacity: 0.08,
            }}
          />
          <p className="relative text-sm font-semibold">XerinPay</p>
          <p className="text-muted-foreground relative text-xs">
            One API · one dashboard
          </p>
        </div>

        {/* Progress */}
        <div className="mt-5 space-y-2">
          {STEPS.map((item, index) => {
            const done = index < step
            const active = index === step
            return (
              <div
                key={item.label}
                className={cn(
                  "flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-500",
                  active
                    ? "border-primary/40 bg-primary/5"
                    : done
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-transparent",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold transition-colors duration-500",
                    done
                      ? "bg-emerald-500 text-white"
                      : active
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {done ? "✓" : index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={cn(
                      "text-xs font-medium transition-colors duration-500",
                      active || done ? "text-foreground" : "text-muted-foreground",
                    )}
                  >
                    {item.label}
                  </p>
                </div>
                <code className="text-muted-foreground shrink-0 font-mono text-[10px]">
                  {item.detail}
                </code>
              </div>
            )
          })}
        </div>
      </div>

      {/* Floating amount chip */}
      <div
        className="bg-card absolute -right-3 -top-3 rounded-xl border px-3 py-2 shadow-lg sm:-right-6"
        style={{ animation: "xerin-drift 8s ease-in-out infinite" }}
      >
        <p className="text-muted-foreground text-[10px]">Received</p>
        <p className="text-sm font-semibold tabular-nums">TZS 100,000</p>
      </div>
    </div>
  )
}
