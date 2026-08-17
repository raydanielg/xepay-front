"use client"

import Link from "next/link"

import { CodeBlock, InlineCode } from "@/components/docs/code-block"
import { useDocsContext } from "@/lib/docs/context"
import { PLACEHOLDER_KEY } from "@/lib/docs/samples"

export function AuthenticationGuide() {
  const { baseUrl, testKey } = useDocsContext()
  const key = testKey ?? PLACEHOLDER_KEY

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Authentication</h1>
      <p className="text-muted-foreground mt-3 text-lg">
        Every request carries a key in the Authorization header. Which key you
        use decides what you can do and whether real money can move.
      </p>

      <div className="mt-8">
        <CodeBlock code={`Authorization: Bearer ${key}`} />
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        Four kinds of key
      </h2>
      <div className="mt-4 divide-y rounded-xl border">
        <KeyRow
          prefix="sk_live_"
          name="Live secret"
          where="Your server only"
          can="Everything, with real money"
        />
        <KeyRow
          prefix="sk_test_"
          name="Test secret"
          where="Your server, and this documentation"
          can="Everything, in the sandbox"
        />
        <KeyRow
          prefix="pk_live_"
          name="Live public"
          where="Safe in a browser"
          can="Create a charge. Cannot read anything."
        />
        <KeyRow
          prefix="pk_test_"
          name="Test public"
          where="Safe in a browser"
          can="Create a sandbox charge."
        />
      </div>

      <div className="mt-6 rounded-xl border-l-2 border-red-500/60 bg-red-500/5 p-4">
        <p className="text-sm font-medium">A secret key never goes in a browser</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Not in JavaScript, not in a mobile app, not in a React component,
          not in a repository. Anyone who can read your page source can read
          it, and a live secret can move every shilling in your balance. If
          you need to start a payment from a browser, use the public key —
          it can create a charge and nothing else.
        </p>
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        Test and live are separate worlds
      </h2>
      <p className="text-muted-foreground mt-2">
        The environment is baked into the key, so there is no &quot;test
        mode&quot; switch to get wrong. A test key physically cannot reach a
        real provider, and a live key cannot reach the sandbox. Your code is
        identical in both — only the key changes.
      </p>
      <div className="mt-4">
        <CodeBlock
          filename=".env"
          code={`# Development
XERINPAY_SECRET_KEY=sk_test_…
XERINPAY_BASE_URL=${baseUrl}

# Production — load from your secrets manager, never a committed file
XERINPAY_SECRET_KEY=sk_live_…`}
        />
      </div>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        Losing a key
      </h2>
      <p className="text-muted-foreground mt-2">
        We store a hash, not the key, so we cannot recover one for you. That
        is deliberate: it also means a breach of our database does not hand
        an attacker your credentials.
      </p>
      <p className="text-muted-foreground mt-3">
        If a key leaks, revoke it in{" "}
        <Link href="/dashboard/api-keys" className="underline">
          API keys
        </Link>{" "}
        and issue a new one. Revocation takes effect immediately, and it is
        permanent — there is no un-revoke.
      </p>

      <h2 className="mt-10 text-xl font-semibold tracking-tight">
        Rate limits
      </h2>
      <div className="mt-4 divide-y rounded-xl border">
        <LimitRow scope="Per API key" limit="100 requests / minute" />
        <LimitRow scope={<InlineCode>POST /v1/charges</InlineCode>} limit="30 / minute" />
        <LimitRow scope={<InlineCode>POST /v1/payouts</InlineCode>} limit="10 / minute" />
      </div>
      <p className="text-muted-foreground mt-3 text-sm">
        Going over returns <InlineCode>429</InlineCode> with a{" "}
        <InlineCode>Retry-After</InlineCode> header telling you how many
        seconds to wait. Respect it rather than retrying immediately.
      </p>
    </div>
  )
}

function KeyRow({
  prefix,
  name,
  where,
  can,
}: {
  prefix: string
  name: string
  where: string
  can: string
}) {
  const isSecret = prefix.startsWith("sk_")
  return (
    <div className="p-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <code
          className={`rounded px-1.5 py-0.5 font-mono text-sm font-medium ${
            isSecret
              ? "bg-red-500/10 text-red-700 dark:text-red-400"
              : "bg-sky-500/10 text-sky-700 dark:text-sky-400"
          }`}
        >
          {prefix}…
        </code>
        <span className="text-sm font-medium">{name}</span>
      </div>
      <dl className="text-muted-foreground mt-2 grid gap-1 text-sm sm:grid-cols-2">
        <div>
          <dt className="inline font-medium">Use it: </dt>
          <dd className="inline">{where}</dd>
        </div>
        <div>
          <dt className="inline font-medium">Can: </dt>
          <dd className="inline">{can}</dd>
        </div>
      </dl>
    </div>
  )
}

function LimitRow({
  scope,
  limit,
}: {
  scope: React.ReactNode
  limit: string
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
      <span>{scope}</span>
      <span className="text-muted-foreground tabular-nums">{limit}</span>
    </div>
  )
}
