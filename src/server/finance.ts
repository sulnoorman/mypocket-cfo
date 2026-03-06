import { createServerFn } from "@tanstack/react-start"
import {
  createPocketRecord,
  createTransactionRecord,
  deleteTransactionRecord,
  listAllTransactions,
  listPocketRecords,
  listRecentTransactions,
  totalAmountByType,
  totalPocketSpending,
  createPocketItemRecord,
  togglePocketItemRecord,
  deletePocketItemRecord,
  listPocketItems,
  archivePocketRecord,
  type PocketItemRecord,
  type PocketRecord
} from "../db/client"
import { parseSmartInput } from "../lib/smartParser"

export type Pocket = PocketRecord & {
  items: PocketItemRecord[]
  spent: number
}

export type Transaction = {
  id: number
  description: string
  amount: number
  type: "income" | "expense"
  category: string | null
  pocketId: number | null
  date: number
}

export type DashboardData = {
  totalIncome: number
  totalSpending: number
  remaining: number
  expenseTrend: { month: string; total: number }[]
  pockets: Pocket[]
  recentTransactions: Transaction[]
}

function buildExpenseTrend(params: {
  months: number
  now: Date
  transactions: { type: "income" | "expense"; amount: number; date: number }[]
}): { month: string; total: number }[] {
  const months = Math.max(3, Math.min(24, params.months))
  const start = new Date(params.now.getFullYear(), params.now.getMonth() - (months - 1), 1)
  const monthKeys: { key: string; label: string }[] = []
  for (let i = 0; i < months; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleDateString("id-ID", { month: "short" })
    monthKeys.push({ key, label })
  }

  const totals = new Map<string, number>()
  for (const mk of monthKeys) totals.set(mk.key, 0)

  for (const tx of params.transactions) {
    if (tx.type !== "expense") continue
    if (tx.date <= 0) continue
    const d = new Date(tx.date * 1000)
    if (d < start) continue
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const prev = totals.get(key)
    if (prev != null) totals.set(key, prev + tx.amount)
  }

  return monthKeys.map((mk) => ({ month: mk.label, total: totals.get(mk.key) ?? 0 }))
}

export const getDashboardData = createServerFn({
  method: "GET"
})
  .handler(async () => {
    const totalIncome = totalAmountByType("income")
    const totalSpending = totalAmountByType("expense")
    const remaining = totalIncome - totalSpending

    const allTransactions = listAllTransactions()
    const expenseTrend = buildExpenseTrend({
      months: 6,
      now: new Date(),
      transactions: allTransactions
    })

    const allPockets = listPocketRecords()
    const enrichedPockets: Pocket[] = allPockets.map((p) => ({
      ...p,
      items: listPocketItems(p.id),
      spent: totalPocketSpending(p.id)
    }))

    const recent = listRecentTransactions(10)

    return {
      totalIncome,
      totalSpending,
      remaining,
      expenseTrend,
      pockets: enrichedPockets,
      recentTransactions: recent
    } satisfies DashboardData
  })

export const createPocket = createServerFn({
  method: "POST"
})
  .inputValidator(
    (data: {
      name: string
      budgetLimit?: number | null
      type: "recurring" | "project"
      resetDay?: number
    }) => data
  )
  .handler(async ({ data }) => {
    const name = data.name.trim()
    const limitValue = data.budgetLimit ?? null
    if (!name) {
      throw new Error("Pocket name is required")
    }
    const pocket = createPocketRecord({
      name,
      budgetLimit: limitValue,
      type: data.type,
      resetDay: data.resetDay
    })
    return pocket
  })

export const listPockets = createServerFn({
  method: "GET"
}).handler(async () => {
  const all = listPocketRecords()
  return all.map((p) => ({
    ...p,
    items: listPocketItems(p.id),
    spent: totalPocketSpending(p.id)
  }))
})

export const archivePocket = createServerFn({
  method: "POST"
})
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const archived = archivePocketRecord(data.id)
    if (!archived) {
      throw new Error("Pocket not found")
    }
    return archived
  })

export const createPocketItem = createServerFn({
  method: "POST"
})
  .inputValidator((data: { pocketId: number; name: string }) => data)
  .handler(async ({ data }) => {
    if (!data.name.trim()) throw new Error("Item name required")
    return createPocketItemRecord({
      pocketId: data.pocketId,
      name: data.name
    })
  })

export const togglePocketItem = createServerFn({
  method: "POST"
})
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const updated = togglePocketItemRecord(data.id)
    if (!updated) throw new Error("Item not found")
    return updated
  })

export const deletePocketItem = createServerFn({
  method: "POST"
})
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    deletePocketItemRecord(data.id)
    return { ok: true }
  })

export const createTransactionFromSmartInput = createServerFn({
  method: "POST"
})
  .inputValidator(
    (data: {
      text: string
      pocketId?: number | null
      date?: string | null
      enableSmartCategorization?: boolean
    }) => data
  )
  .handler(async ({ data }) => {
    const parsed = parseSmartInput(data.text)
    if (!parsed.amount || parsed.amount <= 0) {
      throw new Error("Tidak menemukan nominal di input")
    }
    const categorizationEnabled = data.enableSmartCategorization !== false
    const timestamp =
      data.date != null && data.date !== ""
        ? Date.parse(data.date)
        : Date.now()
    const pocketId =
      typeof data.pocketId === "number" && Number.isFinite(data.pocketId)
        ? data.pocketId
        : null
    const created = createTransactionRecord({
      description: parsed.description,
      amount: parsed.amount,
      type: parsed.type,
      category: categorizationEnabled ? parsed.category : null,
      pocketId,
      date: Math.floor(timestamp / 1000)
    })
    return created
  })

export const deleteTransaction = createServerFn({
  method: "POST"
})
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    deleteTransactionRecord(data.id)
    return {
      ok: true
    }
  })

export const updatePocketBudget = createServerFn({
  method: "POST"
})
  .inputValidator((data: { id: number; budgetLimit: number | null }) => data)
  .handler(async ({ data }) => {
    const pockets = listPocketRecords()
    const pocket = pockets.find((p) => p.id === data.id)
    if (!pocket) {
      throw new Error("Pocket not found")
    }
    pocket.budgetLimit = data.budgetLimit
    return pocket
  })

export const getPocketSpending = createServerFn({
  method: "GET"
})
  .inputValidator((data: { pocketId: number }) => data)
  .handler(async ({ data }) => {
    const total = totalPocketSpending(data.pocketId)
    return total
  })
