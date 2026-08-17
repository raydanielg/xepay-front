"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { IconSearch } from "@tabler/icons-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import { api, type Charge } from "@/lib/api"
import { formatDateTime, formatMoney, redactPhone } from "@/lib/format"
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

const STATUSES = [
  "pending",
  "processing",
  "success",
  "failed",
  "expired",
  "reversed",
]

export default function TransactionsPage() {
  return (
    <RequirePermission permission={Perm.VIEW_TRANSACTIONS}>
      <TransactionsList />
    </RequirePermission>
  )
}

function TransactionsList() {
  const { session } = useSession()
  const environment = session?.merchant?.live_enabled ? "live" : "test"

  const [rows, setRows] = useState<Charge[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [status, setStatus] = useState<string>("all")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const load = useCallback(
    async (opts: { append?: boolean; startingAfter?: string } = {}) => {
      setLoading(true)
      try {
        const result = await api.transactions({
          environment,
          status: status === "all" ? undefined : status,
          search: search || undefined,
          starting_after: opts.startingAfter,
        })
        setRows((prev) => (opts.append ? [...prev, ...result.data] : result.data))
        setCursor(result.next_cursor)
        setHasMore(result.has_more)
        setError(null)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    },
    [environment, status, search],
  )

  useEffect(() => {
    void load()
  }, [load])

  if (error) return <ErrorState error={error} />

  return (
    <>
      <PageHeader
        title="Transactions"
        description="Every payment attempt, including the ones that failed."
      />

      <div className="flex flex-wrap items-center gap-3">
        <form
          className="relative flex-1 min-w-56"
          onSubmit={(e) => {
            e.preventDefault()
            void load()
          }}
        >
          <IconSearch className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
          <Input
            placeholder="Reference, phone or name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </form>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="pt-6">
          {loading && rows.length === 0 ? (
            <TableSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No transactions match"
              description="Try clearing the filters or widening your search."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>Payer</TableHead>
                    <TableHead>Channel</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Fee</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((txn) => (
                    <TableRow key={txn.id}>
                      <TableCell className="font-mono text-xs">
                        <Link
                          href={`/dashboard/transactions/${txn.id}`}
                          className="hover:underline"
                        >
                          {txn.reference}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{txn.payer.name ?? "—"}</div>
                        <div className="text-muted-foreground text-xs">
                          {redactPhone(txn.payer.phone)}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {txn.network ?? txn.channel}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatMoney(txn.amount, txn.currency)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right text-xs tabular-nums">
                        {formatMoney(txn.fee, txn.currency)}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={txn.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {formatDateTime(txn.created_at)}
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
                    onClick={() =>
                      void load({ append: true, startingAfter: cursor ?? undefined })
                    }
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
