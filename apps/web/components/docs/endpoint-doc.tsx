"use client"

import { useState } from "react"

import { cn } from "@workspace/ui/lib/utils"

import { CodeBlock, EndpointSignature } from "@/components/docs/code-block"
import { Playground } from "@/components/docs/playground"
import { useDocsContext } from "@/lib/docs/context"
import type { Endpoint, Param } from "@/lib/docs/endpoints"
import { LANGUAGES, generateSample, type LanguageId } from "@/lib/docs/samples"

/**
 * One endpoint, fully documented: signature, parameters, a code sample in
 * the reader's language of choice, the response shape, and a live
 * playground.
 *
 * Everything is generated from the catalogue entry, so an endpoint cannot
 * be documented inconsistently with how it actually behaves.
 */
export function EndpointDoc({ endpoint }: { endpoint: Endpoint }) {
  const { baseUrl, testKey } = useDocsContext()
  const [language, setLanguage] = useState<LanguageId>("curl")

  const sample = generateSample(endpoint, language, {
    baseUrl,
    apiKey: testKey,
  })

  return (
    <section id={endpoint.id} className="scroll-mt-20 border-t py-10 first:border-0">
      <h3 className="text-xl font-semibold tracking-tight">{endpoint.title}</h3>
      <p className="text-muted-foreground mt-2 max-w-2xl">
        {endpoint.description}
      </p>

      <div className="mt-4">
        <EndpointSignature
          method={endpoint.method}
          path={endpoint.path}
          baseUrl={baseUrl}
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <AuthChip auth={endpoint.auth} />
        {endpoint.idempotent ? (
          <span className="rounded-md border border-violet-500/25 bg-violet-500/10 px-2 py-0.5 text-xs font-medium text-violet-700 dark:text-violet-400">
            Idempotency-Key required
          </span>
        ) : null}
      </div>

      {endpoint.notes?.length ? (
        <ul className="mt-4 space-y-2">
          {endpoint.notes.map((note) => (
            <li
              key={note}
              className="rounded-lg border-l-2 border-amber-500/50 bg-amber-500/5 px-3 py-2 text-sm"
            >
              {note}
            </li>
          ))}
        </ul>
      ) : null}

      {endpoint.params?.length ? (
        <ParamTable title="Body parameters" params={endpoint.params} />
      ) : null}
      {endpoint.query?.length ? (
        <ParamTable title="Query parameters" params={endpoint.query} />
      ) : null}

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 flex gap-1">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.id}
                type="button"
                onClick={() => setLanguage(lang.id)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-medium transition",
                  language === lang.id
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-muted",
                )}
              >
                {lang.label}
              </button>
            ))}
          </div>
          <CodeBlock code={sample} maxHeight="28rem" />
        </div>

        {endpoint.response ? (
          <div>
            <p className="text-muted-foreground mb-2 py-1 text-xs font-medium">
              Response
            </p>
            <CodeBlock
              code={JSON.stringify(endpoint.response, null, 2)}
              maxHeight="28rem"
            />
          </div>
        ) : null}
      </div>

      <div className="mt-6">
        <Playground endpoint={endpoint} />
      </div>
    </section>
  )
}

function AuthChip({ auth }: { auth: Endpoint["auth"] }) {
  const config = {
    secret: {
      label: "Secret key",
      className:
        "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    },
    public_or_secret: {
      label: "Secret or public key",
      className:
        "border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-400",
    },
    none: {
      label: "No auth",
      className: "border-border bg-muted text-muted-foreground",
    },
  }[auth]

  return (
    <span
      className={cn(
        "rounded-md border px-2 py-0.5 text-xs font-medium",
        config.className,
      )}
    >
      {config.label}
    </span>
  )
}

function ParamTable({ title, params }: { title: string; params: Param[] }) {
  return (
    <div className="mt-6">
      <p className="mb-2 text-sm font-medium">{title}</p>
      <div className="divide-y rounded-xl border">
        {params.map((param) => (
          <ParamRow key={param.name} param={param} />
        ))}
      </div>
    </div>
  )
}

function ParamRow({ param, depth = 0 }: { param: Param; depth?: number }) {
  return (
    <div
      className={cn("px-4 py-3", depth > 0 && "border-l-2 border-muted bg-muted/20")}
      style={depth > 0 ? { marginLeft: depth * 12 } : undefined}
    >
      <div className="flex flex-wrap items-baseline gap-2">
        <code className="font-mono text-sm font-medium">{param.name}</code>
        <span className="text-muted-foreground text-xs">{param.type}</span>
        {param.required ? (
          <span className="text-xs font-medium text-red-600 dark:text-red-400">
            required
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">optional</span>
        )}
      </div>
      <p className="text-muted-foreground mt-1 text-sm">{param.description}</p>

      {param.fields?.length ? (
        <div className="mt-3 space-y-0 divide-y rounded-lg border">
          {param.fields.map((field) => (
            <ParamRow key={field.name} param={field} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
