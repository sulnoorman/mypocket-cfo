import { createFileRoute, Link, useRouter } from "@tanstack/react-router"
import type { ComponentType, ReactNode } from "react"
import {
  ArrowDownRight,
  ArrowUpRight,
  LineChart as LineChartIcon,
  Scale,
  Wallet,
  Sparkles
} from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts"
import { useMemo, useState, useEffect } from "react"
import { getDashboardData, createTransactionFromSmartInput } from "~/server/finance"
import { useAppPreferences } from "~/lib/preferences"
import { formatDateFromUnix, formatMoney } from "~/lib/format"
import { askFinanceQuestion } from "~/server/ai"
import { supabase } from "~/lib/supabase"
import MetricCard from "~/components/MetricCard"

export const Route = createFileRoute("/")({
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
  component: DashboardPage
})

function DashboardPage() {
  const router = useRouter()
  const data = Route.useLoaderData()
  const { preferences } = useAppPreferences()
  const [user, setUser] = useState<any>(null)
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const now = new Date()
    setCurrentDate(now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }))
  }, [])

  const username = user?.user_metadata?.username || user?.email || "Guest"

  const [smartText, setSmartText] = useState("")
  const [smartDate, setSmartDate] = useState("")
  const [selectedPocketId, setSelectedPocketId] = useState<string>("")
  const [isSavingSmart, setIsSavingSmart] = useState(false)

  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState<string | null>(null)
  const [isAsking, setIsAsking] = useState(false)

  const [error, setError] = useState<string | null>(null)

  const moneyClass = preferences.privacyMode ? "blur-sm select-none" : ""

  const recentTransactions = useMemo(
    () => data.recentTransactions.slice(0, 3),
    [data.recentTransactions]
  )

  const recentNonGoalPockets = useMemo(() => {
    return data.pockets.filter((p) => p.type !== "project").slice(0, 3)
  }, [data.pockets])

  const netBalance = data.totalIncome - data.totalSpending

  async function refresh() {
    await router.invalidate()
  }

  async function handleSmartSubmit() {
    if (!smartText.trim()) {
      setError("Isi dulu teks transaksi")
      return
    }
    setError(null)
    setIsSavingSmart(true)
    try {
      await createTransactionFromSmartInput({
        data: {
          userId: (await supabase.auth.getSession()).data.session!.user.id,
          text: smartText,
          pocketId:
            selectedPocketId === "" ? null : Number.parseInt(selectedPocketId, 10),
          date: smartDate || null,
          enableSmartCategorization: preferences.smartCategorizationEnabled
        }
      })
      setSmartText("")
      setSmartDate("")
      setSelectedPocketId("")
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan transaksi pintar")
    } finally {
      setIsSavingSmart(false)
    }
  }

  async function handleAsk() {
    if (!question.trim()) {
      setError("Tulis dulu pertanyaan keuangan kamu")
      return
    }
    setError(null)
    setIsAsking(true)
    try {
      const result = await askFinanceQuestion({
        data: {
          question,
          endpoint:
            preferences.showAdvancedAiSettings &&
              preferences.aiEndpointUrl.trim().length > 0
              ? preferences.aiEndpointUrl
              : null,
          systemPrompt: preferences.aiSystemPrompt || null
        }
      })
      setAnswer(result.answer)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menjawab pertanyaan finansial")
    } finally {
      setIsAsking(false)
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      {/* Greating Label */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-lg font-semibold tracking-tight">Welcome back, {username}!</div>
          <div className="text-sm text-mutedForeground">
            {currentDate}
          </div>
        </div>
      </div>
      <div className="text-xs text-mutedForeground">
        {preferences.privacyMode ? "Privacy mode: on" : "Privacy mode: off"}
      </div>

      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground">
          {error}
        </div>
      )}

      <section className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Total Pemasukan"
          value={formatMoney(Math.max(0, data.totalIncome), preferences.currency)}
          valueClassName={moneyClass}
          tone="positive"
          icon={ArrowUpRight}
        />
        <MetricCard
          title="Total Pengeluaran"
          value={formatMoney(Math.max(0, data.totalSpending), preferences.currency)}
          valueClassName={moneyClass}
          tone="negative"
          icon={ArrowDownRight}
        />
        <MetricCard
          title="Net Balance"
          value={formatMoney(netBalance, preferences.currency)}
          valueClassName={moneyClass}
          tone={netBalance >= 0 ? "neutral" : "negative"}
          icon={Scale}
        />
      </section>

      <section className="flex flex-col gap-6">
        <Card>
          <CardHeader
            title="Smart Input"
            description={
              preferences.smartCategorizationEnabled
                ? "Auto-tagging aktif · kategori otomatis"
                : "Auto-tagging nonaktif · kategori manual"
            }
            icon={Sparkles}
          />
          <div className="mt-4 flex flex-col gap-3">
            <textarea
              value={smartText}
              onChange={(e) => setSmartText(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-lg border border-border/60 bg-input px-3 py-2 text-sm outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
              placeholder="Contoh: nambah jajan kopi 25rb, gaji masuk 5jt"
            />
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <select
                  value={selectedPocketId}
                  onChange={(e) => setSelectedPocketId(e.target.value)}
                  className="h-9 rounded-md border border-border/60 bg-input px-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                >
                  <option value="">Tanpa pocket</option>
                  {data.pockets.map((pocket) => (
                    <option key={pocket.id} value={pocket.id}>
                      {pocket.name}
                    </option>
                  ))}
                </select>
                <input
                  type="date"
                  value={smartDate}
                  onChange={(e) => setSmartDate(e.target.value)}
                  className="h-9 rounded-md border border-border/60 bg-input px-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <button
                type="button"
                onClick={handleSmartSubmit}
                disabled={isSavingSmart}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-sky-500 px-3 text-xs font-medium text-background transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSavingSmart ? "Menyimpan..." : "Simpan transaksi"}
              </button>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Monthly Expense Trend"
            description="Tren pengeluaran beberapa bulan terakhir."
            icon={LineChartIcon}
          />
          <div className="mt-4 h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.expenseTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "rgba(148,163,184,0.9)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(148,163,184,0.2)" }}
                  tickLine={{ stroke: "rgba(148,163,184,0.2)" }}
                />
                <YAxis
                  tick={{ fill: "rgba(148,163,184,0.9)", fontSize: 12 }}
                  axisLine={{ stroke: "rgba(148,163,184,0.2)" }}
                  tickLine={{ stroke: "rgba(148,163,184,0.2)" }}
                  tickFormatter={(v) =>
                    preferences.privacyMode ? "•••" : formatCompactNumber(v)
                  }
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(2,6,23,0.95)",
                    border: "1px solid rgba(31,41,55,0.8)",
                    borderRadius: 12
                  }}
                  labelStyle={{ color: "rgba(226,232,240,0.9)" }}
                  itemStyle={{ color: "rgba(226,232,240,0.9)" }}
                  formatter={(v) =>
                    preferences.privacyMode
                      ? ["•••••", "Expense"]
                      : [formatMoney(Number(v), preferences.currency), "Expense"]
                  }
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={{ r: 3, stroke: "#38bdf8", fill: "#38bdf8" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <section className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader
              title="Recent Transactions"
              description="3 transaksi terakhir"
              icon={ArrowDownRight}
            />
            <div className="mt-4">
              {recentTransactions.length === 0 ? (
                <EmptyState text="Belum ada transaksi. Coba input dari halaman Pockets." />
              ) : (
                <ul className="flex flex-col gap-2">
                  {recentTransactions.map((tx) => (
                    <li
                      key={tx.id}
                      className="flex items-start justify-between gap-3 rounded-md border border-border/60 bg-background/50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">
                          {tx.description}
                        </div>
                        <div className="mt-0.5 text-xs text-mutedForeground">
                          {formatDateFromUnix(Math.floor(new Date(tx.date as any).getTime() / 1000))}
                          {tx.category ? ` · ${tx.category}` : ""}
                        </div>
                      </div>
                      <div
                        className={[
                          "text-sm font-semibold",
                          tx.type === "income"
                            ? "text-emerald-400"
                            : "text-rose-400",
                          moneyClass
                        ].join(" ")}
                      >
                        {tx.type === "income" ? "+" : "-"}{" "}
                        {formatMoney(tx.amount, preferences.currency)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Link
                to="/pockets"
                className="inline-flex items-center justify-center rounded-md border border-border/60 bg-background/40 px-3 py-2 text-xs font-medium text-mutedForeground transition hover:border-sky-500/40 hover:text-foreground"
              >
                Manage transactions
              </Link>
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Pockets (Non-goals)"
              description="3 pocket aktif (exclude goals/project)."
              icon={Wallet}
            />
            <div className="mt-4">
              {recentNonGoalPockets.length === 0 ? (
                <EmptyState text="Belum ada pocket non-goals. Buat recurring pocket di halaman Pockets." />
              ) : (
                <ul className="flex flex-col gap-2">
                  {recentNonGoalPockets.map((p) => (
                    <li
                      key={p.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background/50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-mutedForeground">
                          {p.type === "recurring"
                            ? `Reset day: ${p.resetDay || 1}`
                            : "Active"}
                        </div>
                      </div>
                      <div className={["text-xs text-mutedForeground", moneyClass].join(" ")}>
                        {p.budgetLimit ? (
                          <>
                            {formatMoney(p.spent, preferences.currency)} /{" "}
                            {formatMoney(p.budgetLimit, preferences.currency)}
                          </>
                        ) : (
                          formatMoney(p.spent, preferences.currency)
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="mt-4 flex justify-end">
              <Link
                to="/pockets"
                className="inline-flex items-center justify-center rounded-md border border-border/60 bg-background/40 px-3 py-2 text-xs font-medium text-mutedForeground transition hover:border-sky-500/40 hover:text-foreground"
              >
                View all pockets
              </Link>
            </div>
          </Card>

          {preferences.ragAiAnalysisEnabled && (
            <Card>
              <CardHeader
                title="Ask Your CFO"
                description="Rule-based sekarang, siap diupgrade ke Transformers.js."
                icon={Sparkles}
              />
              <div className="mt-4 flex flex-col gap-3">
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-border/60 bg-input px-3 py-2 text-sm outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  placeholder="Contoh: Berapa total jajan bulan lalu?"
                />
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={handleAsk}
                    disabled={isAsking}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-slate-800 px-3 text-sm font-medium text-foreground ring-1 ring-slate-600 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isAsking ? "Memikirkan..." : "Tanya CFO"}
                  </button>
                  <span className="text-xs text-mutedForeground">AI analysis: on</span>
                </div>
                {answer && (
                  <div className="mt-2 rounded-md border border-border/60 bg-background/50 px-3 py-2 text-sm text-foreground max-h-32 overflow-auto">
                    {answer}
                  </div>
                )}
              </div>
            </Card>
          )}
        </section>
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

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-border/60 px-3 py-6 text-center text-sm text-mutedForeground">
      {text}
    </div>
  )
}

function formatCompactNumber(value: number): string {
  if (!Number.isFinite(value)) return "0"
  if (value >= 1000000000) return `${Math.round(value / 100000000) / 10}B`
  if (value >= 1000000) return `${Math.round(value / 100000) / 10}M`
  if (value >= 1000) return `${Math.round(value / 100) / 10}K`
  return String(Math.round(value))
}
