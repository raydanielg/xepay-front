"use client"

import { useCallback, useEffect, useState } from "react"

import { Badge } from "@workspace/ui/components/badge"
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

import {
  ApiError,
  api,
  type KycQueueEntry,
  type KycReviewDetail,
} from "@/lib/api"
import { formatDate, formatDateTime } from "@/lib/format"
import { Perm } from "@/lib/rbac"
import { useSession } from "@/lib/session"
import {
  EmptyState,
  ErrorState,
  PageHeader,
  PermissionDenied,
  StatusBadge,
  TableSkeleton,
} from "@/components/dashboard/shared"

export default function AdminKycPage() {
  const { isStaff, can, loading } = useSession()

  if (loading) return <TableSkeleton />
  if (!isStaff || !can(Perm.ADMIN_REVIEW_KYC)) {
    return <PermissionDenied permission={Perm.ADMIN_REVIEW_KYC} />
  }
  return <KycQueue />
}

function KycQueue() {
  const [rows, setRows] = useState<KycQueueEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  const [reviewing, setReviewing] = useState<KycReviewDetail | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.adminKycQueue()
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

  async function open(merchantId: string) {
    try {
      setReviewing(await api.adminKycDetail(merchantId))
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not load that merchant.",
      )
    }
  }

  if (error) return <ErrorState error={error} />

  return (
    <>
      <PageHeader
        title="KYC review"
        description="Merchants waiting on a verification decision."
      />

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <TableSkeleton rows={4} />
          ) : rows.length === 0 ? (
            <EmptyState
              title="Nothing waiting"
              description="Every submitted merchant has been reviewed."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Business</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Waiting since</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((merchant) => (
                  <TableRow key={merchant.id}>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {merchant.business_name}
                      </div>
                      <div className="text-muted-foreground text-xs">
                        {merchant.email}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {merchant.business_type.replace(/_/g, " ")}
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">{merchant.document_count}</span>
                      {merchant.missing_documents.length > 0 ? (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {merchant.missing_documents.length} missing
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={merchant.kyc_status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDate(merchant.created_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => void open(merchant.id)}
                      >
                        Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ReviewDialog
        merchant={reviewing}
        onClose={() => setReviewing(null)}
        onDecided={async () => {
          setReviewing(null)
          await load()
        }}
      />
    </>
  )
}

function ReviewDialog({
  merchant,
  onClose,
  onDecided,
}: {
  merchant: KycReviewDetail | null
  onClose: () => void
  onDecided: () => Promise<void>
}) {
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [rejecting, setRejecting] = useState(false)

  async function approve() {
    if (!merchant) return
    setBusy(true)
    try {
      const result = await api.adminKycApprove(merchant.id, note, true)
      toast.success(
        result.live_enabled
          ? `${merchant.business_name} approved and live.`
          : `${merchant.business_name} approved, but live mode is withheld.`,
      )
      setNote("")
      await onDecided()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not approve.")
    } finally {
      setBusy(false)
    }
  }

  async function reject() {
    if (!merchant || !note.trim()) return
    setBusy(true)
    try {
      await api.adminKycReject(merchant.id, note.trim())
      toast.success(`${merchant.business_name} rejected.`)
      setNote("")
      setRejecting(false)
      await onDecided()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not reject.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={merchant !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{merchant?.business_name}</DialogTitle>
          <DialogDescription>
            Check each document against the details before deciding.
          </DialogDescription>
        </DialogHeader>

        {merchant ? (
          <div className="space-y-4">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <Detail label="Business type" value={merchant.business_type} />
              <Detail label="Trading name" value={merchant.trading_name} />
              <Detail label="TIN" value={merchant.tin} />
              <Detail label="BRELA" value={merchant.brela_number} />
              <Detail label="VRN" value={merchant.vrn} />
              <Detail label="Region" value={merchant.region} />
              <Detail label="Email" value={merchant.email} />
              <Detail label="Phone" value={merchant.phone} />
              <Detail label="Bank" value={merchant.settlement_bank_name} />
              <Detail
                label="Account"
                value={
                  merchant.settlement_account_name
                    ? `${merchant.settlement_account_name} · ${merchant.settlement_account_no}`
                    : merchant.settlement_account_no
                }
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium">Documents</p>
              <div className="space-y-2">
                {merchant.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between gap-3 rounded-md border p-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm">{doc.doc_type_label}</p>
                      <p className="text-muted-foreground truncate text-xs">
                        {doc.original_filename} ·{" "}
                        {formatDateTime(doc.created_at)}
                      </p>
                    </div>
                    {doc.url ? (
                      <Button size="sm" variant="outline" render={<a href={doc.url} target="_blank" rel="noopener noreferrer" />}>
                        Open
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-xs">
                        No link
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {!merchant.can_go_live ? (
              <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-3 text-sm">
                <p className="font-medium">Live mode will stay off</p>
                <p className="text-muted-foreground mt-1">
                  {merchant.cannot_go_live_reason}
                </p>
              </div>
            ) : null}

            <div>
              <p className="mb-1 text-sm font-medium">
                {rejecting ? "Reason for rejection" : "Note (optional)"}
              </p>
              <Textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  rejecting
                    ? "Be specific — the merchant sees this and acts on it."
                    : "Anything worth recording against this decision."
                }
              />
            </div>
          </div>
        ) : null}

        <DialogFooter className="gap-2">
          {rejecting ? (
            <>
              <Button variant="outline" onClick={() => setRejecting(false)}>
                Back
              </Button>
              <Button
                variant="destructive"
                disabled={!note.trim() || busy}
                onClick={() => void reject()}
              >
                Confirm rejection
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setRejecting(true)}>
                Reject
              </Button>
              <Button disabled={busy} onClick={() => void approve()}>
                Approve
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  )
}
