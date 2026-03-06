import type { CurrencyCode } from "~/lib/preferences"

export function formatMoney(amount: number, currency: CurrencyCode): string {
  const safeAmount = Number.isFinite(amount) ? amount : 0
  const locale = currency === "IDR" ? "id-ID" : "en-US"
  const maximumFractionDigits = currency === "IDR" ? 0 : 2
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits
  }).format(safeAmount)
}

export function formatDateFromUnix(timestamp: number): string {
  if (!timestamp) return ""
  const date = new Date(timestamp * 1000)
  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "2-digit"
  })
}

