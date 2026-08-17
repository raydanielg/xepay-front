"use client"

import { useCallback, useEffect, useState } from "react"
import { IconAlertTriangle, IconCopy, IconShieldCheck } from "@tabler/icons-react"

import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Separator } from "@workspace/ui/components/separator"
import { toast } from "@workspace/ui/components/sonner"

import { ApiError, api } from "@/lib/api"
import { ROLE_DESCRIPTIONS, ROLE_LABELS, type Role } from "@/lib/rbac"
import { useSession } from "@/lib/session"
import { ErrorState, PageHeader } from "@/components/dashboard/shared"

export default function SettingsPage() {
  const { session, refresh } = useSession()

  return (
    <>
      <PageHeader
        title="Settings"
        description="Your account and security."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Your account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <Row label="Name" value={session?.user.full_name ?? "—"} />
          <Row label="Email" value={session?.user.email ?? "—"} />
          <Row
            label="Role"
            value={
              session
                ? ROLE_LABELS[session.user.role as Role] ?? session.user.role
                : "—"
            }
          />
          {session ? (
            <p className="text-muted-foreground pt-1 text-xs">
              {ROLE_DESCRIPTIONS[session.user.role as Role]}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <TwoFactorCard onChanged={refresh} />
    </>
  )
}

function TwoFactorCard({ onChanged }: { onChanged: () => Promise<void> }) {
  const [status, setStatus] = useState<{
    enabled: boolean
    required: boolean
    must_enrol: boolean
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<unknown>(null)

  const [setup, setSetup] = useState<{
    secret: string
    otpauth_uri: string
  } | null>(null)
  const [code, setCode] = useState("")
  const [busy, setBusy] = useState(false)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)

  const load = useCallback(async () => {
    try {
      setStatus(await api.totpStatus())
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

  async function begin() {
    setBusy(true)
    try {
      setSetup(await api.totpSetup())
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "Could not start setup.",
      )
    } finally {
      setBusy(false)
    }
  }

  async function confirm() {
    setBusy(true)
    try {
      const result = await api.totpConfirm(code)
      setRecoveryCodes(result.recovery_codes)
      setSetup(null)
      setCode("")
      await load()
      await onChanged()
      toast.success("Two-factor authentication is on.")
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : "That code didn't work.",
      )
    } finally {
      setBusy(false)
    }
  }

  if (error) return <ErrorState error={error} />

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-base">Two-factor authentication</CardTitle>
          {status?.enabled ? (
            <Badge
              variant="outline"
              className="border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
            >
              On
            </Badge>
          ) : status?.required ? (
            <Badge
              variant="outline"
              className="border-red-500/30 text-red-700 dark:text-red-400"
            >
              Required
            </Badge>
          ) : (
            <Badge variant="secondary">Off</Badge>
          )}
        </div>
        <CardDescription>
          A second code from your phone, on top of your password.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {loading ? null : status?.must_enrol ? (
          <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
            <IconAlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600" />
            <p className="text-sm">
              Your role can move money, so two-factor authentication is
              required. Set it up now — some screens stay locked until you do.
            </p>
          </div>
        ) : null}

        {/* Recovery codes: shown once, immediately after enrolment. */}
        {recoveryCodes ? (
          <div className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center gap-2">
              <IconShieldCheck className="size-4 text-emerald-600" />
              <p className="text-sm font-medium">Save your recovery codes</p>
            </div>
            <p className="text-muted-foreground text-sm">
              These are the only way back in if you lose your phone. They are
              shown once.
            </p>
            <div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-3">
              {recoveryCodes.map((recovery) => (
                <code key={recovery} className="font-mono text-xs">
                  {recovery}
                </code>
              ))}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  void navigator.clipboard.writeText(recoveryCodes.join("\n"))
                  toast.success("Recovery codes copied")
                }}
              >
                <IconCopy className="size-4" />
                Copy all
              </Button>
              <Button size="sm" onClick={() => setRecoveryCodes(null)}>
                I&apos;ve saved them
              </Button>
            </div>
          </div>
        ) : null}

        {setup ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">
                1. Add this to your authenticator app
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Google Authenticator, Authy, 1Password — any of them work.
                Enter this key manually:
              </p>
              <div className="mt-2 flex items-center gap-2 rounded-md border p-2">
                <code className="flex-1 break-all font-mono text-xs">
                  {setup.secret}
                </code>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    void navigator.clipboard.writeText(setup.secret)
                    toast.success("Key copied")
                  }}
                >
                  <IconCopy className="size-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <Label htmlFor="totp-code" className="text-sm font-medium">
                2. Enter the 6-digit code it shows
              </Label>
              <p className="text-muted-foreground mt-1 text-sm">
                This proves the key was entered correctly, so you don&apos;t
                get locked out.
              </p>
              <div className="mt-2 flex gap-2">
                <Input
                  id="totp-code"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  className="max-w-32 font-mono tracking-widest"
                />
                <Button
                  disabled={code.length !== 6 || busy}
                  onClick={() => void confirm()}
                >
                  Turn on
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSetup(null)
                    setCode("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ) : status?.enabled ? (
          <p className="text-muted-foreground text-sm">
            Two-factor authentication is protecting this account.
            {status.required
              ? " It cannot be turned off for your role."
              : ""}
          </p>
        ) : (
          <Button disabled={busy} onClick={() => void begin()}>
            Set up two-factor authentication
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}
