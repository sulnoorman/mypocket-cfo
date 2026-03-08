import { createFileRoute, useRouter } from "@tanstack/react-router"
import type { ComponentType, ReactNode } from "react"
import { useState } from "react"
import { useEffect } from "react"
import {
  Archive,
  CheckCircle2,
  Circle,
  Plus,
  Repeat,
  Target,
  Trash2,
  Wallet
} from "lucide-react"
import {
  archivePocket,
  createPocket,
  createPocketItem,
  deletePocketItem,
  getDashboardData,
  togglePocketItem
} from "~/server/finance"
import type { Pocket } from "~/server/finance"
import { formatMoney } from "~/lib/format"
import { useAppPreferences } from "~/lib/preferences"
import { supabase } from "~/lib/supabase"

export const Route = createFileRoute("/pockets")({
  loader: async () => {
    const { data } = await supabase.auth.getSession()
    const userId = data.session?.user.id
    if (!userId) {
      return {
        totalIncome: 0,
        totalSpending: 0,
        remaining: 0,
        expenseTrend: [],
        pockets: [],
        recentTransactions: []
      }
    }
    return getDashboardData({ data: { userId } })
  },
  component: PocketsPage
})

function PocketsPage() {
  const router = useRouter()
  const { preferences } = useAppPreferences()
  const data = Route.useLoaderData()
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    const now = new Date()
    setCurrentDate(now.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }))
  }, [])

  const [pocketName, setPocketName] = useState("")
  const [pocketBudget, setPocketBudget] = useState("")
  const [pocketType, setPocketType] = useState<"recurring" | "project">("project")
  const [pocketResetDay, setPocketResetDay] = useState("1")
  const [isCreatingPocket, setIsCreatingPocket] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const moneyClass = preferences.privacyMode ? "blur-sm select-none" : ""

  async function refresh() {
    await router.invalidate()
  }

  async function handleCreatePocket() {
    if (!pocketName.trim()) {
      setError("Nama pocket wajib diisi")
      return
    }
    setError(null)
    setIsCreatingPocket(true)
    try {
      const budget =
        pocketBudget.trim().length === 0
          ? null
          : Number.parseInt(pocketBudget.trim(), 10)

      const resetDay =
        pocketType === "recurring" ? Number.parseInt(pocketResetDay, 10) : undefined

      await createPocket({
        data: {
          userId: (await supabase.auth.getSession()).data.session!.user.id,
          name: pocketName,
          budgetLimit: Number.isNaN(budget) ? null : budget,
          type: pocketType,
          resetDay
        }
      })
      setPocketName("")
      setPocketBudget("")
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membuat pocket")
    } finally {
      setIsCreatingPocket(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold tracking-tight">Pockets</div>
          <div className="text-sm text-mutedForeground">
            Manage your budgets and goals — {currentDate}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
          {error}
        </div>
      )}

      <section className="flex flex-col gap-4">
        <Card>
          <CardHeader
            title="Create Pocket"
            description="Project/goal or recurring checklist."
            icon={Wallet}
          />
          <div className="mt-4 grid gap-3">
            <div className="grid gap-3 md:grid-cols-2">
              <input
                value={pocketName}
                onChange={(e) => setPocketName(e.target.value)}
                placeholder="Nama pocket (Daily, Bills...)"
                className="h-9 rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
              <input
                value={pocketBudget}
                onChange={(e) => setPocketBudget(e.target.value)}
                placeholder="Limit (opsional)"
                className="h-9 rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              />
            </div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <select
                value={pocketType}
                onChange={(e) => setPocketType(e.target.value as any)}
                className="h-9 rounded-md border border-border/60 bg-input px-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              >
                <option value="project">Project / Goal</option>
                <option value="recurring">Recurring (Monthly)</option>
              </select>
              {pocketType === "recurring" && (
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={pocketResetDay}
                  onChange={(e) => setPocketResetDay(e.target.value)}
                  placeholder="Reset day (1-31)"
                  className="h-9 w-full md:w-40 rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  title="Day of month to reset checked items"
                />
              )}
              <button
                type="button"
                onClick={handleCreatePocket}
                disabled={isCreatingPocket}
                className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-slate-800 px-3 text-sm font-medium text-foreground ring-1 ring-slate-600 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Plus className="h-4 w-4" />
                Buat Pocket
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="All Pockets"
            description="Active pockets with progress."
            icon={Wallet}
          />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {data.pockets.map((pocket) => (
              <PocketCard
                key={pocket.id}
                pocket={pocket}
                currency={preferences.currency}
                privacyMode={preferences.privacyMode}
                onRefresh={refresh}
              />
            ))}
            {data.pockets.length === 0 && (
              <div className="col-span-full py-10 text-center text-sm text-mutedForeground">
                Belum ada pocket. Buat satu di atas.
              </div>
            )}
          </div>
        </Card>
      </section>
    </div>
  )
}

function Card({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/40 p-4 shadow-sm shadow-sky-500/5">
      {children}
    </div>
  )
}

function CardHeader({
  title,
  description,
  icon: Icon
}: {
  title: string
  description: string
  icon: ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xs text-mutedForeground">{description}</div>
      </div>
      <div className="rounded-md border border-border/60 bg-background/40 p-2 text-sky-400">
        <Icon className="h-4 w-4" />
      </div>
    </div>
  )
}

function PocketCard({
  pocket,
  currency,
  privacyMode,
  onRefresh
}: {
  pocket: Pocket
  currency: "IDR" | "USD"
  privacyMode: boolean
  onRefresh: () => void
}) {
  const [itemName, setItemName] = useState("")
  const [isAddingItem, setIsAddingItem] = useState(false)
  const isRecurring = pocket.type === "recurring"
  const moneyClass = privacyMode ? "blur-sm select-none" : ""

  const progress = isRecurring
    ? pocket.items.length > 0
      ? (pocket.items.filter((i) => i.isChecked).length / pocket.items.length) *
        100
      : 0
    : pocket.budgetLimit
      ? Math.min((pocket.spent / pocket.budgetLimit) * 100, 100)
      : 0

  const isProjectComplete =
    !isRecurring && pocket.budgetLimit && pocket.spent >= pocket.budgetLimit

  async function handleAddItem() {
    if (!itemName.trim()) return
    setIsAddingItem(true)
    try {
      await createPocketItem({ data: { userId: (await supabase.auth.getSession()).data.session!.user.id, pocketId: pocket.id, name: itemName } })
      setItemName("")
      onRefresh()
    } finally {
      setIsAddingItem(false)
    }
  }

  async function handleToggleItem(id: number) {
    await togglePocketItem({ data: { userId: (await supabase.auth.getSession()).data.session!.user.id, id } })
    onRefresh()
  }

  async function handleDeleteItem(id: number) {
    await deletePocketItem({ data: { userId: (await supabase.auth.getSession()).data.session!.user.id, id } })
    onRefresh()
  }

  async function handleArchive() {
    if (confirm("Archive this pocket?")) {
      await archivePocket({ data: { userId: (await supabase.auth.getSession()).data.session!.user.id, id: pocket.id } })
      onRefresh()
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border/60 bg-background/50 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-medium text-sm truncate">{pocket.name}</span>
            {isRecurring ? (
              <Repeat className="h-3.5 w-3.5 text-sky-400" />
            ) : (
              <Target className="h-3.5 w-3.5 text-emerald-400" />
            )}
          </div>
          <span className="text-[11px] text-mutedForeground">
            {isRecurring
              ? `Reset day: ${pocket.resetDay || 1}`
              : pocket.budgetLimit
                ? `Limit: ${formatMoney(pocket.budgetLimit, currency)}`
                : "No limit"}
          </span>
        </div>
        <button
          onClick={handleArchive}
          className="text-mutedForeground hover:text-destructive"
          title="Archive Pocket"
        >
          <Archive className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex justify-between text-[11px] text-mutedForeground">
          <span>Progress</span>
          <span className={moneyClass}>
            {isRecurring
              ? `${pocket.items.filter((i) => i.isChecked).length}/${pocket.items.length}`
              : `${formatMoney(pocket.spent, currency)}`}
          </span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary/30">
          <div
            className={`h-full transition-all duration-500 ${
              isRecurring ? "bg-sky-500" : "bg-emerald-500"
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {isRecurring && (
        <div className="flex flex-col gap-2">
          <ul className="flex flex-col gap-1.5">
            {pocket.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2">
                <button
                  onClick={() => handleToggleItem(item.id)}
                  className="flex flex-1 items-center gap-2 text-left min-w-0"
                >
                  {item.isChecked ? (
                    <CheckCircle2 className="h-4 w-4 text-sky-500" />
                  ) : (
                    <Circle className="h-4 w-4 text-mutedForeground" />
                  )}
                  <span
                    className={`text-sm truncate ${
                      item.isChecked
                        ? "text-mutedForeground line-through"
                        : "text-foreground"
                    }`}
                  >
                    {item.name}
                  </span>
                </button>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 text-mutedForeground hover:border-rose-500/60 hover:text-rose-400"
                  title="Delete item"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2">
            <input
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="Add item..."
              className="h-9 flex-1 rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500"
              onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
            />
            <button
              onClick={handleAddItem}
              disabled={isAddingItem}
              className="inline-flex h-9 w-10 items-center justify-center rounded-md bg-secondary/30 hover:bg-secondary/40 disabled:opacity-60"
              title="Add item"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {!isRecurring && isProjectComplete && (
        <button
          onClick={handleArchive}
          className="mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500/10 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20"
        >
          <CheckCircle2 className="h-4 w-4" />
          Goal Achieved! Archive
        </button>
      )}
    </div>
  )
}
