"use client"

import { usePathname } from "next/navigation"

/**
 * Route transition.
 *
 * Keyed on the pathname so React remounts the subtree on navigation, which
 * restarts the CSS animation. That is the whole mechanism — no library, no
 * exit animation, no layout thrash.
 *
 * Deliberately short (240ms) and subtle. A page transition should make
 * navigation feel connected, not make the user wait. Anything over ~300ms
 * on a route change reads as slowness rather than polish.
 *
 * Exit animations are intentionally absent: they delay the next page by
 * their own duration, and on a payments dashboard nobody thanks you for
 * making "show me that transaction" take longer.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div
      key={pathname}
      style={{ animation: "xerin-page-in 240ms cubic-bezier(0.16,1,0.3,1) both" }}
    >
      {children}
    </div>
  )
}
