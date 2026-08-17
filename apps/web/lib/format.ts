/**
 * Money and value formatting.
 *
 * The API sends every amount as an integer in minor units. The ONLY place
 * that integer becomes a decimal is at render time, here. Never do
 * arithmetic on the formatted value, and never send a decimal back — the
 * API rejects it.
 */

const MINOR_PER_MAJOR = 100

/** 10000 -> "TZS 100.00" */
export function formatMoney(minor: number | null | undefined, currency = "TZS"): string {
  if (minor === null || minor === undefined) return "—"
  const major = minor / MINOR_PER_MAJOR
  return `${currency} ${major.toLocaleString("en-TZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

/** 10000 -> "100.00" — for table cells where the currency is a column header. */
export function formatAmount(minor: number | null | undefined): string {
  if (minor === null || minor === undefined) return "—"
  return (minor / MINOR_PER_MAJOR).toLocaleString("en-TZ", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** "100.50" -> 10050. Rounds half-up rather than trusting float truncation. */
export function toMinor(major: string | number): number {
  const value = typeof major === "string" ? parseFloat(major) : major
  if (Number.isNaN(value)) return 0
  return Math.round(value * MINOR_PER_MAJOR)
}

/** +2557***5678 — matches the backend's log redaction (§13.2). */
export function redactPhone(phone: string | null | undefined): string {
  if (!phone) return "—"
  if (phone.length < 9) return "***"
  return `${phone.slice(0, 5)}***${phone.slice(-4)}`
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  })
}

export function formatRelative(iso: string | null | undefined): string {
  if (!iso) return "—"
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return "just now"
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}d ago`
  return formatDate(iso)
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—"
  return `${(value * 100).toFixed(1)}%`
}

/**
 * Status → badge variant. Deliberately explicit rather than clever:
 * a payment status shown in the wrong colour causes real support calls.
 */
export type StatusTone = "success" | "pending" | "failed" | "warning" | "neutral"

export function statusTone(status: string): StatusTone {
  switch (status) {
    case "success":
    case "paid":
    case "active":
    case "approved":
    case "operational":
      return "success"
    case "pending":
    case "processing":
    case "awaiting_approval":
    case "submitted":
    case "under_review":
      return "pending"
    case "failed":
    case "rejected":
    case "reversed":
    case "suspended":
    case "outage":
      return "failed"
    // The one that must never look routine: we do not know whether money
    // left, and a human has to resolve it.
    case "requires_investigation":
    case "expired":
    case "degraded":
      return "warning"
    default:
      return "neutral"
  }
}

export const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  processing: "Processing",
  success: "Succeeded",
  failed: "Failed",
  expired: "Expired",
  reversed: "Reversed",
  awaiting_approval: "Awaiting approval",
  approved: "Approved",
  rejected: "Rejected",
  requires_investigation: "Needs investigation",
  paid: "Paid",
}

export function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}
