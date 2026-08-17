"use client"

import { useCallback, useEffect, useState } from "react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { cn } from "@workspace/ui/lib/utils"

import { api, type LedgerEntry } from "@/lib/api"
import { formatAmount, formatDateTime } from "@/lib/format"
import { Perm } from "@/lib/rbac"
import {
  EmptyState,
  ErrorState,
  PageHeader,
  RequirePermission,
  TableSkeleton,
} from "@/components/dashboard/shared"

const ACCOUNT_LABELS: Record<string, string> = {
  merchant_available: "Available",
  merchant_pending: "Pending",
  merchant_reserve: "Reserve",
}

export default function LedgerPage() {
  return (
    <RequirePermission permission={Perm.VIEW_LEDGER}>
      <LedgerView />
    </RequirePermission>
  )
}

function LedgerView() {
  const [rows, setRows] = useState<LedgerEntry[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const load = useCallback(async (startingAfter?: string) => {
    setLoading(true)
    try {
      const result = await api.ledger({ starting_after: startingAfter })
      setRows((prev) => (startingAfter ? [...prev, ...result.data] : result.data))
      setCursor(result.next_cursor)
      setHasMore(result.has_more)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  if (error) return <ErrorState error={error} />

  return (
    <>
      <PageHeader
        title="Ledger"
        description="Every entry behind your balance. Append-only — nothing here is ever edited or deleted."
      />

      <Card>
        <CardContent className="pt-6">
          {loading && rows.length === 0 ? (
            <TableSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No ledger entries yet"
              description="Entries appear as soon as your first payment succeeds."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Narration</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                        {formatDateTime(entry.created_at)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {ACCOUNT_LABELS[entry.account_type] ?? entry.account_type}
                      </TableCell>
                      <TableCell className="max-w-md text-sm">
                        {entry.narration}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right tabular-nums",
                          entry.direction === "debit"
                            ? "text-red-600 dark:text-red-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {entry.direction === "debit"
                          ? formatAmount(entry.amount)
                          : "—"}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right tabular-nums",
                          entry.direction === "credit"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground",
                        )}
                      >
                        {entry.direction === "credit"
                          ? formatAmount(entry.amount)
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {hasMore ? (
                <div className="mt-4 flex justify-center">
                  <Button
                    variant="outline"
                    disabled={loading}
                    onClick={() => void load(cursor ?? undefined)}
                  >
                    {loading ? "Loading…" : "Load more"}
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>
    </>
  )
}
