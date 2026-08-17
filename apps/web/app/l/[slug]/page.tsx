import type { Metadata } from "next"

import { CheckoutClient } from "@/components/checkout/checkout-client"

/**
 * Hosted checkout (§11.1).
 *
 * Server component wrapper so the shell arrives as HTML on the first byte.
 * Everything below is deliberately austere: no analytics, no fonts beyond
 * the system stack, no third-party scripts, no tracking cookies. This page
 * is loaded on cheap phones over weak 3G, and every kilobyte is a customer
 * who abandons the payment.
 */

export const metadata: Metadata = {
  title: "Pay — XerinPay",
  // A payment page has no business in a search index.
  robots: { index: false, follow: false },
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <CheckoutClient slug={slug} />
}
