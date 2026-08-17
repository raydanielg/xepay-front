"use client"

import { useState } from "react"
import { cn } from "@workspace/ui/lib/utils"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { Spinner } from "@workspace/ui/components/spinner"
import { LegalDrawers } from "@/components/legal-drawers"
import Image from "next/image"
import Link from "next/link"
import {
  IconAlertCircle,
  IconEye,
  IconEyeOff,
  IconMail,
  IconLock,
  IconUser,
  IconPhone,
} from "@tabler/icons-react"

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirmation, setPasswordConfirmation] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    let raw = e.target.value.replace(/\D/g, "")
    if (raw.length > 0 && !/^[67]/.test(raw)) {
      raw = raw.substring(1)
    }
    if (raw.length > 9) raw = raw.substring(0, 9)
    setPhone(raw)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== passwordConfirmation) {
      setError("Passwords do not match.")
      return
    }

    if (phone && !/^[67]\d{8}$/.test(phone)) {
      setError("Phone number must be 9 digits starting with 7 or 6.")
      return
    }

    setLoading(true)

    try {
      // TODO: Replace with actual XerinPay auth service
      console.log("Register:", {
        full_name: fullName,
        email,
        password,
        phone: phone ? `255${phone}` : undefined,
      })
      window.location.href = "/dashboard"
    } catch {
      setError("Registration failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Form Side */}
          <form onSubmit={handleSubmit} className="p-6 md:p-8">
            <FieldGroup>
              {/* Logo & Title */}
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex items-center gap-3">
                  <Image
                    src="/assets/XERIN express-09 (1).png"
                    alt="XerinPay Logo"
                    width={0}
                    height={0}
                    sizes="64px"
                    className="object-contain"
                    style={{ width: "auto", height: "64px" }}
                    priority
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
                  <p className="text-balance text-sm text-muted-foreground">
                    Join XerinPay today
                  </p>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">
                  <IconAlertCircle className="size-4 shrink-0 translate-y-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Full Name */}
              <Field>
                <FieldLabel htmlFor="full_name" className="text-sm font-medium">Full Name</FieldLabel>
                <div className="relative">
                  <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                    autoComplete="name"
                    className="h-11 pl-10 text-sm"
                  />
                </div>
              </Field>

              {/* Email */}
              <Field>
                <FieldLabel htmlFor="reg-email" className="text-sm font-medium">Email Address</FieldLabel>
                <div className="relative">
                  <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="reg-email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                    className="h-11 pl-10 text-sm"
                  />
                </div>
              </Field>

              {/* Phone */}
              <Field>
                <FieldLabel htmlFor="phone" className="text-sm font-medium">Phone Number</FieldLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-0">
                    <div className="flex items-center gap-1.5 bg-muted border-r border-input px-3 rounded-l-lg h-11">
                      <span className="text-xs font-bold text-muted-foreground select-none">+255</span>
                    </div>
                  </div>
                  <IconPhone className="absolute left-[88px] top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    placeholder="7XX XXX XXX"
                    value={phone}
                    onChange={handlePhoneChange}
                    disabled={loading}
                    autoComplete="tel"
                    maxLength={9}
                    className="h-11 pl-[112px] text-sm font-mono tracking-wide"
                  />
                </div>
                <FieldDescription className="text-[11px] text-muted-foreground">
                  Enter 9 digits starting with 7 or 6
                </FieldDescription>
              </Field>

              {/* Password */}
              <Field>
                <FieldLabel htmlFor="reg-password" className="text-sm font-medium">Password</FieldLabel>
                <div className="relative">
                  <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                    className="h-11 pl-10 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
                  </button>
                </div>
              </Field>

              {/* Confirm Password */}
              <Field>
                <FieldLabel htmlFor="password-confirm" className="text-sm font-medium">Confirm Password</FieldLabel>
                <div className="relative">
                  <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password-confirm"
                    type={showPassword ? "text" : "password"}
                    placeholder="Re-enter your password"
                    required
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    disabled={loading}
                    autoComplete="new-password"
                    className="h-11 pl-10 text-sm"
                  />
                </div>
              </Field>

              {/* Submit */}
              <Field>
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-11 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner className="size-4" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </Field>

              {/* Login link */}
              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  href="/auth"
                  className="font-semibold text-primary underline-offset-2 hover:underline transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </FieldGroup>
          </form>

          {/* Image Side */}
          <div className="relative hidden bg-muted md:block">
            <img
              src="/assets/44405.jpg"
              alt="XerinPay"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.4] dark:grayscale"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-3 p-8 pb-12 text-white">
              <div className="text-center">
                <h2 className="text-3xl font-bold leading-tight drop-shadow-lg">
                  XerinPay
                </h2>
                <p className="mt-3 text-sm text-white/80 max-w-xs drop-shadow">
                  Secure, fast, and reliable payments — manage your transactions, balances, and transfers all in one place.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        By creating an account, you agree to the{" "}
        <LegalDrawers />
        .
      </FieldDescription>
    </div>
  )
}
