"use client"

/** Small pieces reused across every dashboard page. */

import { IconAlertTriangle, IconLock } from "@tabler/icons-react"

import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { cn } from "@workspace/ui/lib/utils"

import { ApiError } from "@/lib/api"
import { statusLabel, statusTone, type StatusTone } from "@/lib/format"
import { useSession } from "@/lib/session"
import type { Permission } from "@/lib/rbac"

const TONE_CLASSES: Record<StatusTone, string> = {
  success:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
  failed: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
  // Distinct from `failed` on purpose: "we don't know" must not look like
  // "it failed", because the operator response is completely different.
  warning:
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-500/20",
  neutral: "bg-muted text-muted-foreground border-border",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant="outline"
      className={cn("font-medium", TONE_CLASSES[statusTone(status)])}
    >
      {statusLabel(status)}
    </Badge>
  )
}

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="text-muted-foreground mt-1 text-sm">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  )
}

export function StatCard({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: React.ReactNode
  hint?: string
  tone?: "default" | "warning"
}) {
  return (
    <Card className={cn(tone === "warning" && "border-orange-500/30")}>
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        {hint ? (
          <p className="text-muted-foreground mt-1 text-xs">{hint}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}

/**
 * Shown when a user reaches a page their role does not cover.
 *
 * The nav already hides these, but a bookmarked or shared URL still lands
 * here — so it explains rather than 404s.
 */
export function PermissionDenied({ permission }: { permission?: Permission }) {
  const { role } = useSession()
  return (
    <Card className="mx-auto max-w-md">
      <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
        <div className="bg-muted flex size-10 items-center justify-center rounded-full">
          <IconLock className="size-5" />
        </div>
        <div>
          <p className="font-medium">You don&apos;t have access to this page</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Your role ({role ?? "unknown"}) doesn&apos;t include this
            permission. Ask an owner or admin if you need it.
          </p>
          {permission ? (
            <code className="text-muted-foreground mt-2 block text-xs">
              {permission}
            </code>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

/** Gate a whole page. Renders the denial card rather than an empty screen. */
export function RequirePermission({
  permission,
  children,
}: {
  permission: Permission
  children: React.ReactNode
}) {
  const { can, loading } = useSession()
  if (loading) return <TableSkeleton />
  if (!can(permission)) return <PermissionDenied permission={permission} />
  return <>{children}</>
}

export function ErrorState({ error }: { error: unknown }) {
  const message =
    error instanceof ApiError
      ? error.message
      : "Something went wrong loading this page."
  const requestId = error instanceof ApiError ? error.requestId : undefined

  return (
    <Card className="border-red-500/30">
      <CardContent className="flex items-start gap-3 py-6">
        <IconAlertTriangle className="mt-0.5 size-5 shrink-0 text-red-600" />
        <div className="min-w-0">
          <p className="font-medium">{message}</p>
          {requestId ? (
            // Support asks for exactly one identifier (§9.4).
            <p className="text-muted-foreground mt-1 text-xs">
              Quote this to support:{" "}
              <code className="font-mono">{requestId}</code>
            </p>
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed py-14 text-center">
      <p className="font-medium">{title}</p>
      {description ? (
        <p className="text-muted-foreground max-w-sm text-sm">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

export function TableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-9 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-28 w-full" />
      ))}
    </div>
  )
}
