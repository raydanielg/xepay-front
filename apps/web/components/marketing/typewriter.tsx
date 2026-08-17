"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

/**
 * Self-typing rotating text.
 *
 * Types a phrase, holds it long enough to read, deletes it, moves to the
 * next. Timings are tuned so the phrase is readable rather than
 * impressive — the point is that a visitor reads all of them, not that the
 * effect looks fast.
 *
 * Accessibility matters more here than it looks. A naive implementation
 * makes a screen reader announce every single character as it appears,
 * which is unusable. So:
 *
 *   * The animated text is aria-hidden.
 *   * A visually-hidden span carries every phrase as plain, static text, so
 *     assistive tech reads the full promise once and moves on.
 *   * Under prefers-reduced-motion the animation is skipped entirely and
 *     the first phrase is shown as static text.
 */

const TYPE_MS = 55
const DELETE_MS = 28
const HOLD_MS = 2000
const PAUSE_BEFORE_NEXT_MS = 320

export function Typewriter({
  phrases,
  className,
  cursorClassName,
}: {
  phrases: string[]
  className?: string
  cursorClassName?: string
}) {
  const [text, setText] = useState("")
  const [index, setIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)
  const [reduced, setReduced] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(query.matches)
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches)
    query.addEventListener("change", onChange)
    return () => query.removeEventListener("change", onChange)
  }, [])

  useEffect(() => {
    if (reduced || phrases.length === 0) return

    const current = phrases[index] ?? ""

    // Finished typing — hold, then start deleting.
    if (!deleting && text === current) {
      timer.current = setTimeout(() => setDeleting(true), HOLD_MS)
      return () => clearTimeout(timer.current)
    }

    // Finished deleting — advance to the next phrase.
    if (deleting && text === "") {
      timer.current = setTimeout(() => {
        setDeleting(false)
        setIndex((i) => (i + 1) % phrases.length)
      }, PAUSE_BEFORE_NEXT_MS)
      return () => clearTimeout(timer.current)
    }

    timer.current = setTimeout(
      () => {
        setText((previous) =>
          deleting
            ? current.slice(0, previous.length - 1)
            : current.slice(0, previous.length + 1),
        )
      },
      deleting ? DELETE_MS : TYPE_MS,
    )

    return () => clearTimeout(timer.current)
  }, [text, deleting, index, phrases, reduced])

  if (reduced) {
    return <span className={className}>{phrases[0]}</span>
  }

  return (
    <>
      {/* What a screen reader gets: the whole promise, once, as plain text. */}
      <span className="sr-only">{phrases.join(". ")}.</span>

      <span aria-hidden className={cn("inline-block", className)}>
        {text}
        <span
          className={cn(
            "ml-0.5 inline-block w-[3px] translate-y-[0.08em] self-stretch rounded-full align-middle",
            cursorClassName ?? "bg-primary",
          )}
          style={{
            height: "0.9em",
            animation: "xerin-caret 1s steps(2, start) infinite",
          }}
        />
      </span>
    </>
  )
}
