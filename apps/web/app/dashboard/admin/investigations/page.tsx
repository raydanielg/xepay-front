"use client"

import { useEffect, useState } from "react"
import { IconAlertTriangle } from "@tabler/icons-react"

import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { api, type Payout } from "@/lib/api"
import { formatDateTime, formatMoney, redactPhone } from "@/lib/format"
import { Perm } from "@/lib/rbac"
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PermissionDenied,
  TableSkeleton,
} from "@/components/dashboard/shared"
import { useSession } from "@/lib/session"

/**
 * XerinPay staff only: payouts where we do not know whether money left.
 *
 * These are the most expensive rows in the system. The reserve is still
 * held, so the merchant is not out of pocket — but until someone confirms
 * against the provider, we cannot release or complete them.
 */
export default function InvestigationsPage() {
  const { isStaff, can, loading: sessionLoading } = useSession()

  const [rows, setRows] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    if (!isStaff) {
      setLoading(false)
      return
    }
    let cancelled = false
    api
      .payoutInvestigations()
      .then((result) => !cancelled && setRows(result.data))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [isStaff])

  if (sessionLoading) return <TableSkeleton />
  if (!isStaff || !can(Perm.ADMIN_VIEW_MERCHANTS)) {
    return <PermissionDenied permission={Perm.ADMIN_VIEW_MERCHANTS} />
  }
  if (error) return <ErrorState error={error} />

  return (
    <>
      <PageHeader
        title="Payout investigations"
        description="Payouts in an unknown state. Funds remain reserved until resolved."
      />

      <Card className="border-orange-500/40 bg-orange-500/5">
        <CardContent className="flex items-start gap-3 py-4">
          <IconAlertTriangle className="mt-0.5 size-5 shrink-0 text-orange-600" />
          <div className="text-sm">
            <p className="font-medium">Confirm with the provider before acting</p>
            <p className="text-muted-foreground mt-1">
              Do not release a reserve on assumption. If the payout actually
              succeeded on the provider&apos;s side, releasing it means paying
              the recipient twice at XerinPay&apos;s expense. Check the
              provider&apos;s own records first, then resolve.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <TableSkeleton rows={3} />
          ) : rows.length === 0 ? (
            <EmptyState
              title="Nothing under investigation"
              description="Every payout has a confirmed outcome. This is the state you want."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Merchant</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="text-right">Amount held</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Since</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-mono text-xs">
                      {payout.reference}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payout.merchant ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {payout.destination_type === "mobile_money"
                        ? redactPhone(payout.destination_no)
                        : payout.destination_no}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatMoney(payout.amount, payout.currency)}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs text-xs">
                      {payout.failure_message ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDateTime(payout.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  )
}
