"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { IconArrowRight, IconBook2, IconExternalLink } from "@tabler/icons-react"

import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import {
  api,
  type Breakdown,
  type Charge,
  type Overview,
  type Timeseries,
  type TimeseriesPoint,
} from "@/lib/api"
import {
  formatMoney,
  formatPercent,
  formatRelative,
  redactPhone,
} from "@/lib/format"
import { Perm } from "@/lib/rbac"
import { useSession } from "@/lib/session"
import {
  MetricCard,
  NetworkChart,
  SuccessRateChart,
  VolumeChart,
} from "@/components/dashboard/metrics"
import {
  EmptyState,
  ErrorState,
  StatGridSkeleton,
  StatusBadge,
  TableSkeleton,
} from "@/components/dashboard/shared"

const RANGES = [
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
]

export default function DashboardPage() {
  const { session, can, loading: sessionLoading } = useSession()
  const [days, setDays] = useState(30)

  const [overview, setOverview] = useState<Overview | null>(null)
  const [timeseries, setTimeseries] = useState<Timeseries | null>(null)
  const [breakdown, setBreakdown] = useState<Breakdown | null>(null)
  const [recent, setRecent] = useState<Charge[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const environment = session?.merchant?.live_enabled ? "live" : "test"

  useEffect(() => {
    if (sessionLoading || !session) return

    let cancelled = false
    setLoading(true)

    async function load() {
      try {
        const [overviewData, series, breakdownData, transactions] =
          await Promise.all([
            api.overview(environment, days),
            api.timeseries(environment, days),
            api.breakdown(environment, days),
            can(Perm.VIEW_TRANSACTIONS)
              ? api.transactions({ environment, limit: 6 })
              : Promise.resolve({ data: [] as Charge[] }),
          ])
        if (cancelled) return
        setOverview(overviewData)
        setTimeseries(series)
        setBreakdown(breakdownData)
        setRecent(transactions.data)
        setError(null)
      } catch (err) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [session, sessionLoading, environment, days, can])

  if (error) return <ErrorState error={error} />

  const series = timeseries?.series ?? []
  const firstName = session?.user.full_name?.split(" ")[0] ?? "there"

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Habari, {firstName}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {session?.merchant?.display_name ?? "XerinPay internal admin"}
          </p>
        </div>

        <div className="flex rounded-lg border p-0.5">
          {RANGES.map((range) => (
            <button
              key={range.days}
              type="button"
              onClick={() => setDays(range.days)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition",
                days === range.days
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* Onboarding nudge. Only while it is genuinely actionable — a banner
          that never goes away stops being read. */}
      {session?.merchant && !session.merchant.live_enabled ? (
        <GoLiveBanner kycStatus={session.merchant.kyc_status} />
      ) : null}

      {loading ? (
        <StatGridSkeleton />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Volume collected"
            value={formatMoney(overview?.volume_minor ?? 0)}
            hint={`${overview?.success_count ?? 0} payments`}
            delta={deltaOf(series, (p) => p.volume_minor)}
            spark={series.map((p) => p.volume_minor)}
          />
          {can(Perm.VIEW_BALANCE) && overview?.balance ? (
            <MetricCard
              label="Available balance"
              value={formatMoney(overview.balance.available_minor)}
              hint="Ready to pay out"
            />
          ) : null}
          <MetricCard
            label="Success rate"
            value={formatPercent(overview?.success_rate)}
            hint={`${overview?.transaction_count ?? 0} attempts`}
            spark={series.map((p) => (p.success_rate ?? 0) * 100)}
            tone={
              overview?.success_rate != null && overview.success_rate < 0.7
                ? "warning"
                : "default"
            }
          />
          <MetricCard
            label="Fees"
            value={formatMoney(overview?.fees_minor ?? 0)}
            hint="On successful payments"
            spark={series.map((p) => p.fees_minor)}
          />
        </div>
      )}

      {loading ? (
        <StatGridSkeleton count={2} />
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-2">
            <VolumeChart series={series} />
            <SuccessRateChart series={series} />
          </div>

          {breakdown ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <NetworkChart breakdown={breakdown} />
              {can(Perm.VIEW_TRANSACTIONS) ? (
                <RecentActivity rows={recent} loading={loading} />
              ) : null}
            </div>
          ) : null}
        </>
      )}
    </>
  )
}

function GoLiveBanner({ kycStatus }: { kycStatus: string }) {
  const steps: Record<string, { title: string; body: string; href: string; cta: string }> =
    {
      not_started: {
        title: "You're in test mode",
        body: "Upload your business documents to start accepting real payments.",
        href: "/dashboard/kyc",
        cta: "Start verification",
      },
      rejected: {
        title: "Verification needs attention",
        body: "Some documents were rejected. Check the notes and upload again.",
        href: "/dashboard/kyc",
        cta: "Review documents",
      },
      submitted: {
        title: "Verification in progress",
        body: "Your documents are with our team. Meanwhile, build against the sandbox.",
        href: "/docs/quickstart",
        cta: "Read the quickstart",
      },
      under_review: {
        title: "Verification in progress",
        body: "Your documents are with our team. We'll email you when there's a decision.",
        href: "/docs/quickstart",
        cta: "Read the quickstart",
      },
      approved: {
        title: "Almost live",
        body: "You're verified. Add a settlement account and fee plan to switch on live mode.",
        href: "/dashboard/settings",
        cta: "Finish setup",
      },
    }

  const step = steps[kycStatus] ?? steps.not_started

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 py-4">
        <div>
          <p className="font-medium">{step.title}</p>
          <p className="text-muted-foreground mt-0.5 text-sm">{step.body}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/docs">
              <IconBook2 className="size-4" />
              Docs
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href={step.href}>
              {step.cta}
              <IconArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function RecentActivity({
  rows,
  loading,
}: {
  rows: Charge[]
  loading: boolean
}) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">Recent activity</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/transactions">
            View all
            <IconExternalLink className="size-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <TableSkeleton rows={4} />
        ) : rows.length === 0 ? (
          <EmptyState
            title="Nothing yet"
            description="Payments appear here as customers pay you."
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payer</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">When</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/transactions/${txn.id}`}
                      className="text-sm hover:underline"
                    >
                      {txn.payer.name ?? redactPhone(txn.payer.phone)}
                    </Link>
                    <div className="text-muted-foreground font-mono text-xs">
                      {txn.reference}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatMoney(txn.amount, txn.currency)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={txn.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-right text-xs">
                    {formatRelative(txn.created_at)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Change between the first and second half of the period.
 *
 * Returns null when the earlier half is empty — "up 100%" from a base of
 * zero is not information, it is noise, and it makes a first-ever payment
 * look like explosive growth.
 */
function deltaOf(
  series: TimeseriesPoint[],
  pick: (point: TimeseriesPoint) => number,
): number | null {
  if (series.length < 4) return null

  const midpoint = Math.floor(series.length / 2)
  const sum = (rows: TimeseriesPoint[]) =>
    rows.reduce((total, row) => total + pick(row), 0)

  const earlier = sum(series.slice(0, midpoint))
  const later = sum(series.slice(midpoint))

  if (earlier === 0) return null
  return (later - earlier) / earlier
}
