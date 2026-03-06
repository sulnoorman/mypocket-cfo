import { jsxs, jsx } from "react/jsx-runtime";
import { useRouter } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Sparkles, Wallet, Plus, ArrowDownRight, Trash2, Repeat, Target, Archive, CheckCircle2, Circle } from "lucide-react";
import { c as createSsrRpc, u as useAppPreferences, R as Route, a as createTransactionFromSmartInput, b as createPocket, d as deleteTransaction, e as archivePocket, t as togglePocketItem, f as deletePocketItem, g as createPocketItem } from "./router-C_hNtkw0.js";
import { c as createServerFn } from "../server.js";
import { f as formatMoney, a as formatDateFromUnix } from "./format-CczPE23T.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
const askFinanceQuestion = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createSsrRpc("ee4dee9efeb78155814e621f49b93f21ea3413e86e3100280d38adcaa8983e2a"));
function PocketsPage() {
  const router = useRouter();
  const {
    preferences
  } = useAppPreferences();
  const data = Route.useLoaderData();
  const [smartText, setSmartText] = useState("");
  const [smartDate, setSmartDate] = useState("");
  const [selectedPocketId, setSelectedPocketId] = useState("");
  const [isSavingSmart, setIsSavingSmart] = useState(false);
  const [pocketName, setPocketName] = useState("");
  const [pocketBudget, setPocketBudget] = useState("");
  const [pocketType, setPocketType] = useState("project");
  const [pocketResetDay, setPocketResetDay] = useState("1");
  const [isCreatingPocket, setIsCreatingPocket] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState(null);
  const moneyClass = preferences.privacyMode ? "blur-sm select-none" : "";
  const pocketNameById = useMemo(() => {
    const map = /* @__PURE__ */ new Map();
    for (const p of data.pockets) map.set(p.id, p.name);
    return map;
  }, [data.pockets]);
  async function refresh() {
    await router.invalidate();
  }
  async function handleCreatePocket() {
    if (!pocketName.trim()) {
      setError("Nama pocket wajib diisi");
      return;
    }
    setError(null);
    setIsCreatingPocket(true);
    try {
      const budget = pocketBudget.trim().length === 0 ? null : Number.parseInt(pocketBudget.trim(), 10);
      const resetDay = pocketType === "recurring" ? Number.parseInt(pocketResetDay, 10) : void 0;
      await createPocket({
        data: {
          name: pocketName,
          budgetLimit: Number.isNaN(budget) ? null : budget,
          type: pocketType,
          resetDay
        }
      });
      setPocketName("");
      setPocketBudget("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal membuat pocket");
    } finally {
      setIsCreatingPocket(false);
    }
  }
  async function handleSmartSubmit() {
    if (!smartText.trim()) {
      setError("Isi dulu teks transaksi");
      return;
    }
    setError(null);
    setIsSavingSmart(true);
    try {
      await createTransactionFromSmartInput({
        data: {
          text: smartText,
          pocketId: selectedPocketId === "" ? null : Number.parseInt(selectedPocketId, 10),
          date: smartDate || null,
          enableSmartCategorization: preferences.smartCategorizationEnabled
        }
      });
      setSmartText("");
      setSmartDate("");
      setSelectedPocketId("");
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menyimpan transaksi pintar");
    } finally {
      setIsSavingSmart(false);
    }
  }
  async function handleDeleteTransaction(id) {
    setError(null);
    try {
      await deleteTransaction({
        data: {
          id
        }
      });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menghapus transaksi");
    }
  }
  async function handleAsk() {
    if (!question.trim()) {
      setError("Tulis dulu pertanyaan keuangan kamu");
      return;
    }
    setError(null);
    setIsAsking(true);
    try {
      const result = await askFinanceQuestion({
        data: {
          question
        }
      });
      setAnswer(result.answer);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal menjawab pertanyaan finansial");
    } finally {
      setIsAsking(false);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto flex w-full max-w-6xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "text-lg font-semibold tracking-tight", children: "Pockets" }),
      /* @__PURE__ */ jsx("div", { className: "text-sm text-mutedForeground", children: "Organize budgets, recurring checklists, and smart input." })
    ] }),
    error && /* @__PURE__ */ jsx("div", { className: "rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs text-destructive-foreground", children: error }),
    /* @__PURE__ */ jsxs("section", { className: "grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { title: "Smart Input", description: preferences.smartCategorizationEnabled ? "Auto-tagging aktif" : "Auto-tagging nonaktif", icon: Sparkles }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col gap-3", children: [
            /* @__PURE__ */ jsx("textarea", { value: smartText, onChange: (e) => setSmartText(e.target.value), rows: 3, className: "w-full resize-none rounded-lg border border-border/60 bg-input px-3 py-2 text-sm outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-500", placeholder: "Contoh: nambah jajan kopi 25rb, gaji masuk 5jt" }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center md:justify-between", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-3", children: [
                /* @__PURE__ */ jsxs("select", { value: selectedPocketId, onChange: (e) => setSelectedPocketId(e.target.value), className: "h-9 rounded-md border border-border/60 bg-input px-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500", children: [
                  /* @__PURE__ */ jsx("option", { value: "", children: "Tanpa pocket" }),
                  data.pockets.map((pocket) => /* @__PURE__ */ jsx("option", { value: pocket.id, children: pocket.name }, pocket.id))
                ] }),
                /* @__PURE__ */ jsx("input", { type: "date", value: smartDate, onChange: (e) => setSmartDate(e.target.value), className: "h-9 rounded-md border border-border/60 bg-input px-2 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" })
              ] }),
              /* @__PURE__ */ jsx("button", { type: "button", onClick: handleSmartSubmit, disabled: isSavingSmart, className: "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-sky-500 px-3 text-xs font-medium text-background transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60", children: isSavingSmart ? "Menyimpan..." : "Simpan transaksi" })
            ] })
          ] })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { title: "Create Pocket", description: "Project/goal or recurring checklist.", icon: Wallet }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 grid gap-3", children: [
            /* @__PURE__ */ jsxs("div", { className: "grid gap-3 md:grid-cols-2", children: [
              /* @__PURE__ */ jsx("input", { value: pocketName, onChange: (e) => setPocketName(e.target.value), placeholder: "Nama pocket (Daily, Bills...)", className: "h-9 rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" }),
              /* @__PURE__ */ jsx("input", { value: pocketBudget, onChange: (e) => setPocketBudget(e.target.value), placeholder: "Limit (opsional)", className: "h-9 rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500" })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 md:flex-row md:items-center", children: [
              /* @__PURE__ */ jsxs("select", { value: pocketType, onChange: (e) => setPocketType(e.target.value), className: "h-9 rounded-md border border-border/60 bg-input px-2 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500", children: [
                /* @__PURE__ */ jsx("option", { value: "project", children: "Project / Goal" }),
                /* @__PURE__ */ jsx("option", { value: "recurring", children: "Recurring (Monthly)" })
              ] }),
              pocketType === "recurring" && /* @__PURE__ */ jsx("input", { type: "number", min: "1", max: "31", value: pocketResetDay, onChange: (e) => setPocketResetDay(e.target.value), placeholder: "Reset day (1-31)", className: "h-9 w-full md:w-40 rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500", title: "Day of month to reset checked items" }),
              /* @__PURE__ */ jsxs("button", { type: "button", onClick: handleCreatePocket, disabled: isCreatingPocket, className: "inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-slate-800 px-3 text-sm font-medium text-foreground ring-1 ring-slate-600 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60", children: [
                /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }),
                "Buat Pocket"
              ] })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "mt-5 grid gap-4 sm:grid-cols-2", children: [
            data.pockets.map((pocket) => /* @__PURE__ */ jsx(PocketCard, { pocket, currency: preferences.currency, privacyMode: preferences.privacyMode, onRefresh: refresh }, pocket.id)),
            data.pockets.length === 0 && /* @__PURE__ */ jsx("div", { className: "col-span-full py-10 text-center text-sm text-mutedForeground", children: "Belum ada pocket. Buat satu di atas." })
          ] })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-4", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { title: "Recent Transactions", description: "10 transaksi terakhir", icon: ArrowDownRight }),
          /* @__PURE__ */ jsx("div", { className: "mt-4", children: data.recentTransactions.length === 0 ? /* @__PURE__ */ jsx("div", { className: "rounded-md border border-dashed border-border/60 px-3 py-6 text-center text-sm text-mutedForeground", children: "Belum ada transaksi." }) : /* @__PURE__ */ jsx("ul", { className: "flex flex-col gap-2 text-sm", children: data.recentTransactions.map((tx) => /* @__PURE__ */ jsxs("li", { className: "flex items-start justify-between gap-3 rounded-md border border-border/60 bg-background/50 px-3 py-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex flex-1 flex-col gap-0.5 min-w-0", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
                /* @__PURE__ */ jsx("span", { className: "truncate font-medium", children: tx.description }),
                /* @__PURE__ */ jsxs("span", { className: ["text-xs font-medium", tx.type === "income" ? "text-emerald-400" : "text-rose-400", moneyClass].join(" "), children: [
                  tx.type === "income" ? "+" : "-",
                  " ",
                  formatMoney(tx.amount, preferences.currency)
                ] })
              ] }),
              /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs text-mutedForeground", children: [
                tx.category && /* @__PURE__ */ jsx("span", { className: "rounded-full border border-border/60 px-2 py-0.5", children: tx.category }),
                tx.pocketId != null && /* @__PURE__ */ jsx("span", { className: "rounded-full border border-border/60 px-2 py-0.5", children: pocketNameById.get(tx.pocketId) ?? "Pocket" }),
                /* @__PURE__ */ jsx("span", { children: formatDateFromUnix(tx.date) })
              ] })
            ] }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => handleDeleteTransaction(tx.id), className: "ml-1 inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-border/60 text-mutedForeground hover:border-rose-500 hover:text-rose-400", title: "Delete", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
          ] }, tx.id)) }) })
        ] }),
        preferences.ragAiAnalysisEnabled && /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { title: "Ask Your CFO", description: "Rule-based now, ready for Transformers.js later.", icon: Sparkles }),
          /* @__PURE__ */ jsxs("div", { className: "mt-4 flex flex-col gap-3", children: [
            /* @__PURE__ */ jsx("textarea", { value: question, onChange: (e) => setQuestion(e.target.value), rows: 2, className: "w-full resize-none rounded-lg border border-border/60 bg-input px-3 py-2 text-sm outline-none ring-0 focus:border-sky-500 focus:ring-1 focus:ring-sky-500", placeholder: "Contoh: Berapa total jajan bulan lalu?" }),
            /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
              /* @__PURE__ */ jsx("button", { type: "button", onClick: handleAsk, disabled: isAsking, className: "inline-flex h-9 items-center justify-center gap-2 rounded-md bg-slate-800 px-3 text-sm font-medium text-foreground ring-1 ring-slate-600 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60", children: isAsking ? "Memikirkan..." : "Tanya CFO" }),
              /* @__PURE__ */ jsx("span", { className: "text-xs text-mutedForeground", children: "AI analysis: on" })
            ] }),
            answer && /* @__PURE__ */ jsx("div", { className: "rounded-md border border-border/60 bg-background/50 px-3 py-2 text-sm text-foreground", children: answer })
          ] })
        ] })
      ] })
    ] })
  ] });
}
function Card({
  children
}) {
  return /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-border/60 bg-card/40 p-4 shadow-sm shadow-sky-500/5", children });
}
function CardHeader({
  title,
  description,
  icon: Icon
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "text-sm font-semibold", children: title }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-mutedForeground", children: description })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-md border border-border/60 bg-background/40 p-2 text-sky-400", children: /* @__PURE__ */ jsx(Icon, { className: "h-4 w-4" }) })
  ] });
}
function PocketCard({
  pocket,
  currency,
  privacyMode,
  onRefresh
}) {
  const [itemName, setItemName] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const isRecurring = pocket.type === "recurring";
  const moneyClass = privacyMode ? "blur-sm select-none" : "";
  const progress = isRecurring ? pocket.items.length > 0 ? pocket.items.filter((i) => i.isChecked).length / pocket.items.length * 100 : 0 : pocket.budgetLimit ? Math.min(pocket.spent / pocket.budgetLimit * 100, 100) : 0;
  const isProjectComplete = !isRecurring && pocket.budgetLimit && pocket.spent >= pocket.budgetLimit;
  async function handleAddItem() {
    if (!itemName.trim()) return;
    setIsAddingItem(true);
    try {
      await createPocketItem({
        data: {
          pocketId: pocket.id,
          name: itemName
        }
      });
      setItemName("");
      onRefresh();
    } finally {
      setIsAddingItem(false);
    }
  }
  async function handleToggleItem(id) {
    await togglePocketItem({
      data: {
        id
      }
    });
    onRefresh();
  }
  async function handleDeleteItem(id) {
    await deletePocketItem({
      data: {
        id
      }
    });
    onRefresh();
  }
  async function handleArchive() {
    if (confirm("Archive this pocket?")) {
      await archivePocket({
        data: {
          id: pocket.id
        }
      });
      onRefresh();
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-3 rounded-lg border border-border/60 bg-background/50 p-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5 min-w-0", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
          /* @__PURE__ */ jsx("span", { className: "font-medium text-sm truncate", children: pocket.name }),
          isRecurring ? /* @__PURE__ */ jsx(Repeat, { className: "h-3.5 w-3.5 text-sky-400" }) : /* @__PURE__ */ jsx(Target, { className: "h-3.5 w-3.5 text-emerald-400" })
        ] }),
        /* @__PURE__ */ jsx("span", { className: "text-[11px] text-mutedForeground", children: isRecurring ? `Reset day: ${pocket.resetDay || 1}` : pocket.budgetLimit ? `Limit: ${formatMoney(pocket.budgetLimit, currency)}` : "No limit" })
      ] }),
      /* @__PURE__ */ jsx("button", { onClick: handleArchive, className: "text-mutedForeground hover:text-destructive", title: "Archive Pocket", children: /* @__PURE__ */ jsx(Archive, { className: "h-4 w-4" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between text-[11px] text-mutedForeground", children: [
        /* @__PURE__ */ jsx("span", { children: "Progress" }),
        /* @__PURE__ */ jsx("span", { className: moneyClass, children: isRecurring ? `${pocket.items.filter((i) => i.isChecked).length}/${pocket.items.length}` : `${formatMoney(pocket.spent, currency)}` })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "h-1.5 w-full overflow-hidden rounded-full bg-secondary/30", children: /* @__PURE__ */ jsx("div", { className: `h-full transition-all duration-500 ${isRecurring ? "bg-sky-500" : "bg-emerald-500"}`, style: {
        width: `${progress}%`
      } }) })
    ] }),
    isRecurring && /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-2", children: [
      /* @__PURE__ */ jsx("ul", { className: "flex flex-col gap-1.5", children: pocket.items.map((item) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxs("button", { onClick: () => handleToggleItem(item.id), className: "flex flex-1 items-center gap-2 text-left min-w-0", children: [
          item.isChecked ? /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4 text-sky-500" }) : /* @__PURE__ */ jsx(Circle, { className: "h-4 w-4 text-mutedForeground" }),
          /* @__PURE__ */ jsx("span", { className: `text-sm truncate ${item.isChecked ? "text-mutedForeground line-through" : "text-foreground"}`, children: item.name })
        ] }),
        /* @__PURE__ */ jsx("button", { onClick: () => handleDeleteItem(item.id), className: "inline-flex h-7 w-7 items-center justify-center rounded-md border border-border/60 text-mutedForeground hover:border-rose-500/60 hover:text-rose-400", title: "Delete item", children: /* @__PURE__ */ jsx(Trash2, { className: "h-3.5 w-3.5" }) })
      ] }, item.id)) }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("input", { value: itemName, onChange: (e) => setItemName(e.target.value), placeholder: "Add item...", className: "h-9 flex-1 rounded-md border border-border/60 bg-input px-3 text-sm outline-none focus:border-sky-500", onKeyDown: (e) => e.key === "Enter" && handleAddItem() }),
        /* @__PURE__ */ jsx("button", { onClick: handleAddItem, disabled: isAddingItem, className: "inline-flex h-9 w-10 items-center justify-center rounded-md bg-secondary/30 hover:bg-secondary/40 disabled:opacity-60", title: "Add item", children: /* @__PURE__ */ jsx(Plus, { className: "h-4 w-4" }) })
      ] })
    ] }),
    !isRecurring && isProjectComplete && /* @__PURE__ */ jsxs("button", { onClick: handleArchive, className: "mt-1 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-500/10 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/20", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: "h-4 w-4" }),
      "Goal Achieved! Archive"
    ] })
  ] });
}
export {
  PocketsPage as component
};
