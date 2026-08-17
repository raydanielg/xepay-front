"use client"

/**
 * Full-page animated background.
 *
 * Sits behind everything at z-0 with the page content above it. Three
 * layers, cheapest first:
 *
 *   1. A static SVG grid — no animation cost at all.
 *   2. Slow-drifting colour fields — transform and opacity only, so they
 *      stay on the compositor and never trigger layout or paint.
 *   3. A few floating dots — decorative, and the first thing to go if this
 *      ever shows up in a performance trace.
 *
 * Deliberately no canvas and no particle library. This page loads on cheap
 * Android phones over 3G, and a background is not worth a frame budget.
 */

const ORBS = [
  {
    className: "left-[-10%] top-[-5%] size-[42rem]",
    colour: "var(--primary)",
    opacity: 0.16,
    duration: 26,
    delay: 0,
  },
  {
    className: "right-[-15%] top-[15%] size-[36rem]",
    colour: "var(--chart-2)",
    opacity: 0.13,
    duration: 32,
    delay: -8,
  },
  {
    className: "left-[20%] top-[55%] size-[38rem]",
    colour: "var(--chart-3)",
    opacity: 0.1,
    duration: 38,
    delay: -16,
  },
  {
    className: "right-[5%] bottom-[-10%] size-[34rem]",
    colour: "var(--chart-4)",
    opacity: 0.12,
    duration: 30,
    delay: -22,
  },
]

const DOTS = [
  { left: "12%", top: "22%", size: 5, duration: 14, delay: 0 },
  { left: "78%", top: "16%", size: 4, duration: 18, delay: -3 },
  { left: "24%", top: "68%", size: 6, duration: 22, delay: -7 },
  { left: "88%", top: "58%", size: 4, duration: 16, delay: -11 },
  { left: "58%", top: "84%", size: 5, duration: 20, delay: -5 },
  { left: "42%", top: "8%", size: 3, duration: 24, delay: -14 },
  { left: "6%", top: "46%", size: 4, duration: 19, delay: -9 },
  { left: "68%", top: "38%", size: 3, duration: 26, delay: -17 },
  { left: "34%", top: "30%", size: 4, duration: 21, delay: -2 },
]

/**
 * Concentric rings behind the hero subject.
 *
 * They read as a signal radiating outward — which is literally what a
 * payment prompt is — and they give the cut-out figure something to stand
 * in front of, now that it has no card behind it.
 */
const RINGS = [
  { size: "22rem", delay: 0 },
  { size: "34rem", delay: -2.4 },
  { size: "46rem", delay: -4.8 },
]

export function AnimatedBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Base wash so the orbs have something to sit on in both themes */}
      <div className="from-background via-background to-muted/30 absolute inset-0 bg-gradient-to-b" />

      {/* Grid */}
      <svg className="absolute inset-0 size-full opacity-[0.35]">
        <defs>
          <pattern
            id="xerin-grid"
            width="56"
            height="56"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 56 0 L 0 0 0 56"
              fill="none"
              stroke="var(--border)"
              strokeWidth="1"
            />
          </pattern>
          <radialGradient id="xerin-grid-fade">
            {/* Fades the grid out at the edges so it reads as texture
                rather than a table. */}
            <stop offset="0%" stopColor="white" stopOpacity="0.9" />
            <stop offset="70%" stopColor="white" stopOpacity="0.25" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </radialGradient>
          <mask id="xerin-grid-mask">
            <rect width="100%" height="100%" fill="url(#xerin-grid-fade)" />
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#xerin-grid)"
          mask="url(#xerin-grid-mask)"
        />
      </svg>

      {/* Drifting colour fields */}
      {ORBS.map((orb, index) => (
        <div
          key={index}
          className={`absolute rounded-full blur-3xl ${orb.className}`}
          style={{
            background: `radial-gradient(circle, ${orb.colour} 0%, transparent 68%)`,
            opacity: orb.opacity,
            animation: `xerin-drift ${orb.duration}s ease-in-out ${orb.delay}s infinite`,
          }}
        />
      ))}

      {/* Radiating rings, positioned behind where the hero subject stands */}
      <div className="absolute left-1/2 top-[34%] -translate-x-1/2 -translate-y-1/2">
        {RINGS.map((ring) => (
          <div
            key={ring.size}
            className="border-primary/20 absolute left-1/2 top-1/2 rounded-full border"
            style={{
              width: ring.size,
              height: ring.size,
              marginLeft: `calc(${ring.size} / -2)`,
              marginTop: `calc(${ring.size} / -2)`,
              animation: `xerin-ring 7.2s ease-out ${ring.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Floating dots */}
      {DOTS.map((dot, index) => (
        <span
          key={index}
          className="bg-primary/40 absolute rounded-full"
          style={{
            left: dot.left,
            top: dot.top,
            width: dot.size,
            height: dot.size,
            animation: `xerin-float ${dot.duration}s ease-in-out ${dot.delay}s infinite`,
          }}
        />
      ))}

      {/* Fades the whole field out toward the footer, so lower sections sit
          on a calm surface rather than competing with the background. */}
      <div className="from-background absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t to-transparent" />
    </div>
  )
}

/**
 * A softer, section-scoped version for bands that need lift without the
 * full page treatment behind them.
 */
export function SectionGlow({
  className = "",
}: {
  className?: string
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
    >
      <div
        className="absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.12] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          animation: "xerin-drift 24s ease-in-out infinite",
        }}
      />
    </div>
  )
}
