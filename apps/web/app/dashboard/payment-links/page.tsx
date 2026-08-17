"use client"

import { useCallback, useEffect, useState } from "react"
import { IconCopy, IconExternalLink, IconPlus } from "@tabler/icons-react"

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
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Switch } from "@workspace/ui/components/switch"
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

import { ApiError, api, type PaymentLinkRecord } from "@/lib/api"
import { formatMoney, toMinor } from "@/lib/format"
import { Perm } from "@/lib/rbac"
import {
  EmptyState,
  ErrorState,
  PageHeader,
  RequirePermission,
  TableSkeleton,
} from "@/components/dashboard/shared"

export default function PaymentLinksPage() {
  return (
    <RequirePermission permission={Perm.MANAGE_PAYMENT_LINKS}>
      <PaymentLinksView />
    </RequirePermission>
  )
}

function PaymentLinksView() {
  const [rows, setRows] = useState<PaymentLinkRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.paymentLinks()
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

  async function toggle(link: PaymentLinkRecord) {
    try {
      await api.updatePaymentLink(link.id, { active: !link.active })
      await load()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not update the link.",
      )
    }
  }

  if (error) return <ErrorState error={error} />

  return (
    <>
      <PageHeader
        title="Payment links"
        description="Take payments without writing any code. Share a link, or print the QR for your counter."
        action={
          <Button onClick={() => setCreating(true)}>
            <IconPlus className="size-4" />
            New link
          </Button>
        }
      />

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <TableSkeleton rows={4} />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No payment links yet"
              description="Create one and send it to a customer — they can pay from any phone."
              action={
                <Button onClick={() => setCreating(true)}>Create a link</Button>
              }
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="text-sm font-medium">
                      {link.title}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <code className="text-muted-foreground max-w-48 truncate font-mono text-xs">
                          /{link.slug}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7"
                          onClick={() => {
                            void navigator.clipboard.writeText(link.url)
                            toast.success("Link copied")
                          }}
                        >
                          <IconCopy className="size-3.5" />
                        </Button>
                        <Button size="icon" variant="ghost" className="size-7" render={<a href={link.url} target="_blank" rel="noopener noreferrer" />}>
                          <IconExternalLink className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {link.amount === null ? (
                        <span className="text-muted-foreground text-xs">
                          Customer chooses
                        </span>
                      ) : (
                        formatMoney(link.amount, link.currency)
                      )}
                    </TableCell>
                    <TableCell className="text-right text-sm tabular-nums">
                      {link.uses_count}
                      {link.max_uses ? ` / ${link.max_uses}` : ""}
                    </TableCell>
                    <TableCell>
                      <Badge variant={link.active ? "outline" : "secondary"}>
                        {link.active ? "Active" : "Off"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => void toggle(link)}
                      >
                        {link.active ? "Turn off" : "Turn on"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <CreateDialog
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={async () => {
          setCreating(false)
          await load()
        }}
      />
    </>
  )
}

function CreateDialog({
  open,
  onClose,
  onCreated,
}: {
  open: boolean
  onClose: () => void
  onCreated: () => Promise<void>
}) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [amount, setAmount] = useState("")
  const [openAmount, setOpenAmount] = useState(false)
  const [reusable, setReusable] = useState(true)
  const [busy, setBusy] = useState(false)

  async function create() {
    if (!title.trim()) return
    setBusy(true)
    try {
      const link = await api.createPaymentLink({
        title: title.trim(),
        description: description.trim() || undefined,
        // Null tells the checkout page to ask the customer for an amount.
        amount: openAmount ? null : toMinor(amount),
        is_reusable: reusable,
      })
      void navigator.clipboard.writeText(link.url)
      toast.success("Link created and copied to your clipboard.")
      setTitle("")
      setDescription("")
      setAmount("")
      await onCreated()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not create the link.",
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New payment link</DialogTitle>
          <DialogDescription>
            Anyone with this link can pay you from their phone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="link-title">What is this for?</Label>
            <Input
              id="link-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mchele kilo 5"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label htmlFor="link-description">
              Description{" "}
              <span className="text-muted-foreground font-normal">optional</span>
            </Label>
            <Textarea
              id="link-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1.5"
            />
          </div>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Let the customer choose</p>
              <p className="text-muted-foreground text-xs">
                For donations or varying amounts
              </p>
            </div>
            <Switch checked={openAmount} onCheckedChange={setOpenAmount} />
          </div>

          {!openAmount ? (
            <div>
              <Label htmlFor="link-amount">Amount (TZS)</Label>
              <Input
                id="link-amount"
                type="number"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10000"
                className="mt-1.5"
              />
            </div>
          ) : null}

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">Reusable</p>
              <p className="text-muted-foreground text-xs">
                Off means the link works once only
              </p>
            </div>
            <Switch checked={reusable} onCheckedChange={setReusable} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!title.trim() || busy || (!openAmount && !amount)}
            onClick={() => void create()}
          >
            Create link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
