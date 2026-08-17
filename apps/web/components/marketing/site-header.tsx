"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { IconMenu2, IconX } from "@tabler/icons-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#developers", label: "Developers" },
  { href: "#pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
]

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Transparent over the hero, solid once you leave it — so the nav never
    // competes with the headline but stays readable over content.
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b bg-background/80 backdrop-blur-md"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/assets/XERIN icon-09 (1).png"
            alt=""
            width={28}
            height={28}
            priority
          />
          <span className="text-lg font-semibold tracking-tight">XerinPay</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground rounded-md px-3 py-1.5 text-sm transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
            <Link href="/auth">Sign in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/auth/register">Anza bure</Link>
          </Button>
          <button
            type="button"
            className="md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <IconX className="size-5" /> : <IconMenu2 className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="bg-background border-t md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col p-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="hover:bg-muted rounded-md px-3 py-2.5 text-sm"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="hover:bg-muted rounded-md px-3 py-2.5 text-sm"
            >
              Sign in
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
