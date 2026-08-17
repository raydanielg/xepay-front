"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

/**
 * Scroll animation primitives.
 *
 * Built on IntersectionObserver and CSS transitions rather than an
 * animation library — a landing page that ships 60KB of JS to fade some
 * text in is a landing page that loads slowly on the 3G connections most
 * of our visitors are on.
 *
 * Everything here respects `prefers-reduced-motion`: content still appears,
 * it just does not move. Motion sickness is not a design choice.
 */

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

export function useInView<T extends HTMLElement>(
  options: { threshold?: number; once?: boolean } = {},
) {
  const { threshold = 0.15, once = true } = options
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return
        if (entry.isIntersecting) {
          setInView(true)
          if (once) observer.disconnect()
        } else if (!once) {
          setInView(false)
        }
      },
      { threshold, rootMargin: "0px 0px -60px 0px" },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, once])

  return { ref, inView }
}

type Direction = "up" | "down" | "left" | "right" | "none"

const OFFSETS: Record<Direction, string> = {
  up: "translate3d(0, 24px, 0)",
  down: "translate3d(0, -24px, 0)",
  left: "translate3d(24px, 0, 0)",
  right: "translate3d(-24px, 0, 0)",
  none: "none",
}

/**
 * Fade and slide content in as it enters the viewport.
 *
 * Deliberately not polymorphic. A generic `as` prop plus a forwarded ref is
 * a lot of type machinery for a wrapper div, and every use here is a div.
 */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className,
}: {
  children: React.ReactNode
  direction?: Direction
  /** Milliseconds. Use to stagger siblings. */
  delay?: number
  className?: string
}) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const reduced = usePrefersReducedMotion()
  const visible = inView || reduced

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : OFFSETS[direction],
        transition: reduced
          ? "none"
          : `opacity 620ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 620ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        // Dropped once the animation is done so we do not keep a layer
        // promoted for every revealed block on a long page.
        willChange: reduced || visible ? undefined : "opacity, transform",
      }}
    >
      {children}
    </div>
  )
}

/** Stagger a list of children without hand-writing each delay. */
export function Stagger({
  children,
  step = 80,
  direction = "up",
  className,
}: {
  children: React.ReactNode
  step?: number
  direction?: Direction
  className?: string
}) {
  const items = Array.isArray(children) ? children : [children]

  return (
    <div className={className}>
      {items.map((child, index) => (
        <Reveal key={index} direction={direction} delay={index * step}>
          {child}
        </Reveal>
      ))}
    </div>
  )
}

/**
 * Count up to a number when it scrolls into view.
 *
 * Uses requestAnimationFrame with an ease-out so it decelerates rather than
 * stopping dead — a linear counter reads as a loading spinner.
 */
export function CountUp({
  to,
  duration = 1600,
  prefix = "",
  suffix = "",
  decimals = 0,
}: {
  to: number
  duration?: number
  prefix?: string
  suffix?: string
  decimals?: number
}) {
  const { ref, inView } = useInView<HTMLSpanElement>()
  const reduced = usePrefersReducedMotion()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      setValue(to)
      return
    }

    let frame = 0
    const start = performance.now()

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress)
      setValue(to * eased)

      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, to, duration, reduced])

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {value.toLocaleString("en-TZ", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  )
}

/**
 * Continuous horizontal scroll, duplicated so the loop is seamless.
 *
 * Paused on hover so a visitor can actually read a logo they recognised,
 * and disabled entirely under reduced motion.
 */
export function Marquee({
  children,
  speed = 40,
  className,
}: {
  children: React.ReactNode
  /** Seconds for one full pass. */
  speed?: number
  className?: string
}) {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return (
      <div className={cn("flex flex-wrap justify-center gap-8", className)}>
        {children}
      </div>
    )
  }

  return (
    <div
      className={cn(
        "group relative flex overflow-hidden",
        "[mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]",
        className,
      )}
    >
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          className="flex shrink-0 items-center gap-12 pr-12 group-hover:[animation-play-state:paused]"
          style={{
            animation: `xerin-marquee ${speed}s linear infinite`,
          }}
        >
          {children}
        </div>
      ))}
    </div>
  )
}

/**
 * Continuous vertical scroll. Same seamless-loop trick as `Marquee`, but on
 * the Y axis.
 *
 * Reads as a live feed of everything reachable, which is the point of the
 * section it sits in. Paused on hover so a visitor can read a name they
 * recognised.
 */
export function VerticalMarquee({
  children,
  speed = 26,
  reverse = false,
  className,
}: {
  children: React.ReactNode
  /** Seconds for one full pass. */
  speed?: number
  /** Scroll downward instead of upward. */
  reverse?: boolean
  className?: string
}) {
  const reduced = usePrefersReducedMotion()

  if (reduced) {
    return <div className={cn("flex flex-col gap-3", className)}>{children}</div>
  }

  return (
    <div
      className={cn(
        "group relative flex flex-col overflow-hidden",
        "[mask-image:linear-gradient(to_bottom,transparent,black_14%,black_86%,transparent)]",
        className,
      )}
    >
      {[0, 1].map((copy) => (
        <div
          key={copy}
          aria-hidden={copy === 1}
          className="flex shrink-0 flex-col gap-3 pb-3 group-hover:[animation-play-state:paused]"
          style={{
            animation: `xerin-marquee-y ${speed}s linear infinite`,
            animationDirection: reverse ? "reverse" : "normal",
          }}
        >
          {children}
        </div>
      ))}
    </div>
  )
}

/** Soft animated blobs behind the hero. Purely decorative. */
export function GradientField({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className,
      )}
    >
      <div
        className="absolute -left-32 -top-32 size-[38rem] rounded-full opacity-[0.18] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--primary) 0%, transparent 70%)",
          animation: "xerin-drift 18s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -right-40 top-20 size-[32rem] rounded-full opacity-[0.14] blur-3xl"
        style={{
          background:
            "radial-gradient(circle, var(--chart-2) 0%, transparent 70%)",
          animation: "xerin-drift 22s ease-in-out infinite reverse",
        }}
      />
    </div>
  )
}
