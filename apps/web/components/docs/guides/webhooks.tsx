"use client"

import { useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { CodeBlock, InlineCode } from "@/components/docs/code-block"
import { EVENT_TYPES } from "@/lib/docs/endpoints"
import { LANGUAGES, VERIFY_SAMPLES, type LanguageId } from "@/lib/docs/samples"

const RETRY_SCHEDULE = [
  { attempt: 1, after: "Immediately" },
  { attempt: 2, after: "1 minute" },
  { attempt: 3, after: "5 minutes" },
  { attempt: 4, after: "30 minutes" },
  { attempt: 5, after: "2 hours" },
  { attempt: 6, after: "6 hours" },
  { attempt: 7, after: "24 hours" },
]

export function WebhooksGuide() {
  const [language, setLanguage] = useState<LanguageId>("node")

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-semibold tracking-tight">
        Verifying a webhook
      </h2>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        Anyone can POST to your endpoint. Without verification, someone can
        send you a fake <InlineCode>charge.success</InlineCode> and take your
        goods for free. This is the single most important part of the
        integration.
      </p>

      <div className="mt-5">
        <CodeBlock
          filename="Headers on every delivery"
          code={`X-Xerin-Signature: t=1755419662,v1=5257a869e7ecebeda32affa62cdca3fa…
X-Xerin-Event-Id:  evt_01J8XKQ2M7VN4P
X-Xerin-Event-Type: charge.success`}
        />
      </div>

      <p className="text-muted-foreground mt-4">
        <InlineCode>v1</InlineCode> is{" "}
        <InlineCode>
          HMAC_SHA256(your_secret, &quot;{"{timestamp}"}.{"{raw_body}"}&quot;)
        </InlineCode>
        .
      </p>

      <div className="mt-6">
        <div className="mb-2 flex gap-1">
          {LANGUAGES.filter((l) => l.id !== "curl").map((lang) => (
            <button
              key={lang.id}
              type="button"
              onClick={() => setLanguage(lang.id)}
              className={cn(
                "rounded-md px-2.5 py-1 text-xs font-medium transition",
                language === lang.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {lang.label}
            </button>
          ))}
        </div>
        <CodeBlock code={VERIFY_SAMPLES[language]} />
      </div>

      <h3 className="mt-8 text-lg font-semibold tracking-tight">
        Five things people get wrong
      </h3>
      <ol className="mt-3 space-y-3">
        <Mistake
          n={1}
          title="Parsing the JSON before verifying"
          body="Parsing and re-serialising changes whitespace, so the signature will never match. Read the raw body first, verify, then parse."
        />
        <Mistake
          n={2}
          title="Comparing with == instead of a constant-time function"
          body="A normal comparison returns as soon as it finds a difference, and the timing leaks the signature one byte at a time. Use timingSafeEqual, hash_equals or compare_digest."
        />
        <Mistake
          n={3}
          title="Not checking the timestamp"
          body="Without it, someone who captures one valid webhook can replay it forever. Reject anything older than five minutes."
        />
        <Mistake
          n={4}
          title="Doing slow work before responding"
          body="Return 200 first, then process. If you take too long we treat it as a failure and retry, and you process the same event twice."
        />
        <Mistake
          n={5}
          title="Assuming each event arrives once"
          body="Retries and network drops mean duplicates are normal. Use X-Xerin-Event-Id as an idempotency key on your side."
        />
      </ol>

      <h3 className="mt-10 text-lg font-semibold tracking-tight">
        When delivery fails
      </h3>
      <p className="text-muted-foreground mt-2">
        Any <InlineCode>2xx</InlineCode> counts as success. Anything else
        retries on this schedule, with ±20% jitter so an outage does not
        produce a thundering herd when everyone comes back at once.
      </p>
      <div className="mt-4 divide-y rounded-xl border">
        {RETRY_SCHEDULE.map((row) => (
          <div
            key={row.attempt}
            className="flex items-center justify-between px-4 py-2.5 text-sm"
          >
            <span>Attempt {row.attempt}</span>
            <span className="text-muted-foreground">{row.after}</span>
          </div>
        ))}
      </div>
      <p className="text-muted-foreground mt-3 text-sm">
        After the seventh attempt the endpoint is disabled and we email you.
        <InlineCode>410 Gone</InlineCode> disables it immediately. You can
        resend any missed event from the dashboard.
      </p>

      <h3 className="mt-10 text-lg font-semibold tracking-tight">Events</h3>
      <div className="mt-4 divide-y rounded-xl border">
        {EVENT_TYPES.map((event) => (
          <div key={event.name} className="px-4 py-3">
            <code className="font-mono text-sm font-medium">{event.name}</code>
            <p className="text-muted-foreground mt-0.5 text-sm">
              {event.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

function Mistake({
  n,
  title,
  body,
}: {
  n: number
  title: string
  body: string
}) {
  return (
    <li className="flex gap-3 rounded-lg border p-3">
      <span className="text-muted-foreground shrink-0 font-mono text-sm">
        {n}
      </span>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 text-sm">{body}</p>
      </div>
    </li>
  )
}
