"use client"

import { useMemo, useState } from "react"
import { IconAlertTriangle, IconBolt, IconLoader2 } from "@tabler/icons-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { cn } from "@workspace/ui/lib/utils"

import { CodeBlock, EndpointSignature } from "@/components/docs/code-block"
import type { Endpoint } from "@/lib/docs/endpoints"
import { exampleBody } from "@/lib/docs/samples"
import { useDocsContext } from "@/lib/docs/context"

/**
 * Live API playground.
 *
 * Fires real requests at the configured base URL using the merchant's TEST
 * key. Two deliberate constraints:
 *
 *   * Test keys only. The picker never offers a live key, so nobody moves
 *     real money by clicking "Send" while reading documentation.
 *   * The request runs from the browser, so what you see is exactly what
 *     your own client would see — including CORS behaviour, which is a
 *     common first-integration stumble worth surfacing here rather than in
 *     production.
 */
export function Playground({ endpoint }: { endpoint: Endpoint }) {
  const { baseUrl, testKey, environment } = useDocsContext()

  const initialBody = useMemo(() => {
    const body = exampleBody(endpoint)
    return body ? JSON.stringify(body, null, 2) : ""
  }, [endpoint])

  const [body, setBody] = useState(initialBody)
  const [pathValue, setPathValue] = useState(endpoint.path)
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{
    status: number
    durationMs: number
    body: string
    requestId: string | null
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const needsKey = endpoint.auth !== "none"
  const hasPathParam = endpoint.path.includes("{")
  const canSend = !needsKey || Boolean(testKey)

  async function send() {
    setSending(true)
    setError(null)
    setResult(null)

    const started = performance.now()
    try {
      const headers: Record<string, string> = {}
      if (needsKey && testKey) headers.Authorization = `Bearer ${testKey}`
      if (body.trim()) headers["Content-Type"] = "application/json"
      if (endpoint.idempotent) {
        headers["Idempotency-Key"] =
          typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`
      }

      const response = await fetch(`${baseUrl}${pathValue}`, {
        method: endpoint.method,
        headers,
        body:
          endpoint.method === "GET" || !body.trim() ? undefined : body,
      })

      const text = await response.text()
      let pretty = text
      try {
        pretty = JSON.stringify(JSON.parse(text), null, 2)
      } catch {
        // Not JSON — show it raw.
      }

      setResult({
        status: response.status,
        durationMs: Math.round(performance.now() - started),
        body: pretty,
        requestId: response.headers.get("X-Request-Id"),
      })
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message}. If this is a CORS error, add this origin to CORS_ALLOWED_ORIGINS on your API.`
          : "The request failed.",
      )
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <IconBolt className="size-4 text-amber-500" />
          <span className="text-sm font-medium">Try it</span>
        </div>
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-xs font-medium",
            environment === "test"
              ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
              : "border-border bg-muted text-muted-foreground",
          )}
        >
          Test mode — no real money
        </span>
      </div>

      <div className="space-y-4 p-4">
        <EndpointSignature
          method={endpoint.method}
          path={pathValue}
          baseUrl={baseUrl}
        />

        {!canSend ? (
          <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <p className="text-sm">
              You need a test API key to send requests from here.{" "}
              <a href="/dashboard/api-keys" className="font-medium underline">
                Create one
              </a>
              , then come back — it&apos;s picked up automatically.
            </p>
          </div>
        ) : null}

        {hasPathParam ? (
          <div>
            <Label htmlFor={`${endpoint.id}-path`} className="text-xs">
              Path — replace the placeholder with a real id
            </Label>
            <Input
              id={`${endpoint.id}-path`}
              value={pathValue}
              onChange={(e) => setPathValue(e.target.value)}
              className="mt-1.5 font-mono text-sm"
            />
          </div>
        ) : null}

        {endpoint.method !== "GET" && initialBody ? (
          <div>
            <Label htmlFor={`${endpoint.id}-body`} className="text-xs">
              Request body
            </Label>
            <textarea
              id={`${endpoint.id}-body`}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={Math.min(initialBody.split("\n").length + 1, 16)}
              spellCheck={false}
              className="mt-1.5 w-full rounded-lg border bg-[#0d1117] p-3 font-mono text-[13px] text-white/85 outline-none focus:border-white/30"
            />
          </div>
        ) : null}

        <div className="flex items-center gap-3">
          <Button disabled={!canSend || sending} onClick={() => void send()}>
            {sending ? (
              <>
                <IconLoader2 className="size-4 animate-spin" />
                Sending
              </>
            ) : (
              `Send ${endpoint.method}`
            )}
          </Button>
          {endpoint.idempotent ? (
            <span className="text-muted-foreground text-xs">
              A fresh Idempotency-Key is generated per send.
            </span>
          ) : null}
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        ) : null}

        {result ? (
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span
                className={cn(
                  "rounded-md border px-2 py-0.5 font-mono font-semibold",
                  result.status < 300
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : result.status < 500
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400",
                )}
              >
                {result.status}
              </span>
              <span className="text-muted-foreground tabular-nums">
                {result.durationMs}ms
              </span>
              {result.requestId ? (
                <span className="text-muted-foreground font-mono">
                  {result.requestId}
                </span>
              ) : null}
            </div>
            <CodeBlock code={result.body} maxHeight="24rem" />
          </div>
        ) : null}
      </div>
    </div>
  )
}
