"use client"

import { useState } from "react"
import Link from "next/link"
import {
  IconArrowRight,
  IconBolt,
  IconBook2,
  IconBuildingBank,
  IconChartBar,
  IconChevronDown,
  IconCode,
  IconDeviceMobile,
  IconLink,
  IconRefresh,
  IconRouteAltLeft,
  IconShieldLock,
  IconWebhook,
} from "@tabler/icons-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { CountUp, GradientField, Marquee, Reveal } from "@/components/marketing/motion"
import { PaymentFlow } from "@/components/marketing/payment-flow"

const NETWORKS = [
  "M-Pesa",
  "Mixx by Yas",
  "Airtel Money",
  "HaloPesa",
  "AzamPesa",
  "CRDB",
  "NMB",
  "NBC",
]

// --------------------------------------------------------------------------
// Hero
// --------------------------------------------------------------------------

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 sm:pt-40 sm:pb-28">
      <GradientField />

      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <Reveal>
              <span className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
                <IconBolt className="size-3.5" />
                Built for Tanzania
              </span>
            </Reveal>

            <Reveal delay={80}>
              <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Every payment network.{" "}
                <span className="text-primary">One integration.</span>
              </h1>
            </Reveal>

            <Reveal delay={160}>
              <p className="text-muted-foreground mt-6 max-w-lg text-lg">
                M-Pesa, Mixx by Yas, Airtel Money, HaloPesa, AzamPesa and the
                banks — through a single API and one dashboard. Stop
                integrating each provider separately.
              </p>
            </Reveal>

            <Reveal delay={240}>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button size="lg" asChild>
                  <Link href="/auth/register">
                    Anza bure
                    <IconArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/docs">
                    <IconBook2 className="size-4" />
                    Read the docs
                  </Link>
                </Button>
              </div>
            </Reveal>

            <Reveal delay={320}>
              <p className="text-muted-foreground mt-6 text-sm">
                Free to start · Sandbox from day one · No monthly fee
              </p>
            </Reveal>
          </div>

          <Reveal direction="left" delay={200} className="flex justify-center lg:justify-end">
            <PaymentFlow />
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// --------------------------------------------------------------------------
// Networks marquee
// --------------------------------------------------------------------------

export function Networks() {
  return (
    <section className="border-y py-10">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-muted-foreground mb-6 text-center text-xs font-medium uppercase tracking-wide">
          One integration reaches all of these
        </p>
        <Marquee speed={38}>
          {NETWORKS.map((name) => (
            <span
              key={name}
              className="text-muted-foreground/70 hover:text-foreground shrink-0 text-lg font-semibold tracking-tight transition-colors"
            >
              {name}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  )
}

// --------------------------------------------------------------------------
// Stats
// --------------------------------------------------------------------------

export function Stats() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-8 sm:grid-cols-3">
          <Stat
            value={<CountUp to={5} suffix="+" />}
            label="Mobile money networks"
            detail="Plus the major banks, through one API"
          />
          <Stat
            value={<CountUp to={15} suffix=" min" />}
            label="Payment window"
            detail="With automatic status polling when callbacks are lost"
          />
          <Stat
            value={<CountUp to={7} />}
            label="Webhook retries"
            detail="Over 24 hours, with jitter — we do not give up early"
          />
        </div>
      </div>
    </section>
  )
}

function Stat({
  value,
  label,
  detail,
}: {
  value: React.ReactNode
  label: string
  detail: string
}) {
  return (
    <Reveal className="text-center">
      <p className="text-primary text-4xl font-semibold tracking-tight">
        {value}
      </p>
      <p className="mt-2 font-medium">{label}</p>
      <p className="text-muted-foreground mt-1 text-sm">{detail}</p>
    </Reveal>
  )
}

// --------------------------------------------------------------------------
// Features
// --------------------------------------------------------------------------

const FEATURES = [
  {
    icon: IconDeviceMobile,
    title: "Collections",
    body: "Take payments from any mobile money wallet or bank account. We work out the network from the phone number.",
  },
  {
    icon: IconLink,
    title: "Payment links",
    body: "Get paid without writing code. Create a link, share it on WhatsApp, print the QR for your counter.",
  },
  {
    icon: IconBuildingBank,
    title: "Payouts",
    body: "Send money to staff, suppliers or customers. Large amounts wait for a second person to approve.",
  },
  {
    icon: IconRouteAltLeft,
    title: "Automatic failover",
    body: "When a provider goes down we route around it. Your customers never find out there was a problem.",
  },
  {
    icon: IconWebhook,
    title: "Signed webhooks",
    body: "Every event is HMAC-signed and retried seven times over 24 hours. Nothing is quietly dropped.",
  },
  {
    icon: IconChartBar,
    title: "Double-entry ledger",
    body: "Your balance is computed from an append-only ledger, never a stored number. Money cannot silently appear or vanish.",
  },
  {
    icon: IconRefresh,
    title: "Daily reconciliation",
    body: "We compare our records against every provider each night and report discrepancies — even when there are none.",
  },
  {
    icon: IconShieldLock,
    title: "Roles that mean something",
    body: "A developer cannot approve a payout. Support cannot move money at all. Separation of duty by default.",
  },
]

export function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Everything a payment system needs
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Not a wrapper around one provider. A real aggregator, built for
            networks that drop.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={(index % 4) * 70}>
              <div className="group hover:border-primary/30 h-full rounded-2xl border p-5 transition-all duration-300 hover:shadow-lg">
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                  {feature.body}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// --------------------------------------------------------------------------
// How it works
// --------------------------------------------------------------------------

const STEPS = [
  {
    title: "Create a charge",
    body: "One API call, or a payment link if you would rather not write code. We push a prompt to the customer's phone.",
    code: "POST /v1/charges",
  },
  {
    title: "The customer pays",
    body: "They enter their mobile money PIN. On a cheap phone, on a weak connection, in Swahili if they prefer.",
    code: "Customer enters PIN",
  },
  {
    title: "You get told",
    body: "A signed webhook lands on your server. If it goes missing, our poller asks the provider directly — you still find out.",
    code: "charge.success",
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="bg-muted/30 scroll-mt-20 border-y py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Three steps, and one of them is theirs
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            The hard parts — retries, lost callbacks, provider outages — are
            ours to handle.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <Reveal key={step.title} delay={index * 120}>
              <div className="relative h-full">
                {index < STEPS.length - 1 ? (
                  <div
                    aria-hidden
                    className="from-primary/40 absolute left-full top-8 hidden h-px w-6 bg-gradient-to-r to-transparent md:block"
                  />
                ) : null}
                <div className="bg-card h-full rounded-2xl border p-6">
                  <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full text-sm font-semibold">
                    {index + 1}
                  </span>
                  <h3 className="mt-4 font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
                    {step.body}
                  </p>
                  <code className="text-muted-foreground bg-muted mt-4 inline-block rounded-md px-2 py-1 font-mono text-xs">
                    {step.code}
                  </code>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

// --------------------------------------------------------------------------
// Developers
// --------------------------------------------------------------------------

const SNIPPETS = {
  node: `const charge = await fetch("https://api.xerinpay.co.tz/v1/charges", {
  method: "POST",
  headers: {
    Authorization: \`Bearer \${process.env.XERINPAY_SECRET_KEY}\`,
    "Idempotency-Key": randomUUID(),
  },
  body: JSON.stringify({
    amount: 10000,              // TZS 100.00, in minor units
    channel: "mobile_money",
    payer: { phone: "+255712345678" },
    description: "Order #4821",
  }),
})`,
  php: `$ch = curl_init('https://api.xerinpay.co.tz/v1/charges');
curl_setopt_array($ch, [
    CURLOPT_POST       => true,
    CURLOPT_HTTPHEADER => [
        'Authorization: Bearer ' . getenv('XERINPAY_SECRET_KEY'),
        'Idempotency-Key: ' . bin2hex(random_bytes(16)),
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'amount'  => 10000,          // TZS 100.00
        'channel' => 'mobile_money',
        'payer'   => ['phone' => '+255712345678'],
    ]),
]);`,
  python: `charge = requests.post(
    "https://api.xerinpay.co.tz/v1/charges",
    headers={
        "Authorization": f"Bearer {os.environ['XERINPAY_SECRET_KEY']}",
        "Idempotency-Key": str(uuid.uuid4()),
    },
    json={
        "amount": 10000,             # TZS 100.00, in minor units
        "channel": "mobile_money",
        "payer": {"phone": "+255712345678"},
    },
)`,
}

type SnippetId = keyof typeof SNIPPETS

export function Developers() {
  const [language, setLanguage] = useState<SnippetId>("node")

  return (
    <section id="developers" className="scroll-mt-20 py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="text-primary text-sm font-medium">
              For developers
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              A first payment in five minutes
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              REST and JSON. Amounts as integers so nothing rounds wrong.
              Idempotency keys so a dropped connection never charges twice.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Sandbox with test numbers for every failure path",
                "Normalised error codes — never learn a provider's",
                "Every API request logged for 30 days",
                "Live playground inside the docs",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm">
                  <span className="bg-primary/10 text-primary mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full text-[10px]">
                    ✓
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Button className="mt-8" asChild>
              <Link href="/docs/quickstart">
                <IconCode className="size-4" />
                Start building
              </Link>
            </Button>
          </Reveal>

          <Reveal direction="left" delay={120}>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl">
              <div className="flex items-center gap-1 border-b border-white/10 px-3 py-2">
                {(Object.keys(SNIPPETS) as SnippetId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setLanguage(id)}
                    className={cn(
                      "rounded-md px-2.5 py-1 text-xs font-medium capitalize transition",
                      language === id
                        ? "bg-white/10 text-white"
                        : "text-white/50 hover:text-white/80",
                    )}
                  >
                    {id === "node" ? "Node.js" : id}
                  </button>
                ))}
              </div>
              <pre className="overflow-x-auto p-4 text-[13px] leading-relaxed">
                <code className="font-mono text-white/85">
                  {SNIPPETS[language]}
                </code>
              </pre>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// --------------------------------------------------------------------------
// Pricing
// --------------------------------------------------------------------------

export function Pricing() {
  return (
    <section id="pricing" className="bg-muted/30 scroll-mt-20 border-y py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Pay only when you get paid
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            No setup fee, no monthly fee, no minimum. A percentage of what you
            successfully collect.
          </p>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-3xl gap-5 sm:grid-cols-2">
          <Reveal>
            <div className="bg-card h-full rounded-2xl border p-6">
              <p className="font-semibold">Collections</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                Per transaction
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Charged only on payments that actually succeed. Failed
                attempts cost you nothing.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {[
                  "All mobile money networks",
                  "Bank transfers",
                  "Payment links and hosted checkout",
                  "Unlimited API keys and webhooks",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-primary">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="border-primary/30 bg-card relative h-full rounded-2xl border p-6">
              <span className="bg-primary text-primary-foreground absolute -top-2.5 right-5 rounded-full px-2.5 py-0.5 text-xs font-medium">
                Talk to us
              </span>
              <p className="font-semibold">High volume</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">
                Custom rates
              </p>
              <p className="text-muted-foreground mt-2 text-sm">
                Moving serious volume? Rates come down, and you get a named
                contact rather than a queue.
              </p>
              <ul className="mt-5 space-y-2 text-sm">
                {[
                  "Negotiated per-transaction pricing",
                  "Faster settlement schedule",
                  "Custom provider routing rules",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-primary">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>

        <Reveal delay={160}>
          <p className="text-muted-foreground mt-8 text-center text-sm">
            Exact rates depend on your volume and channel mix.{" "}
            <Link href="/auth/register" className="text-foreground underline">
              Create an account
            </Link>{" "}
            to see your plan.
          </p>
        </Reveal>
      </div>
    </section>
  )
}

// --------------------------------------------------------------------------
// FAQ
// --------------------------------------------------------------------------

const FAQS = [
  {
    q: "Do I need my own Bank of Tanzania licence?",
    a: "No. You operate under our arrangement with licensed providers. If you later want your own licence, nothing about your integration changes.",
  },
  {
    q: "What happens when a network goes down?",
    a: "We route to another provider automatically — but only when the failure was technical. If a customer cancelled or has no balance, retrying elsewhere would just put another prompt on their phone, so we return the error to you instead.",
  },
  {
    q: "What if a webhook never arrives?",
    a: "It happens, and we plan for it. We retry seven times over 24 hours, and separately we poll the provider ourselves for anything stuck. You can also query any charge's status directly at any time.",
  },
  {
    q: "How quickly do I get my money?",
    a: "T+2 by default, into the bank account you nominate. New accounts settle at T+7 for the first 30 days. You can see every settlement, with the gross, fees and refunds that produced it.",
  },
  {
    q: "Do you handle card payments?",
    a: "Not directly. Card numbers never touch our servers — that is a deliberate boundary. If you need cards we pass you to a PCI DSS compliant provider.",
  },
  {
    q: "Can my developer see everything I can?",
    a: "Only what their role allows. A developer manages API keys and webhooks but cannot approve a payout. Support can look up transactions but cannot move money at all.",
  },
]

export function Faq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="py-20">
      <div className="mx-auto max-w-3xl px-4">
        <Reveal className="text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Questions people actually ask
          </h2>
        </Reveal>

        <div className="mt-12 divide-y rounded-2xl border">
          {FAQS.map((faq, index) => {
            const expanded = open === index
            return (
              <Reveal key={faq.q} delay={index * 50}>
                <button
                  type="button"
                  onClick={() => setOpen(expanded ? null : index)}
                  aria-expanded={expanded}
                  className="hover:bg-muted/40 flex w-full items-center justify-between gap-4 p-5 text-left transition-colors"
                >
                  <span className="font-medium">{faq.q}</span>
                  <IconChevronDown
                    className={cn(
                      "text-muted-foreground size-4 shrink-0 transition-transform duration-300",
                      expanded && "rotate-180",
                    )}
                  />
                </button>
                <div
                  className="grid transition-all duration-300"
                  style={{
                    gridTemplateRows: expanded ? "1fr" : "0fr",
                  }}
                >
                  <div className="overflow-hidden">
                    <p className="text-muted-foreground px-5 pb-5 text-sm leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}

// --------------------------------------------------------------------------
// Closing CTA
// --------------------------------------------------------------------------

export function CallToAction() {
  return (
    <section className="relative overflow-hidden py-20">
      <GradientField />
      <div className="relative mx-auto max-w-3xl px-4 text-center">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Start collecting today
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Create an account, get a sandbox key, and send your first payment
            before lunch. Verification only matters when you are ready for
            real money.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/auth/register">
                Anza bure
                <IconArrowRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/docs">Read the docs</Link>
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// --------------------------------------------------------------------------
// Footer
// --------------------------------------------------------------------------

const FOOTER = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Payment links", href: "#features" },
    ],
  },
  {
    heading: "Developers",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Quickstart", href: "/docs/quickstart" },
      { label: "API reference", href: "/docs/charges" },
      { label: "Webhooks", href: "/docs/webhooks" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign in", href: "/auth" },
      { label: "Create account", href: "/auth/register" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-lg font-semibold tracking-tight">XerinPay</p>
            <p className="text-muted-foreground mt-2 max-w-xs text-sm">
              A payment aggregator for Tanzania. One API, one dashboard, every
              network.
            </p>
          </div>

          {FOOTER.map((group) => (
            <div key={group.heading}>
              <p className="text-sm font-medium">{group.heading}</p>
              <ul className="mt-3 space-y-2">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="text-muted-foreground mt-10 flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-xs">
          <p>© {new Date().getFullYear()} XerinPay. Dar es Salaam, Tanzania.</p>
          <p>Amounts in TZS. Payments processed via licensed providers.</p>
        </div>
      </div>
    </footer>
  )
}
