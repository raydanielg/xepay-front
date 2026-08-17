import type { Metadata } from "next"

import { DocsShell } from "@/components/docs/docs-shell"
import { DocsProvider } from "@/lib/docs/context"

export const metadata: Metadata = {
  title: "XerinPay API Documentation",
  description:
    "Accept mobile money and bank payments across Tanzania through one API.",
}

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DocsProvider>
      <DocsShell>{children}</DocsShell>
    </DocsProvider>
  )
}
