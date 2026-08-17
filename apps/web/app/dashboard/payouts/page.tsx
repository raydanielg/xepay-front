"use client"

import { useCallback, useEffect, useState } from "react"
import { IconAlertTriangle } from "@tabler/icons-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@workspace/ui/components/dialog"
import { Textarea } from "@workspace/ui/components/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { toast } from "@workspace/ui/components/sonner"

import { ApiError, api, type Payout } from "@/lib/api"
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

export default function PayoutsPage() {
  return (
    <RequirePermission permission={Perm.VIEW_PAYOUTS}>
      <PayoutsList />
    </RequirePermission>
  )
}

function PayoutsList() {
  const { can } = useSession()
  const canApprove = can(Perm.APPROVE_PAYOUT)

  const [rows, setRows] = useState<Payout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [rejecting, setRejecting] = useState<Payout | null>(null)
  const [reason, setReason] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.payouts()
      setRows(result.data)
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

  async function approve(payout: Payout) {
    setBusyId(payout.id)
    try {
      await api.approvePayout(payout.id)
      toast.success(`Payout ${payout.reference} approved and sent.`)
      await load()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not approve this payout.",
      )
    } finally {
      setBusyId(null)
    }
  }

  async function reject() {
    if (!rejecting || !reason.trim()) return
    setBusyId(rejecting.id)
    try {
      await api.rejectPayout(rejecting.id, reason.trim())
      toast.success(`Payout ${rejecting.reference} rejected. Funds released.`)
      setRejecting(null)
      setReason("")
      await load()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not reject this payout.",
      )
    } finally {
      setBusyId(null)
    }
  }

  if (error) return <ErrorState error={error} />

  const investigations = rows.filter(
    (p) => p.status === "requires_investigation",
  )

  return (
    <>
      <PageHeader
        title="Payouts"
        description="Money leaving your balance. Payouts above your threshold need approval."
      />

      {/* This must be impossible to miss: funds are held and only a human
          can resolve it (§8.4 step 7). */}
      {investigations.length > 0 ? (
        <Card className="border-orange-500/40 bg-orange-500/5">
          <CardContent className="flex items-start gap-3 py-4">
            <IconAlertTriangle className="mt-0.5 size-5 shrink-0 text-orange-600" />
            <div>
              <p className="font-medium">
                {investigations.length} payout
                {investigations.length === 1 ? "" : "s"} in an unknown state
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                We could not confirm with the provider whether the money left.
                The funds stay reserved until XerinPay support resolves it —
                releasing them early risks paying twice.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <TableSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No payouts yet"
              description="Payouts you send to bank accounts or mobile money will appear here."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Destination</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  {canApprove ? (
                    <TableHead className="text-right">Action</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((payout) => (
                  <TableRow key={payout.id}>
                    <TableCell className="font-mono text-xs">
                      {payout.reference}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {payout.destination_name ?? "—"}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {payout.destination_type === "mobile_money"
                          ? redactPhone(payout.destination_no)
                          : payout.destination_no}
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatMoney(payout.amount, payout.currency)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={payout.status} />
                      {payout.failure_message ? (
                        <p className="text-muted-foreground mt-1 max-w-xs text-xs">
                          {payout.failure_message}
                        </p>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDateTime(payout.created_at)}
                    </TableCell>
                    {canApprove ? (
                      <TableCell className="text-right">
                        {payout.status === "awaiting_approval" ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              disabled={busyId === payout.id}
                              onClick={() => void approve(payout)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={busyId === payout.id}
                              onClick={() => setRejecting(payout)}
                            >
                              Reject
                            </Button>
                          </div>
                        ) : null}
                      </TableCell>
                    ) : null}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog
        open={rejecting !== null}
        onOpenChange={(open) => {
          if (!open) {
            setRejecting(null)
            setReason("")
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject payout</DialogTitle>
            <DialogDescription>
              {rejecting
                ? `${formatMoney(rejecting.amount, rejecting.currency)} to ${rejecting.destination_no}. The reserved funds return to your available balance.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Why is this being rejected? This is recorded in the audit log."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!reason.trim() || busyId !== null}
              onClick={() => void reject()}
            >
              Reject payout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
