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
import Image from "next/image"
import Link from "next/link"
import {
  IconMail,
  IconCircleCheck,
  IconArrowLeft,
} from "@tabler/icons-react"

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // TODO: Replace with actual XerinPay auth service
      console.log("Forgot password:", email)
      setSent(true)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Form Side */}
          <div className="p-6 md:p-8">
            {!sent ? (
              <form onSubmit={handleSubmit}>
                <FieldGroup>
                  {/* Logo & Back Link */}
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3">
                      <Image
                        src="/assets/XERIN PAY LOGO-12-12.svg"
                        alt="XerinPay Logo"
                        width={0}
                        height={0}
                        sizes="64px"
                        className="object-contain"
                        style={{ width: "auto", height: "512px" }}
                        priority
                      />
                    </div>
                    <Link
                      href="/auth"
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
                    >
                      <IconArrowLeft className="size-4" />
                      Back to login
                    </Link>
                  </div>

                  {/* Title */}
                  <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold tracking-tight">
                      Forgot password?
                    </h1>
                    <p className="text-balance text-sm text-muted-foreground">
                      No worries — enter your email and we&apos;ll send you reset instructions.
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive animate-fade-in">
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
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 py-12 text-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                  <IconCircleCheck className="size-8 text-primary" />
                </div>
                <div className="flex flex-col gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">Check your email</h1>
                  <p className="text-balance text-sm text-muted-foreground max-w-sm">
                    We&apos;ve sent a password reset link to{" "}
                    <span className="font-medium text-foreground">{email}</span>.
                    The link will expire in 60 minutes.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="mt-2"
                  onClick={() => {
                    setSent(false)
                    setEmail("")
                  }}
                >
                  Try a different email
                </Button>
                <Link
                  href="/auth"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors mt-2"
                >
                  Back to login
                </Link>
              </div>
            )}
          </div>

          {/* Image Side */}
          <div className="relative hidden bg-muted md:block">
            <img
              src="/assets/ss.png"
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
        Remember your password?{" "}
        <Link href="/auth" className="underline hover:text-foreground">
          Sign in
        </Link>
      </FieldDescription>
    </div>
  )
}
