import { createServerFn } from "@tanstack/react-start"
import { db, schema } from "~/db/drizzle"
import { and, desc, eq, isNull } from "drizzle-orm"
import { parseSmartInput } from "../lib/smartParser"

export type Pocket = {
  id: number
  userId: string
  name: string
  budgetLimit: number | null
  type: "recurring" | "project"
  status: "active" | "archived"
  resetDay: number | null
  lastResetAt: string | null
  createdAt: string
  items: {
    id: number
    pocketId: number
    userId: string
    name: string
    isChecked: boolean
    createdAt: string
  }[]
  spent: number
}

export type Transaction = {
  id: number
  userId: string
  description: string
  amount: number
  type: "income" | "expense"
  category: string | null
  pocketId: number | null
  date: string
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

async function ensureMonthlyResets(userId: string) {
  const now = new Date()
  const dayOfMonth = now.getDate()
  const rows = await db.select().from(schema.pockets).where(and(eq(schema.pockets.userId, userId), eq(schema.pockets.type, "recurring"), eq(schema.pockets.status, "active")))
  for (const p of rows) {
    if (p.resetDay && (!p.lastResetAt || new Date(p.lastResetAt).getMonth() !== now.getMonth() || new Date(p.lastResetAt).getFullYear() !== now.getFullYear())) {
      if (dayOfMonth >= p.resetDay) {
        await db.update(schema.pocketItems).set({ isChecked: false }).where(and(eq(schema.pocketItems.userId, userId), eq(schema.pocketItems.pocketId, p.id)))
        await db.update(schema.pockets).set({ lastResetAt: new Date() }).where(and(eq(schema.pockets.userId, userId), eq(schema.pockets.id, p.id)))
      }
    }
  }
}

async function getTotals(userId: string) {
  const txs = await db.select().from(schema.transactions).where(eq(schema.transactions.userId, userId))
  let totalIncome = 0
  let totalSpending = 0
  for (const tx of txs) {
    const amt = Number(tx.amount)
    if (tx.type === "income") totalIncome += amt
    else totalSpending += amt
  }
  return {
    totalIncome,
    totalSpending,
    remaining: totalIncome - totalSpending,
    transactions: txs.map(t => ({
      id: t.id,
      userId: t.userId,
      description: t.description,
      amount: Number(t.amount),
      type: t.type,
      category: t.category,
      pocketId: t.pocketId,
      date: t.occurredAt.toISOString()
    }))
  }
}

export const getAllTransactions = createServerFn({
  method: "GET"
})
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const txs = await db.select()
      .from(schema.transactions)
      .where(eq(schema.transactions.userId, data.userId))
      .orderBy(desc(schema.transactions.occurredAt))
    
    return txs.map(t => ({
      id: t.id,
      userId: t.userId,
      description: t.description,
      amount: Number(t.amount),
      type: t.type,
      category: t.category,
      pocketId: t.pocketId,
      date: t.occurredAt.toISOString()
    })) satisfies Transaction[]
  })

export const getDashboardData = createServerFn({
  method: "GET"
})
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const userId = data.userId
    await ensureMonthlyResets(userId)
    const { totalIncome, totalSpending, transactions: txs } = await getTotals(userId)
    const remaining = totalIncome - totalSpending

    const allTransactions = txs.map(t => ({ type: t.type, amount: Number(t.amount), date: Math.floor(new Date(t.date).getTime() / 1000) }))
    const expenseTrend = buildExpenseTrend({
      months: 6,
      now: new Date(),
      transactions: allTransactions
    })

    const allPocketsRaw = await db.select().from(schema.pockets).where(and(eq(schema.pockets.userId, userId), eq(schema.pockets.status, "active")))
    const pocketIds = allPocketsRaw.map(p => p.id)
    const items = pocketIds.length ? await db.select().from(schema.pocketItems).where(and(eq(schema.pocketItems.userId, userId))) : []
    const spentByPocket = new Map<number, number>()
    for (const tx of txs) {
      if (tx.type === "expense" && tx.pocketId) {
        spentByPocket.set(tx.pocketId, (spentByPocket.get(tx.pocketId) || 0) + Number(tx.amount))
      }
    }
    const enrichedPockets: Pocket[] = allPocketsRaw.map(p => ({
      id: p.id,
      userId: p.userId,
      name: p.name,
      budgetLimit: p.budgetLimit != null ? Number(p.budgetLimit) : null,
      type: p.type,
      status: p.status,
      resetDay: p.resetDay ?? null,
      lastResetAt: p.lastResetAt ? p.lastResetAt.toISOString() : null,
      createdAt: p.createdAt.toISOString(),
      items: items.filter(i => i.pocketId === p.id).map(i => ({
        id: i.id,
        pocketId: i.pocketId,
        userId: i.userId,
        name: i.name,
        isChecked: i.isChecked,
        createdAt: i.createdAt.toISOString()
      })),
      spent: spentByPocket.get(p.id) || 0
    }))

    const recentRows = await db.select().from(schema.transactions).where(eq(schema.transactions.userId, userId)).orderBy(desc(schema.transactions.occurredAt)).limit(10)
    const recent = recentRows.map(t => ({
      id: t.id,
      userId: t.userId,
      description: t.description,
      amount: Number(t.amount),
      type: t.type,
      category: t.category,
      pocketId: t.pocketId,
      date: t.occurredAt.toISOString()
    }))

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
      userId: string
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
    const rows = await db.insert(schema.pockets).values({
      userId: data.userId,
      name,
      budgetLimit: limitValue != null ? String(limitValue.toFixed ? limitValue.toFixed(2) : limitValue) : null,
      type: data.type,
      resetDay: data.resetDay
    }).returning()
    return rows[0]
  })

export const listPockets = createServerFn({
  method: "GET"
}).inputValidator((data: { userId: string }) => data).handler(async ({ data }) => {
  await ensureMonthlyResets(data.userId)
  const txs = await db.select().from(schema.transactions).where(eq(schema.transactions.userId, data.userId))
  const all = await db.select().from(schema.pockets).where(and(eq(schema.pockets.userId, data.userId), eq(schema.pockets.status, "active")))
  const items = await db.select().from(schema.pocketItems).where(eq(schema.pocketItems.userId, data.userId))
  const spentByPocket = new Map<number, number>()
  for (const tx of txs) {
    if (tx.type === "expense" && tx.pocketId) {
      spentByPocket.set(tx.pocketId, (spentByPocket.get(tx.pocketId) || 0) + Number(tx.amount))
    }
  }
  return all.map((p) => ({
    id: p.id,
    userId: p.userId,
    name: p.name,
    budgetLimit: p.budgetLimit,
    type: p.type,
    status: p.status,
    resetDay: p.resetDay ?? null,
    lastResetAt: p.lastResetAt ? p.lastResetAt.toISOString() : null,
    createdAt: p.createdAt.toISOString(),
    items: items.filter(i => i.pocketId === p.id),
    spent: spentByPocket.get(p.id) || 0
  }))
})

export const archivePocket = createServerFn({
  method: "POST"
})
  .inputValidator((data: { userId: string; id: number }) => data)
  .handler(async ({ data }) => {
    const res = await db.update(schema.pockets).set({ status: "archived" }).where(and(eq(schema.pockets.userId, data.userId), eq(schema.pockets.id, data.id))).returning()
    if (!res[0]) {
      throw new Error("Pocket not found")
    }
    return res[0]
  })

export const createPocketItem = createServerFn({
  method: "POST"
})
  .inputValidator((data: { userId: string; pocketId: number; name: string }) => data)
  .handler(async ({ data }) => {
    if (!data.name.trim()) throw new Error("Item name required")
    const rows = await db.insert(schema.pocketItems).values({
      userId: data.userId,
      pocketId: data.pocketId,
      name: data.name
    }).returning()
    return rows[0]
  })

export const togglePocketItem = createServerFn({
  method: "POST"
})
  .inputValidator((data: { userId: string; id: number }) => data)
  .handler(async ({ data }) => {
    const rows = await db.select().from(schema.pocketItems).where(and(eq(schema.pocketItems.userId, data.userId), eq(schema.pocketItems.id, data.id)))
    const item = rows[0]
    if (!item) throw new Error("Item not found")
    const updated = await db.update(schema.pocketItems).set({ isChecked: !item.isChecked }).where(and(eq(schema.pocketItems.userId, data.userId), eq(schema.pocketItems.id, data.id))).returning()
    return updated[0]
  })

export const deletePocketItem = createServerFn({
  method: "POST"
})
  .inputValidator((data: { userId: string; id: number }) => data)
  .handler(async ({ data }) => {
    await db.delete(schema.pocketItems).where(and(eq(schema.pocketItems.userId, data.userId), eq(schema.pocketItems.id, data.id)))
    return { ok: true }
  })

export const createTransactionFromSmartInput = createServerFn({
  method: "POST"
})
  .inputValidator(
    (data: {
      userId: string
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
    const rows = await db.insert(schema.transactions).values({
      userId: data.userId,
      description: parsed.description,
      amount: String(parsed.amount.toFixed ? parsed.amount.toFixed(2) : parsed.amount),
      type: parsed.type,
      category: categorizationEnabled ? parsed.category : null,
      pocketId,
      occurredAt: new Date(timestamp)
    }).returning()
    return rows[0]
  })

export const deleteTransaction = createServerFn({
  method: "POST"
})
  .inputValidator((data: { userId: string; id: number }) => data)
  .handler(async ({ data }) => {
    await db.delete(schema.transactions).where(and(eq(schema.transactions.userId, data.userId), eq(schema.transactions.id, data.id)))
    return {
      ok: true
    }
  })

export const updatePocketBudget = createServerFn({
  method: "POST"
})
  .inputValidator((data: { userId: string; id: number; budgetLimit: number | null }) => data)
  .handler(async ({ data }) => {
    const rows = await db.update(schema.pockets).set({ budgetLimit: data.budgetLimit != null ? String(data.budgetLimit.toFixed ? data.budgetLimit.toFixed(2) : data.budgetLimit) : null }).where(and(eq(schema.pockets.userId, data.userId), eq(schema.pockets.id, data.id))).returning()
    const pocket = rows[0]
    if (!pocket) {
      throw new Error("Pocket not found")
    }
    return pocket
  })

export const getPocketSpending = createServerFn({
  method: "GET"
})
  .inputValidator((data: { userId: string; pocketId: number }) => data)
  .handler(async ({ data }) => {
    const txs = await db.select().from(schema.transactions).where(and(eq(schema.transactions.userId, data.userId), eq(schema.transactions.pocketId, data.pocketId), eq(schema.transactions.type, "expense")))
    const total = txs.reduce((sum, t) => sum + Number(t.amount), 0)
    return total
  })
