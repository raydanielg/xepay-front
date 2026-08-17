/**
 * Dashboard navigation, filtered by permission.
 *
 * One shell for every role (the alternative — a route per role — duplicates
 * pages and drifts). Each item declares the permission it needs; the sidebar
 * renders only what the signed-in user actually has.
 *
 * A nav item's `permission` must match the `required_permission` on the
 * backend view it links to. If they disagree, the user sees a link that
 * 403s, which is worse than not seeing it at all.
 */

import {
  IconActivity,
  IconAlertTriangle,
  IconBook,
  IconBook2,
  IconBuildingBank,
  IconCash,
  IconClipboardList,
  IconCreditCard,
  IconKey,
  IconLayoutDashboard,
  IconLink,
  IconReceipt,
  IconSettings,
  IconShieldLock,
  IconUsers,
  IconWebhook,
} from "@tabler/icons-react"

import { Perm, type Permission } from "@/lib/rbac"

export interface NavItem {
  title: string
  url: string
  icon: typeof IconLayoutDashboard
  permission: Permission
  /** Shown as a small hint in the sidebar for less obvious destinations. */
  description?: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: IconLayoutDashboard,
        permission: Perm.VIEW_DASHBOARD,
      },
      {
        title: "Transactions",
        url: "/dashboard/transactions",
        icon: IconCreditCard,
        permission: Perm.VIEW_TRANSACTIONS,
      },
    ],
  },
  {
    label: "Money",
    items: [
      {
        title: "Balance",
        url: "/dashboard/balance",
        icon: IconCash,
        permission: Perm.VIEW_BALANCE,
      },
      {
        title: "Ledger",
        url: "/dashboard/ledger",
        icon: IconBook,
        permission: Perm.VIEW_LEDGER,
        description: "Double-entry detail",
      },
      {
        title: "Payouts",
        url: "/dashboard/payouts",
        icon: IconBuildingBank,
        permission: Perm.VIEW_PAYOUTS,
      },
      {
        title: "Settlements",
        url: "/dashboard/settlements",
        icon: IconReceipt,
        permission: Perm.VIEW_SETTLEMENTS,
      },
    ],
  },
  {
    label: "Collect",
    items: [
      {
        title: "Payment links",
        url: "/dashboard/payment-links",
        icon: IconLink,
        permission: Perm.MANAGE_PAYMENT_LINKS,
        description: "Take payments without code",
      },
    ],
  },
  {
    label: "Developers",
    items: [
      {
        title: "API keys",
        url: "/dashboard/api-keys",
        icon: IconKey,
        permission: Perm.VIEW_API_KEYS,
      },
      {
        title: "Webhooks",
        url: "/dashboard/webhooks",
        icon: IconWebhook,
        permission: Perm.VIEW_WEBHOOKS,
      },
      {
        title: "API logs",
        url: "/dashboard/api-logs",
        icon: IconActivity,
        permission: Perm.VIEW_API_LOGS,
      },
      {
        title: "Documentation",
        url: "/docs",
        icon: IconBook2,
        // Everyone can read the docs. Gating them would be odd — they
        // contain nothing merchant-specific beyond the reader's own base
        // URL, and a support agent answering an integration question needs
        // them as much as a developer does.
        permission: Perm.VIEW_DASHBOARD,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        title: "Team",
        url: "/dashboard/team",
        icon: IconUsers,
        permission: Perm.VIEW_TEAM,
      },
      {
        title: "Verification",
        url: "/dashboard/kyc",
        icon: IconShieldLock,
        permission: Perm.SUBMIT_KYC,
        description: "KYC documents",
      },
      {
        title: "Audit log",
        url: "/dashboard/audit",
        icon: IconClipboardList,
        permission: Perm.VIEW_AUDIT,
      },
      {
        title: "Settings",
        url: "/dashboard/settings",
        icon: IconSettings,
        permission: Perm.VIEW_DASHBOARD,
        description: "Account and two-factor authentication",
      },
    ],
  },
]

/**
 * XerinPay internal staff. Never shown to a merchant user.
 *
 * Reconciliation and provider health exist on the backend but have no UI
 * yet, so they are not listed — a link that 404s is worse than an absent one.
 */
export const STAFF_NAV: NavGroup[] = [
  {
    label: "XerinPay admin",
    items: [
      {
        title: "KYC review",
        url: "/dashboard/admin/kyc",
        icon: IconShieldLock,
        permission: Perm.ADMIN_REVIEW_KYC,
      },
      {
        title: "Investigations",
        url: "/dashboard/admin/investigations",
        icon: IconAlertTriangle,
        permission: Perm.ADMIN_VIEW_MERCHANTS,
        description: "Payouts in an unknown state",
      },
    ],
  },
]

/** Drop items the user cannot access, then drop any group left empty. */
export function visibleNav(
  permissions: string[] | undefined,
  isStaff: boolean,
): NavGroup[] {
  const groups = isStaff ? [...NAV_GROUPS, ...STAFF_NAV] : NAV_GROUPS

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) =>
        permissions?.includes(item.permission),
      ),
    }))
    .filter((group) => group.items.length > 0)
}
