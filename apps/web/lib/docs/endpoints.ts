/**
 * The API catalogue.
 *
 * Single source of truth for the docs pages, the code samples and the
 * playground. Adding an endpoint here makes it appear in all three — there
 * is no second list to keep in step.
 *
 * Nothing here hardcodes a host. The base URL comes from
 * NEXT_PUBLIC_API_BASE_URL at render time, so the same docs are correct on
 * localhost, staging and production without an edit.
 */

export type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE"

export interface Param {
  name: string
  type: string
  required?: boolean
  description: string
  example?: string | number | boolean
  /** Nested object fields, e.g. `payer.phone`. */
  fields?: Param[]
}

export interface Endpoint {
  id: string
  method: HttpMethod
  path: string
  title: string
  description: string
  /** Which credential this accepts. Drives the playground's key picker. */
  auth: "secret" | "public_or_secret" | "none"
  /** Money-moving POSTs require an Idempotency-Key (§9.1). */
  idempotent?: boolean
  params?: Param[]
  query?: Param[]
  /** Sample success body, shown in the response tab. */
  response?: Record<string, unknown>
  notes?: string[]
}

export interface DocSection {
  slug: string
  title: string
  summary: string
  endpoints: Endpoint[]
}

export const SECTIONS: DocSection[] = [
  {
    slug: "charges",
    title: "Charges",
    summary:
      "Collect money from a customer's mobile money wallet. A charge is created immediately and completes when the customer enters their PIN.",
    endpoints: [
      {
        id: "create-charge",
        method: "POST",
        path: "/v1/charges",
        title: "Create a charge",
        description:
          "Pushes a payment prompt to the customer's phone. Returns straight away with status `pending` — do not wait on this call for the final outcome, listen for the webhook instead.",
        auth: "public_or_secret",
        idempotent: true,
        params: [
          {
            name: "amount",
            type: "integer",
            required: true,
            description:
              "Amount in minor units. 10000 means TZS 100.00. Never send a decimal.",
            example: 10000,
          },
          {
            name: "currency",
            type: "string",
            description: "Only TZS is supported.",
            example: "TZS",
          },
          {
            name: "channel",
            type: "string",
            required: true,
            description: "`mobile_money` or `bank`.",
            example: "mobile_money",
          },
          {
            name: "network",
            type: "string",
            description:
              "mpesa, tigo, airtel, halopesa or azampesa. If you leave this out we work it out from the phone number.",
            example: "mpesa",
          },
          {
            name: "payer",
            type: "object",
            required: true,
            description: "Who is paying.",
            fields: [
              {
                name: "phone",
                type: "string",
                required: true,
                description: "Any Tanzanian format. We normalise it.",
                example: "+255712345678",
              },
              {
                name: "name",
                type: "string",
                description: "Shown on the receipt.",
                example: "Asha Mwakalinga",
              },
            ],
          },
          {
            name: "description",
            type: "string",
            description: "Shown to the customer on the payment prompt.",
            example: "Payment for order #4821",
          },
          {
            name: "metadata",
            type: "object",
            description:
              "Your own data. We never read or change it, and it comes back on every webhook.",
            example: '{ "order_id": "4821" }',
          },
        ],
        response: {
          id: "ch_01J8XKQ2M7VN4P",
          reference: "XP_20260817_A7F2C9",
          status: "pending",
          amount: 10000,
          fee: 200,
          net: 9800,
          currency: "TZS",
          channel: "mobile_money",
          payer: { phone: "+255712345678", name: "Asha Mwakalinga" },
          metadata: { order_id: "4821" },
          created_at: "2026-08-17T09:14:22Z",
          expires_at: "2026-08-17T09:29:22Z",
        },
        notes: [
          "The customer has 15 minutes to enter their PIN before the charge expires.",
          "Always send an Idempotency-Key. Tanzanian networks drop constantly and your client will retry — without a key you will create a second charge.",
        ],
      },
      {
        id: "get-charge",
        method: "GET",
        path: "/v1/charges/{id}",
        title: "Retrieve a charge",
        description:
          "Accepts either the charge id or the customer-visible reference.",
        auth: "secret",
      },
      {
        id: "list-charges",
        method: "GET",
        path: "/v1/charges",
        title: "List charges",
        description: "Newest first, cursor paginated.",
        auth: "secret",
        query: [
          {
            name: "status",
            type: "string",
            description: "pending, processing, success, failed, expired.",
          },
          {
            name: "limit",
            type: "integer",
            description: "Up to 100. Defaults to 25.",
            example: 25,
          },
          {
            name: "starting_after",
            type: "string",
            description: "Cursor from the previous page's `next_cursor`.",
          },
        ],
      },
      {
        id: "refund-charge",
        method: "POST",
        path: "/v1/charges/{id}/refunds",
        title: "Refund a charge",
        description:
          "Full or partial. Leave `amount` out to refund everything still outstanding.",
        auth: "secret",
        idempotent: true,
        params: [
          {
            name: "amount",
            type: "integer",
            description: "Minor units. Defaults to the full refundable amount.",
            example: 10000,
          },
          {
            name: "reason",
            type: "string",
            description: "Recorded against the refund.",
            example: "Customer changed their mind",
          },
        ],
      },
    ],
  },
  {
    slug: "payouts",
    title: "Payouts",
    summary:
      "Send money out to mobile money wallets or bank accounts. Payouts above your threshold wait for a human to approve them.",
    endpoints: [
      {
        id: "create-payout",
        method: "POST",
        path: "/v1/payouts",
        title: "Create a payout",
        description:
          "Reserves the funds immediately, then sends. If the amount is above your auto-approve threshold — or the destination is new — it waits for approval in the dashboard.",
        auth: "secret",
        idempotent: true,
        params: [
          {
            name: "amount",
            type: "integer",
            required: true,
            description: "Minor units.",
            example: 50000,
          },
          {
            name: "destination_type",
            type: "string",
            required: true,
            description: "`mobile_money` or `bank`.",
            example: "mobile_money",
          },
          {
            name: "destination_no",
            type: "string",
            required: true,
            description: "Phone number or bank account number.",
            example: "+255754123456",
          },
          {
            name: "destination_name",
            type: "string",
            description: "Recipient name.",
            example: "Juma Hassan",
          },
          {
            name: "bank_code",
            type: "string",
            description: "Required when destination_type is `bank`.",
          },
          {
            name: "narration",
            type: "string",
            description: "Shown on the recipient's statement.",
            example: "Salary August",
          },
        ],
        notes: [
          "A payout whose outcome we cannot confirm is held for investigation, not failed. The funds stay reserved until a human checks with the provider — we never release them on a guess.",
        ],
      },
      {
        id: "get-payout",
        method: "GET",
        path: "/v1/payouts/{id}",
        title: "Retrieve a payout",
        description: "Current status and provider reference.",
        auth: "secret",
      },
    ],
  },
  {
    slug: "balance",
    title: "Balance & settlements",
    summary:
      "Your balance is computed from the ledger, never stored as a single number.",
    endpoints: [
      {
        id: "get-balance",
        method: "GET",
        path: "/v1/balance",
        title: "Retrieve your balance",
        description:
          "`available` is what you can pay out or settle now. `pending` is collected but not yet cleared. `reserve` is held against payouts in flight.",
        auth: "secret",
        response: {
          object: "balance",
          available_minor: 4_850_000,
          pending_minor: 120_000,
          reserve_minor: 50_000,
          total_minor: 5_020_000,
          currency: "TZS",
        },
      },
      {
        id: "list-settlements",
        method: "GET",
        path: "/v1/settlements",
        title: "List settlements",
        description: "Transfers of your balance to your bank account.",
        auth: "secret",
      },
    ],
  },
  {
    slug: "payment-links",
    title: "Payment links",
    summary:
      "Take payments without writing any code. Create a link, share it, get paid.",
    endpoints: [
      {
        id: "create-link",
        method: "POST",
        path: "/v1/payment-links",
        title: "Create a payment link",
        description:
          "Leave `amount` out to let the customer choose — useful for donations.",
        auth: "secret",
        params: [
          {
            name: "title",
            type: "string",
            required: true,
            description: "Shown at the top of the checkout page.",
            example: "Mchele kilo 5",
          },
          {
            name: "amount",
            type: "integer",
            description: "Minor units. Omit for a customer-chosen amount.",
            example: 1000000,
          },
          {
            name: "slug",
            type: "string",
            description: "Custom link address. We generate one if you don't.",
            example: "duka-la-mama-asha",
          },
          {
            name: "is_reusable",
            type: "boolean",
            description: "False means the link works once only.",
            example: true,
          },
        ],
      },
    ],
  },
  {
    slug: "webhooks",
    title: "Webhooks",
    summary:
      "We tell your server when something happens. Every request is signed — verify it before you trust it.",
    endpoints: [
      {
        id: "create-endpoint",
        method: "POST",
        path: "/v1/webhooks/endpoints",
        title: "Register an endpoint",
        description:
          "Returns the signing secret once. Store it — it is never shown again.",
        auth: "secret",
        params: [
          {
            name: "url",
            type: "string",
            required: true,
            description: "Must be HTTPS.",
            example: "https://example.co.tz/webhooks/xerinpay",
          },
          {
            name: "events",
            type: "array",
            description: "Leave empty to receive everything.",
            example: '["charge.success", "payout.failed"]',
          },
        ],
      },
      {
        id: "list-deliveries",
        method: "GET",
        path: "/v1/webhooks/deliveries",
        title: "List deliveries",
        description: "Every attempt, with your server's response.",
        auth: "secret",
      },
      {
        id: "resend-delivery",
        method: "POST",
        path: "/v1/webhooks/deliveries/{id}/resend",
        title: "Resend a delivery",
        description: "Replays an event your server missed.",
        auth: "secret",
      },
    ],
  },
  {
    slug: "status",
    title: "Status",
    summary: "Provider health. No authentication needed.",
    endpoints: [
      {
        id: "provider-status",
        method: "GET",
        path: "/v1/providers/status",
        title: "Provider health",
        description:
          "Check this first when payments start failing — it tells you whether the problem is us, a provider, or your integration.",
        auth: "none",
      },
    ],
  },
]

export const EVENT_TYPES = [
  { name: "charge.pending", description: "A charge was created and the customer has been prompted." },
  { name: "charge.success", description: "Money received. This is the one that matters." },
  { name: "charge.failed", description: "The payment did not go through. Check `failure_code`." },
  { name: "charge.expired", description: "The customer never responded in time." },
  { name: "refund.success", description: "A refund reached the customer." },
  { name: "refund.failed", description: "A refund could not be completed." },
  { name: "payout.pending", description: "A payout was created and funds reserved." },
  { name: "payout.success", description: "Money left your balance and reached the recipient." },
  { name: "payout.failed", description: "The payout failed and the funds were returned." },
  { name: "settlement.paid", description: "Your balance was transferred to your bank." },
  { name: "payment_link.paid", description: "Someone paid through one of your links." },
  { name: "merchant.kyc_approved", description: "Your account was verified." },
  { name: "merchant.suspended", description: "Your account was suspended." },
]

export const ERROR_CODES = [
  { code: "insufficient_funds", meaning: "The customer has no balance.", retry: false },
  { code: "invalid_phone", meaning: "The number is wrong or not registered on that network.", retry: false },
  { code: "payer_cancelled", meaning: "The customer dismissed the prompt.", retry: false },
  { code: "timeout", meaning: "The customer never responded.", retry: false },
  { code: "limit_exceeded", meaning: "The network's transaction limit was hit.", retry: false },
  { code: "provider_unavailable", meaning: "A provider or network is down. We retry elsewhere automatically.", retry: true },
  { code: "duplicate_reference", meaning: "That reference was already used.", retry: false },
  { code: "unknown_error", meaning: "Something we have not mapped yet. Contact support with the request_id.", retry: true },
]

export const TEST_NUMBERS = [
  { number: "+255700000001", behaviour: "Succeeds after 3 seconds", tone: "success" },
  { number: "+255700000002", behaviour: "Fails — insufficient_funds", tone: "fail" },
  { number: "+255700000003", behaviour: "Fails — payer_cancelled", tone: "fail" },
  { number: "+255700000004", behaviour: "No callback at all — tests your poller", tone: "warn" },
  { number: "+255700000005", behaviour: "Succeeds after 2 minutes", tone: "success" },
] as const

export function findEndpoint(id: string): Endpoint | undefined {
  for (const section of SECTIONS) {
    const match = section.endpoints.find((e) => e.id === id)
    if (match) return match
  }
  return undefined
}

export function allEndpoints(): Endpoint[] {
  return SECTIONS.flatMap((s) => s.endpoints)
}
