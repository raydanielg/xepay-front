"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  IconArrowRight,
  IconBolt,
  IconBook2,
  IconBuildingBank,
  IconChartBar,
  IconCheck,
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

import { SectionGlow } from "@/components/marketing/animated-background"
import { Marquee, Reveal, VerticalMarquee } from "@/components/marketing/motion"
import { Layer, NetworkOrbit, Tilt } from "@/components/marketing/three-d"
import { Typewriter } from "@/components/marketing/typewriter"

/**
 * Mobile money, by the network that runs it.
 *
 * Only mobile network operators belong here. AzamPesa was previously in this
 * list and should not have been — it is a wallet run by Azam Group, not an
 * MNO, and it has no MSISDN range of its own. Listing it beside M-Pesa
 * implied we detect it from a phone prefix, which is not something you can
 * do. Kept out rather than quietly mislabelled.
 */
const MOBILE_NETWORKS = [
  { name: "M-Pesa", operator: "Vodacom" },
  { name: "Mixx by Yas", operator: "Yas" },
  { name: "Airtel Money", operator: "Airtel" },
  { name: "HaloPesa", operator: "Halotel" },
  { name: "T-Pesa", operator: "TTCL" },
]

const BANKS = [
  { name: "CRDB", operator: "Bank" },
  { name: "NMB", operator: "Bank" },
  { name: "NBC", operator: "Bank" },
  { name: "Exim", operator: "Bank" },
  { name: "Stanbic", operator: "Bank" },
  { name: "Absa", operator: "Bank" },
]

const ALL_CHANNELS = [...MOBILE_NETWORKS, ...BANKS]

/**
 * Hero phrases, each finishing the sentence "Get paid …".
 *
 * Every one is an outcome the merchant gets, not a capability we have. They
 * are ordered to answer the questions a business owner asks in the order
 * they ask them: can everyone pay me, will I lose sales, when do I see the
 * money, how soon can I start, and do I need a developer.
 *
 * Kept short so the typing never outlasts the reader's patience.
 */
const HERO_PHRASES = [
  "by every customer.",
  "even when a network fails.",
  "into your bank in two days.",
  "starting this afternoon.",
  "without writing any code.",
]

// --------------------------------------------------------------------------
// Hero — centred, with the product photo as the anchor
// --------------------------------------------------------------------------

export function Hero() {
  return (
    <section className="relative pt-32 pb-16 sm:pt-40">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-3xl text-center">
          <Reveal>
            <span className="border-primary/20 bg-primary/5 text-primary inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium backdrop-blur">
              <IconBolt className="size-3.5" />
              Built for Tanzania
            </span>
          </Reveal>

          <Reveal delay={80}>
            {/*
              Benefit-first, not feature-first. "Every payment network, one
              integration" describes what we built; "get paid by every
              customer" describes what the merchant gets — and that is the
              thing they are actually deciding about.

              min-h reserves the tallest line so the paragraph below does not
              jump each time the phrase changes length.
            */}
            <h1 className="mt-6 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Get paid
              <br />
              <span className="text-primary inline-flex min-h-[1.25em] items-center justify-center">
                <Typewriter phrases={HERO_PHRASES} />
              </span>
            </h1>
          </Reveal>

          <Reveal delay={160}>
            <p className="text-muted-foreground mx-auto mt-6 max-w-xl text-lg">
              Your customers pay from whichever wallet they already use. You
              see one dashboard, get one settlement, and never chase a
              provider again.
            </p>
          </Reveal>

          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Button size="lg" render={<Link href="/auth/register" />}>
                Get started free
                <IconArrowRight />
              </Button>
              <Button
                size="lg"
                variant="outline"
                render={<Link href="/docs" />}
              >
                <IconBook2 />
                Read the docs
              </Button>
            </div>
          </Reveal>

          <Reveal delay={320}>
            <p className="text-muted-foreground mt-6 text-sm">
              Free to start · Sandbox from day one · No monthly fee
            </p>
          </Reveal>
        </div>

        {/*
          Hero subject. A cut-out PNG on a transparent background, so it sits
          directly on the animated backdrop with no card, border or frame
          around it — the figure reads as part of the page rather than as a
          screenshot pasted onto it.

          The soft radial glow behind it does the work a card border used to:
          it separates the subject from the background without drawing a box.
        */}
        <div
          className="relative mx-auto mt-14 flex max-w-3xl justify-center"
          style={{ animation: "xerin-rise 900ms cubic-bezier(0.16,1,0.3,1) both" }}
        >
          <div
            aria-hidden
            className="absolute inset-x-8 bottom-8 top-4 rounded-full opacity-70 blur-3xl"
            style={{
              background:
                "radial-gradient(ellipse at 50% 55%, var(--primary) 0%, transparent 68%)",
              opacity: 0.22,
            }}
          />

          <Tilt maxDeg={6} scale={1.01} glare={false} className="relative">
            <Image
              src="/assets/ss.png"
              alt="A customer paying with her phone"
              width={760}
              height={760}
              priority
              sizes="(max-width: 768px) 88vw, 520px"
              className="relative h-auto w-full max-w-md drop-shadow-2xl"
            />

            {/* Lifted off the subject's plane so they gain real parallax as
                it tilts, rather than sliding around flat on top of it. */}
            <Layer depth={70}>
              <FloatingChip
                className="left-0 top-1/4 sm:-left-12"
                label="Received"
                value="TZS 100,000"
                delay={0}
              />
            </Layer>
            <Layer depth={95}>
              <FloatingChip
                className="right-0 bottom-1/3 sm:-right-12"
                label="Settled to bank"
                value="T+2"
                delay={-4}
              />
            </Layer>
          </Tilt>
        </div>
      </div>
    </section>
  )
}

function FloatingChip({
  className,
  label,
  value,
  delay,
}: {
  className?: string
  label: string
  value: string
  delay: number
}) {
  return (
    <div
      className={cn(
        "bg-card/90 absolute hidden rounded-xl border px-3.5 py-2.5 shadow-lg backdrop-blur sm:block",
        className,
      )}
      style={{ animation: `xerin-drift 9s ease-in-out ${delay}s infinite` }}
    >
      <p className="text-muted-foreground text-[10px] uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-semibold tabular-nums">{value}</p>
    </div>
  )
}

// --------------------------------------------------------------------------
// Networks marquee
// --------------------------------------------------------------------------

export function Networks() {
  return (
    <section className="bg-background/60 border-y py-10 backdrop-blur">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-muted-foreground mb-6 text-center text-xs font-medium uppercase tracking-wide">
          One integration reaches all of these
        </p>
        <Marquee speed={38}>
          {ALL_CHANNELS.map((channel) => (
            <span
              key={channel.name}
              className="text-muted-foreground/70 hover:text-foreground shrink-0 text-lg font-semibold tracking-tight transition-colors"
            >
              {channel.name}
            </span>
          ))}
        </Marquee>
      </div>
    </section>
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
    <section id="features" className="relative scroll-mt-20 py-20">
      <SectionGlow />
      <div className="relative mx-auto max-w-6xl px-4">
        <Reveal className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            What you stop worrying about
          </h2>
          <p className="text-muted-foreground mt-4 text-lg">
            Chasing providers, reconciling by hand, wondering whether a
            payment landed. All of it becomes our problem.
          </p>
        </Reveal>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, index) => (
            <Reveal key={feature.title} delay={(index % 4) * 70}>
              <div className="group bg-card/60 hover:border-primary/30 h-full rounded-2xl border p-5 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="bg-primary/10 text-primary flex size-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110">
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
// Built for real customers — image + copy
// --------------------------------------------------------------------------

export function ForCustomers() {
  return (
    <section className="relative py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/*
            The 3D orbit rather than a third photo. Only two photographs
            exist in the project, and repeating one across sections reads as
            padding. This also earns its place here: the section is about
            reaching whichever wallet the customer already has, and the orbit
            shows exactly that.
          */}
          <Reveal direction="right">
            <NetworkOrbit />
          </Reveal>

          <Reveal direction="left" delay={120}>
            <span className="text-primary text-sm font-medium">
              Built for how people actually pay
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              A checkout that works on any phone
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Your customers are on cheap handsets and weak 3G. Our hosted
              checkout is server-rendered, under 100KB, and available in
              Swahili and English.
            </p>

            <ul className="mt-7 space-y-4">
              {[
                {
                  title: "Three steps, nothing more",
                  body: "Pick a network, enter a number, confirm. We detect the network from the number, so most people never touch the picker.",
                },
                {
                  title: "Clear instructions at the right moment",
                  body: "“Check your phone and enter your M-Pesa PIN” — in their language, at the exact moment they need it.",
                },
                {
                  title: "No tracking, no third-party scripts",
                  body: "A payment page has no business carrying analytics. Nothing loads that the payment does not need.",
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="bg-primary/10 text-primary mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full">
                    <IconCheck className="size-3" />
                  </span>
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {item.body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

// --------------------------------------------------------------------------
// The aggregator idea, in 3D
// --------------------------------------------------------------------------

export function Aggregation() {
  return (
    <section className="relative overflow-hidden py-24">
      <SectionGlow />
      <div className="relative mx-auto max-w-6xl px-4">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          <Reveal direction="right">
            <span className="text-primary text-sm font-medium">
              One connection, not five
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Integrate once. Reach everyone.
            </h2>
            <p className="text-muted-foreground mt-4 text-lg">
              Each provider has its own authentication, its own error codes,
              its own idea of what a phone number looks like. We absorb all of
              that so your code sees one shape.
            </p>

            <Tilt maxDeg={8} scale={1.01} className="mt-8 rounded-2xl">
              <div className="bg-card relative overflow-hidden rounded-2xl border shadow-xl">
                <Image
                  src="/assets/img.png"
                  alt="A completed payment confirmation on a phone"
                  width={1536}
                  height={1024}
                  sizes="(max-width: 1024px) 90vw, 520px"
                  className="h-auto w-full"
                />
              </div>
            </Tilt>
          </Reveal>

          {/*
            Two columns scrolling in opposite directions. Mobile money and
            banks are kept apart on purpose — they are genuinely different
            rails with different settlement behaviour, and lumping them into
            one list implies a uniformity that does not exist.
          */}
          <Reveal direction="left" delay={140}>
            <div className="grid h-[26rem] grid-cols-2 gap-3">
              <ChannelColumn
                heading="Mobile money"
                items={MOBILE_NETWORKS}
                speed={22}
              />
              <ChannelColumn
                heading="Banks"
                items={BANKS}
                speed={28}
                reverse
              />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}

function ChannelColumn({
  heading,
  items,
  speed,
  reverse,
}: {
  heading: string
  items: { name: string; operator: string }[]
  speed: number
  reverse?: boolean
}) {
  return (
    <div className="flex min-h-0 flex-col">
      <p className="text-muted-foreground mb-3 text-xs font-semibold uppercase tracking-wide">
        {heading}
      </p>
      <VerticalMarquee speed={speed} reverse={reverse} className="flex-1">
        {items.map((item) => (
          <div
            key={item.name}
            className="bg-card/70 hover:border-primary/40 rounded-xl border p-3.5 backdrop-blur transition-colors"
          >
            <p className="text-sm font-semibold tracking-tight">{item.name}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {item.operator}
            </p>
          </div>
        ))}
      </VerticalMarquee>
    </div>
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
    <section
      id="how"
      className="bg-muted/40 relative scroll-mt-20 border-y py-20 backdrop-blur"
    >
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
                    className="from-primary/50 absolute left-full top-10 hidden h-px w-6 bg-gradient-to-r to-transparent md:block"
                  />
                ) : null}
                <div className="bg-card hover:border-primary/30 h-full rounded-2xl border p-6 transition-colors">
                  <span className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-full font-semibold">
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
    <section id="developers" className="relative scroll-mt-20 py-20">
      <SectionGlow />
      <div className="relative mx-auto max-w-6xl px-4">
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
                  <span className="bg-primary/10 text-primary mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full">
                    <IconCheck className="size-2.5" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <Button
              size="lg"
              className="mt-8"
              render={<Link href="/docs/quickstart" />}
            >
              <IconCode />
              Start building
            </Button>
          </Reveal>

          <Reveal direction="left" delay={120}>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl">
              <div className="flex items-center gap-1 border-b border-white/10 px-3 py-2.5">
                <div className="mr-2 flex gap-1.5">
                  {["#ff5f57", "#febc2e", "#28c840"].map((colour) => (
                    <span
                      key={colour}
                      className="size-2.5 rounded-full"
                      style={{ backgroundColor: colour }}
                    />
                  ))}
                </div>
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
    <section
      id="pricing"
      className="bg-muted/40 scroll-mt-20 border-y py-20 backdrop-blur"
    >
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
              <ul className="mt-5 space-y-2.5 text-sm">
                {[
                  "All mobile money networks",
                  "Bank transfers",
                  "Payment links and hosted checkout",
                  "Unlimited API keys and webhooks",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <IconCheck className="text-primary size-4 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="border-primary/40 bg-card relative h-full rounded-2xl border-2 p-6 shadow-lg">
              <span className="bg-primary text-primary-foreground absolute -top-3 right-5 rounded-full px-3 py-0.5 text-xs font-medium">
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
              <ul className="mt-5 space-y-2.5 text-sm">
                {[
                  "Negotiated per-transaction pricing",
                  "Faster settlement schedule",
                  "Custom provider routing rules",
                  "Priority support",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <IconCheck className="text-primary size-4 shrink-0" />
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

        <div className="bg-card/60 mt-12 divide-y rounded-2xl border backdrop-blur">
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
                  style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
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
    <section className="relative overflow-hidden py-24">
      <SectionGlow />
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
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Button size="lg" render={<Link href="/auth/register" />}>
              Get started free
              <IconArrowRight />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/docs" />}>
              Read the docs
            </Button>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// The footer lives in components/marketing/site-footer.tsx. It grew a live
// provider-status check and the legal drawers, neither of which belongs in
// a file of static page sections.
