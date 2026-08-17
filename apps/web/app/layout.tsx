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
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
