"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

/**
 * 3D elements, built on CSS transforms rather than WebGL.
 *
 * This is a deliberate engineering choice, not a shortcut. Three.js plus a
 * React renderer is ~600KB of JavaScript before a single triangle is drawn,
 * and it holds a WebGL context open. The people paying through XerinPay are
 * on entry-level Android handsets over 3G — the exact devices where that
 * cost is felt hardest, and where a dropped WebGL context means a blank
 * rectangle instead of a hero.
 *
 * `perspective` + `transform-style: preserve-3d` + `rotateX/Y/Z` is real 3D:
 * true depth, correct occlusion between layers, GPU-composited, and it
 * degrades to a flat card rather than nothing. Everything below runs on the
 * compositor thread and costs no main-thread time.
 *
 * If we ever genuinely need a mesh — a rotating globe with real geometry —
 * that is the point to reach for WebGL, lazily and behind a capability
 * check. Not before.
 */

// --------------------------------------------------------------------------
// Pointer-tracked tilt
// --------------------------------------------------------------------------

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(query.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  return reduced
}

/**
 * Tilts its children toward the pointer in real 3D.
 *
 * Pointer events rather than mouse events, so it works with a stylus. On
 * touch there is no hover, so the tilt simply never engages — no jitter
 * from treating a tap as a hover.
 */
export function Tilt({
  children,
  className,
  maxDeg = 12,
  scale = 1.02,
  glare = true,
}: {
  children: React.ReactNode
  className?: string
  /** Maximum rotation on each axis. Beyond ~15° it starts to look broken. */
  maxDeg?: number
  scale?: number
  glare?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const frame = useRef<number>(0)
  const reduced = usePrefersReducedMotion()
  const [transform, setTransform] = useState("")
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50, opacity: 0 })

  const onPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (reduced || event.pointerType === "touch") return
      const element = ref.current
      if (!element) return

      // Throttle to one update per frame. Without this, a fast pointer
      // queues dozens of style writes per frame for no visual gain.
      cancelAnimationFrame(frame.current)
      const { clientX, clientY } = event

      frame.current = requestAnimationFrame(() => {
        const rect = element.getBoundingClientRect()
        const px = (clientX - rect.left) / rect.width
        const py = (clientY - rect.top) / rect.height

        // Invert Y so moving up tilts the top away, which is what the eye
        // expects from a physical object.
        const rotateY = (px - 0.5) * 2 * maxDeg
        const rotateX = -(py - 0.5) * 2 * maxDeg

        setTransform(
          `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale(${scale})`,
        )
        setGlarePos({ x: px * 100, y: py * 100, opacity: 0.14 })
      })
    },
    [maxDeg, scale, reduced],
  )

  const reset = useCallback(() => {
    cancelAnimationFrame(frame.current)
    setTransform("perspective(1200px) rotateX(0deg) rotateY(0deg) scale(1)")
    setGlarePos((prev) => ({ ...prev, opacity: 0 }))
  }, [])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      className={cn("relative", className)}
      style={{
        transform: transform || undefined,
        transformStyle: "preserve-3d",
        transition: transform
          ? "transform 120ms cubic-bezier(0.16,1,0.3,1)"
          : "transform 420ms cubic-bezier(0.16,1,0.3,1)",
        willChange: "transform",
      }}
    >
      {children}
      {glare && !reduced ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, white, transparent 55%)`,
            opacity: glarePos.opacity,
            mixBlendMode: "overlay",
          }}
        />
      ) : null}
    </div>
  )
}

/** Pushes a child forward on the Z axis inside a `Tilt`. */
export function Layer({
  children,
  depth = 40,
  className,
}: {
  children: React.ReactNode
  /** Pixels toward the viewer. */
  depth?: number
  className?: string
}) {
  return (
    <div
      className={className}
      style={{
        transform: `translateZ(${depth}px)`,
        transformStyle: "preserve-3d",
      }}
    >
      {children}
    </div>
  )
}

// --------------------------------------------------------------------------
// Rotating payment card
// --------------------------------------------------------------------------

/**
 * A card with genuine front and back faces, rotating in 3D.
 *
 * `backfaceVisibility: hidden` on both faces is what makes this real rather
 * than a crossfade — the back is genuinely behind the front and occludes
 * correctly through the rotation.
 */
export function RotatingCard({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion()

  return (
    <div
      className={cn("relative", className)}
      style={{ perspective: "1400px" }}
    >
      <div
        className="relative aspect-[1.586/1] w-full"
        style={{
          transformStyle: "preserve-3d",
          animation: reduced
            ? undefined
            : "xerin-card-spin 16s cubic-bezier(0.65,0,0.35,1) infinite",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl p-5 shadow-2xl"
          style={{
            backfaceVisibility: "hidden",
            background:
              "linear-gradient(135deg, oklch(0.42 0.14 40) 0%, oklch(0.28 0.09 35) 55%, oklch(0.20 0.05 30) 100%)",
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 opacity-40"
            style={{
              background:
                "radial-gradient(circle at 78% 18%, rgba(255,255,255,0.32), transparent 52%)",
            }}
          />

          <div className="relative flex h-full flex-col justify-between text-white">
            <div className="flex items-start justify-between">
              <span className="text-sm font-semibold tracking-tight">
                XerinPay
              </span>
              <span className="text-[10px] uppercase tracking-widest text-white/60">
                Merchant
              </span>
            </div>

            {/* Chip */}
            <div
              className="h-8 w-11 rounded-md"
              style={{
                background:
                  "linear-gradient(135deg, #e8c98a 0%, #b8933f 50%, #e8c98a 100%)",
              }}
            />

            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/50">
                Available balance
              </p>
              <p className="mt-0.5 text-xl font-semibold tabular-nums">
                TZS 4,850,000
              </p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 overflow-hidden rounded-2xl shadow-2xl"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background:
              "linear-gradient(135deg, oklch(0.24 0.05 32) 0%, oklch(0.18 0.03 28) 100%)",
          }}
        >
          <div className="mt-6 h-10 w-full bg-black/70" />
          <div className="px-5 pt-4">
            <div className="flex h-8 items-center justify-end rounded bg-white/90 px-3">
              <span className="font-mono text-xs text-black/70">•••</span>
            </div>
            <p className="mt-4 text-[10px] leading-relaxed text-white/40">
              Settled to your bank on a T+2 schedule. Every shilling traced
              through a double-entry ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------
// 3D network constellation
// --------------------------------------------------------------------------

/**
 * Mobile money services, by the network that runs them, plus banks as a
 * single node.
 *
 * AzamPesa is deliberately absent: it is a wallet run by Azam Group rather
 * than a mobile network operator, so it has no MSISDN prefix of its own and
 * does not belong beside M-Pesa in a list of networks.
 */
const RING = [
  { label: "M-Pesa", angle: 0 },
  { label: "Mixx", angle: 60 },
  { label: "Airtel", angle: 120 },
  { label: "HaloPesa", angle: 180 },
  { label: "T-Pesa", angle: 240 },
  { label: "Banks", angle: 300 },
]

/**
 * Networks orbiting XerinPay on a tilted ring, in true 3D.
 *
 * The ring is rotated on X so it reads as a disc seen at an angle; each
 * node is then counter-rotated to stay upright and legible. That
 * counter-rotation is the whole trick — without it the labels tumble and
 * become unreadable at the back of the orbit.
 */
export function NetworkOrbit({ className }: { className?: string }) {
  const reduced = usePrefersReducedMotion()
  const radius = 132

  return (
    <div
      className={cn("relative mx-auto aspect-square w-full max-w-md", className)}
      style={{ perspective: "1000px" }}
      aria-hidden
    >
      <div
        className="absolute inset-0"
        style={{
          transformStyle: "preserve-3d",
          transform: "rotateX(66deg)",
          animation: reduced ? undefined : "xerin-orbit 26s linear infinite",
        }}
      >
        {/* Orbit path */}
        <div
          className="border-primary/25 absolute rounded-full border"
          style={{
            inset: `calc(50% - ${radius}px)`,
            transformStyle: "preserve-3d",
          }}
        />

        {RING.map((node) => (
          <div
            key={node.label}
            className="absolute left-1/2 top-1/2"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotate(${node.angle}deg) translateX(${radius}px)`,
            }}
          >
            {/*
              Three nested transforms, and all three are needed:

              1. This layer counter-spins on Z at the same rate as the ring,
                 cancelling the orbit rotation. Without it the labels tumble
                 as they travel and are unreadable at the back of the orbit.
              2. The inner layer undoes this node's own fixed ring angle.
              3. …and the ring's 66° X tilt, so the label faces the viewer
                 squarely rather than lying flat on the disc.
            */}
            <div
              style={{
                transformStyle: "preserve-3d",
                animation: reduced
                  ? undefined
                  : "xerin-counter-orbit 26s linear infinite",
              }}
            >
              <div
                className="bg-card/95 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-2xl border px-1 text-center shadow-lg backdrop-blur"
                style={{ transform: `rotate(${-node.angle}deg) rotateX(-66deg)` }}
              >
                <span className="text-[10px] font-semibold leading-tight">
                  {node.label}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Hub */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="bg-primary text-primary-foreground relative flex size-24 items-center justify-center rounded-3xl shadow-2xl">
          <span
            aria-hidden
            className="bg-primary/30 absolute inset-0 rounded-3xl"
            style={{ animation: "xerin-ripple 2.6s ease-out infinite" }}
          />
          <span className="relative text-sm font-semibold">XerinPay</span>
        </div>
      </div>
    </div>
  )
}
