import { createFileRoute } from "@tanstack/react-router"
import { useState, useMemo } from "react"
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Search, 
  Calendar as CalendarIcon,
  Tag,
  Wallet,
  Trash2,
  X
} from "lucide-react"
import { getAllTransactions, deleteTransaction } from "~/server/finance"
import { supabase } from "~/lib/supabase"
import { useAppPreferences } from "~/lib/preferences"
import { formatMoney, formatDateFromUnix } from "~/lib/format"
import { useRouter } from "@tanstack/react-router"

export const Route = createFileRoute("/transactions")({
  loader: async () => {
    const { data } = await supabase.auth.getSession()
    const userId = data.session?.user.id
    if (!userId) return []
    return getAllTransactions({ data: { userId } })
  },
  component: TransactionsPage
})

function TransactionsPage() {
  const router = useRouter()
  const transactions = Route.useLoaderData()
  const { preferences } = useAppPreferences()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  
  const categories = useMemo(() => {
    const cats = new Set<string>()
    transactions.forEach(tx => {
      if (tx.category) cats.add(tx.category)
    })
    return ["all", ...Array.from(cats)]
  }, [transactions])

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(search.toLowerCase()) || 
                           (tx.category?.toLowerCase().includes(search.toLowerCase()) ?? false)
      const matchesType = typeFilter === "all" || tx.type === typeFilter
      const matchesCategory = categoryFilter === "all" || tx.category === categoryFilter
      return matchesSearch && matchesType && matchesCategory
    })
  }, [transactions, search, typeFilter, categoryFilter])

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this transaction?")) return
    const { data } = await supabase.auth.getSession()
    if (!data.session) return
    await deleteTransaction({ data: { userId: data.session.user.id, id } })
    router.invalidate()
  }

  const moneyClass = preferences.privacyMode ? "blur-sm select-none" : ""

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Audit Transaksi</h1>
        <p className="text-sm text-mutedForeground">
          Lihat, filter, dan kelola semua riwayat keuangan kamu.
        </p>
      </div>

      {/* Filters Section */}
      <div className="grid gap-4 rounded-xl border border-border/60 bg-card/40 p-4 shadow-sm md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mutedForeground" />
          <input
            type="text"
            placeholder="Cari deskripsi atau kategori..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded-lg border border-border/60 bg-background/50 pl-10 pr-3 text-sm outline-none focus:border-sky-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as any)}
          className="h-10 w-full rounded-lg border border-border/60 bg-background/50 px-3 text-sm outline-none focus:border-sky-500"
        >
          <option value="all">Semua Tipe</option>
          <option value="income">Pemasukan (+)</option>
          <option value="expense">Pengeluaran (-)</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 w-full rounded-lg border border-border/60 bg-background/50 px-3 text-sm outline-none focus:border-sky-500"
        >
          <option value="all">Semua Kategori</option>
          {categories.filter(c => c !== "all").map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <div className="flex items-center justify-end text-xs text-mutedForeground">
          Menampilkan {filteredTransactions.length} transaksi
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex flex-col gap-3">
        {filteredTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 py-12 text-mutedForeground">
            <X className="mb-2 h-8 w-8 opacity-20" />
            <p>Tidak ada transaksi yang ditemukan.</p>
          </div>
        ) : (
          filteredTransactions.map((tx) => (
            <div 
              key={tx.id}
              className="group relative flex items-center justify-between gap-4 rounded-xl border border-border/60 bg-card/30 p-4 transition hover:bg-card/50"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${
                  tx.type === "income" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                }`}>
                  {tx.type === "income" ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground truncate">{tx.description}</span>
                    {tx.category && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-medium text-sky-400 border border-sky-500/20">
                        <Tag className="h-2.5 w-2.5" />
                        {tx.category}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-mutedForeground">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="h-3 w-3" />
                      {formatDateFromUnix(Math.floor(new Date(tx.date).getTime() / 1000))}
                    </span>
                    {tx.pocketId && (
                      <span className="flex items-center gap-1">
                        <Wallet className="h-3 w-3" />
                        Pocket ID: {tx.pocketId}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`text-right ${moneyClass}`}>
                  <div className={`text-sm font-bold ${
                    tx.type === "income" ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {tx.type === "income" ? "+" : "-"} {formatMoney(tx.amount, preferences.currency)}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(tx.id)}
                  className="rounded-md p-2 text-mutedForeground opacity-0 transition hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
                  title="Hapus transaksi"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
