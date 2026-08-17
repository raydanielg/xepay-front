"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { IconMenu2, IconMoon, IconSun, IconX } from "@tabler/icons-react"
import { useTheme } from "next-themes"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

const LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how", label: "How it works" },
  { href: "#developers", label: "Developers" },
  { href: "/docs", label: "Docs" },
]

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = resolvedTheme === "dark"

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="hover:bg-muted rounded-lg p-2 transition-colors"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {mounted ? (
        isDark ? <IconSun className="size-5" /> : <IconMoon className="size-5" />
      ) : (
        <IconSun className="size-5" />
      )}
    </button>
  )
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    // Transparent over the hero, solid once you scroll past it — the nav
    // never competes with the headline but stays readable over content.
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
          ? "bg-background/70 border-b shadow-sm backdrop-blur-xl"
          : "border-b border-transparent",
      )}
    >
      <div className="mx-auto flex h-18 max-w-6xl items-center gap-6 px-4 py-3">
        {/* Full wordmark rather than the icon — this is the one place a
            visitor learns the brand name. */}
        <Link href="/" className="flex shrink-0 items-center">
          <Image
            src="/assets/XERIN PAY LOGO-12-12.svg"
            alt="XerinPay"
            width={200}
            height={54}
            priority
            className="h-12 w-auto object-contain"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg px-3 py-2 text-sm font-medium transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="lg"
            className="hidden sm:flex"
            render={<Link href="/auth" />}
          >
            Sign in
          </Button>
          <Button size="lg" render={<Link href="/auth/register" />}>
            Get started free
          </Button>
          <button
            type="button"
            className="hover:bg-muted rounded-lg p-2 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <IconX className="size-5" /> : <IconMenu2 className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="bg-background/95 border-t backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col p-2">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="hover:bg-muted rounded-lg px-3 py-3 text-sm font-medium"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/auth"
              onClick={() => setOpen(false)}
              className="hover:bg-muted rounded-lg px-3 py-3 text-sm font-medium"
            >
              Sign in
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
