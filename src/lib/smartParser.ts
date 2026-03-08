export type TransactionKind = "income" | "expense"

export type ParsedSmartInput = {
  description: string
  amount: number
  type: TransactionKind
  category: string | null
}

const incomeKeywords = ["gaji", "gajian", "salary", "bonus", "masuk", "income"]
const expenseKeywords = [
  "jajan",
  "makan",
  "kopi",
  "coffee",
  "bayar",
  "beli",
  "topup",
  "top up",
  "sewa",
  "rent",
  "keluar",
  "spend",
  "belanja"
]

const categoryHints: Record<string, string> = {
  gaji: "Gaji",
  salary: "Gaji",
  bonus: "Bonus",
  jajan: "Jajan",
  kopi: "Kopi",
  coffee: "Kopi",
  makan: "Makan",
  food: "Makan",
  sewa: "Sewa",
  rent: "Sewa",
  listrik: "Listrik",
  pulsa: "Pulsa",
  kuota: "Pulsa",
  transport: "Transportasi",
  gojek: "Transportasi",
  grab: "Transportasi"
}

function detectType(text: string): TransactionKind {
  const lower = text.toLowerCase()
  for (const token of incomeKeywords) {
    if (lower.includes(token)) {
      return "income"
    }
  }
  for (const token of expenseKeywords) {
    if (lower.includes(token)) {
      return "expense"
    }
  }
  return "expense"
}

function detectCategory(text: string): string | null {
  const lower = text.toLowerCase()
  const tokens = lower.split(/\s+/g)
  for (const token of tokens) {
    const cleaned = token.replace(/[^a-zA-Z0-9]/g, "")
    if (cleaned in categoryHints) {
      return categoryHints[cleaned]
    }
  }
  return null
}

function parseNumericValue(raw: string): number | null {
  const match = raw.match(/(\d+)([.,]?\d+)?\s*(rb|k|ribu|juta|jt|miliar|m)?/i)
  if (!match) {
    return null
  }
  const base = parseFloat(match[1] + (match[2] ? match[2].replace(",", ".") : ""))
  if (Number.isNaN(base)) {
    return null
  }
  const unit = match[3]?.toLowerCase()
  if (!unit) {
    return base
  }
  if (unit === "rb" || unit === "k" || unit === "ribu") {
    return base * 1000
  }
  if (unit === "jt" || unit === "juta") {
    return base * 1000000
  }
  if (unit === "m" || unit === "miliar") {
    // In Indonesian context, 'm' usually means Miliar (Billion)
    // But if previously it was Million, I should be careful. 
    // Usually 'jt' is million. Let's make 'm' Billion to be correct for ID context.
    return base * 1000000000
  }
  return base
}

export function parseSmartInput(text: string): ParsedSmartInput {
  const trimmed = text.trim()
  const description = trimmed.length === 0 ? "Transaksi" : trimmed
  const lower = trimmed.toLowerCase()
  // Match numbers followed by common Indonesian currency slang
  const amountCandidates = lower.match(/\d+[.,]?\d*\s*(rb|k|ribu|juta|jt|miliar|m)?/gi) ?? []
  let amount = 0
  for (const candidate of amountCandidates) {
    const parsed = parseNumericValue(candidate)
    if (parsed && parsed > 0) {
      amount = parsed
      break
    }
  }
  if (!amount) {
    const plainNumber = lower.match(/\d+/g)
    if (plainNumber && plainNumber.length > 0) {
      amount = parseInt(plainNumber[0] ?? "0", 10)
    }
  }
  if (!amount || amount < 0) {
    amount = 0
  }
  const type = detectType(lower)
  const category = detectCategory(lower)
  return {
    description,
    amount,
    type,
    category
  }
}
