"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { IconArrowUpRight, IconMail, IconMapPin } from "@tabler/icons-react"

import { cn } from "@workspace/ui/lib/utils"

import { LegalDrawers } from "@/components/legal-drawers"

/**
 * Site footer.
 *
 * Every link here points at something that exists. Terms and Privacy are
 * drawers rather than routes, so they open in place instead of linking to
 * pages we never built — a footer full of 404s is worse than a short footer.
 *
 * The status pill is real: it polls the public provider-health endpoint, the
 * same one the docs tell developers to check when payments start failing.
 * A footer that claims "All systems operational" without asking anything
 * would be theatre.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

const COLUMNS = [
  {
    heading: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "How it works", href: "/#how" },
      { label: "For developers", href: "/#developers" },
      { label: "Pricing", href: "/#pricing" },
    ],
  },
  {
    heading: "Documentation",
    links: [
      { label: "Introduction", href: "/docs" },
      { label: "Quickstart", href: "/docs/quickstart" },
      { label: "Authentication", href: "/docs/authentication" },
      { label: "Testing", href: "/docs/testing" },
      { label: "Errors", href: "/docs/errors" },
    ],
  },
  {
    heading: "API reference",
    links: [
      { label: "Charges", href: "/docs/charges" },
      { label: "Payouts", href: "/docs/payouts" },
      { label: "Balance", href: "/docs/balance" },
      { label: "Payment links", href: "/docs/payment-links" },
      { label: "Webhooks", href: "/docs/webhooks" },
    ],
  },
  {
    heading: "Account",
    links: [
      { label: "Sign in", href: "/auth" },
      { label: "Create account", href: "/auth/register" },
      { label: "Reset password", href: "/auth/forgot-password" },
      { label: "Dashboard", href: "/dashboard" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="relative overflow-hidden border-t">
      <div className="relative mx-auto max-w-6xl px-4 pt-16">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_2.8fr]">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex">
              <Image
                src="/assets/XERIN PAY LOGO-12-12.svg"
                alt="XerinPay"
                width={200}
                height={54}
                className="h-12 w-auto object-contain"
              />
            </Link>

            <p className="text-muted-foreground mt-4 max-w-xs text-sm leading-relaxed">
              One API for every way Tanzania pays. Mobile money and banks,
              one dashboard, one settlement.
            </p>

            <div className="mt-5">
              <ProviderStatus />
            </div>

            <div className="text-muted-foreground mt-6 space-y-2 text-sm">
              <a
                href="mailto:support@xerinpay.co.tz"
                className="hover:text-foreground flex items-center gap-2 transition-colors"
              >
                <IconMail className="size-4 shrink-0" />
                support@xerinpay.co.tz
              </a>
              <p className="flex items-center gap-2">
                <IconMapPin className="size-4 shrink-0" />
                Dar es Salaam, Tanzania
              </p>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((column) => (
              <div key={column.heading}>
                <p className="text-xs font-semibold uppercase tracking-wide">
                  {column.heading}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <FooterLink href={link.href}>{link.label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="text-muted-foreground mt-14 flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t py-6 text-xs">
          <p>© {new Date().getFullYear()} XerinPay. All rights reserved.</p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {/*
              Wrapped in a span because LegalDrawers renders as an inline
              sentence — two buttons joined by the word "and". Dropped
              straight into a flex row, that "and" becomes its own flex item
              and the spacing falls apart.

              These are drawers, not routes: they open in place rather than
              linking to /terms and /privacy pages that do not exist.
            */}
            <span>
              <LegalDrawers />
            </span>
            <span className="hidden sm:inline">Amounts in TZS</span>
          </div>
        </div>
      </div>

      {/*
        Oversized wordmark. Clipped by the footer's overflow and faded into
        the background so it reads as texture at the close of the page, not
        as a heading competing with the links above it.

        aria-hidden because it is decorative repetition — the brand name is
        already in the logo, the copyright line and the page title, and a
        screen reader announcing "XERINPAY" a fourth time is noise.
      */}
      <div
        aria-hidden
        className="pointer-events-none relative flex w-full select-none justify-center"
      >
        <span
          className="from-foreground/[0.09] to-foreground/0 translate-y-[22%] bg-gradient-to-b bg-clip-text text-[19vw] font-bold leading-none tracking-tighter text-transparent"
          style={{ WebkitBackgroundClip: "text" }}
        >
          XERINPAY
        </span>
      </div>
    </footer>
  )
}

function FooterLink({
  href,
  children,
}: {
  href: string
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className="text-muted-foreground hover:text-foreground group inline-flex items-center gap-1 text-sm transition-colors"
    >
      {children}
      <IconArrowUpRight className="size-3 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
    </Link>
  )
}

type Health = "operational" | "degraded" | "outage" | "unknown"

const STATUS_STYLES: Record<Health, { dot: string; label: string; text: string }> = {
  operational: {
    dot: "bg-emerald-500",
    label: "All systems operational",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  degraded: {
    dot: "bg-amber-500",
    label: "Degraded performance",
    text: "text-amber-600 dark:text-amber-400",
  },
  outage: {
    dot: "bg-red-500",
    label: "Provider outage",
    text: "text-red-600 dark:text-red-400",
  },
  unknown: {
    dot: "bg-muted-foreground/40",
    label: "Status unavailable",
    text: "text-muted-foreground",
  },
}

/**
 * Live provider health.
 *
 * Fails to `unknown` rather than to "operational" — claiming everything is
 * fine because we could not reach our own status endpoint is exactly the
 * wrong default, and it is the moment a merchant most needs the truth.
 */
function ProviderStatus() {
  const [health, setHealth] = useState<Health>("unknown")

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const response = await fetch(`${API_BASE}/v1/providers/status`)
        if (!response.ok) throw new Error(String(response.status))
        const body = await response.json()
        if (!cancelled) setHealth((body.status as Health) ?? "unknown")
      } catch {
        if (!cancelled) setHealth("unknown")
      }
    }

    void check()
    // Cheap enough to refresh while the page is open, slow enough not to
    // matter. The footer is not a monitoring dashboard.
    const timer = setInterval(check, 60_000)
    return () => {
      cancelled = true
      clearInterval(timer)
    }
  }, [])

  const style = STATUS_STYLES[health]

  return (
    <Link
      href="/docs/status"
      className="hover:bg-muted/60 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors"
    >
      <span className="relative flex size-2">
        {health === "operational" ? (
          <span
            className={cn(
              "absolute inline-flex size-full rounded-full opacity-70",
              style.dot,
            )}
            style={{ animation: "xerin-ripple 2.4s ease-out infinite" }}
          />
        ) : null}
        <span className={cn("relative inline-flex size-2 rounded-full", style.dot)} />
      </span>
      <span className={style.text}>{style.label}</span>
    </Link>
  )
}
