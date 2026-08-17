"use client"

import { useCallback, useEffect, useRef, useState } from "react"

import {
  LANGUAGES,
  NETWORKS,
  guessNetwork,
  makeT,
  type Lang,
  type NetworkId,
} from "@/lib/checkout-i18n"

/**
 * The checkout flow, in three steps and nothing more (§11.1):
 *   pick network → enter number → confirm
 *
 * Written with plain elements rather than the component library: this page
 * ships to cheap phones on weak networks and every dependency is weight the
 * customer pays for before they can pay us.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

// Poll every 3 seconds for 3 minutes, then hand control back to the customer
// with a "check again" button rather than spinning forever (§11.1).
const POLL_INTERVAL_MS = 3_000
const POLL_LIMIT_MS = 180_000

interface LinkDetails {
  slug: string
  title: string
  description: string | null
  amount: number | null
  currency: string
  collect_fields: string[]
  merchant_name: string
  payable: boolean
  unavailable_reason: string | null
  fee_bearer: string
}

interface PaymentState {
  reference: string
  status: string
  amount: number
  currency: string
  failure_code: string | null
  instruction_key: string
}

type Step = "loading" | "form" | "waiting" | "done" | "unavailable"

export function CheckoutClient({ slug }: { slug: string }) {
  const [lang, setLang] = useState<Lang>("sw")
  const t = makeT(lang)

  const [link, setLink] = useState<LinkDetails | null>(null)
  const [step, setStep] = useState<Step>("loading")
  const [error, setError] = useState<string | null>(null)

  const [amount, setAmount] = useState("")
  const [phone, setPhone] = useState("")
  const [name, setName] = useState("")
  const [note, setNote] = useState("")
  const [network, setNetwork] = useState<NetworkId | null>(null)
  const [networkTouched, setNetworkTouched] = useState(false)

  const [payment, setPayment] = useState<PaymentState | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [pollTimedOut, setPollTimedOut] = useState(false)
  const [copied, setCopied] = useState(false)

  // -- Load the link ----------------------------------------------------

  useEffect(() => {
    let cancelled = false
    fetch(`${API_BASE}/checkout/${slug}`)
      .then(async (res) => {
        const body = await res.json().catch(() => null)
        if (cancelled) return
        if (!res.ok) {
          setError(t("error.link_not_found"))
          setStep("unavailable")
          return
        }
        setLink(body)
        setStep(body.payable ? "form" : "unavailable")
        if (!body.payable) setError(body.unavailable_reason)
      })
      .catch(() => {
        if (!cancelled) {
          setError(t("error.generic"))
          setStep("unavailable")
        }
      })
    return () => {
      cancelled = true
    }
    // t is stable per language; reloading on language change is wasteful.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug])

  // -- Guess the network as they type -----------------------------------

  useEffect(() => {
    if (networkTouched) return
    const guess = guessNetwork(phone)
    if (guess) setNetwork(guess)
  }, [phone, networkTouched])

  // -- Poll for the outcome ---------------------------------------------

  const startedAt = useRef<number>(0)

  const poll = useCallback(async () => {
    if (!payment) return
    try {
      const res = await fetch(`${API_BASE}/checkout/status/${payment.reference}`)
      if (!res.ok) return
      const body = await res.json()

      setPayment((prev) => (prev ? { ...prev, status: body.status,
        failure_code: body.failure_code } : prev))

      if (body.is_final) {
        setStep("done")
        if (body.status === "success" && body.redirect_url) {
          // Give them a moment to see the confirmation before leaving.
          setTimeout(() => {
            window.location.href = body.redirect_url
          }, 2500)
        }
      }
    } catch {
      // A dropped poll is expected on a weak connection. Stay quiet and
      // let the next tick try again.
    }
  }, [payment])

  useEffect(() => {
    if (step !== "waiting") return
    startedAt.current = Date.now()
    setPollTimedOut(false)

    const timer = setInterval(() => {
      if (Date.now() - startedAt.current > POLL_LIMIT_MS) {
        setPollTimedOut(true)
        clearInterval(timer)
        return
      }
      void poll()
    }, POLL_INTERVAL_MS)

    return () => clearInterval(timer)
  }, [step, poll])

  // -- Submit ------------------------------------------------------------

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (link?.amount === null && !amount.trim()) {
      setError(t("error.amount_required"))
      return
    }
    if (!phone.trim()) {
      setError(t("error.phone_required"))
      return
    }
    if (!network) {
      setError(t("error.network_required"))
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`${API_BASE}/checkout/${slug}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Minor units. The input is in whole shillings, so multiply here
          // rather than asking the customer to think in cents.
          amount: link?.amount ?? Math.round(Number(amount) * 100),
          phone,
          network,
          name: name || undefined,
          note: note || undefined,
        }),
      })
      const body = await res.json().catch(() => null)

      if (!res.ok) {
        setError(body?.error?.message ?? t("error.generic"))
        setSubmitting(false)
        return
      }

      setPayment(body)
      setStep(body.status === "failed" ? "done" : "waiting")
    } catch {
      setError(t("error.generic"))
    } finally {
      setSubmitting(false)
    }
  }

  function reset() {
    setPayment(null)
    setStep("form")
    setError(null)
    setPollTimedOut(false)
  }

  // -- Render ------------------------------------------------------------

  return (
    <div className="min-h-dvh bg-neutral-50 px-4 py-8 text-neutral-900">
      <div className="mx-auto w-full max-w-md">
        <LanguageToggle lang={lang} onChange={setLang} />

        <div className="mt-3 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-200">
          {step === "loading" ? (
            <Loading />
          ) : step === "unavailable" ? (
            <Unavailable message={error} />
          ) : (
            <>
              <Header link={link} t={t} />

              <div className="p-5">
                {step === "form" ? (
                  <PayForm
                    t={t}
                    link={link}
                    amount={amount}
                    setAmount={setAmount}
                    phone={phone}
                    setPhone={setPhone}
                    name={name}
                    setName={setName}
                    note={note}
                    setNote={setNote}
                    network={network}
                    setNetwork={(id) => {
                      setNetwork(id)
                      setNetworkTouched(true)
                    }}
                    error={error}
                    submitting={submitting}
                    onSubmit={submit}
                  />
                ) : step === "waiting" ? (
                  <Waiting
                    t={t}
                    payment={payment}
                    timedOut={pollTimedOut}
                    onCheckAgain={() => {
                      startedAt.current = Date.now()
                      setPollTimedOut(false)
                      void poll()
                    }}
                  />
                ) : (
                  <Outcome
                    t={t}
                    payment={payment}
                    copied={copied}
                    onCopy={() => {
                      if (!payment) return
                      void navigator.clipboard.writeText(payment.reference)
                      setCopied(true)
                      setTimeout(() => setCopied(false), 2000)
                    }}
                    onRetry={reset}
                  />
                )}
              </div>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-neutral-500">
          {t("page.secured")}
        </p>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------------

function LanguageToggle({
  lang,
  onChange,
}: {
  lang: Lang
  onChange: (lang: Lang) => void
}) {
  return (
    <div className="flex justify-end gap-1">
      {LANGUAGES.map((option) => (
        <button
          key={option.code}
          type="button"
          onClick={() => onChange(option.code)}
          className={`rounded-full px-3 py-1 text-xs font-medium transition ${
            lang === option.code
              ? "bg-neutral-900 text-white"
              : "bg-white text-neutral-600 ring-1 ring-neutral-200"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

function Header({ link, t }: { link: LinkDetails | null; t: (k: string) => string }) {
  if (!link) return null
  return (
    <div className="border-b border-neutral-100 bg-neutral-50 p-5 text-center">
      <p className="text-xs uppercase tracking-wide text-neutral-500">
        {t("page.pay_to")}
      </p>
      <p className="mt-1 text-lg font-semibold">{link.merchant_name}</p>
      <p className="mt-2 text-sm text-neutral-600">{link.title}</p>
      {link.amount !== null ? (
        <p className="mt-3 text-3xl font-bold tabular-nums">
          {formatTzs(link.amount, link.currency)}
        </p>
      ) : null}
    </div>
  )
}

function PayForm(props: {
  t: (k: string) => string
  link: LinkDetails | null
  amount: string
  setAmount: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  name: string
  setName: (v: string) => void
  note: string
  setNote: (v: string) => void
  network: NetworkId | null
  setNetwork: (id: NetworkId) => void
  error: string | null
  submitting: boolean
  onSubmit: (e: React.FormEvent) => void
}) {
  const { t, link } = props
  const collect = link?.collect_fields ?? ["name", "phone"]

  return (
    <form onSubmit={props.onSubmit} className="space-y-5">
      {link?.amount === null ? (
        <Field label={t("field.amount")}>
          <input
            type="number"
            inputMode="numeric"
            required
            min={1}
            value={props.amount}
            onChange={(e) => props.setAmount(e.target.value)}
            placeholder={t("field.amount_placeholder")}
            className={INPUT}
          />
        </Field>
      ) : null}

      <div>
        <p className="mb-2 text-sm font-medium">{t("step.network")}</p>
        <div className="grid grid-cols-2 gap-2">
          {NETWORKS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => props.setNetwork(option.id)}
              className={`rounded-xl border p-3 text-left transition ${
                props.network === option.id
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white hover:border-neutral-400"
              }`}
            >
              <span className="block text-sm font-medium">{option.label}</span>
              <span
                className={`block text-xs ${
                  props.network === option.id
                    ? "text-neutral-300"
                    : "text-neutral-500"
                }`}
              >
                {option.hint}
              </span>
            </button>
          ))}
        </div>
      </div>

      <Field label={t("field.phone")}>
        <input
          type="tel"
          inputMode="tel"
          required
          value={props.phone}
          onChange={(e) => props.setPhone(e.target.value)}
          placeholder={t("field.phone_placeholder")}
          className={INPUT}
          autoComplete="tel"
        />
      </Field>

      {collect.includes("name") ? (
        <Field label={t("field.name")}>
          <input
            type="text"
            value={props.name}
            onChange={(e) => props.setName(e.target.value)}
            placeholder={t("field.name_placeholder")}
            className={INPUT}
            autoComplete="name"
          />
        </Field>
      ) : null}

      {collect.includes("note") ? (
        <Field label={`${t("field.note")} (${t("field.optional")})`}>
          <input
            type="text"
            value={props.note}
            onChange={(e) => props.setNote(e.target.value)}
            className={INPUT}
          />
        </Field>
      ) : null}

      {props.error ? (
        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {props.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={props.submitting}
        className="w-full rounded-xl bg-neutral-900 py-3.5 text-base font-semibold text-white transition active:scale-[0.99] disabled:opacity-60"
      >
        {props.submitting ? t("status.sending") : t("action.pay")}
      </button>
    </form>
  )
}

function Waiting({
  t,
  payment,
  timedOut,
  onCheckAgain,
}: {
  t: (k: string) => string
  payment: PaymentState | null
  timedOut: boolean
  onCheckAgain: () => void
}) {
  const instruction = payment?.instruction_key ?? "prompt.default"

  return (
    <div className="py-6 text-center">
      <div className="mx-auto size-12 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />

      <p className="mt-5 text-lg font-semibold">{t("status.waiting")}</p>

      {/* The single most important sentence on the page. */}
      <p className="mt-3 rounded-xl bg-amber-50 p-4 text-base font-medium text-amber-900">
        {t(instruction)}
      </p>

      {payment ? (
        <p className="mt-4 text-2xl font-bold tabular-nums">
          {formatTzs(payment.amount, payment.currency)}
        </p>
      ) : null}

      {timedOut ? (
        <div className="mt-6">
          <p className="text-sm text-neutral-600">{t("status.taking_long")}</p>
          <button
            type="button"
            onClick={onCheckAgain}
            className="mt-3 w-full rounded-xl border border-neutral-300 py-3 text-sm font-semibold"
          >
            {t("action.check_again")}
          </button>
        </div>
      ) : null}
    </div>
  )
}

function Outcome({
  t,
  payment,
  copied,
  onCopy,
  onRetry,
}: {
  t: (k: string) => string
  payment: PaymentState | null
  copied: boolean
  onCopy: () => void
  onRetry: () => void
}) {
  const succeeded = payment?.status === "success"
  const failureKey = `failure.${payment?.failure_code ?? "unknown_error"}`

  return (
    <div className="py-6 text-center">
      <div
        className={`mx-auto flex size-14 items-center justify-center rounded-full ${
          succeeded ? "bg-emerald-100" : "bg-red-100"
        }`}
      >
        <span className={`text-2xl ${succeeded ? "text-emerald-700" : "text-red-700"}`}>
          {succeeded ? "✓" : "✕"}
        </span>
      </div>

      <p className="mt-4 text-lg font-semibold">
        {succeeded
          ? t("status.success")
          : payment?.status === "expired"
            ? t("status.expired")
            : t("status.failed")}
      </p>

      {succeeded && payment ? (
        <p className="mt-2 text-2xl font-bold tabular-nums">
          {formatTzs(payment.amount, payment.currency)}
        </p>
      ) : (
        <p className="mt-2 text-sm text-neutral-600">{t(failureKey)}</p>
      )}

      {/* The customer should leave with something they can quote. */}
      {payment ? (
        <div className="mt-5 rounded-xl bg-neutral-50 p-3">
          <p className="text-xs text-neutral-500">{t("status.reference")}</p>
          <div className="mt-1 flex items-center justify-center gap-2">
            <code className="font-mono text-sm font-semibold">
              {payment.reference}
            </code>
            <button
              type="button"
              onClick={onCopy}
              className="rounded-md px-2 py-1 text-xs font-medium text-neutral-600 ring-1 ring-neutral-200"
            >
              {copied ? t("status.copied") : t("status.copy")}
            </button>
          </div>
        </div>
      ) : null}

      {!succeeded ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 w-full rounded-xl bg-neutral-900 py-3.5 text-base font-semibold text-white"
        >
          {t("action.try_again")}
        </button>
      ) : null}
    </div>
  )
}

function Loading() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="size-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-900" />
    </div>
  )
}

function Unavailable({ message }: { message: string | null }) {
  return (
    <div className="p-8 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-neutral-100">
        <span className="text-xl text-neutral-500">!</span>
      </div>
      <p className="mt-4 text-sm text-neutral-600">{message}</p>
    </div>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
    </label>
  )
}

const INPUT =
  "w-full rounded-xl border border-neutral-300 px-4 py-3 text-base outline-none focus:border-neutral-900"

function formatTzs(minor: number, currency = "TZS"): string {
  return `${currency} ${(minor / 100).toLocaleString("en-TZ", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}
