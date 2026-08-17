"use client"

/**
 * Docs context.
 *
 * Supplies the base URL and the merchant's test key to every code sample
 * and to the playground, so the docs show *their* setup rather than a
 * generic placeholder.
 *
 * The base URL comes from NEXT_PUBLIC_API_BASE_URL. Nothing in the docs
 * hardcodes a host — the same pages are correct on localhost, staging and
 * production.
 *
 * The key is fetched only when the reader is signed in, and only ever the
 * TEST key. A live secret must never be rendered into a docs page: those
 * get screenshotted, pasted into tickets and shared in chat.
 */

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react"

import { api, tokens } from "@/lib/api"

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

interface DocsContextValue {
  baseUrl: string
  /** The merchant's test secret, when signed in. Never a live key. */
  testKey: string | null
  /** Their public test key, for browser-side checkout samples. */
  publicKey: string | null
  environment: "test" | "live"
  signedIn: boolean
  loading: boolean
}

const DocsContext = createContext<DocsContextValue>({
  baseUrl: DEFAULT_BASE_URL,
  testKey: null,
  publicKey: null,
  environment: "test",
  signedIn: false,
  loading: false,
})

export function DocsProvider({ children }: { children: React.ReactNode }) {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [signedIn, setSignedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!tokens.access) {
      setLoading(false)
      return
    }

    let cancelled = false
    api
      .apiKeys()
      .then((result) => {
        if (cancelled) return
        setSignedIn(true)
        // Only the public key is retrievable after creation — the secret is
        // hashed and shown once. So the playground can offer a public key
        // automatically, and asks the reader to paste a secret if needed.
        const testKey = result.data.find(
          (key) => key.environment === "test" && key.active,
        )
        setPublicKey(testKey?.public_key ?? null)
      })
      .catch(() => {
        // Not signed in, or no permission to list keys. The docs still work
        // with placeholders.
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // The reader can paste their own secret to use the playground. Kept in
  // memory only — never written to storage, so closing the tab discards it.
  const [pastedSecret, setPastedSecret] = useState<string | null>(null)

  const value = useMemo<DocsContextValue>(
    () => ({
      baseUrl: DEFAULT_BASE_URL,
      testKey: pastedSecret,
      publicKey,
      environment: "test",
      signedIn,
      loading,
    }),
    [pastedSecret, publicKey, signedIn, loading],
  )

  return (
    <DocsSecretSetter.Provider value={setPastedSecret}>
      <DocsContext.Provider value={value}>{children}</DocsContext.Provider>
    </DocsSecretSetter.Provider>
  )
}

const DocsSecretSetter = createContext<(secret: string | null) => void>(
  () => undefined,
)

export function useDocsContext(): DocsContextValue {
  return useContext(DocsContext)
}

/** Lets the key bar hand a pasted secret to the playground. */
export function useSetDocsSecret() {
  return useContext(DocsSecretSetter)
}
