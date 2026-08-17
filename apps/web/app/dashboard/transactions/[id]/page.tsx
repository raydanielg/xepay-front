"use client"

import { use, useEffect, useState } from "react"
import Link from "next/link"
import { IconArrowLeft } from "@tabler/icons-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { Separator } from "@workspace/ui/components/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { toast } from "@workspace/ui/components/sonner"

import { ApiError, api, type Charge } from "@/lib/api"
import { formatDateTime, formatMoney, redactPhone, toMinor } from "@/lib/format"
import { Perm } from "@/lib/rbac"
import { useSession } from "@/lib/session"
import {
  ErrorState,
  PageHeader,
  RequirePermission,
  StatusBadge,
  TableSkeleton,
} from "@/components/dashboard/shared"

export default function TransactionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  // Next 16: route params are a promise and must be unwrapped with `use`.
  const { id } = use(params)
  return (
    <RequirePermission permission={Perm.VIEW_TRANSACTIONS}>
      <TransactionDetail id={id} />
    </RequirePermission>
  )
}

function TransactionDetail({ id }: { id: string }) {
  const { can } = useSession()
  const [txn, setTxn] = useState<Charge | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  const [refunding, setRefunding] = useState(false)

  useEffect(() => {
    let cancelled = false
    api
      .transaction(id)
      .then((data) => !cancelled && setTxn(data))
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [id])

  if (error) return <ErrorState error={error} />
  if (loading || !txn) return <TableSkeleton />

  return (
    <>
      <Button variant="ghost" size="sm" className="w-fit" render={<Link href="/dashboard/transactions" />}>
        <IconArrowLeft className="size-4" />
        Back to transactions
      </Button>

      <PageHeader
        title={txn.reference}
        description={txn.description ?? undefined}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={txn.status} />
            {can(Perm.CREATE_REFUND) && txn.status === "success" ? (
              <Button variant="outline" size="sm" onClick={() => setRefunding(true)}>
                Refund
              </Button>
            ) : null}
          </div>
        }
      />

      <RefundDialog
        open={refunding}
        txn={txn}
        onClose={() => setRefunding(false)}
        onDone={async () => {
          setRefunding(false)
          setTxn(await api.transaction(id))
        }}
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <Row label="Amount" value={formatMoney(txn.amount, txn.currency)} />
            <Row label="Fee" value={formatMoney(txn.fee, txn.currency)} />
            <Separator />
            <Row
              label="Net to you"
              value={formatMoney(txn.net, txn.currency)}
              emphasise
            />
            <Separator />
            <Row label="Channel" value={txn.network ?? txn.channel} />
            <Row label="Payer" value={txn.payer.name ?? "—"} />
            <Row label="Phone" value={redactPhone(txn.payer.phone)} />
            <Row label="Created" value={formatDateTime(txn.created_at)} />
            {txn.completed_at ? (
              <Row label="Completed" value={formatDateTime(txn.completed_at)} />
            ) : null}
            {txn.failure_code ? (
              <>
                <Separator />
                <Row label="Failure" value={txn.failure_code} />
                {txn.failure_message ? (
                  <p className="text-muted-foreground text-xs">
                    {txn.failure_message}
                  </p>
                ) : null}
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(txn.metadata ?? {}).length === 0 ? (
              <p className="text-muted-foreground text-sm">
                No metadata was sent with this payment.
              </p>
            ) : (
              <dl className="space-y-2 text-sm">
                {Object.entries(txn.metadata).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-muted-foreground text-xs">{key}</dt>
                    <dd className="font-mono text-xs">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            )}
          </CardContent>
        </Card>
      </div>

      {/* One row per provider try. This is what makes a failover visible. */}
      {txn.attempts && txn.attempts.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Provider attempts</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>HTTP</TableHead>
                  <TableHead className="text-right">Latency</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {txn.attempts.map((attempt) => (
                  <TableRow key={`${attempt.provider}-${attempt.attempt_number}`}>
                    <TableCell className="text-muted-foreground text-xs">
                      {attempt.attempt_number}
                    </TableCell>
                    <TableCell className="text-sm">{attempt.provider}</TableCell>
                    <TableCell className="text-sm">
                      {attempt.outcome}
                      {attempt.failure_code ? (
                        <span className="text-muted-foreground ml-2 text-xs">
                          {attempt.failure_code}
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs tabular-nums">
                      {attempt.http_status ?? "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-right text-xs tabular-nums">
                      {attempt.latency_ms ? `${attempt.latency_ms}ms` : "—"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDateTime(attempt.created_at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : null}
    </>
  )
}

function RefundDialog({
  open,
  txn,
  onClose,
  onDone,
}: {
  open: boolean
  txn: Charge
  onClose: () => void
  onDone: () => Promise<void>
}) {
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [busy, setBusy] = useState(false)

  // What's left after any refunds already issued against this payment.
  const alreadyRefunded = (txn.refunds ?? []).reduce(
    (sum, r) => (r.status === "failed" ? sum : sum + r.amount),
    0,
  )
  const refundable = txn.amount - alreadyRefunded

  async function submit() {
    setBusy(true)
    try {
      // Blank means refund everything still outstanding.
      const minor = amount ? toMinor(amount) : null
      await api.refund(txn.id, minor, reason)
      toast.success("Refund requested.")
      setAmount("")
      setReason("")
      await onDone()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not issue the refund.",
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refund this payment</DialogTitle>
          <DialogDescription>
            {formatMoney(refundable, txn.currency)} can still be refunded.
            The money comes out of your available balance.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="refund-amount">
              Amount{" "}
              <span className="text-muted-foreground font-normal">
                leave blank to refund it all
              </span>
            </Label>
            <Input
              id="refund-amount"
              type="number"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={(refundable / 100).toString()}
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="refund-reason">Reason</Label>
            <Textarea
              id="refund-reason"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Recorded in the audit log."
              className="mt-1.5"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button disabled={busy} onClick={() => void submit()}>
            Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Row({
  label,
  value,
  emphasise,
}: {
  label: string
  value: string
  emphasise?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={`tabular-nums ${emphasise ? "font-semibold" : "font-medium"}`}
      >
        {value}
      </span>
    </div>
  )
}
