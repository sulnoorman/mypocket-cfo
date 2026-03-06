export type PocketRecord = {
  id: number
  name: string
  budgetLimit: number | null
  type: "recurring" | "project"
  status: "active" | "archived"
  resetDay?: number
  lastResetDate?: number
  createdAt: number
}

export type PocketItemRecord = {
  id: number
  pocketId: number
  name: string
  isChecked: boolean
}

export type TransactionRecord = {
  id: number
  description: string
  amount: number
  type: "income" | "expense"
  category: string | null
  pocketId: number | null
  date: number
  createdAt: number
}

const pockets: PocketRecord[] = []
const pocketItems: PocketItemRecord[] = []
const transactions: TransactionRecord[] = []

let nextPocketId = 1
let nextPocketItemId = 1
let nextTransactionId = 1

export function createPocketRecord(params: {
  name: string
  budgetLimit: number | null
  type: "recurring" | "project"
  resetDay?: number
}): PocketRecord {
  const record: PocketRecord = {
    id: nextPocketId++,
    name: params.name,
    budgetLimit: params.budgetLimit,
    type: params.type,
    status: "active",
    resetDay: params.resetDay,
    lastResetDate: Math.floor(Date.now() / 1000),
    createdAt: Math.floor(Date.now() / 1000)
  }
  pockets.push(record)
  return record
}

export function updatePocketBudgetRecord(
  id: number,
  budgetLimit: number | null
): PocketRecord | null {
  const pocket = pockets.find((p) => p.id === id)
  if (!pocket) {
    return null
  }
  pocket.budgetLimit = budgetLimit
  return pocket
}

export function archivePocketRecord(id: number): PocketRecord | null {
  const pocket = pockets.find((p) => p.id === id)
  if (!pocket) {
    return null
  }
  pocket.status = "archived"
  return pocket
}

export function listPocketRecords(): PocketRecord[] {
  // Simple check for recurring reset on list
  const now = new Date()
  const dayOfMonth = now.getDate()
  
  pockets.forEach(p => {
    if (p.type === "recurring" && p.status === "active" && p.resetDay && p.lastResetDate) {
      const lastReset = new Date(p.lastResetDate * 1000)
      // If we are past the reset day in the current month, and last reset was in a previous month
      // OR if today is the reset day and we haven't reset today
      // Simplified logic: If last reset was in a different month/year, and today >= resetDay
      
      const isDifferentMonth = lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear()
      if (isDifferentMonth && dayOfMonth >= p.resetDay) {
        // Trigger reset
        const items = pocketItems.filter(i => i.pocketId === p.id)
        items.forEach(i => i.isChecked = false)
        p.lastResetDate = Math.floor(now.getTime() / 1000)
      }
    }
  })

  return pockets.filter(p => p.status === "active").slice().sort((a, b) => a.id - b.id)
}

// Item functions
export function createPocketItemRecord(params: {
  pocketId: number
  name: string
}): PocketItemRecord {
  const record: PocketItemRecord = {
    id: nextPocketItemId++,
    pocketId: params.pocketId,
    name: params.name,
    isChecked: false
  }
  pocketItems.push(record)
  return record
}

export function togglePocketItemRecord(id: number): PocketItemRecord | null {
  const item = pocketItems.find(i => i.id === id)
  if (!item) return null
  item.isChecked = !item.isChecked
  return item
}

export function deletePocketItemRecord(id: number): void {
  const index = pocketItems.findIndex(i => i.id === id)
  if (index !== -1) {
    pocketItems.splice(index, 1)
  }
}

export function listPocketItems(pocketId: number): PocketItemRecord[] {
  return pocketItems.filter(i => i.pocketId === pocketId)
}

export function createTransactionRecord(params: {
  description: string
  amount: number
  type: "income" | "expense"
  category: string | null
  pocketId: number | null
  date: number
}): TransactionRecord {
  const record: TransactionRecord = {
    id: nextTransactionId++,
    description: params.description,
    amount: params.amount,
    type: params.type,
    category: params.category,
    pocketId: params.pocketId,
    date: params.date,
    createdAt: Math.floor(Date.now() / 1000)
  }
  transactions.push(record)
  return record
}

export function deleteTransactionRecord(id: number): void {
  const index = transactions.findIndex((tx) => tx.id === id)
  if (index !== -1) {
    transactions.splice(index, 1)
  }
}

export function listRecentTransactions(limit: number): TransactionRecord[] {
  return transactions
    .slice()
    .sort((a, b) => b.date - a.date || b.id - a.id)
    .slice(0, limit)
}

export function totalAmountByType(type: "income" | "expense"): number {
  return transactions
    .filter((tx) => tx.type === type)
    .reduce((sum, tx) => sum + tx.amount, 0)
}

export function totalPocketSpending(pocketId: number): number {
  return transactions
    .filter((tx) => tx.pocketId === pocketId && tx.type === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0)
}

export function listAllTransactions(): TransactionRecord[] {
  return transactions.slice()
}
