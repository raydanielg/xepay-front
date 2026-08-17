"use client"

import { CodeBlock, InlineCode } from "@/components/docs/code-block"
import { ERROR_CODES } from "@/lib/docs/endpoints"

const HTTP_STATUSES = [
  { code: "200", meaning: "Fine." },
  { code: "201", meaning: "Created." },
  { code: "400", meaning: "Your request was malformed. Read `param`." },
  { code: "401", meaning: "The key is missing, wrong or revoked." },
  { code: "403", meaning: "The key is valid but not allowed to do this." },
  { code: "404", meaning: "No such object — or it belongs to someone else." },
  { code: "409", meaning: "Idempotency-Key reused with a different body." },
  { code: "429", meaning: "Rate limited. Read `Retry-After`." },
  { code: "5xx", meaning: "Ours. Retry with the same Idempotency-Key." },
]

export function ErrorsGuide() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Errors</h1>
      <p className="text-muted-foreground mt-3 text-lg">
        Every error has the same shape, whatever went wrong and whichever
        provider caused it.
      </p>

      <div className="mt-8">
        <CodeBlock
          code={JSON.stringify(
            {
              error: {
                type: "invalid_request_error",
                code: "invalid_phone",
                message:
                  "The phone number is not valid for the selected network.",
                param: "payer.phone",
                request_id: "req_01J8XKQ8ZP",
              },
            },
            null,
            2,
          )}
        />
      </div>

      <div className="mt-6 rounded-xl border-l-2 border-sky-500/60 bg-sky-500/5 p-4">
        <p className="text-sm font-medium">Log the request_id</p>
        <p className="text-muted-foreground mt-1 text-sm">
          It is on every response, success or failure, in the{" "}
          <InlineCode>X-Request-Id</InlineCode> header. When you contact
          support, it is the one thing that lets us find your exact request
          immediately instead of guessing from timestamps.
        </p>
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        Payment failure codes
      </h2>
      <p className="text-muted-foreground mt-2">
        These are ours, not the provider&apos;s. You never have to learn
        Selcom&apos;s or AzamPay&apos;s codes — we translate them.
      </p>

      <div className="mt-5 divide-y rounded-xl border">
        {ERROR_CODES.map((entry) => (
          <div key={entry.code} className="p-4">
            <div className="flex flex-wrap items-center gap-2">
              <code className="font-mono text-sm font-medium">{entry.code}</code>
              {entry.retry ? (
                <span className="rounded-md border border-sky-500/25 bg-sky-500/10 px-2 py-0.5 text-xs font-medium text-sky-700 dark:text-sky-400">
                  We retry automatically
                </span>
              ) : (
                <span className="text-muted-foreground rounded-md border px-2 py-0.5 text-xs font-medium">
                  Do not retry
                </span>
              )}
            </div>
            <p className="text-muted-foreground mt-1 text-sm">{entry.meaning}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border-l-2 border-amber-500/60 bg-amber-500/5 p-4">
        <p className="text-sm font-medium">
          Do not retry a customer failure
        </p>
        <p className="text-muted-foreground mt-1 text-sm">
          If someone has no balance or cancelled the prompt, sending the
          request again cannot succeed — it just puts another PIN prompt on
          their phone. Show them what happened and let them decide. We handle
          the retries that <em>can</em> help, by routing to another provider
          when the failure was technical.
        </p>
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        HTTP statuses
      </h2>
      <div className="mt-4 divide-y rounded-xl border">
        {HTTP_STATUSES.map((row) => (
          <div
            key={row.code}
            className="flex items-baseline gap-4 px-4 py-2.5 text-sm"
          >
            <code className="font-mono font-medium">{row.code}</code>
            <span className="text-muted-foreground">{row.meaning}</span>
          </div>
        ))}
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        Retrying safely
      </h2>
      <p className="text-muted-foreground mt-2">
        On a timeout or a <InlineCode>5xx</InlineCode>, retry with the{" "}
        <strong>same</strong> Idempotency-Key. That is what makes it safe: if
        the first attempt actually succeeded, you get the original result
        back rather than creating a second charge.
      </p>
      <div className="mt-4">
        <CodeBlock
          filename="Retry with backoff"
          code={`const idempotencyKey = randomUUID()   // once, outside the loop

for (let attempt = 0; attempt < 3; attempt++) {
  try {
    const response = await createCharge(payload, idempotencyKey)
    if (response.ok) return response
    if (response.status < 500) return response   // our fault? no. yours.
  } catch {
    // network dropped — safe to retry, the key protects us
  }
  await sleep(2 ** attempt * 1000)
}`}
        />
      </div>
    </div>
  )
}
