import type { Metadata } from "next"

import { AnimatedBackground } from "@/components/marketing/animated-background"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"
import {
  Aggregation,
  CallToAction,
  Developers,
  Faq,
  Features,
  ForCustomers,
  Hero,
  HowItWorks,
  Networks,
  Pricing,
} from "@/components/marketing/sections"

export const metadata: Metadata = {
  title: "XerinPay — Every payment network. One integration.",
  description:
    "Accept M-Pesa, Mixx by Yas, Airtel Money, HaloPesa, AzamPesa and bank payments across Tanzania through a single API and one dashboard.",
  openGraph: {
    title: "XerinPay — Every payment network. One integration.",
    description:
      "A payment aggregator for Tanzania. One API, one dashboard, every network.",
    type: "website",
    locale: "en_TZ",
  },
}

export default function HomePage() {
  return (
    <>
      <AnimatedBackground />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <Networks />
        <Features />
        <Aggregation />
        <ForCustomers />
        <HowItWorks />
        <Developers />
        <Pricing />
        <Faq />
        <CallToAction />
      </main>
      <SiteFooter />
    </>
  )
}
