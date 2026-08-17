"use client"

import { useState, useEffect, useCallback } from "react"
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
import { ApiError, api } from "@/lib/api"
import Image from "next/image"
import Link from "next/link"
import {
  IconAlertCircle,
  IconEye,
  IconEyeOff,
  IconMail,
  IconLock,
} from "@tabler/icons-react"

export function AuthForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [needsTotp, setNeedsTotp] = useState(false)
  const [totpCode, setTotpCode] = useState("")
  const [recoveryAvailable, setRecoveryAvailable] = useState(false)

  const slideshowImages = [
    "/assets/44405.jpg",
    "/assets/34979 (2).jpg",
    "/assets/ss.png",
  ]
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slideshowImages.length)
  }, [slideshowImages.length])

  useEffect(() => {
    const timer = setInterval(nextSlide, 4000)
    return () => clearInterval(timer)
  }, [nextSlide])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await api.login(email, password, totpCode || undefined)

      if (result.totpRequired) {
        // Password was correct; we're now asking for the second factor.
        setNeedsTotp(true)
        setRecoveryAvailable(result.recoveryAvailable)
        setLoading(false)
        return
      }

      // Full navigation rather than router.push: it guarantees the session
      // provider mounts fresh and reads the token we just stored.
      window.location.href = "/dashboard"
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Could not sign in. Please check your connection and try again.",
      )
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
                    src="/assets/XERIN PAY LOGO-12-12.svg"
                    alt="XerinPay Logo"
                    width={0}
                    height={0}
                    sizes="64px"
                    className="object-contain"
                    style={{ width: "auto", height: "96px" }}
                    priority
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-bold tracking-tight">
                    Welcome back
                  </h1>
                  <p className="text-balance text-sm text-muted-foreground">
                    Sign in to access your payment dashboard
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

              {/* Email */}
              <Field>
                <FieldLabel htmlFor="email" className="text-sm font-medium">Email</FieldLabel>
                <div className="relative">
                  <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                    className="h-11 pl-10 text-sm"
                  />
                </div>
              </Field>

              {/* Password */}
              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password" className="text-sm font-medium">Password</FieldLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="text-xs text-muted-foreground underline-offset-2 hover:underline hover:text-primary transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                    className="h-11 pl-10 pr-10 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <IconEyeOff className="size-4" />
                    ) : (
                      <IconEye className="size-4" />
                    )}
                  </button>
                </div>
              </Field>

              {/* Second factor. Only appears after the password is accepted. */}
              {needsTotp && (
                <Field>
                  <FieldLabel htmlFor="totp" className="text-sm font-medium">
                    Authentication code
                  </FieldLabel>
                  <Input
                    id="totp"
                    inputMode="numeric"
                    autoFocus
                    required
                    value={totpCode}
                    onChange={(e) =>
                      setTotpCode(
                        e.target.value.replace(/[^0-9A-Za-z-]/g, "").toUpperCase(),
                      )
                    }
                    placeholder="000000"
                    disabled={loading}
                    autoComplete="one-time-code"
                    className="h-11 text-sm font-mono tracking-widest"
                  />
                  <FieldDescription>
                    {recoveryAvailable
                      ? "Enter the 6-digit code from your app, or one of your recovery codes."
                      : "Enter the 6-digit code from your authenticator app."}
                  </FieldDescription>
                </Field>
              )}

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
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Field>

              {/* Register link */}
              <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link
                  href="/auth/register"
                  className="font-semibold text-primary underline-offset-2 hover:underline transition-colors"
                >
                  Create account
                </Link>
              </div>
            </FieldGroup>
          </form>

          {/* Image Slideshow Side */}
          <div className="relative hidden bg-muted md:block">
            {slideshowImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="XerinPay"
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                  idx === currentSlide ? "opacity-100" : "opacity-0"
                } dark:brightness-[0.4] dark:grayscale`}
              />
            ))}
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
            {/* Slide indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {slideshowImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlide(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentSlide
                      ? "w-6 bg-white"
                      : "w-1.5 bg-white/50 hover:bg-white/70"
                  }`}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-xs text-muted-foreground">
        By signing in, you agree to the{" "}
        <LegalDrawers />
        .
      </FieldDescription>
    </div>
  )
}
