import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ArrowDownRight, Scale, LineChart, Wallet } from "lucide-react";
import { ResponsiveContainer, LineChart as LineChart$1, CartesianGrid, XAxis, YAxis, Tooltip, Line } from "recharts";
import { useMemo } from "react";
import { h as Route, u as useAppPreferences } from "./router-C_hNtkw0.js";
import { f as formatMoney, a as formatDateFromUnix } from "./format-CczPE23T.js";
import "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "@tanstack/react-router/ssr/server";
function DashboardPage() {
  const data = Route.useLoaderData();
  const {
    preferences
  } = useAppPreferences();
  const moneyClass = preferences.privacyMode ? "blur-sm select-none" : "";
  const recentTransactions = useMemo(() => data.recentTransactions.slice(0, 3), [data.recentTransactions]);
  const recentNonGoalPockets = useMemo(() => {
    return data.pockets.filter((p) => p.type !== "project").slice(0, 3);
  }, [data.pockets]);
  const netBalance = data.totalIncome - data.totalSpending;
  return /* @__PURE__ */ jsxs("div", { className: "mx-auto flex w-full max-w-6xl flex-col gap-6", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("div", { className: "text-lg font-semibold tracking-tight", children: "Dashboard" }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-mutedForeground", children: "Snapshot finansial kamu — cepat, rapi, dan aman." })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "text-xs text-mutedForeground", children: preferences.privacyMode ? "Privacy mode: on" : "Privacy mode: off" })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "grid gap-4 md:grid-cols-3", children: [
      /* @__PURE__ */ jsx(MetricCard, { title: "Total Pemasukan", value: formatMoney(Math.max(0, data.totalIncome), preferences.currency), valueClassName: moneyClass, tone: "positive", icon: ArrowUpRight }),
      /* @__PURE__ */ jsx(MetricCard, { title: "Total Pengeluaran", value: formatMoney(Math.max(0, data.totalSpending), preferences.currency), valueClassName: moneyClass, tone: "negative", icon: ArrowDownRight }),
      /* @__PURE__ */ jsx(MetricCard, { title: "Net Balance", value: formatMoney(netBalance, preferences.currency), valueClassName: moneyClass, tone: netBalance >= 0 ? "neutral" : "negative", icon: Scale })
    ] }),
    /* @__PURE__ */ jsxs("section", { className: "grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { title: "Monthly Expense Trend", description: "Tren pengeluaran beberapa bulan terakhir.", icon: LineChart }),
        /* @__PURE__ */ jsx("div", { className: "mt-4 h-72 w-full", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(LineChart$1, { data: data.expenseTrend, children: [
          /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "rgba(148,163,184,0.15)" }),
          /* @__PURE__ */ jsx(XAxis, { dataKey: "month", tick: {
            fill: "rgba(148,163,184,0.9)",
            fontSize: 12
          }, axisLine: {
            stroke: "rgba(148,163,184,0.2)"
          }, tickLine: {
            stroke: "rgba(148,163,184,0.2)"
          } }),
          /* @__PURE__ */ jsx(YAxis, { tick: {
            fill: "rgba(148,163,184,0.9)",
            fontSize: 12
          }, axisLine: {
            stroke: "rgba(148,163,184,0.2)"
          }, tickLine: {
            stroke: "rgba(148,163,184,0.2)"
          }, tickFormatter: (v) => preferences.privacyMode ? "•••" : formatCompactNumber(v) }),
          /* @__PURE__ */ jsx(Tooltip, { contentStyle: {
            background: "rgba(2,6,23,0.95)",
            border: "1px solid rgba(31,41,55,0.8)",
            borderRadius: 12
          }, labelStyle: {
            color: "rgba(226,232,240,0.9)"
          }, itemStyle: {
            color: "rgba(226,232,240,0.9)"
          }, formatter: (v) => preferences.privacyMode ? ["•••••", "Expense"] : [formatMoney(Number(v), preferences.currency), "Expense"] }),
          /* @__PURE__ */ jsx(Line, { type: "monotone", dataKey: "total", stroke: "#38bdf8", strokeWidth: 2, dot: {
            r: 3,
            stroke: "#38bdf8",
            fill: "#38bdf8"
          }, activeDot: {
            r: 5
          } })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { title: "Recent Transactions", description: "3 transaksi terakhir", icon: ArrowDownRight }),
          /* @__PURE__ */ jsx("div", { className: "mt-4", children: recentTransactions.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { text: "Belum ada transaksi. Coba input dari halaman Pockets." }) : /* @__PURE__ */ jsx("ul", { className: "flex flex-col gap-2", children: recentTransactions.map((tx) => /* @__PURE__ */ jsxs("li", { className: "flex items-start justify-between gap-3 rounded-md border border-border/60 bg-background/50 px-3 py-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-medium", children: tx.description }),
              /* @__PURE__ */ jsxs("div", { className: "mt-0.5 text-xs text-mutedForeground", children: [
                formatDateFromUnix(tx.date),
                tx.category ? ` · ${tx.category}` : ""
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: ["text-sm font-semibold", tx.type === "income" ? "text-emerald-400" : "text-rose-400", moneyClass].join(" "), children: [
              tx.type === "income" ? "+" : "-",
              " ",
              formatMoney(tx.amount, preferences.currency)
            ] })
          ] }, tx.id)) }) }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 flex justify-end", children: /* @__PURE__ */ jsx(Link, { to: "/pockets", className: "inline-flex items-center justify-center rounded-md border border-border/60 bg-background/40 px-3 py-2 text-xs font-medium text-mutedForeground transition hover:border-sky-500/40 hover:text-foreground", children: "Manage transactions" }) })
        ] }),
        /* @__PURE__ */ jsxs(Card, { children: [
          /* @__PURE__ */ jsx(CardHeader, { title: "Pockets (Non-goals)", description: "3 pocket aktif (exclude goals/project).", icon: Wallet }),
          /* @__PURE__ */ jsx("div", { className: "mt-4", children: recentNonGoalPockets.length === 0 ? /* @__PURE__ */ jsx(EmptyState, { text: "Belum ada pocket non-goals. Buat recurring pocket di halaman Pockets." }) : /* @__PURE__ */ jsx("ul", { className: "flex flex-col gap-2", children: recentNonGoalPockets.map((p) => /* @__PURE__ */ jsxs("li", { className: "flex items-center justify-between gap-3 rounded-md border border-border/60 bg-background/50 px-3 py-2", children: [
            /* @__PURE__ */ jsxs("div", { className: "min-w-0", children: [
              /* @__PURE__ */ jsx("div", { className: "truncate text-sm font-medium", children: p.name }),
              /* @__PURE__ */ jsx("div", { className: "text-xs text-mutedForeground", children: p.type === "recurring" ? `Reset day: ${p.resetDay || 1}` : "Active" })
            ] }),
            /* @__PURE__ */ jsx("div", { className: ["text-xs text-mutedForeground", moneyClass].join(" "), children: p.budgetLimit ? /* @__PURE__ */ jsxs(Fragment, { children: [
              formatMoney(p.spent, preferences.currency),
              " /",
              " ",
              formatMoney(p.budgetLimit, preferences.currency)
            ] }) : formatMoney(p.spent, preferences.currency) })
          ] }, p.id)) }) }),
          /* @__PURE__ */ jsx("div", { className: "mt-4 flex justify-end", children: /* @__PURE__ */ jsx(Link, { to: "/pockets", className: "inline-flex items-center justify-center rounded-md border border-border/60 bg-background/40 px-3 py-2 text-xs font-medium text-mutedForeground transition hover:border-sky-500/40 hover:text-foreground", children: "View all pockets" }) })
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
function EmptyState({
  text
}) {
  return /* @__PURE__ */ jsx("div", { className: "rounded-md border border-dashed border-border/60 px-3 py-6 text-center text-sm text-mutedForeground", children: text });
}
function MetricCard({
  title,
  value,
  valueClassName,
  tone,
  icon: Icon
}) {
  const colorClass = tone === "positive" ? "text-emerald-400" : tone === "negative" ? "text-rose-400" : "text-sky-400";
  return /* @__PURE__ */ jsx("div", { className: "rounded-xl border border-border/60 bg-card/40 p-4 shadow-sm shadow-sky-500/5", children: /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1 min-w-0", children: [
      /* @__PURE__ */ jsx("span", { className: "text-xs text-mutedForeground", children: title }),
      /* @__PURE__ */ jsx("span", { className: ["text-lg font-semibold truncate", valueClassName ?? ""].join(" "), children: value })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "rounded-md bg-background/60 p-2", children: /* @__PURE__ */ jsx(Icon, { className: `h-5 w-5 ${colorClass}` }) })
  ] }) });
}
function formatCompactNumber(value) {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1e9) return `${Math.round(value / 1e8) / 10}B`;
  if (value >= 1e6) return `${Math.round(value / 1e5) / 10}M`;
  if (value >= 1e3) return `${Math.round(value / 100) / 10}K`;
  return String(Math.round(value));
}
export {
  DashboardPage as component
};
