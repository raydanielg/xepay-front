"use client"

import { useCallback, useEffect, useState } from "react"
import { IconAlertTriangle, IconCopy } from "@tabler/icons-react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { toast } from "@workspace/ui/components/sonner"

import { ApiError, api, type ApiKeyRecord } from "@/lib/api"
import { formatDateTime, formatRelative } from "@/lib/format"
import { Perm } from "@/lib/rbac"
import { useSession } from "@/lib/session"
import {
  EmptyState,
  ErrorState,
  PageHeader,
  RequirePermission,
  TableSkeleton,
} from "@/components/dashboard/shared"

export default function ApiKeysPage() {
  return (
    <RequirePermission permission={Perm.VIEW_API_KEYS}>
      <ApiKeysView />
    </RequirePermission>
  )
}

function ApiKeysView() {
  const { can, session } = useSession()
  const canManage = can(Perm.MANAGE_API_KEYS)

  const [keys, setKeys] = useState<ApiKeyRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)
  const [newSecret, setNewSecret] = useState<ApiKeyRecord | null>(null)
  const [busy, setBusy] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await api.apiKeys()
      setKeys(result.data)
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

  async function create(environment: "test" | "live") {
    setBusy(true)
    try {
      const key = await api.createApiKey(environment)
      setNewSecret(key)
      await load()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not create the key.",
      )
    } finally {
      setBusy(false)
    }
  }

  async function revoke(key: ApiKeyRecord) {
    setBusy(true)
    try {
      await api.revokeApiKey(key.id)
      toast.success("Key revoked. Any integration using it will stop working.")
      await load()
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not revoke the key.",
      )
    } finally {
      setBusy(false)
    }
  }

  if (error) return <ErrorState error={error} />

  return (
    <>
      <PageHeader
        title="API keys"
        description="Secret keys are shown once, at creation. We store only a hash."
        action={
          canManage ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={busy}
                onClick={() => void create("test")}
              >
                New test key
              </Button>
              <Button
                disabled={busy || !session?.merchant?.live_enabled}
                onClick={() => void create("live")}
                title={
                  session?.merchant?.live_enabled
                    ? undefined
                    : "Live mode is not enabled yet"
                }
              >
                New live key
              </Button>
            </div>
          ) : null
        }
      />

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <TableSkeleton rows={3} />
          ) : keys.length === 0 ? (
            <EmptyState
              title="No API keys yet"
              description="Create a test key to start integrating against the sandbox."
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Key</TableHead>
                  <TableHead>Environment</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead>Created</TableHead>
                  {canManage ? (
                    <TableHead className="text-right">Action</TableHead>
                  ) : null}
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id} className={key.active ? "" : "opacity-50"}>
                    <TableCell>
                      <code className="font-mono text-xs">
                        {key.secret_prefix}…
                      </code>
                      {key.label ? (
                        <div className="text-muted-foreground text-xs">
                          {key.label}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          key.environment === "live"
                            ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                            : "border-amber-500/30 text-amber-700 dark:text-amber-400"
                        }
                      >
                        {key.environment}
                      </Badge>
                      {!key.active ? (
                        <Badge variant="secondary" className="ml-2">
                          revoked
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {key.last_used_at ? formatRelative(key.last_used_at) : "Never"}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {formatDateTime(key.created_at)}
                    </TableCell>
                    {canManage ? (
                      <TableCell className="text-right">
                        {key.active ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={busy}
                            onClick={() => void revoke(key)}
                          >
                            Revoke
                          </Button>
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

      {/* Shown once. There is no way to retrieve this again, by design. */}
      <Dialog
        open={newSecret !== null}
        onOpenChange={(open) => !open && setNewSecret(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy your secret key now</DialogTitle>
            <DialogDescription>
              This is the only time it will ever be shown. We store a hash, not
              the key itself — if you lose it you will need to create a new one.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <SecretRow
              label="Secret key"
              value={newSecret?.secret_key ?? ""}
              highlight
            />
            <SecretRow
              label="Public key"
              value={newSecret?.public_key ?? ""}
            />
          </div>

          <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-3">
            <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <p className="text-muted-foreground text-xs">
              Keep the secret key on your server only. Never put it in a
              browser, a mobile app, or a git repository.
            </p>
          </div>

          <DialogFooter>
            <Button onClick={() => setNewSecret(null)}>
              I&apos;ve saved it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SecretRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div>
      <p className="text-muted-foreground mb-1 text-xs font-medium">{label}</p>
      <div
        className={`flex items-center gap-2 rounded-md border p-2 ${
          highlight ? "border-primary/40 bg-primary/5" : ""
        }`}
      >
        <code className="flex-1 break-all font-mono text-xs">{value}</code>
        <Button
          size="icon"
          variant="ghost"
          onClick={() => {
            void navigator.clipboard.writeText(value)
            toast.success(`${label} copied`)
          }}
        >
          <IconCopy className="size-4" />
        </Button>
      </div>
    </div>
  )
}
