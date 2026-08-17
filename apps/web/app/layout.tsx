import { Inter, Geist_Mono, Noto_Sans } from "next/font/google"

import "@workspace/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@workspace/ui/components/sonner"
import { cn } from "@workspace/ui/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const notoSans = Noto_Sans({ subsets: ["latin"], variable: "--font-noto" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata = {
  title: "XerinPay",
  description: "XerinPay - Secure payment platform",
  icons: {
    icon: "/assets/XERIN PAY LOGO-12-12.svg",
    apple: "/assets/XERIN PAY LOGO-12-12.svg",
    shortcut: "/assets/XERIN PAY LOGO-12-12.svg",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn("antialiased", inter.variable, notoSans.variable, fontMono.variable)}
    >
      <body>
        <ThemeProvider>
          {/*
            Skip link. Visually hidden until focused, so a keyboard user can
            jump past the sidebar and nav instead of tabbing through every
            item on every page load. First focusable element on the page,
            deliberately.
          */}
          <a
            href="#main"
            className="bg-background focus:ring-ring sr-only rounded-md px-4 py-2 text-sm font-medium shadow-lg focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:ring-2"
          >
            Skip to content
          </a>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
