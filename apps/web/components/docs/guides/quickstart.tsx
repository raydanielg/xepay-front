"use client"

import Link from "next/link"
import { useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { CodeBlock, InlineCode } from "@/components/docs/code-block"
import { useDocsContext } from "@/lib/docs/context"
import { LANGUAGES, PLACEHOLDER_KEY, type LanguageId } from "@/lib/docs/samples"

export function QuickstartGuide() {
  const { baseUrl, testKey } = useDocsContext()
  const [language, setLanguage] = useState<LanguageId>("curl")
  const key = testKey ?? PLACEHOLDER_KEY

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Quickstart</h1>
      <p className="text-muted-foreground mt-3 text-lg">
        A working payment in five minutes, entirely in the sandbox. No real
        money moves and no real phone rings.
      </p>

      <Section n={1} title="Get a test key">
        <p className="text-muted-foreground">
          Create one from{" "}
          <Link href="/dashboard/api-keys" className="underline">
            API keys
          </Link>{" "}
          in your dashboard. Copy the secret when it appears — it is shown
          once and stored only as a hash, so we genuinely cannot show it to
          you again.
        </p>
        <p className="text-muted-foreground mt-3">
          Test keys start with <InlineCode>sk_test_</InlineCode> and can only
          reach the sandbox. They cannot move real money, which is why you
          can experiment freely.
        </p>
      </Section>

      <Section n={2} title="Send your first charge">
        <p className="text-muted-foreground mb-4">
          This number is a sandbox number that always succeeds, three seconds
          after you call it.
        </p>

        <div className="mb-2 flex gap-1">
          {LANGUAGES.map((lang) => (
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

        <CodeBlock code={firstCharge(language, baseUrl, key)} />

        <p className="text-muted-foreground mt-4">
          You get back a charge with status <InlineCode>pending</InlineCode>.
          That is not a failure — it means the prompt has gone out and we are
          waiting on the customer.
        </p>
      </Section>

      <Section n={3} title="Listen for the result">
        <p className="text-muted-foreground mb-4">
          Register an endpoint, and we will POST to it when the charge
          resolves. <strong>This is the signal that matters</strong> — never
          ship goods based on the response from step 2.
        </p>
        <CodeBlock
          code={`curl -X POST ${baseUrl}/v1/webhooks/endpoints \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://your-server.co.tz/webhooks/xerinpay",
    "events": ["charge.success", "charge.failed"]
  }'`}
        />
        <p className="text-muted-foreground mt-4">
          The response includes a signing secret, once. Store it — you need
          it to verify that a webhook really came from us. See{" "}
          <Link href="/docs/webhooks" className="underline">
            Webhooks
          </Link>
          .
        </p>
      </Section>

      <Section n={4} title="Handle the failure paths">
        <p className="text-muted-foreground mb-4">
          The happy path is the easy part. Before you go live, make sure your
          integration survives each of these — the sandbox lets you trigger
          them on demand.
        </p>
        <div className="divide-y rounded-xl border">
          <Row
            number="+255700000002"
            outcome="No balance"
            note="Show the customer a clear message. Do not retry — it will just annoy them."
          />
          <Row
            number="+255700000003"
            outcome="They cancelled"
            note="Let them start again. This is not an error on your side."
          />
          <Row
            number="+255700000004"
            outcome="No webhook ever arrives"
            note="The one people forget. Your code must not hang forever waiting."
          />
          <Row
            number="+255700000005"
            outcome="Succeeds after two minutes"
            note="Proves your webhook handler still works long after the request finished."
          />
        </div>
      </Section>

      <div className="mt-10 rounded-xl border bg-muted/30 p-5">
        <p className="font-medium">Going live</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Live keys need approved verification. Upload your documents in{" "}
          <Link href="/dashboard/kyc" className="underline">
            Verification
          </Link>
          , and once approved you can issue a <InlineCode>sk_live_</InlineCode>{" "}
          key. Your code does not change — only the key does.
        </p>
      </div>
    </div>
  )
}

function Section({
  n,
  title,
  children,
}: {
  n: number
  title: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-10">
      <div className="mb-4 flex items-center gap-3">
        <span className="bg-foreground text-background flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
          {n}
        </span>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  )
}

function Row({
  number,
  outcome,
  note,
}: {
  number: string
  outcome: string
  note: string
}) {
  return (
    <div className="p-3">
      <div className="flex flex-wrap items-baseline gap-2">
        <code className="font-mono text-sm font-medium">{number}</code>
        <span className="text-sm">{outcome}</span>
      </div>
      <p className="text-muted-foreground mt-1 text-sm">{note}</p>
    </div>
  )
}

function firstCharge(language: LanguageId, baseUrl: string, key: string): string {
  const body = {
    amount: 10000,
    currency: "TZS",
    channel: "mobile_money",
    payer: { phone: "+255700000001", name: "Asha Mwakalinga" },
    description: "My first payment",
  }

  if (language === "curl") {
    return `curl -X POST ${baseUrl}/v1/charges \\
  -H "Authorization: Bearer ${key}" \\
  -H "Content-Type: application/json" \\
  -H "Idempotency-Key: $(uuidgen)" \\
  -d '${JSON.stringify(body, null, 2).replace(/\n/g, "\n  ")}'`
  }

  if (language === "node") {
    return `import { randomUUID } from "node:crypto"

const response = await fetch("${baseUrl}/v1/charges", {
  method: "POST",
  headers: {
    Authorization: "Bearer ${key}",
    "Content-Type": "application/json",
    "Idempotency-Key": randomUUID(),
  },
  body: JSON.stringify(${JSON.stringify(body, null, 2).replace(/\n/g, "\n  ")}),
})

console.log(await response.json())`
  }

  if (language === "php") {
    return `<?php

$ch = curl_init('${baseUrl}/v1/charges');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_HTTPHEADER     => [
        'Authorization: Bearer ${key}',
        'Content-Type: application/json',
        'Idempotency-Key: ' . bin2hex(random_bytes(16)),
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'amount'      => 10000,
        'currency'    => 'TZS',
        'channel'     => 'mobile_money',
        'payer'       => ['phone' => '+255700000001', 'name' => 'Asha Mwakalinga'],
        'description' => 'My first payment',
    ]),
]);

print_r(json_decode(curl_exec($ch), true));`
  }

  return `import uuid
import requests

response = requests.post(
    "${baseUrl}/v1/charges",
    headers={
        "Authorization": "Bearer ${key}",
        "Idempotency-Key": str(uuid.uuid4()),
    },
    json={
        "amount": 10000,
        "currency": "TZS",
        "channel": "mobile_money",
        "payer": {"phone": "+255700000001", "name": "Asha Mwakalinga"},
        "description": "My first payment",
    },
    timeout=30,
)

print(response.json())`
}
