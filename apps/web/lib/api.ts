/**
 * API client for the XerinPay dashboard.
 *
 * Talks to /api/dashboard/* with a JWT. Every error the backend returns
 * uses the §9.4 envelope, so errors are unwrapped into a single ApiError
 * type carrying the request_id — which is what support will ask for.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000"

const ACCESS_TOKEN_KEY = "xerinpay.access_token"
const REFRESH_TOKEN_KEY = "xerinpay.refresh_token"

export class ApiError extends Error {
  code: string
  type: string
  param?: string
  requestId?: string
  status: number

  constructor(
    message: string,
    opts: {
      code?: string
      type?: string
      param?: string
      requestId?: string
      status: number
    },
  ) {
    super(message)
    this.name = "ApiError"
    this.code = opts.code ?? "unknown_error"
    this.type = opts.type ?? "api_error"
    this.param = opts.param
    this.requestId = opts.requestId
    this.status = opts.status
  }

  /** Whether re-authenticating might fix this. */
  get isAuthError(): boolean {
    return this.status === 401
  }
}

// --------------------------------------------------------------------------
// Token storage
// --------------------------------------------------------------------------
// sessionStorage rather than localStorage: a dashboard token can approve
// payouts, so it should not survive the browser being closed. This is a
// deliberate trade of convenience for blast radius.

export const tokens = {
  get access(): string | null {
    if (typeof window === "undefined") return null
    return window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
  },
  get refresh(): string | null {
    if (typeof window === "undefined") return null
    return window.sessionStorage.getItem(REFRESH_TOKEN_KEY)
  },
  set(access: string, refresh?: string) {
    if (typeof window === "undefined") return
    window.sessionStorage.setItem(ACCESS_TOKEN_KEY, access)
    if (refresh) window.sessionStorage.setItem(REFRESH_TOKEN_KEY, refresh)
  },
  clear() {
    if (typeof window === "undefined") return
    window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
    window.sessionStorage.removeItem(REFRESH_TOKEN_KEY)
  },
}

// --------------------------------------------------------------------------
// Core request
// --------------------------------------------------------------------------

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown
  /** Set on money-moving POSTs. Required by the backend (§9.1). */
  idempotencyKey?: string
  /** Internal: prevents an infinite refresh loop. */
  _retried?: boolean
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, idempotencyKey, _retried, ...init } = options

  const headers = new Headers(init.headers)
  headers.set("Content-Type", "application/json")

  const access = tokens.access
  if (access) headers.set("Authorization", `Bearer ${access}`)
  if (idempotencyKey) headers.set("Idempotency-Key", idempotencyKey)

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  // Access token expired — refresh once, then retry the original request.
  if (response.status === 401 && !_retried && tokens.refresh) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return request<T>(path, { ...options, _retried: true })
    }
  }

  if (response.status === 204) return undefined as T

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const err = payload?.error ?? {}
    throw new ApiError(err.message ?? "Something went wrong.", {
      code: err.code,
      type: err.type,
      param: err.param,
      requestId: err.request_id ?? response.headers.get("X-Request-Id") ?? undefined,
      status: response.status,
    })
  }

  return payload as T
}

async function refreshAccessToken(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/api/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: tokens.refresh }),
    })
    if (!response.ok) {
      tokens.clear()
      return false
    }
    const data = await response.json()
    tokens.set(data.access, data.refresh)
    return true
  } catch {
    tokens.clear()
    return false
  }
}

/** Generate an Idempotency-Key. One per logical request, reused across retries. */
export function idempotencyKey(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface CursorList<T> {
  object: "list"
  data: T[]
  has_more: boolean
  next_cursor: string | null
}

export interface SessionUser {
  id: string
  email: string
  full_name: string
  role: string
  is_staff_member: boolean
  totp_enabled: boolean
  must_enrol_totp: boolean
  permissions: string[]
}

export interface SessionMerchant {
  id: string
  business_name: string
  display_name: string
  status: string
  kyc_status: string
  live_enabled: boolean
  settlement_schedule: string
}

export interface Session {
  user: SessionUser
  merchant: SessionMerchant | null
}

export interface Balance {
  available_minor: number
  pending_minor: number
  reserve_minor: number
  total_minor: number
  currency: string
}

export interface Overview {
  environment: string
  period_days: number
  volume_minor: number
  fees_minor: number
  net_minor: number
  transaction_count: number
  success_count: number
  success_rate: number | null
  balance?: Balance
}

export interface TimeseriesPoint {
  date: string
  volume_minor: number
  fees_minor: number
  attempts: number
  succeeded: number
  failed: number
  /** Null on a day with no attempts — not zero, which would read as total failure. */
  success_rate: number | null
}

export interface Timeseries {
  environment: string
  days: number
  start: string
  end: string
  series: TimeseriesPoint[]
}

export interface Breakdown {
  networks: { network: string; volume_minor: number; count: number }[]
  statuses: { status: string; count: number }[]
}

export interface Charge {
  object: "charge"
  id: string
  reference: string
  status: string
  amount: number
  fee: number
  net: number
  currency: string
  channel: string
  network: string | null
  payer: { phone: string | null; name: string | null }
  description: string | null
  metadata: Record<string, unknown>
  failure_code: string | null
  failure_message: string | null
  created_at: string
  completed_at: string | null
  expires_at?: string
  attempts?: ProviderAttempt[]
  refunds?: { id: string; amount: number; status: string; created_at: string }[]
}

export interface ProviderAttempt {
  provider: string
  attempt_number: number
  outcome: string
  http_status: number | null
  latency_ms: number | null
  failure_code: string | null
  created_at: string
}

export interface Payout {
  id: string
  reference: string
  status: string
  amount: number
  fee: number
  currency: string
  destination_type: string
  destination_no: string
  destination_name: string | null
  failure_code: string | null
  failure_message: string | null
  created_at: string
  completed_at: string | null
  merchant?: string
}

export interface Settlement {
  id: string
  period_start: string
  period_end: string
  gross: number
  fees: number
  refunds: number
  net: number
  currency: string
  status: string
  bank_ref: string | null
  transaction_count: number
  paid_at: string | null
}

export interface LedgerEntry {
  id: number
  entry_group: string
  account_type: string
  direction: "debit" | "credit"
  amount: number
  signed_amount: number
  currency: string
  narration: string
  transaction_id: string | null
  payout_id: string | null
  created_at: string
}

export interface ApiKeyRecord {
  object: "api_key"
  id: string
  environment: string
  label: string | null
  public_key: string
  secret_prefix: string
  last_used_at: string | null
  revoked_at: string | null
  active: boolean
  created_at: string
  /** Present ONLY in the create response. Never returned again. */
  secret_key?: string
}

export interface WebhookEndpointRecord {
  object: "webhook_endpoint"
  id: string
  url: string
  events: string[]
  active: boolean
  failure_count: number
  disabled_at: string | null
  created_at: string
  secret?: string
}

export interface WebhookDeliveryRecord {
  object: "webhook_delivery"
  id: number
  endpoint_id: string
  event_id: string
  event_type: string
  attempt: number
  http_status: number | null
  delivered: boolean
  error: string | null
  next_retry_at: string | null
  created_at: string
}

export interface TeamMember {
  id: string
  email: string
  full_name: string
  role: string
  totp_enabled: boolean
  last_login_at: string | null
}

export interface AuditEntry {
  id: number
  action: string
  resource: string
  resource_id: string | null
  actor: string | null
  actor_type: string
  reason: string | null
  ip_address: string | null
  created_at: string
}

export interface PaymentLinkRecord {
  object: "payment_link"
  id: string
  url: string
  slug: string
  title: string
  description: string | null
  amount: number | null
  currency: string
  is_reusable: boolean
  max_uses: number | null
  uses_count: number
  collect_fields: string[]
  active: boolean
  expires_at: string | null
  created_at: string
}

export interface KycDocument {
  id: string
  doc_type: string
  doc_type_label: string
  status: string
  original_filename: string | null
  size_bytes: number | null
  review_note: string | null
  reviewed_at: string | null
  created_at: string
  url?: string | null
}

export interface KycOverview {
  kyc_status: string
  live_enabled: boolean
  business_type: string
  required_documents: string[]
  missing_documents: string[]
  can_submit: boolean
  has_settlement_account: boolean
  documents: KycDocument[]
}

export interface KycQueueEntry {
  id: string
  business_name: string
  business_type: string
  email: string
  phone: string
  tin: string | null
  brela_number: string | null
  kyc_status: string
  missing_documents: string[]
  document_count: number
  created_at: string
}

export interface KycReviewDetail extends KycQueueEntry {
  trading_name: string | null
  address: string | null
  region: string | null
  vrn: string | null
  status: string
  live_enabled: boolean
  settlement_bank_name: string | null
  settlement_account_name: string | null
  settlement_account_no: string | null
  can_go_live: boolean
  cannot_go_live_reason: string | null
  documents: KycDocument[]
}

export interface ApiLogEntry {
  id: number
  request_id: string
  method: string
  path: string
  status_code: number
  latency_ms: number
  error_code: string | null
  environment: string
  created_at: string
}

// --------------------------------------------------------------------------
// Endpoints
// --------------------------------------------------------------------------

function query(params: Record<string, string | number | undefined>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value))
  }
  const qs = search.toString()
  return qs ? `?${qs}` : ""
}

export const api = {
  // Auth
  /**
   * Sign in. When the account has 2FA on, the first call comes back with
   * `totpRequired` instead of tokens — call again with the code.
   */
  async login(
    email: string,
    password: string,
    code?: string,
  ): Promise<
    | { totpRequired: true; recoveryAvailable: boolean }
    | { totpRequired: false; access_token: string; refresh_token: string }
  > {
    const response = await fetch(`${API_BASE}/api/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, code }),
    })
    const payload = await response.json().catch(() => null)

    // A 401 carrying `totp_required` is a challenge, not a rejection — the
    // password was right and we're asking for the second factor.
    if (response.status === 401 && payload?.data?.totp_required) {
      return {
        totpRequired: true,
        recoveryAvailable: Boolean(payload.data.recovery_available),
      }
    }

    if (!response.ok) {
      throw new ApiError(
        payload?.error?.message ?? "Invalid email or password.",
        { status: response.status, code: payload?.error?.code },
      )
    }

    tokens.set(payload.data.access_token, payload.data.refresh_token)
    return { totpRequired: false, ...payload.data }
  },

  regenerateRecoveryCodes: (password: string) =>
    request<{ recovery_codes: string[] }>("/api/auth/2fa/recovery-codes/", {
      method: "POST",
      body: { password },
    }),

  /**
   * Sign up. Creates the merchant account and its owner in one step, and
   * returns tokens so the user lands straight in the dashboard.
   */
  async register(payload: {
    full_name: string
    email: string
    password: string
    password_confirmation: string
    phone?: string
    business_name?: string
    business_type?: string
  }) {
    const response = await fetch(`${API_BASE}/api/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        username: payload.email,
      }),
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) {
      const err = body?.error ?? {}
      // Registration errors are usually field-level (email taken, weak
      // password). Surface the first specific message rather than a generic
      // "validation error", which tells the user nothing.
      const detail = err.details
        ? Object.values(err.details as Record<string, string[]>)[0]?.[0]
        : undefined
      throw new ApiError(detail ?? err.message ?? "Could not create your account.", {
        status: response.status,
        code: err.code,
      })
    }
    tokens.set(body.data.access_token, body.data.refresh_token)
    return body.data
  },

  async logout() {
    try {
      await request("/api/auth/logout/", {
        method: "POST",
        body: { refresh_token: tokens.refresh },
      })
    } finally {
      tokens.clear()
    }
  },

  // Session
  me: () => request<Session>("/api/dashboard/me"),

  // Overview
  overview: (environment = "live", days = 30) =>
    request<Overview>(`/api/dashboard/overview${query({ environment, days })}`),

  timeseries: (environment = "live", days = 30) =>
    request<Timeseries>(`/api/dashboard/timeseries${query({ environment, days })}`),

  breakdown: (environment = "live", days = 30) =>
    request<Breakdown>(`/api/dashboard/breakdown${query({ environment, days })}`),

  // Transactions
  transactions: (params: {
    environment?: string
    status?: string
    channel?: string
    search?: string
    starting_after?: string
    limit?: number
  } = {}) =>
    request<CursorList<Charge>>(`/api/dashboard/transactions${query(params)}`),

  transaction: (id: string) =>
    request<Charge>(`/api/dashboard/transactions/${id}`),

  // Money
  balance: () => request<Balance>("/api/dashboard/balance"),

  ledger: (params: { starting_after?: string; limit?: number } = {}) =>
    request<CursorList<LedgerEntry>>(`/api/dashboard/ledger${query(params)}`),

  payouts: (params: { status?: string; starting_after?: string } = {}) =>
    request<CursorList<Payout>>(`/api/dashboard/payouts${query(params)}`),

  approvePayout: (id: string) =>
    request<Payout>(`/api/dashboard/payouts/${id}/approve`, { method: "POST" }),

  rejectPayout: (id: string, reason: string) =>
    request<Payout>(`/api/dashboard/payouts/${id}/reject`, {
      method: "POST",
      body: { reason },
    }),

  settlements: (params: { starting_after?: string } = {}) =>
    request<CursorList<Settlement>>(`/api/dashboard/settlements${query(params)}`),

  // Developer
  apiKeys: () =>
    request<{ object: "list"; data: ApiKeyRecord[] }>("/api/dashboard/api-keys"),

  createApiKey: (environment: string, label?: string) =>
    request<ApiKeyRecord>("/api/dashboard/api-keys", {
      method: "POST",
      body: { environment, label },
    }),

  revokeApiKey: (id: string) =>
    request<ApiKeyRecord>(`/api/dashboard/api-keys/${id}/revoke`, {
      method: "POST",
    }),

  apiLogs: (params: { starting_after?: string } = {}) =>
    request<CursorList<ApiLogEntry>>(`/api/dashboard/api-logs${query(params)}`),

  webhookEndpoints: () =>
    request<{ object: "list"; data: WebhookEndpointRecord[] }>(
      "/api/dashboard/webhooks/endpoints",
    ),

  webhookDeliveries: (params: { starting_after?: string } = {}) =>
    request<CursorList<WebhookDeliveryRecord>>(
      `/api/dashboard/webhooks/deliveries${query(params)}`,
    ),

  // Team & audit
  team: () =>
    request<{
      object: "list"
      data: TeamMember[]
      available_roles: { value: string; label: string; permissions: string[] }[]
    }>("/api/dashboard/team"),

  audit: (params: { starting_after?: string } = {}) =>
    request<CursorList<AuditEntry>>(`/api/dashboard/audit${query(params)}`),

  // Two-factor
  totpStatus: () =>
    request<{
      enabled: boolean
      required: boolean
      must_enrol: boolean
      confirmed_at: string | null
    }>("/api/auth/2fa/status/"),

  totpSetup: () =>
    request<{
      secret: string
      otpauth_uri: string
      issuer: string
      account: string
    }>("/api/auth/2fa/setup/", { method: "POST" }),

  totpConfirm: (code: string) =>
    request<{ enabled: boolean; recovery_codes: string[] }>(
      "/api/auth/2fa/confirm/",
      { method: "POST", body: { code } },
    ),

  totpDisable: (password: string, code: string) =>
    request<{ enabled: boolean }>("/api/auth/2fa/disable/", {
      method: "POST",
      body: { password, code },
    }),

  // Payment links
  paymentLinks: (params: { starting_after?: string } = {}) =>
    request<CursorList<PaymentLinkRecord>>(
      `/api/dashboard/payment-links${query(params)}`,
    ),

  createPaymentLink: (payload: {
    title: string
    description?: string
    amount?: number | null
    slug?: string
    is_reusable?: boolean
    collect_fields?: string[]
    redirect_url?: string
  }) =>
    request<PaymentLinkRecord>("/api/dashboard/payment-links", {
      method: "POST",
      body: payload,
    }),

  updatePaymentLink: (id: string, payload: Record<string, unknown>) =>
    request<PaymentLinkRecord>(`/api/dashboard/payment-links/${id}`, {
      method: "PATCH",
      body: payload,
    }),

  // Refunds
  refund: (transactionId: string, amount: number | null, reason: string) =>
    request<{ id: string; amount: number; status: string }>(
      `/api/dashboard/transactions/${transactionId}/refund`,
      { method: "POST", body: { amount, reason } },
    ),

  // KYC — merchant side
  kycStatus: () => request<KycOverview>("/api/dashboard/kyc"),

  /**
   * Upload a document. Uses FormData, so it bypasses the JSON `request`
   * helper — setting Content-Type by hand would break the multipart
   * boundary the browser generates.
   */
  async kycUpload(docType: string, file: File): Promise<KycDocument> {
    const form = new FormData()
    form.append("doc_type", docType)
    form.append("file", file)

    const headers = new Headers()
    const access = tokens.access
    if (access) headers.set("Authorization", `Bearer ${access}`)

    const response = await fetch(`${API_BASE}/api/dashboard/kyc/documents`, {
      method: "POST",
      headers,
      body: form,
    })
    const body = await response.json().catch(() => null)
    if (!response.ok) {
      const err = body?.error ?? {}
      throw new ApiError(err.message ?? "Upload failed.", {
        status: response.status,
        code: err.code,
        param: err.param,
        requestId: err.request_id,
      })
    }
    return body
  },

  kycSubmit: () =>
    request<{ kyc_status: string }>("/api/dashboard/kyc/submit", {
      method: "POST",
    }),

  // KYC — staff review
  adminKycQueue: () =>
    request<{ object: "list"; data: KycQueueEntry[] }>("/api/dashboard/admin/kyc"),

  adminKycDetail: (merchantId: string) =>
    request<KycReviewDetail>(`/api/dashboard/admin/kyc/${merchantId}`),

  adminKycApprove: (merchantId: string, note: string, enableLive: boolean) =>
    request<{ kyc_status: string; live_enabled: boolean }>(
      `/api/dashboard/admin/kyc/${merchantId}/approve`,
      { method: "POST", body: { note, enable_live: enableLive } },
    ),

  adminKycReject: (merchantId: string, reason: string) =>
    request<{ kyc_status: string }>(
      `/api/dashboard/admin/kyc/${merchantId}/reject`,
      { method: "POST", body: { reason } },
    ),

  // XerinPay staff
  payoutInvestigations: () =>
    request<{ object: "list"; data: Payout[] }>(
      "/api/dashboard/admin/payout-investigations",
    ),
}
