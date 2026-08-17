/**
 * Checkout translations (§11.1).
 *
 * Swahili first in spirit: most people paying through this page are more
 * comfortable in Swahili than English, and a payment page is the worst
 * possible place to make someone work in a second language. The toggle is
 * always visible.
 *
 * These strings are deliberately plain. "Ingiza namba yako ya siri ya M-Pesa"
 * beats a literal translation of "Authorize the transaction" — the customer
 * needs to know which buttons to press on their phone, not what we call it.
 */

export type Lang = "sw" | "en"

export const LANGUAGES: { code: Lang; label: string }[] = [
  { code: "sw", label: "Kiswahili" },
  { code: "en", label: "English" },
]

type Dict = Record<string, string>

const sw: Dict = {
  "page.pay_to": "Lipa kwa",
  "page.amount": "Kiasi",
  "page.total": "Jumla",
  "page.fee": "Ada",
  "page.secured": "Malipo salama kupitia XerinPay",

  "step.network": "Chagua mtandao wako",
  "step.details": "Weka namba yako",
  "step.confirm": "Thibitisha",

  "field.amount": "Kiasi cha kulipa",
  "field.amount_placeholder": "Mfano: 10000",
  "field.phone": "Namba ya simu",
  "field.phone_placeholder": "0712 345 678",
  "field.name": "Jina lako",
  "field.name_placeholder": "Jina kamili",
  "field.email": "Barua pepe",
  "field.note": "Maelezo",
  "field.optional": "si lazima",

  "action.continue": "Endelea",
  "action.back": "Rudi nyuma",
  "action.pay": "Lipa sasa",
  "action.check_again": "Angalia tena",
  "action.try_again": "Jaribu tena",
  "action.done": "Nimemaliza",

  "status.sending": "Tunatuma ombi...",
  "status.waiting": "Tunasubiri malipo yako",
  "status.success": "Malipo yamekamilika",
  "status.failed": "Malipo hayakufanikiwa",
  "status.expired": "Muda umeisha",
  "status.reference": "Kumbukumbu",
  "status.copy": "Nakili",
  "status.copied": "Imenakiliwa",
  "status.taking_long":
    "Inachukua muda mrefu kuliko kawaida. Angalia simu yako, kisha bofya hapa chini.",

  // Shown while the customer is at their phone. This is the most important
  // string on the page -- if it is wrong, they do not complete the payment.
  "prompt.mpesa": "Angalia simu yako na uweke PIN yako ya M-Pesa",
  "prompt.tigo": "Angalia simu yako na uweke PIN yako ya Mixx by Yas",
  "prompt.airtel": "Angalia simu yako na uweke PIN yako ya Airtel Money",
  "prompt.halopesa": "Angalia simu yako na uweke PIN yako ya HaloPesa",
  "prompt.azampesa": "Angalia simu yako na uweke PIN yako ya AzamPesa",
  "prompt.default": "Angalia simu yako na uweke PIN yako",

  "failure.insufficient_funds": "Salio lako halitoshi. Weka pesa kisha ujaribu tena.",
  "failure.invalid_phone": "Namba hii si sahihi kwa mtandao uliochagua.",
  "failure.payer_cancelled": "Umeghairi malipo.",
  "failure.timeout": "Hukujibu kwa wakati. Jaribu tena.",
  "failure.limit_exceeded": "Umevuka kiwango cha juu cha muamala.",
  "failure.provider_unavailable":
    "Mtandao una tatizo kwa sasa. Tafadhali jaribu tena baada ya dakika chache.",
  "failure.unknown_error": "Kuna tatizo lisilojulikana. Tafadhali jaribu tena.",
  "failure.duplicate_reference": "Malipo haya tayari yapo.",

  "error.link_not_found": "Kiungo hiki hakipo.",
  "error.amount_required": "Tafadhali weka kiasi.",
  "error.phone_required": "Tafadhali weka namba ya simu.",
  "error.network_required": "Tafadhali chagua mtandao wako.",
  "error.generic": "Kuna tatizo. Tafadhali jaribu tena.",
}

const en: Dict = {
  "page.pay_to": "Pay to",
  "page.amount": "Amount",
  "page.total": "Total",
  "page.fee": "Fee",
  "page.secured": "Payments secured by XerinPay",

  "step.network": "Choose your network",
  "step.details": "Enter your number",
  "step.confirm": "Confirm",

  "field.amount": "Amount to pay",
  "field.amount_placeholder": "e.g. 10000",
  "field.phone": "Phone number",
  "field.phone_placeholder": "0712 345 678",
  "field.name": "Your name",
  "field.name_placeholder": "Full name",
  "field.email": "Email",
  "field.note": "Note",
  "field.optional": "optional",

  "action.continue": "Continue",
  "action.back": "Back",
  "action.pay": "Pay now",
  "action.check_again": "Check again",
  "action.try_again": "Try again",
  "action.done": "Done",

  "status.sending": "Sending your request…",
  "status.waiting": "Waiting for your payment",
  "status.success": "Payment complete",
  "status.failed": "Payment failed",
  "status.expired": "This payment expired",
  "status.reference": "Reference",
  "status.copy": "Copy",
  "status.copied": "Copied",
  "status.taking_long":
    "This is taking longer than usual. Check your phone, then tap below.",

  "prompt.mpesa": "Check your phone and enter your M-Pesa PIN",
  "prompt.tigo": "Check your phone and enter your Mixx by Yas PIN",
  "prompt.airtel": "Check your phone and enter your Airtel Money PIN",
  "prompt.halopesa": "Check your phone and enter your HaloPesa PIN",
  "prompt.azampesa": "Check your phone and enter your AzamPesa PIN",
  "prompt.default": "Check your phone and enter your PIN",

  "failure.insufficient_funds":
    "You don't have enough balance. Top up and try again.",
  "failure.invalid_phone": "That number isn't valid for the network you chose.",
  "failure.payer_cancelled": "You cancelled the payment.",
  "failure.timeout": "You didn't respond in time. Please try again.",
  "failure.limit_exceeded": "That's above your transaction limit.",
  "failure.provider_unavailable":
    "The network is having trouble right now. Please try again in a few minutes.",
  "failure.unknown_error": "Something went wrong. Please try again.",
  "failure.duplicate_reference": "This payment already exists.",

  "error.link_not_found": "This link doesn't exist.",
  "error.amount_required": "Please enter an amount.",
  "error.phone_required": "Please enter your phone number.",
  "error.network_required": "Please choose your network.",
  "error.generic": "Something went wrong. Please try again.",
}

const DICTS: Record<Lang, Dict> = { sw, en }

/** Look up a string, falling back to English then to the key itself. */
export function translate(lang: Lang, key: string): string {
  return DICTS[lang][key] ?? DICTS.en[key] ?? key
}

export function makeT(lang: Lang) {
  return (key: string) => translate(lang, key)
}

export const NETWORKS = [
  { id: "mpesa", label: "M-Pesa", hint: "Vodacom" },
  { id: "tigo", label: "Mixx by Yas", hint: "Tigo" },
  { id: "airtel", label: "Airtel Money", hint: "Airtel" },
  { id: "halopesa", label: "HaloPesa", hint: "Halotel" },
  { id: "azampesa", label: "AzamPesa", hint: "Azam" },
] as const

export type NetworkId = (typeof NETWORKS)[number]["id"]

/** Prefix → network, mirroring apps/common/phone.py. */
const PREFIX_MAP: Record<string, NetworkId> = {}
const PREFIXES: Record<NetworkId, string[]> = {
  mpesa: ["754", "755", "756", "757", "758", "759", "768", "769"],
  tigo: ["711", "712", "713", "714", "715", "716", "717", "718", "719"],
  airtel: ["781", "782", "783", "784", "785", "786", "787", "788", "789"],
  halopesa: ["612", "613", "614", "615", "616", "617", "618", "619"],
  azampesa: ["772", "773", "774", "775", "776"],
}
for (const [network, prefixes] of Object.entries(PREFIXES)) {
  for (const prefix of prefixes) PREFIX_MAP[prefix] = network as NetworkId
}

/**
 * Guess the network from a typed number so the customer doesn't have to
 * choose. Only a convenience — they can always override, and the backend
 * re-derives it anyway.
 */
export function guessNetwork(input: string): NetworkId | null {
  const digits = input.replace(/\D/g, "")
  let national = digits
  if (digits.startsWith("255")) national = digits.slice(3)
  else if (digits.startsWith("0")) national = digits.slice(1)
  if (national.length < 3) return null
  return PREFIX_MAP[national.slice(0, 3)] ?? null
}
