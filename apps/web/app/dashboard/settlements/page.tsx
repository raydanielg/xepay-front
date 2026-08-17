"use client"

import { useEffect, useState } from "react"

import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { api, type Settlement } from "@/lib/api"
import { formatDate, formatMoney } from "@/lib/format"
import { Perm } from "@/lib/rbac"
import { useSession } from "@/lib/session"
import {
  EmptyState,
  ErrorState,
  PageHeader,
  RequirePermission,
  StatusBadge,
  TableSkeleton,
} from "@/components/dashboard/shared"

export default function SettlementsPage() {
  return (
    <RequirePermission permission={Perm.VIEW_SETTLEMENTS}>
      <SettlementsView />
    </RequirePermission>
  )
}

function SettlementsView() {
  const { session } = useSession()
  const [rows, setRows] = useState<Settlement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let cancelled = false
    api
      .settlements()
      .then((result) => !cancelled && setRows(result.data))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  if (error) return <ErrorState error={error} />

  const schedule = session?.merchant?.settlement_schedule

  return (
    <>
      <PageHeader
        title="Settlements"
        description={
          schedule
            ? `Your balance moves to your bank on a ${schedule} schedule.`
            : "Transfers of your balance to your bank account."
        }
      />

      {schedule === "T+7" ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4">
            <p className="text-sm">
              New accounts settle at T+7 for the first 30 days. After that you
              move to your configured schedule automatically.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <TableSkeleton rows={4} />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No settlements yet"
              description="Once you take live payments, settlements will appear here on your schedule."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Fees</TableHead>
                  <TableHead className="text-right">Refunds</TableHead>
                  <TableHead className="text-right">Net paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bank ref</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((settlement) => (
                  <TableRow key={settlement.id}>
                    <TableCell className="text-sm whitespace-nowrap">
                      {formatDate(settlement.period_start)} –{" "}
                      {formatDate(settlement.period_end)}
                      <div className="text-muted-foreground text-xs">
                        {settlement.transaction_count} transactions
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(settlement.gross, settlement.currency)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right text-sm tabular-nums">
                      −{formatMoney(settlement.fees, settlement.currency)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right text-sm tabular-nums">
                      −{formatMoney(settlement.refunds, settlement.currency)}
                    </TableCell>
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatMoney(settlement.net, settlement.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={settlement.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {settlement.bank_ref ?? "—"}
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
