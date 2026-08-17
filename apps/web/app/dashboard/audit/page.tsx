"use client"

import { useCallback, useEffect, useState } from "react"

import { Badge } from "@workspace/ui/components/badge"
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

import { api, type AuditEntry } from "@/lib/api"
import { formatDateTime } from "@/lib/format"
import { Perm } from "@/lib/rbac"
import {
  EmptyState,
  ErrorState,
  PageHeader,
  RequirePermission,
  TableSkeleton,
} from "@/components/dashboard/shared"

export default function AuditPage() {
  return (
    <RequirePermission permission={Perm.VIEW_AUDIT}>
      <AuditView />
    </RequirePermission>
  )
}

function AuditView() {
  const [rows, setRows] = useState<AuditEntry[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const load = useCallback(async (startingAfter?: string) => {
    setLoading(true)
    try {
      const result = await api.audit({ starting_after: startingAfter })
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
        title="Audit log"
        description="Every action that touched money or access. Append-only — entries are never edited or removed."
      />

      <Card>
        <CardContent className="pt-6">
          {loading && rows.length === 0 ? (
            <TableSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState title="Nothing logged yet" />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Who</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                        {formatDateTime(entry.created_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {entry.action}
                        </Badge>
                        {entry.reason ? (
                          <p className="text-muted-foreground mt-1 max-w-sm text-xs">
                            {entry.reason}
                          </p>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-sm">
                        {entry.actor ?? entry.actor_type}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {entry.resource}
                        {entry.resource_id
                          ? ` · ${entry.resource_id.slice(0, 8)}`
                          : ""}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {entry.ip_address ?? "—"}
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
