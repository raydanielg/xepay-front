import type { Metadata } from "next"

import { SiteHeader } from "@/components/marketing/site-header"
import {
  CallToAction,
  Developers,
  Faq,
  Features,
  Hero,
  HowItWorks,
  Networks,
  Pricing,
  SiteFooter,
  Stats,
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
      <SiteHeader />
      <main>
        <Hero />
        <Networks />
        <Stats />
        <Features />
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
