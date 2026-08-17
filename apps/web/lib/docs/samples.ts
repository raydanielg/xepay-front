/**
 * Code sample generation.
 *
 * Every sample is built at render time from the configured base URL and,
 * when the merchant is signed in, their real test key. Nothing here is a
 * static string with `api.xerinpay.co.tz` baked in — the docs are correct
 * on localhost and in production without anyone editing them.
 *
 * The key shown is ALWAYS the test key. A docs page that invites you to
 * paste a live secret into a code sample is a docs page that leaks live
 * secrets into screenshots and support tickets.
 */

import type { Endpoint, Param } from "@/lib/docs/endpoints"

export const LANGUAGES = [
  { id: "curl", label: "cURL" },
  { id: "node", label: "Node.js" },
  { id: "php", label: "PHP" },
  { id: "python", label: "Python" },
] as const

export type LanguageId = (typeof LANGUAGES)[number]["id"]

export const PLACEHOLDER_KEY = "sk_test_YOUR_KEY_HERE"

export interface SampleContext {
  baseUrl: string
  apiKey?: string | null
}

/** Build an example request body from the endpoint's declared params. */
export function exampleBody(endpoint: Endpoint): Record<string, unknown> | null {
  if (!endpoint.params?.length) return null

  const build = (params: Param[]): Record<string, unknown> => {
    const out: Record<string, unknown> = {}
    for (const param of params) {
      if (param.fields) {
        out[param.name] = build(param.fields)
        continue
      }
      if (param.example === undefined) continue

      // Object examples are authored as JSON strings so the catalogue stays
      // readable; parse them back so the sample renders as real JSON.
      if (
        typeof param.example === "string" &&
        (param.example.trim().startsWith("{") ||
          param.example.trim().startsWith("["))
      ) {
        try {
          out[param.name] = JSON.parse(param.example)
          continue
        } catch {
          // Fall through and treat it as a plain string.
        }
      }
      out[param.name] = param.example
    }
    return out
  }

  const body = build(endpoint.params)
  return Object.keys(body).length > 0 ? body : null
}

/** Substitute `{id}` in a path so samples are copy-pasteable. */
function resolvePath(path: string): string {
  return path.replace(/\{(\w+)\}/g, (_, name) =>
    name === "id" ? "ch_01J8XKQ2M7VN4P" : `{${name}}`,
  )
}

function authHeader(ctx: SampleContext): string {
  return ctx.apiKey || PLACEHOLDER_KEY
}

function idempotencyLine(endpoint: Endpoint): boolean {
  return Boolean(endpoint.idempotent)
}

// --------------------------------------------------------------------------
// Generators
// --------------------------------------------------------------------------

function curlSample(endpoint: Endpoint, ctx: SampleContext): string {
  const url = `${ctx.baseUrl}${resolvePath(endpoint.path)}`
  const body = exampleBody(endpoint)
  const lines = [`curl -X ${endpoint.method} ${url} \\`]

  if (endpoint.auth !== "none") {
    lines.push(`  -H "Authorization: Bearer ${authHeader(ctx)}" \\`)
  }
  if (body) {
    lines.push(`  -H "Content-Type: application/json" \\`)
  }
  if (idempotencyLine(endpoint)) {
    lines.push(`  -H "Idempotency-Key: $(uuidgen)" \\`)
  }
  if (body) {
    lines.push(`  -d '${JSON.stringify(body, null, 2).replace(/\n/g, "\n  ")}'`)
  }

  return lines.join("\n").replace(/\s\\$/, "")
}

function nodeSample(endpoint: Endpoint, ctx: SampleContext): string {
  const body = exampleBody(endpoint)
  const headers: string[] = []

  if (endpoint.auth !== "none") {
    headers.push(`      Authorization: \`Bearer \${apiKey}\`,`)
  }
  if (body) headers.push(`      "Content-Type": "application/json",`)
  if (idempotencyLine(endpoint)) {
    headers.push(`      "Idempotency-Key": randomUUID(),`)
  }

  return `${idempotencyLine(endpoint) ? 'import { randomUUID } from "node:crypto"\n\n' : ""}const apiKey = process.env.XERINPAY_SECRET_KEY
const baseUrl = "${ctx.baseUrl}"

const response = await fetch(\`\${baseUrl}${resolvePath(endpoint.path)}\`, {
  method: "${endpoint.method}",
  headers: {
${headers.join("\n")}
  },${
    body
      ? `
  body: JSON.stringify(${JSON.stringify(body, null, 2).replace(/\n/g, "\n  ")}),`
      : ""
  }
})

const data = await response.json()

if (!response.ok) {
  // Every error carries a request_id. Quote it to support.
  throw new Error(\`\${data.error.code}: \${data.error.message} (\${data.error.request_id})\`)
}

console.log(data)`
}

function phpSample(endpoint: Endpoint, ctx: SampleContext): string {
  const body = exampleBody(endpoint)
  const headers = [`'Accept: application/json'`]

  if (endpoint.auth !== "none") {
    headers.unshift(`'Authorization: Bearer ' . $apiKey`)
  }
  if (body) headers.push(`'Content-Type: application/json'`)
  if (idempotencyLine(endpoint)) {
    headers.push(`'Idempotency-Key: ' . bin2hex(random_bytes(16))`)
  }

  return `<?php

$apiKey  = getenv('XERINPAY_SECRET_KEY');
$baseUrl = '${ctx.baseUrl}';

$ch = curl_init($baseUrl . '${resolvePath(endpoint.path)}');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST  => '${endpoint.method}',
    CURLOPT_HTTPHEADER     => [
        ${headers.join(",\n        ")},
    ],${
      body
        ? `
    CURLOPT_POSTFIELDS     => json_encode(${phpArray(body)}),`
        : ""
    }
]);

$response = json_decode(curl_exec($ch), true);
$status   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($status >= 400) {
    throw new Exception($response['error']['message'] . ' (' . $response['error']['request_id'] . ')');
}

print_r($response);`
}

function pythonSample(endpoint: Endpoint, ctx: SampleContext): string {
  const body = exampleBody(endpoint)
  const headers: string[] = []

  if (endpoint.auth !== "none") {
    headers.push(`    "Authorization": f"Bearer {api_key}",`)
  }
  if (idempotencyLine(endpoint)) {
    headers.push(`    "Idempotency-Key": str(uuid.uuid4()),`)
  }

  return `import os${idempotencyLine(endpoint) ? "\nimport uuid" : ""}
import requests

api_key = os.environ["XERINPAY_SECRET_KEY"]
base_url = "${ctx.baseUrl}"

response = requests.${endpoint.method.toLowerCase()}(
    f"{base_url}${resolvePath(endpoint.path)}",
    headers={
${headers.join("\n")}
    },${body ? `\n    json=${pythonDict(body)},` : ""}
    timeout=30,
)

data = response.json()

if not response.ok:
    error = data["error"]
    raise RuntimeError(f"{error['code']}: {error['message']} ({error['request_id']})")

print(data)`
}

// --------------------------------------------------------------------------
// Literal formatting helpers
// --------------------------------------------------------------------------

function phpArray(value: unknown, indent = 8): string {
  const pad = " ".repeat(indent)
  const closePad = " ".repeat(Math.max(indent - 4, 0))

  if (Array.isArray(value)) {
    return `[\n${value
      .map((item) => `${pad}${phpArray(item, indent + 4)}`)
      .join(",\n")}\n${closePad}]`
  }
  if (value && typeof value === "object") {
    return `[\n${Object.entries(value)
      .map(([k, v]) => `${pad}'${k}' => ${phpArray(v, indent + 4)}`)
      .join(",\n")}\n${closePad}]`
  }
  if (typeof value === "string") return `'${value.replace(/'/g, "\\'")}'`
  if (typeof value === "boolean") return value ? "true" : "false"
  return String(value)
}

function pythonDict(value: unknown, indent = 8): string {
  const pad = " ".repeat(indent)
  const closePad = " ".repeat(Math.max(indent - 4, 0))

  if (Array.isArray(value)) {
    return `[\n${value
      .map((item) => `${pad}${pythonDict(item, indent + 4)}`)
      .join(",\n")}\n${closePad}]`
  }
  if (value && typeof value === "object") {
    return `{\n${Object.entries(value)
      .map(([k, v]) => `${pad}"${k}": ${pythonDict(v, indent + 4)}`)
      .join(",\n")}\n${closePad}}`
  }
  if (typeof value === "string") return `"${value}"`
  if (typeof value === "boolean") return value ? "True" : "False"
  return String(value)
}

const GENERATORS: Record<
  LanguageId,
  (endpoint: Endpoint, ctx: SampleContext) => string
> = {
  curl: curlSample,
  node: nodeSample,
  php: phpSample,
  python: pythonSample,
}

export function generateSample(
  endpoint: Endpoint,
  language: LanguageId,
  ctx: SampleContext,
): string {
  return GENERATORS[language](endpoint, ctx)
}

// --------------------------------------------------------------------------
// Webhook verification samples
// --------------------------------------------------------------------------

/**
 * Signature verification, per language.
 *
 * These are the samples most worth getting right: a merchant who verifies
 * incorrectly either rejects every real event, or accepts forged ones.
 */
export const VERIFY_SAMPLES: Record<LanguageId, string> = {
  curl: `# Signature verification cannot be done in a shell in any useful way.
# Pick one of the other languages.`,

  node: `import crypto from "node:crypto"

// IMPORTANT: read the RAW body. Parsing to JSON first changes whitespace
// and the signature will never match.
export function verify(rawBody, signatureHeader, secret) {
  const parts = Object.fromEntries(
    signatureHeader.split(",").map((p) => p.split("=")),
  )

  // Reject anything older than 5 minutes so a captured event cannot be
  // replayed at leisure.
  const age = Math.abs(Date.now() / 1000 - Number(parts.t))
  if (age > 300) return false

  const expected = crypto
    .createHmac("sha256", secret)
    .update(\`\${parts.t}.\${rawBody}\`)
    .digest("hex")

  // Constant-time. Never use === here.
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(parts.v1),
  )
}`,

  php: `<?php

// IMPORTANT: read the RAW body. json_decode then re-encode will change
// whitespace and the signature will never match.
function verify(string $rawBody, string $signatureHeader, string $secret): bool
{
    parse_str(str_replace(',', '&', $signatureHeader), $parts);

    // Reject replays older than 5 minutes.
    if (abs(time() - (int) $parts['t']) > 300) {
        return false;
    }

    $expected = hash_hmac('sha256', $parts['t'] . '.' . $rawBody, $secret);

    // Constant-time. Never use == here.
    return hash_equals($expected, $parts['v1']);
}`,

  python: `import hashlib
import hmac
import time


def verify(raw_body: bytes, signature_header: str, secret: str) -> bool:
    """IMPORTANT: pass the RAW body. Parsing to JSON first changes
    whitespace and the signature will never match."""
    parts = dict(p.split("=", 1) for p in signature_header.split(","))

    # Reject replays older than 5 minutes.
    if abs(time.time() - int(parts["t"])) > 300:
        return False

    expected = hmac.new(
        secret.encode(),
        f"{parts['t']}.{raw_body.decode()}".encode(),
        hashlib.sha256,
    ).hexdigest()

    # Constant-time. Never use == here.
    return hmac.compare_digest(expected, parts["v1"])`,
}
