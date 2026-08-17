"use client"

import { useEffect, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"

import { api, type Balance } from "@/lib/api"
import { formatMoney } from "@/lib/format"
import { Perm } from "@/lib/rbac"
import {
  ErrorState,
  PageHeader,
  RequirePermission,
  StatCard,
  StatGridSkeleton,
} from "@/components/dashboard/shared"

export default function BalancePage() {
  return (
    <RequirePermission permission={Perm.VIEW_BALANCE}>
      <BalanceView />
    </RequirePermission>
  )
}

function BalanceView() {
  const [balance, setBalance] = useState<Balance | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let cancelled = false
    api
      .balance()
      .then((data) => !cancelled && setBalance(data))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  if (error) return <ErrorState error={error} />

  return (
    <>
      <PageHeader
        title="Balance"
        description="Computed from the ledger, never stored as a single figure."
      />

      {loading ? (
        <StatGridSkeleton count={3} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Available"
            value={formatMoney(balance?.available_minor ?? 0, balance?.currency)}
            hint="You can pay out or settle this now"
          />
          <StatCard
            label="Pending"
            value={formatMoney(balance?.pending_minor ?? 0, balance?.currency)}
            hint="Collected but not yet cleared"
          />
          <StatCard
            label="Reserved"
            value={formatMoney(balance?.reserve_minor ?? 0, balance?.currency)}
            hint="Held against payouts in flight"
          />
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">How your balance is worked out</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-3 text-sm">
          <p>
            XerinPay does not keep a balance figure anywhere. Every payment,
            fee, refund, payout and settlement writes a pair of balanced
            entries to a double-entry ledger, and your balance is the sum of
            those entries.
          </p>
          <p>
            That is slower than storing a number, and it is deliberate: it
            makes it impossible for money to quietly appear or disappear. If
            the ledger ever fails to balance, we stop and investigate before
            anything else happens.
          </p>
          <p>
            <strong className="text-foreground">Reserved</strong> funds are not
            lost. They are held while a payout is being confirmed with the
            provider, and either complete or return to available.
          </p>
        </CardContent>
      </Card>
    </>
  )
}
