"use client"

import { use } from "react"
import { notFound } from "next/navigation"

import { EndpointDoc } from "@/components/docs/endpoint-doc"
import { AuthenticationGuide } from "@/components/docs/guides/authentication"
import { ErrorsGuide } from "@/components/docs/guides/errors"
import { QuickstartGuide } from "@/components/docs/guides/quickstart"
import { TestingGuide } from "@/components/docs/guides/testing"
import { WebhooksGuide } from "@/components/docs/guides/webhooks"
import { SECTIONS } from "@/lib/docs/endpoints"

/**
 * One route serves both the hand-written guides and the generated API
 * reference. The reference pages are built from the endpoint catalogue, so
 * adding an endpoint there makes it appear here with no page to write.
 */

const GUIDES: Record<string, () => React.ReactElement> = {
  quickstart: QuickstartGuide,
  authentication: AuthenticationGuide,
  testing: TestingGuide,
  errors: ErrorsGuide,
}

export default function DocsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  // Next 16: route params arrive as a promise.
  const { slug } = use(params)

  const Guide = GUIDES[slug]
  if (Guide) return <Guide />

  const section = SECTIONS.find((s) => s.slug === slug)
  if (!section) notFound()

  // Webhooks needs the signing guide above its endpoints — verifying a
  // signature correctly matters more than any single endpoint on the page.
  const isWebhooks = section.slug === "webhooks"

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-tight">{section.title}</h1>
      <p className="text-muted-foreground mt-3 text-lg">{section.summary}</p>

      {isWebhooks ? <WebhooksGuide /> : null}

      <div className="mt-8">
        {section.endpoints.map((endpoint) => (
          <EndpointDoc key={endpoint.id} endpoint={endpoint} />
        ))}
      </div>
    </div>
  )
}
