"use client"

import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@workspace/ui/components/sheet"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import {
  IconFileText,
  IconShieldCheck,
  IconScale,
  IconUser,
  IconBan,
  IconAlertTriangle,
  IconCheck,
  IconLock,
  IconEye,
  IconShare,
} from "@tabler/icons-react"

type LegalType = "terms" | "privacy" | null

export function LegalDrawers() {
  const [open, setOpen] = useState<LegalType>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open) {
      Promise.resolve().then(() => setLoading(true))
      const timer = setTimeout(() => setLoading(false), 800)
      return () => clearTimeout(timer)
    }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen("terms")}
        className="underline hover:text-foreground transition-colors"
      >
        Terms of Service
      </button>
      {" and "}
      <button
        onClick={() => setOpen("privacy")}
        className="underline hover:text-foreground transition-colors"
      >
        Privacy Policy
      </button>

      {/* Terms of Service */}
      <Sheet open={open === "terms"} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-lg font-bold">
              <IconScale className="size-5 text-primary" />
              Terms of Service
            </SheetTitle>
            <SheetDescription>
              Last updated: August 2026 · XerinPay
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 px-4 pb-4">
            {loading ? (
              <TermsSkeleton />
            ) : (
              <div className="space-y-6 text-sm leading-relaxed">
                <Section icon={<IconFileText className="size-4 text-primary" />} title="1. Acceptance of Terms">
                  By accessing and using XerinPay, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use this platform.
                </Section>
                <Section icon={<IconUser className="size-4 text-primary" />} title="2. User Accounts">
                  <ul className="space-y-2">
                    <ListItem>Users must provide accurate and complete information when registering.</ListItem>
                    <ListItem>Each user is responsible for maintaining the confidentiality of their account credentials.</ListItem>
                    <ListItem>Accounts are assigned based on your role and permissions.</ListItem>
                    <ListItem>Sharing account credentials with others is strictly prohibited.</ListItem>
                  </ul>
                </Section>
                <Section icon={<IconCheck className="size-4 text-primary" />} title="3. Acceptable Use">
                  <ul className="space-y-2">
                    <ListItem>Use the platform solely for legitimate payment and financial transactions.</ListItem>
                    <ListItem>Respect the security and integrity of the platform at all times.</ListItem>
                    <ListItem>Do not attempt to process fraudulent or unauthorized transactions.</ListItem>
                    <ListItem>Do not attempt to disrupt or compromise the security of the platform.</ListItem>
                  </ul>
                </Section>
                <Section icon={<IconBan className="size-4 text-destructive" />} title="4. Prohibited Conduct">
                  <ul className="space-y-2">
                    <ListItem>Using the platform for money laundering or illegal activities.</ListItem>
                    <ListItem>Attempting to access other users&apos; accounts or data.</ListItem>
                    <ListItem>Using automated tools to scrape or manipulate the platform.</ListItem>
                    <ListItem>Any form of fraud or misrepresentation.</ListItem>
                  </ul>
                </Section>
                <Section icon={<IconAlertTriangle className="size-4 text-orange-500" />} title="5. Transaction Responsibility">
                  Users are responsible for verifying all transaction details before confirmation. XerinPay is not liable for transactions made in error. All transactions are logged and auditable.
                </Section>
                <Section icon={<IconScale className="size-4 text-primary" />} title="6. Modifications">
                  XerinPay reserves the right to modify these Terms at any time. Users will be notified of significant changes. Continued use of the platform constitutes acceptance of the updated Terms.
                </Section>
                <div className="rounded-lg bg-muted p-4 text-xs text-muted-foreground">
                  For questions about these Terms, contact support at{" "}
                  <span className="font-medium text-foreground">support@xerinpay.com</span>
                </div>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>

      {/* Privacy Policy */}
      <Sheet open={open === "privacy"} onOpenChange={(v) => !v && setOpen(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-lg font-bold">
              <IconShieldCheck className="size-5 text-primary" />
              Privacy Policy
            </SheetTitle>
            <SheetDescription>
              Last updated: August 2026 · XerinPay
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="flex-1 px-4 pb-4">
            {loading ? (
              <PrivacySkeleton />
            ) : (
              <div className="space-y-6 text-sm leading-relaxed">
                <Section icon={<IconShieldCheck className="size-4 text-primary" />} title="1. Information We Collect">
                  <ul className="space-y-2">
                    <ListItem><strong>Account data:</strong> Name, email, phone number, and role.</ListItem>
                    <ListItem><strong>Transaction data:</strong> Payment history, balances, and transfer records.</ListItem>
                    <ListItem><strong>Usage data:</strong> Login times, pages visited, and interaction logs.</ListItem>
                  </ul>
                </Section>
                <Section icon={<IconEye className="size-4 text-primary" />} title="2. How We Use Your Information">
                  <ul className="space-y-2">
                    <ListItem>To provide and manage your payment experience.</ListItem>
                    <ListItem>To track transactions and generate reports.</ListItem>
                    <ListItem>To communicate important account updates and notifications.</ListItem>
                    <ListItem>To maintain platform security and prevent fraud.</ListItem>
                  </ul>
                </Section>
                <Section icon={<IconLock className="size-4 text-primary" />} title="3. Data Security">
                  Your data is stored securely using industry-standard encryption. Access is restricted to authorized personnel only. Authentication tokens are used to protect your session.
                </Section>
                <Section icon={<IconShare className="size-4 text-primary" />} title="4. Information Sharing">
                  We do not sell, rent, or share your personal information with third parties. Data is shared internally only with authorized personnel for operational and security purposes.
                </Section>
                <Section icon={<IconUser className="size-4 text-primary" />} title="5. Your Rights">
                  <ul className="space-y-2">
                    <ListItem>Access your personal data and transaction records.</ListItem>
                    <ListItem>Request correction of inaccurate information.</ListItem>
                    <ListItem>Request deletion of your account (subject to transaction record retention policies).</ListItem>
                  </ul>
                </Section>
                <Section icon={<IconShieldCheck className="size-4 text-primary" />} title="6. Data Retention">
                  Transaction records are retained in accordance with applicable financial regulations. Account data is retained while you are an active user.
                </Section>
                <Section icon={<IconAlertTriangle className="size-4 text-orange-500" />} title="7. Updates to This Policy">
                  We may update this Privacy Policy from time to time. Users will be notified of significant changes. Continued use of the platform constitutes acceptance of the updated policy.
                </Section>
                <div className="rounded-lg bg-muted p-4 text-xs text-muted-foreground">
                  For privacy concerns, contact support at{" "}
                  <span className="font-medium text-foreground">support@xerinpay.com</span>
                </div>
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="flex items-center gap-2 text-base font-semibold">
        {icon}
        {title}
      </h3>
      <div className="text-muted-foreground pl-6">{children}</div>
    </div>
  )
}

function ListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary" />
      <span>{children}</span>
    </li>
  )
}

function TermsSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-5 w-48" />
          </div>
          <div className="pl-7 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      ))}
    </div>
  )
}

function PrivacySkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="size-5 rounded" />
            <Skeleton className="h-5 w-52" />
          </div>
          <div className="pl-7 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
