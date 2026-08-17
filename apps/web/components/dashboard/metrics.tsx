"use client"

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

import { formatMoney, formatPercent } from "@/lib/format"
import type { Breakdown, TimeseriesPoint } from "@/lib/api"

/**
 * Dashboard charts, all fed from real API data.
 *
 * Two choices worth stating:
 *   * Money axes are formatted in major units. Nobody reads "1,000,000" as
 *     ten thousand shillings at a glance.
 *   * A day with no attempts shows a gap in the success-rate line rather
 *     than a zero, because a zero reads as "everything failed".
 */

const CHART_HEIGHT = 260

// --------------------------------------------------------------------------
// Stat card with sparkline
// --------------------------------------------------------------------------

export function MetricCard({
  label,
  value,
  hint,
  delta,
  spark,
  tone = "default",
}: {
  label: string
  value: string
  hint?: string
  /** Fractional change vs the previous period, e.g. 0.12 for +12%. */
  delta?: number | null
  spark?: number[]
  tone?: "default" | "warning"
}) {
  const positive = (delta ?? 0) >= 0

  return (
    <Card className={cn("overflow-hidden", tone === "warning" && "border-amber-500/40")}>
      <CardHeader className="pb-1">
        <CardTitle className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-2xl font-semibold tabular-nums">
              {value}
            </p>
            <div className="mt-1 flex items-center gap-2">
              {delta !== null && delta !== undefined ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-medium",
                    positive
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-red-600 dark:text-red-400",
                  )}
                >
                  {positive ? (
                    <IconTrendingUp className="size-3.5" />
                  ) : (
                    <IconTrendingDown className="size-3.5" />
                  )}
                  {formatPercent(Math.abs(delta))}
                </span>
              ) : null}
              {hint ? (
                <span className="text-muted-foreground truncate text-xs">
                  {hint}
                </span>
              ) : null}
            </div>
          </div>

          {spark && spark.length > 1 ? (
            <div className="h-10 w-24 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={spark.map((v, i) => ({ i, v }))}>
                  <defs>
                    <linearGradient id={`spark-${label}`} x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="0%"
                        stopColor="var(--primary)"
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--primary)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="var(--primary)"
                    strokeWidth={1.5}
                    fill={`url(#spark-${label})`}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

// --------------------------------------------------------------------------
// Volume over time
// --------------------------------------------------------------------------

export function VolumeChart({
  series,
  currency = "TZS",
}: {
  series: TimeseriesPoint[]
  currency?: string
}) {
  const data = series.map((point) => ({
    date: point.date,
    volume: point.volume_minor / 100,
    label: shortDate(point.date),
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Volume collected</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: CHART_HEIGHT }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ left: -12, right: 8, top: 4 }}>
              <defs>
                <linearGradient id="volumeFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                minTickGap={24}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={compact}
                width={56}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const point = payload[0]?.payload
                  return (
                    <TooltipShell title={longDate(point.date)}>
                      <p className="font-semibold tabular-nums">
                        {formatMoney(point.volume * 100, currency)}
                      </p>
                    </TooltipShell>
                  )
                }}
              />
              <Area
                type="monotone"
                dataKey="volume"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#volumeFill)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// --------------------------------------------------------------------------
// Success rate
// --------------------------------------------------------------------------

export function SuccessRateChart({ series }: { series: TimeseriesPoint[] }) {
  const data = series.map((point) => ({
    date: point.date,
    label: shortDate(point.date),
    // Null keeps a gap in the line on days with no traffic.
    rate: point.success_rate === null ? null : point.success_rate * 100,
    attempts: point.attempts,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Success rate</CardTitle>
      </CardHeader>
      <CardContent>
        <div style={{ height: CHART_HEIGHT }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ left: -18, right: 8, top: 4 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                minTickGap={24}
              />
              <YAxis
                domain={[0, 100]}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                tickFormatter={(v) => `${v}%`}
                width={44}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const point = payload[0]?.payload
                  return (
                    <TooltipShell title={longDate(point.date)}>
                      <p className="font-semibold tabular-nums">
                        {point.rate === null
                          ? "No attempts"
                          : `${point.rate.toFixed(1)}%`}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {point.attempts} attempts
                      </p>
                    </TooltipShell>
                  )
                }}
              />
              <Line
                type="monotone"
                dataKey="rate"
                stroke="var(--primary)"
                strokeWidth={2}
                dot={false}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

// --------------------------------------------------------------------------
// Network breakdown
// --------------------------------------------------------------------------

const NETWORK_LABELS: Record<string, string> = {
  mpesa: "M-Pesa",
  tigo: "Mixx by Yas",
  airtel: "Airtel Money",
  halopesa: "HaloPesa",
  azampesa: "AzamPesa",
  unknown: "Unknown",
}

const NETWORK_COLOURS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
]

export function NetworkChart({
  breakdown,
  currency = "TZS",
}: {
  breakdown: Breakdown
  currency?: string
}) {
  const data = breakdown.networks.map((row) => ({
    name: NETWORK_LABELS[row.network] ?? row.network,
    volume: row.volume_minor / 100,
    count: row.count,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">By network</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-muted-foreground py-12 text-center text-sm">
            No successful payments in this period yet.
          </p>
        ) : (
          <div style={{ height: CHART_HEIGHT }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                layout="vertical"
                margin={{ left: 8, right: 16 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="var(--border)"
                />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickFormatter={compact}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 12, fill: "var(--foreground)" }}
                  width={92}
                />
                <Tooltip
                  cursor={{ fill: "var(--muted)", opacity: 0.4 }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const point = payload[0]?.payload
                    return (
                      <TooltipShell title={point.name}>
                        <p className="font-semibold tabular-nums">
                          {formatMoney(point.volume * 100, currency)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {point.count} payments
                        </p>
                      </TooltipShell>
                    )
                  }}
                />
                <Bar dataKey="volume" radius={[0, 4, 4, 0]} maxBarSize={28}>
                  {data.map((_, index) => (
                    <Cell
                      key={index}
                      fill={NETWORK_COLOURS[index % NETWORK_COLOURS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function TooltipShell({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 shadow-md">
      <p className="text-muted-foreground mb-1 text-xs">{title}</p>
      {children}
    </div>
  )
}

function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  })
}

function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  })
}

/** 1500000 -> "1.5M". Full precision belongs in the tooltip, not the axis. */
function compact(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}k`
  return String(value)
}
