"use client"

import { useState } from "react"
import { IconCheck, IconCopy } from "@tabler/icons-react"

import { cn } from "@workspace/ui/lib/utils"

/**
 * Code display with copy.
 *
 * Deliberately not syntax-highlighted by a library: a highlighter is 40KB+
 * of JS for decoration. A monospace block on a dark surface reads perfectly
 * well, and the docs stay fast.
 */
export function CodeBlock({
  code,
  language,
  filename,
  className,
  maxHeight = "32rem",
}: {
  code: string
  language?: string
  filename?: string
  className?: string
  maxHeight?: string
}) {
  const [copied, setCopied] = useState(false)

  function copy() {
    void navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border border-white/10 bg-[#0d1117]",
        className,
      )}
    >
      {filename || language ? (
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="font-mono text-xs text-white/50">
            {filename ?? language}
          </span>
        </div>
      ) : null}

      <button
        type="button"
        onClick={copy}
        aria-label="Copy code"
        className="absolute right-3 top-3 z-10 rounded-md border border-white/10 bg-white/5 p-1.5 text-white/60 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-white focus:opacity-100"
        style={filename || language ? { top: "2.75rem" } : undefined}
      >
        {copied ? (
          <IconCheck className="size-3.5 text-emerald-400" />
        ) : (
          <IconCopy className="size-3.5" />
        )}
      </button>

      <pre
        className="overflow-auto p-4 text-[13px] leading-relaxed"
        style={{ maxHeight }}
      >
        <code className="font-mono text-white/85">{code}</code>
      </pre>
    </div>
  )
}

/** Small inline code span, for referring to a field in prose. */
export function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[0.85em]">
      {children}
    </code>
  )
}

const METHOD_STYLES: Record<string, string> = {
  GET: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20",
  POST: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  PATCH: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  DELETE: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
}

export function MethodBadge({ method }: { method: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-md border px-2 py-0.5 font-mono text-xs font-semibold",
        METHOD_STYLES[method] ?? "bg-muted text-muted-foreground border-border",
      )}
    >
      {method}
    </span>
  )
}

/** The method + path line that heads every endpoint. */
export function EndpointSignature({
  method,
  path,
  baseUrl,
}: {
  method: string
  path: string
  baseUrl?: string
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
      <MethodBadge method={method} />
      <code className="font-mono text-sm">
        {baseUrl ? (
          <span className="text-muted-foreground">{baseUrl}</span>
        ) : null}
        <span className="font-medium">{path}</span>
      </code>
    </div>
  )
}
