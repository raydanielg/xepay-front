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

/** Fade and slide content in as it enters the viewport. */
export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className,
  as: Tag = "div",
}: {
  children: React.ReactNode
  direction?: Direction
  /** Milliseconds. Use to stagger siblings. */
  delay?: number
  className?: string
  as?: React.ElementType
}) {
  const { ref, inView } = useInView<HTMLDivElement>()
  const reduced = usePrefersReducedMotion()

  return (
    <Tag
      ref={ref}
      className={className}
      style={{
        opacity: inView || reduced ? 1 : 0,
        transform: inView || reduced ? "none" : OFFSETS[direction],
        transition: reduced
          ? "none"
          : `opacity 620ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 620ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: reduced ? undefined : "opacity, transform",
      }}
    >
      {children}
    </Tag>
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
