"use client"

import Link from "next/link"
import {
  IconArrowRight,
  IconBolt,
  IconCode,
  IconLink,
  IconShieldCheck,
  IconWebhook,
} from "@tabler/icons-react"

import { CodeBlock } from "@/components/docs/code-block"
import { useDocsContext } from "@/lib/docs/context"
import { SECTIONS } from "@/lib/docs/endpoints"

export default function DocsHomePage() {
  const { baseUrl } = useDocsContext()

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">
        XerinPay API
      </h1>
      <p className="text-muted-foreground mt-3 text-lg">
        One API for mobile money and bank payments across Tanzania. M-Pesa,
        Mixx by Yas, Airtel Money, HaloPesa, AzamPesa and the banks — without
        integrating each one separately.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <QuickCard
          href="/docs/quickstart"
          icon={IconBolt}
          title="Quickstart"
          description="Your first payment in five minutes."
        />
        <QuickCard
          href="/docs/authentication"
          icon={IconShieldCheck}
          title="Authentication"
          description="Keys, environments and what never goes in a browser."
        />
        <QuickCard
          href="/docs/charges"
          icon={IconCode}
          title="Charges"
          description="Collect money from a customer's wallet."
        />
        <QuickCard
          href="/docs/webhooks"
          icon={IconWebhook}
          title="Webhooks"
          description="Know when a payment actually lands."
        />
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">
        How a payment works
      </h2>
      <p className="text-muted-foreground mt-2">
        Three things happen, and only the third one means you have been paid.
      </p>

      <ol className="mt-5 space-y-4">
        <Step
          n={1}
          title="You create a charge"
          body="We push a prompt to the customer's phone and return immediately with status pending. This call does not wait for them."
        />
        <Step
          n={2}
          title="The customer enters their PIN"
          body="This can take seconds or minutes. They might also ignore it, cancel it, or have no balance."
        />
        <Step
          n={3}
          title="We send you a webhook"
          body="charge.success means the money is yours. This is the only signal you should act on — do not ship goods on the response from step 1."
        />
      </ol>

      <div className="mt-6 rounded-xl border-l-2 border-amber-500/60 bg-amber-500/5 p-4">
        <p className="text-sm font-medium">Build for lost callbacks</p>
        <p className="text-muted-foreground mt-1 text-sm">
          Tanzanian networks drop constantly. Some webhooks will not arrive.
          We retry seven times over 24 hours, and we poll the provider
          ourselves — but your integration should also be able to ask us for
          a charge&apos;s status rather than assuming silence means failure.
        </p>
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">
        Your base URL
      </h2>
      <p className="text-muted-foreground mt-2">
        Every example on these pages already uses your configured host, so
        you can copy them directly.
      </p>
      <div className="mt-3">
        <CodeBlock code={baseUrl} />
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">
        Two rules worth knowing now
      </h2>
      <div className="mt-4 space-y-3">
        <Rule
          title="Amounts are integers, in minor units"
          body="10000 means TZS 100.00. Never send a decimal — floats lose precision and payment systems do not tolerate that."
        />
        <Rule
          title="Every money-moving POST needs an Idempotency-Key"
          body="Networks drop, clients retry. Without a key, a retry creates a second charge. With one, it returns the original."
        />
      </div>

      <h2 className="mt-12 text-xl font-semibold tracking-tight">
        API reference
      </h2>
      <div className="mt-4 divide-y rounded-xl border">
        {SECTIONS.map((section) => (
          <Link
            key={section.slug}
            href={`/docs/${section.slug}`}
            className="flex items-center justify-between gap-4 p-4 transition hover:bg-muted/50"
          >
            <div className="min-w-0">
              <p className="font-medium">{section.title}</p>
              <p className="text-muted-foreground mt-0.5 text-sm">
                {section.summary}
              </p>
            </div>
            <IconArrowRight className="text-muted-foreground size-4 shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}

function QuickCard({
  href,
  icon: Icon,
  title,
  description,
}: {
  href: string
  icon: typeof IconBolt
  title: string
  description: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border p-4 transition hover:border-foreground/20 hover:bg-muted/40"
    >
      <Icon className="text-muted-foreground group-hover:text-foreground size-5 transition" />
      <p className="mt-3 font-medium">{title}</p>
      <p className="text-muted-foreground mt-1 text-sm">{description}</p>
    </Link>
  )
}

function Step({ n, title, body }: { n: number; title: string; body: string }) {
  return (
    <li className="flex gap-4">
      <span className="bg-foreground text-background flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
        {n}
      </span>
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-muted-foreground mt-1 text-sm">{body}</p>
      </div>
    </li>
  )
}

function Rule({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border p-4">
      <p className="font-medium">{title}</p>
      <p className="text-muted-foreground mt-1 text-sm">{body}</p>
    </div>
  )
}
