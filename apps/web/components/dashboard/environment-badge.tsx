"use client"

import { IconAlertTriangle, IconFlask } from "@tabler/icons-react"

import { Badge } from "@workspace/ui/components/badge"

import { useSession } from "@/lib/session"

/**
 * Test/live indicator and account-state warnings.
 *
 * The test-mode banner is deliberately loud. A merchant who thinks they are
 * live but is not will believe payments are being taken when nothing is
 * reaching a real customer.
 */
export function EnvironmentBadge() {
  const { session } = useSession()
  const merchant = session?.merchant

  if (!merchant) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {merchant.live_enabled ? (
        <Badge
          variant="outline"
          className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
        >
          Live mode
        </Badge>
      ) : (
        <Badge
          variant="outline"
          className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
        >
          <IconFlask className="mr-1 size-3" />
          Test mode — no real money moves
        </Badge>
      )}

      {merchant.kyc_status !== "approved" ? (
        <Badge variant="outline" className="text-muted-foreground">
          KYC: {merchant.kyc_status.replace(/_/g, " ")}
        </Badge>
      ) : null}

      {merchant.status === "suspended" ? (
        <Badge
          variant="outline"
          className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
        >
          <IconAlertTriangle className="mr-1 size-3" />
          Account suspended
        </Badge>
      ) : null}
    </div>
  )
}
