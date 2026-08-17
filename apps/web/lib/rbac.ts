/**
 * Role-based access control — mirror of `backend/apps/common/rbac.py`.
 *
 * These two files MUST stay in step. If you add a permission on the backend,
 * add it here; if you add a nav item here, make sure a backend endpoint
 * actually enforces the permission it claims to need.
 *
 * This map exists so the UI can hide what a user cannot do. It is NOT a
 * security boundary — every endpoint re-checks server side. Hiding a button
 * is a courtesy, not a control.
 *
 * The matrix from §13.1 of the architecture document:
 *
 *   Role       View  Create charge  Approve payout  Manage keys  Settings
 *   owner       Y         Y               Y              Y          Y
 *   admin       Y         Y               Y              Y          Y
 *   finance     Y         Y               Y              N          N
 *   developer   Y         Y               N              Y          N
 *   support     Y         N               N              N          N
 *   viewer      Y         N               N              N          N
 */

export const ROLES = [
  "owner",
  "admin",
  "finance",
  "developer",
  "support",
  "viewer",
] as const

export type Role = (typeof ROLES)[number]

export const ROLE_LABELS: Record<Role, string> = {
  owner: "Owner",
  admin: "Admin",
  finance: "Finance",
  developer: "Developer",
  support: "Support",
  viewer: "Viewer",
}

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  owner: "Full access, including billing and account closure.",
  admin: "Full access to operations and settings.",
  finance: "Moves money and reconciles. No access to API keys or settings.",
  developer: "Owns the integration. Cannot approve payouts.",
  support: "Read-only, plus the logs needed to answer customer questions.",
  viewer: "Read-only.",
}

export const Perm = {
  // Read
  VIEW_DASHBOARD: "view:dashboard",
  VIEW_TRANSACTIONS: "view:transactions",
  VIEW_BALANCE: "view:balance",
  VIEW_LEDGER: "view:ledger",
  VIEW_PAYOUTS: "view:payouts",
  VIEW_SETTLEMENTS: "view:settlements",
  VIEW_CUSTOMERS: "view:customers",
  VIEW_API_KEYS: "view:api_keys",
  VIEW_WEBHOOKS: "view:webhooks",
  VIEW_API_LOGS: "view:api_logs",
  VIEW_TEAM: "view:team",
  VIEW_AUDIT: "view:audit",
  VIEW_SETTINGS: "view:settings",

  // Money movement
  CREATE_CHARGE: "create:charge",
  CREATE_REFUND: "create:refund",
  CREATE_PAYOUT: "create:payout",
  APPROVE_PAYOUT: "approve:payout",
  REQUEST_SETTLEMENT: "request:settlement",

  // Configuration
  MANAGE_API_KEYS: "manage:api_keys",
  MANAGE_WEBHOOKS: "manage:webhooks",
  MANAGE_PAYMENT_LINKS: "manage:payment_links",
  MANAGE_TEAM: "manage:team",
  MANAGE_SETTINGS: "manage:settings",
  MANAGE_ROUTING: "manage:routing",
  SUBMIT_KYC: "submit:kyc",

  // XerinPay staff only
  ADMIN_REVIEW_KYC: "admin:review_kyc",
  ADMIN_VIEW_MERCHANTS: "admin:view_merchants",
  ADMIN_MANAGE_MERCHANTS: "admin:manage_merchants",
  ADMIN_VIEW_RECONCILIATION: "admin:view_reconciliation",
  ADMIN_MANAGE_FEE_PLANS: "admin:manage_fee_plans",
  ADMIN_VIEW_PROVIDERS: "admin:view_providers",
} as const

export type Permission = (typeof Perm)[keyof typeof Perm]

const VIEW_ALL: Permission[] = [
  Perm.VIEW_DASHBOARD,
  Perm.VIEW_TRANSACTIONS,
  Perm.VIEW_BALANCE,
  Perm.VIEW_PAYOUTS,
  Perm.VIEW_SETTLEMENTS,
  Perm.VIEW_CUSTOMERS,
]

const OWNER_ADMIN: Permission[] = [
  ...VIEW_ALL,
  Perm.VIEW_LEDGER,
  Perm.VIEW_API_KEYS,
  Perm.VIEW_WEBHOOKS,
  Perm.VIEW_API_LOGS,
  Perm.VIEW_TEAM,
  Perm.VIEW_AUDIT,
  Perm.VIEW_SETTINGS,
  Perm.CREATE_CHARGE,
  Perm.CREATE_REFUND,
  Perm.CREATE_PAYOUT,
  Perm.APPROVE_PAYOUT,
  Perm.REQUEST_SETTLEMENT,
  Perm.MANAGE_API_KEYS,
  Perm.MANAGE_WEBHOOKS,
  Perm.MANAGE_PAYMENT_LINKS,
  Perm.MANAGE_TEAM,
  Perm.MANAGE_SETTINGS,
  Perm.MANAGE_ROUTING,
  Perm.SUBMIT_KYC,
]

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: OWNER_ADMIN,
  admin: OWNER_ADMIN,

  finance: [
    ...VIEW_ALL,
    Perm.VIEW_LEDGER,
    Perm.VIEW_AUDIT,
    Perm.CREATE_CHARGE,
    Perm.CREATE_REFUND,
    Perm.CREATE_PAYOUT,
    Perm.APPROVE_PAYOUT,
    Perm.REQUEST_SETTLEMENT,
    Perm.MANAGE_PAYMENT_LINKS,
  ],

  // Developer owns the integration but must never approve a payout —
  // that separation is the entire point of the approval workflow.
  developer: [
    ...VIEW_ALL,
    Perm.VIEW_API_KEYS,
    Perm.VIEW_WEBHOOKS,
    Perm.VIEW_API_LOGS,
    Perm.CREATE_CHARGE,
    Perm.MANAGE_API_KEYS,
    Perm.MANAGE_WEBHOOKS,
    Perm.MANAGE_PAYMENT_LINKS,
  ],

  support: [...VIEW_ALL, Perm.VIEW_API_LOGS, Perm.VIEW_WEBHOOKS],

  viewer: VIEW_ALL,
}

/** Roles for which 2FA is mandatory (§13.1). */
export const TOTP_REQUIRED_ROLES: Role[] = ["owner", "admin", "finance"]

/**
 * Check a permission against the user's granted set.
 *
 * Prefer the `permissions` array returned by `/api/dashboard/me` over
 * deriving from the role locally — the server is authoritative, and a stale
 * local map would show a user controls that then fail on click.
 */
export function hasPermission(
  granted: string[] | undefined,
  permission: Permission,
): boolean {
  if (!granted) return false
  return granted.includes(permission)
}

export function hasAny(
  granted: string[] | undefined,
  permissions: Permission[],
): boolean {
  if (!granted) return false
  return permissions.some((p) => granted.includes(p))
}

export function permissionsForRole(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

export function requiresTotp(role: Role): boolean {
  return TOTP_REQUIRED_ROLES.includes(role)
}
