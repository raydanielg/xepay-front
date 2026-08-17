"use client"

import { CodeBlock, InlineCode } from "@/components/docs/code-block"
import { useDocsContext } from "@/lib/docs/context"
import { TEST_NUMBERS } from "@/lib/docs/endpoints"
import { PLACEHOLDER_KEY } from "@/lib/docs/samples"

const TONE_STYLES = {
  success:
    "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  fail: "border-red-500/25 bg-red-500/10 text-red-700 dark:text-red-400",
  warn: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400",
} as const

export function TestingGuide() {
  const { baseUrl, testKey } = useDocsContext()
  const key = testKey ?? PLACEHOLDER_KEY

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Testing</h1>
      <p className="text-muted-foreground mt-3 text-lg">
        The sandbox lets you trigger every failure on demand, instead of
        waiting for one to happen in production at an inconvenient moment.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        Test numbers
      </h2>
      <p className="text-muted-foreground mt-2">
        Use these with any <InlineCode>sk_test_</InlineCode> key. No real
        phone is contacted and no money moves.
      </p>

      <div className="mt-5 divide-y rounded-xl border">
        {TEST_NUMBERS.map((entry) => (
          <div
            key={entry.number}
            className="flex flex-wrap items-center justify-between gap-3 p-4"
          >
            <code className="font-mono text-sm font-medium">{entry.number}</code>
            <span
              className={`rounded-md border px-2 py-0.5 text-xs font-medium ${
                TONE_STYLES[entry.tone]
              }`}
            >
              {entry.behaviour}
            </span>
          </div>
        ))}
      </div>

      <p className="text-muted-foreground mt-4">
        Any other valid Tanzanian number succeeds immediately, so the happy
        path stays frictionless while you build.
      </p>

      <div className="mt-6 rounded-xl border-l-2 border-amber-500/60 bg-amber-500/5 p-4">
        <p className="text-sm font-medium">
          Do not skip <code className="font-mono">+255700000004</code>
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          It never sends a callback at all. This is not an edge case — on
          Tanzanian networks, lost callbacks are a certainty, not a
          possibility. If your code hangs forever waiting for a webhook that
          never comes, you will find out here rather than at month end.
        </p>
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        A test worth writing
      </h2>
      <p className="text-muted-foreground mt-2">
        Before going live, prove your integration handles a duplicate
        webhook. We retry, and networks duplicate — your handler will
        receive the same event twice.
      </p>
      <div className="mt-4">
        <CodeBlock
          filename="What to assert"
          code={`// Given the same event delivered twice...
await handleWebhook(event)
await handleWebhook(event)   // same X-Xerin-Event-Id

// ...the order ships once, and the customer is charged once.
expect(await ordersShippedFor(event.data.reference)).toBe(1)`}
        />
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        Checking provider health
      </h2>
      <p className="text-muted-foreground mt-2">
        When payments start failing, check this first — it tells you whether
        the problem is us, a mobile network, or your own integration.
      </p>
      <div className="mt-4">
        <CodeBlock code={`curl ${baseUrl}/v1/providers/status`} />
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        Moving to live
      </h2>
      <ol className="text-muted-foreground mt-3 list-decimal space-y-2 pl-5 text-sm">
        <li>Get your verification approved.</li>
        <li>
          Issue a <InlineCode>sk_live_</InlineCode> key.
        </li>
        <li>
          Register a live webhook endpoint — test and live endpoints are
          separate, and this is the step people forget.
        </li>
        <li>Swap the key in your secrets manager. Nothing else changes.</li>
        <li>Send one small real payment to yourself before announcing it.</li>
      </ol>

      <div className="mt-6">
        <CodeBlock
          code={`# The only difference between sandbox and production
- XERINPAY_SECRET_KEY=${key}
+ XERINPAY_SECRET_KEY=sk_live_…`}
        />
      </div>
    </div>
  )
}
