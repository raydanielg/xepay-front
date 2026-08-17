"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { IconCheck, IconUpload } from "@tabler/icons-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { toast } from "@workspace/ui/components/sonner"

import { ApiError, api, type KycOverview } from "@/lib/api"
import { formatDateTime } from "@/lib/format"
import { Perm } from "@/lib/rbac"
import { useSession } from "@/lib/session"
import {
  ErrorState,
  PageHeader,
  RequirePermission,
  StatusBadge,
  TableSkeleton,
} from "@/components/dashboard/shared"

const DOC_LABELS: Record<string, string> = {
  nida: "National ID (NIDA)",
  brela_cert: "BRELA certificate",
  tin_cert: "TIN certificate",
  vat_cert: "VAT certificate",
  bank_statement: "Bank statement",
  director_id: "Director ID",
  business_licence: "Business licence",
}

export default function KycPage() {
  return (
    <RequirePermission permission={Perm.SUBMIT_KYC}>
      <KycView />
    </RequirePermission>
  )
}

function KycView() {
  const { refresh } = useSession()
  const [data, setData] = useState<KycOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  const [busy, setBusy] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setData(await api.kycStatus())
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

  async function upload(docType: string, file: File) {
    setBusy(docType)
    try {
      await api.kycUpload(docType, file)
      toast.success(`${DOC_LABELS[docType] ?? docType} uploaded.`)
      await load()
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Upload failed.")
    } finally {
      setBusy(null)
    }
  }

  async function submit() {
    setBusy("submit")
    try {
      await api.kycSubmit()
      toast.success("Submitted for review. We'll email you when it's decided.")
      await load()
      await refresh()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not submit for review.",
      )
    } finally {
      setBusy(null)
    }
  }

  if (error) return <ErrorState error={error} />
  if (loading || !data) return <TableSkeleton />

  const uploaded = new Map(data.documents.map((doc) => [doc.doc_type, doc]))

  return (
    <>
      <PageHeader
        title="Verification"
        description="We need these before you can accept real payments."
        action={<StatusBadge status={data.kyc_status} />}
      />

      {data.kyc_status === "approved" ? (
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="flex items-start gap-3 py-4">
            <IconCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <div className="text-sm">
              <p className="font-medium">You&apos;re verified</p>
              <p className="text-muted-foreground mt-1">
                {data.live_enabled
                  ? "Live mode is on. You can take real payments."
                  : "Live mode isn't on yet — check your fee plan and settlement account."}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : data.kyc_status === "rejected" ? (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardContent className="py-4 text-sm">
            <p className="font-medium">Verification was rejected</p>
            <p className="text-muted-foreground mt-1">
              See the notes on each document below, fix what&apos;s flagged,
              and upload again.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Documents</CardTitle>
          <CardDescription>
            PDF, JPG, PNG or WebP. Up to 10 MB each.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {data.required_documents.map((docType) => {
            const doc = uploaded.get(docType)
            return (
              <DocumentRow
                key={docType}
                docType={docType}
                document={doc}
                busy={busy === docType}
                onUpload={(file) => void upload(docType, file)}
              />
            )
          })}
        </CardContent>
      </Card>

      {!data.has_settlement_account ? (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4 text-sm">
            <p className="font-medium">Settlement account missing</p>
            <p className="text-muted-foreground mt-1">
              We need the bank account we&apos;ll pay your balance into before
              you can submit for review.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {data.kyc_status !== "approved" && data.kyc_status !== "under_review" ? (
        <div>
          <Button disabled={!data.can_submit || busy !== null} onClick={() => void submit()}>
            Submit for review
          </Button>
          {!data.can_submit ? (
            <p className="text-muted-foreground mt-2 text-xs">
              {data.missing_documents.length > 0
                ? `Still needed: ${data.missing_documents
                    .map((d) => DOC_LABELS[d] ?? d)
                    .join(", ")}`
                : "Add your settlement bank account first."}
            </p>
          ) : null}
        </div>
      ) : data.kyc_status === "under_review" ? (
        <p className="text-muted-foreground text-sm">
          Your documents are with our team. We&apos;ll email you when
          there&apos;s a decision.
        </p>
      ) : null}
    </>
  )
}

function DocumentRow({
  docType,
  document,
  busy,
  onUpload,
}: {
  docType: string
  document?: { status: string; original_filename: string | null; created_at: string; review_note: string | null }
  busy: boolean
  onUpload: (file: File) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium">{DOC_LABELS[docType] ?? docType}</p>
        {document ? (
          <p className="text-muted-foreground truncate text-xs">
            {document.original_filename} · {formatDateTime(document.created_at)}
          </p>
        ) : (
          <p className="text-muted-foreground text-xs">Not uploaded yet</p>
        )}
        {document?.review_note ? (
          <p className="mt-1 text-xs text-red-600">{document.review_note}</p>
        ) : null}
      </div>

      <div className="flex items-center gap-2">
        {document ? <StatusBadge status={document.status} /> : null}
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onUpload(file)
            e.target.value = ""
          }}
        />
        <Button
          size="sm"
          variant="outline"
          disabled={busy}
          onClick={() => inputRef.current?.click()}
        >
          <IconUpload className="size-4" />
          {document ? "Replace" : "Upload"}
        </Button>
      </div>
    </div>
  )
}
