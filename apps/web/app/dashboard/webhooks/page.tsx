"use client"

import { useCallback, useEffect, useState } from "react"

import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs"

import {
  api,
  type WebhookDeliveryRecord,
  type WebhookEndpointRecord,
} from "@/lib/api"
import { formatDateTime, formatRelative } from "@/lib/format"
import { Perm } from "@/lib/rbac"
import {
  EmptyState,
  ErrorState,
  PageHeader,
  RequirePermission,
  TableSkeleton,
} from "@/components/dashboard/shared"

export default function WebhooksPage() {
  return (
    <RequirePermission permission={Perm.VIEW_WEBHOOKS}>
      <WebhooksView />
    </RequirePermission>
  )
}

function WebhooksView() {
  const [endpoints, setEndpoints] = useState<WebhookEndpointRecord[]>([])
  const [deliveries, setDeliveries] = useState<WebhookDeliveryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [endpointResult, deliveryResult] = await Promise.all([
        api.webhookEndpoints(),
        api.webhookDeliveries(),
      ])
      setEndpoints(endpointResult.data)
      setDeliveries(deliveryResult.data)
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

  const disabled = endpoints.filter((e) => !e.active)

  return (
    <>
      <PageHeader
        title="Webhooks"
        description="Events we send to your server, and every delivery attempt."
      />

      {disabled.length > 0 ? (
        <Card className="border-orange-500/40 bg-orange-500/5">
          <CardContent className="py-4">
            <p className="font-medium">
              {disabled.length} endpoint{disabled.length === 1 ? "" : "s"} disabled
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              We stop after 7 failed attempts. Fix the endpoint, then re-enable
              it — you can resend any missed events from the delivery log.
            </p>
          </CardContent>
        </Card>
      ) : null}

      <Tabs defaultValue="deliveries">
        <TabsList>
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="endpoints">
            Endpoints ({endpoints.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="deliveries" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <TableSkeleton />
              ) : deliveries.length === 0 ? (
                <EmptyState
                  title="No deliveries yet"
                  description="Once you add an endpoint, every event we send appears here."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Attempt</TableHead>
                      <TableHead>Response</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>When</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-mono text-xs">
                          {delivery.event_type}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          #{delivery.attempt}
                        </TableCell>
                        <TableCell className="text-xs tabular-nums">
                          {delivery.http_status ?? "—"}
                        </TableCell>
                        <TableCell>
                          {delivery.delivered ? (
                            <Badge
                              variant="outline"
                              className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                            >
                              Delivered
                            </Badge>
                          ) : delivery.next_retry_at ? (
                            <Badge
                              variant="outline"
                              className="border-amber-500/30 text-amber-700 dark:text-amber-400"
                            >
                              Retrying {formatRelative(delivery.next_retry_at)}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="border-red-500/30 text-red-700 dark:text-red-400"
                            >
                              Failed
                            </Badge>
                          )}
                          {delivery.error ? (
                            <p className="text-muted-foreground mt-1 max-w-xs truncate text-xs">
                              {delivery.error}
                            </p>
                          ) : null}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {formatDateTime(delivery.created_at)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="endpoints" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <TableSkeleton rows={3} />
              ) : endpoints.length === 0 ? (
                <EmptyState
                  title="No endpoints configured"
                  description="Add an HTTPS endpoint to receive charge and payout events."
                />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead>Events</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Failures</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {endpoints.map((endpoint) => (
                      <TableRow key={endpoint.id}>
                        <TableCell className="max-w-xs truncate font-mono text-xs">
                          {endpoint.url}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs">
                          {endpoint.events.length === 0
                            ? "All events"
                            : endpoint.events.join(", ")}
                        </TableCell>
                        <TableCell>
                          <Badge variant={endpoint.active ? "outline" : "secondary"}>
                            {endpoint.active ? "Active" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs tabular-nums">
                          {endpoint.failure_count}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Verifying our signature</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <p>
            Every request carries{" "}
            <code className="font-mono text-xs">X-Xerin-Signature</code> in the
            form <code className="font-mono text-xs">t=…,v1=…</code>, where v1
            is <code className="font-mono text-xs">HMAC_SHA256(secret,
            &quot;{"{timestamp}"}.{"{raw_body}"}&quot;)</code>.
          </p>
          <ol className="list-decimal space-y-1 pl-5">
            <li>Read the raw body <em>before</em> parsing JSON — parsing changes whitespace and breaks the signature</li>
            <li>Compare using a constant-time function, not <code className="font-mono text-xs">==</code></li>
            <li>Reject anything with a timestamp older than 5 minutes</li>
            <li>Return 200 quickly, then do the heavy work</li>
            <li>Use <code className="font-mono text-xs">X-Xerin-Event-Id</code> as your idempotency key — events can repeat</li>
          </ol>
        </CardContent>
      </Card>
    </>
  )
}
