"use client"

import { useEffect, useState } from "react"

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

import { api, type TeamMember } from "@/lib/api"
import { formatRelative } from "@/lib/format"
import { Perm, ROLE_DESCRIPTIONS, ROLE_LABELS, type Role } from "@/lib/rbac"
import {
  ErrorState,
  PageHeader,
  RequirePermission,
  TableSkeleton,
} from "@/components/dashboard/shared"

export default function TeamPage() {
  return (
    <RequirePermission permission={Perm.VIEW_TEAM}>
      <TeamView />
    </RequirePermission>
  )
}

function TeamView() {
  const [members, setMembers] = useState<TeamMember[]>([])
  const [roles, setRoles] = useState<
    { value: string; label: string; permissions: string[] }[]
  >([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    let cancelled = false
    api
      .team()
      .then((result) => {
        if (cancelled) return
        setMembers(result.data)
        setRoles(result.available_roles)
      })
      .catch((err) => !cancelled && setError(err))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [])

  if (error) return <ErrorState error={error} />

  return (
    <>
      <PageHeader
        title="Team"
        description="Who can access this account, and what each role can do."
      />

      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <TableSkeleton rows={4} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>2FA</TableHead>
                  <TableHead>Last seen</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="text-sm font-medium">{member.full_name}</div>
                      <div className="text-muted-foreground text-xs">
                        {member.email}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {ROLE_LABELS[member.role as Role] ?? member.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.totp_enabled ? (
                        <Badge
                          variant="outline"
                          className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                        >
                          Enabled
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="border-amber-500/30 text-amber-700 dark:text-amber-400"
                        >
                          Not set up
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {member.last_login_at
                        ? formatRelative(member.last_login_at)
                        : "Never"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">What each role can do</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {roles.map((role) => (
            <div key={role.value} className="border-b pb-3 last:border-0 last:pb-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {ROLE_LABELS[role.value as Role] ?? role.label}
                </span>
                <span className="text-muted-foreground text-xs">
                  {role.permissions.length} permissions
                </span>
              </div>
              <p className="text-muted-foreground mt-1 text-sm">
                {ROLE_DESCRIPTIONS[role.value as Role] ?? ""}
              </p>
            </div>
          ))}
          <p className="text-muted-foreground pt-2 text-xs">
            Developers deliberately cannot approve payouts, and support cannot
            move money at all. That separation is what makes the approval step
            meaningful.
          </p>
        </CardContent>
      </Card>
    </>
  )
}
