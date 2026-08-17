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

import { api, type ApiLogEntry } from "@/lib/api"
import { formatDateTime } from "@/lib/format"
import { Perm } from "@/lib/rbac"
import {
  EmptyState,
  ErrorState,
  PageHeader,
  RequirePermission,
  TableSkeleton,
} from "@/components/dashboard/shared"

export default function ApiLogsPage() {
  return (
    <RequirePermission permission={Perm.VIEW_API_LOGS}>
      <ApiLogsView />
    </RequirePermission>
  )
}

function ApiLogsView() {
  const [rows, setRows] = useState<ApiLogEntry[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const load = useCallback(async (startingAfter?: string) => {
    setLoading(true)
    try {
      const result = await api.apiLogs({ starting_after: startingAfter })
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
        title="API logs"
        description="Every request from the last 30 days. Quote a request ID when contacting support."
      />

      <Card>
        <CardContent className="pt-6">
          {loading && rows.length === 0 ? (
            <TableSkeleton />
          ) : rows.length === 0 ? (
            <EmptyState
              title="No API requests yet"
              description="Requests appear here as soon as you start using your API keys."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Request</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Latency</TableHead>
                    <TableHead>Request ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-muted-foreground whitespace-nowrap text-xs">
                        {formatDateTime(log.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        <span className="text-muted-foreground">{log.method}</span>{" "}
                        {log.path}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            log.status_code < 300
                              ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                              : log.status_code < 500
                                ? "border-amber-500/30 text-amber-700 dark:text-amber-400"
                                : "border-red-500/30 text-red-700 dark:text-red-400"
                          }
                        >
                          {log.status_code}
                        </Badge>
                        {log.error_code ? (
                          <span className="text-muted-foreground ml-2 text-xs">
                            {log.error_code}
                          </span>
                        ) : null}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-right text-xs tabular-nums">
                        {log.latency_ms}ms
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {log.request_id}
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
