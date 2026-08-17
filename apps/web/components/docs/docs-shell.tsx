"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  IconArrowLeft,
  IconKey,
  IconMenu2,
  IconX,
} from "@tabler/icons-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"

import { SECTIONS } from "@/lib/docs/endpoints"
import { useDocsContext, useSetDocsSecret } from "@/lib/docs/context"

const GUIDES = [
  { slug: "", title: "Introduction" },
  { slug: "quickstart", title: "Quickstart" },
  { slug: "authentication", title: "Authentication" },
  { slug: "testing", title: "Testing" },
  { slug: "errors", title: "Errors" },
]

export function DocsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [navOpen, setNavOpen] = useState(false)

  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-3 px-4">
          <button
            type="button"
            className="lg:hidden"
            onClick={() => setNavOpen((open) => !open)}
            aria-label="Toggle navigation"
          >
            {navOpen ? <IconX className="size-5" /> : <IconMenu2 className="size-5" />}
          </button>

          <Link href="/docs" className="flex items-center gap-2">
            <Image
              src="/assets/XERIN PAY LOGO-12-12.svg"
              alt="XerinPay"
              width={160}
              height={42}
              className="h-10 w-auto object-contain"
            />
            <span className="font-semibold">XerinPay</span>
            <span className="text-muted-foreground text-sm">Docs</span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" render={<Link href="/dashboard" />}>
              <IconArrowLeft className="size-4" />
              Dashboard
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl gap-8 px-4">
        <aside
          className={cn(
            "shrink-0 py-8 lg:block lg:w-56",
            navOpen
              ? "fixed inset-x-0 top-14 z-30 block h-[calc(100dvh-3.5rem)] overflow-y-auto border-b bg-background px-4 pb-8"
              : "hidden",
          )}
        >
          <nav className="space-y-6">
            <NavGroup
              label="Guides"
              items={GUIDES.map((g) => ({
                href: g.slug ? `/docs/${g.slug}` : "/docs",
                title: g.title,
              }))}
              pathname={pathname}
              onNavigate={() => setNavOpen(false)}
            />
            <NavGroup
              label="API reference"
              items={SECTIONS.map((s) => ({
                href: `/docs/${s.slug}`,
                title: s.title,
              }))}
              pathname={pathname}
              onNavigate={() => setNavOpen(false)}
            />
          </nav>
        </aside>

        <main className="min-w-0 flex-1 py-8">
          <KeyBar />
          {children}
        </main>
      </div>
    </div>
  )
}

function NavGroup({
  label,
  items,
  pathname,
  onNavigate,
}: {
  label: string
  items: { href: string; title: string }[]
  pathname: string
  onNavigate: () => void
}) {
  return (
    <div>
      <p className="text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wide">
        {label}
      </p>
      <ul className="space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={cn(
                  "block rounded-md px-2.5 py-1.5 text-sm transition",
                  active
                    ? "bg-muted font-medium text-foreground"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                )}
              >
                {item.title}
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/**
 * Lets the reader paste a test secret so the playground works.
 *
 * Held in memory only — never localStorage, never a cookie. Close the tab
 * and it is gone. We cannot pre-fill it because secrets are hashed on
 * creation and genuinely unrecoverable, which is the correct design.
 */
function KeyBar() {
  const { baseUrl, testKey, signedIn } = useDocsContext()
  const setSecret = useSetDocsSecret()
  const [value, setValue] = useState("")
  const [open, setOpen] = useState(false)

  return (
    <div className="mb-8 rounded-xl border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
            Your API base URL
          </p>
          <code className="font-mono text-sm">{baseUrl}</code>
        </div>

        <div className="flex items-center gap-2">
          {testKey ? (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
              Test key loaded
            </span>
          ) : (
            <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>
              <IconKey className="size-3.5" />
              Add test key
            </Button>
          )}
        </div>
      </div>

      {open && !testKey ? (
        <div className="mt-3 border-t pt-3">
          <p className="text-muted-foreground mb-2 text-xs">
            Paste a <strong>test</strong> secret to run the examples below.
            It stays in this tab only — we never store it. Secrets are hashed
            when created, so we cannot fill this in for you.
            {signedIn ? (
              <>
                {" "}
                <Link href="/dashboard/api-keys" className="underline">
                  Create a test key
                </Link>
                .
              </>
            ) : null}
          </p>
          <div className="flex gap-2">
            <Input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="sk_test_…"
              className="font-mono text-sm"
            />
            <Button
              size="sm"
              disabled={!value.startsWith("sk_test_")}
              onClick={() => {
                setSecret(value.trim())
                setOpen(false)
              }}
            >
              Use it
            </Button>
          </div>
          {value && !value.startsWith("sk_test_") ? (
            <p className="mt-2 text-xs text-red-600">
              Only test keys are accepted here. Never paste a live secret
              into a documentation page.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
