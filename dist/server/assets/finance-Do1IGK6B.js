import { c as createServerRpc, t as totalAmountByType, l as listPocketRecords, a as totalPocketSpending, b as listPocketItems, d as listRecentTransactions, e as createPocketRecord, f as archivePocketRecord, g as createPocketItemRecord, h as togglePocketItemRecord, i as deletePocketItemRecord, j as deleteTransactionRecord, k as createTransactionRecord, m as listAllTransactions } from "./client-CnZmoSJI.js";
import { c as createServerFn } from "../server.js";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core";
import "node:async_hooks";
import "@tanstack/router-core/ssr/server";
import "h3-v2";
import "tiny-invariant";
import "seroval";
import "react/jsx-runtime";
import "@tanstack/react-router/ssr/server";
import "@tanstack/react-router";
const incomeKeywords = ["gaji", "gajian", "salary", "bonus", "masuk", "income"];
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
];
const categoryHints = {
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
};
function detectType(text) {
  const lower = text.toLowerCase();
  for (const token of incomeKeywords) {
    if (lower.includes(token)) {
      return "income";
    }
  }
  for (const token of expenseKeywords) {
    if (lower.includes(token)) {
      return "expense";
    }
  }
  return "expense";
}
function detectCategory(text) {
  const lower = text.toLowerCase();
  const tokens = lower.split(/\s+/g);
  for (const token of tokens) {
    const cleaned = token.replace(/[^a-zA-Z0-9]/g, "");
    if (cleaned in categoryHints) {
      return categoryHints[cleaned];
    }
  }
  return null;
}
function parseNumericValue(raw) {
  var _a;
  const match = raw.match(/(\d+)([.,]?\d+)?\s*(rb|k|jt|m)?/i);
  if (!match) {
    return null;
  }
  const base = parseInt(match[1], 10);
  if (Number.isNaN(base)) {
    return null;
  }
  const unit = (_a = match[3]) == null ? void 0 : _a.toLowerCase();
  if (!unit) {
    return base;
  }
  if (unit === "rb" || unit === "k") {
    return base * 1e3;
  }
  if (unit === "jt" || unit === "m") {
    return base * 1e6;
  }
  return base;
}
function parseSmartInput(text) {
  const trimmed = text.trim();
  const description = trimmed.length === 0 ? "Transaksi" : trimmed;
  const lower = trimmed.toLowerCase();
  const amountCandidates = lower.match(/\d+[.,]?\d*\s*(rb|k|jt|m)?/gi) ?? [];
  let amount = 0;
  for (const candidate of amountCandidates) {
    const parsed = parseNumericValue(candidate);
    if (parsed && parsed > 0) {
      amount = parsed;
      break;
    }
  }
  if (!amount) {
    const plainNumber = lower.match(/\d+/g);
    if (plainNumber && plainNumber.length > 0) {
      amount = parseInt(plainNumber[0] ?? "0", 10);
    }
  }
  if (!amount || amount < 0) {
    amount = 0;
  }
  const type = detectType(lower);
  const category = detectCategory(lower);
  return {
    description,
    amount,
    type,
    category
  };
}
function buildExpenseTrend(params) {
  const months = Math.max(3, Math.min(24, params.months));
  const start = new Date(params.now.getFullYear(), params.now.getMonth() - (months - 1), 1);
  const monthKeys = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(start.getFullYear(), start.getMonth() + i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("id-ID", {
      month: "short"
    });
    monthKeys.push({
      key,
      label
    });
  }
  const totals = /* @__PURE__ */ new Map();
  for (const mk of monthKeys) totals.set(mk.key, 0);
  for (const tx of params.transactions) {
    if (tx.type !== "expense") continue;
    if (tx.date <= 0) continue;
    const d = new Date(tx.date * 1e3);
    if (d < start) continue;
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const prev = totals.get(key);
    if (prev != null) totals.set(key, prev + tx.amount);
  }
  return monthKeys.map((mk) => ({
    month: mk.label,
    total: totals.get(mk.key) ?? 0
  }));
}
const getDashboardData_createServerFn_handler = createServerRpc({
  id: "d559676742f60ca6690f4425e4efc767611d69bd0ae9342c3c7f0abdafebbd4c",
  name: "getDashboardData",
  filename: "src/server/finance.ts"
}, (opts) => getDashboardData.__executeServer(opts));
const getDashboardData = createServerFn({
  method: "GET"
}).handler(getDashboardData_createServerFn_handler, async () => {
  const totalIncome = totalAmountByType("income");
  const totalSpending = totalAmountByType("expense");
  const remaining = totalIncome - totalSpending;
  const allTransactions = listAllTransactions();
  const expenseTrend = buildExpenseTrend({
    months: 6,
    now: /* @__PURE__ */ new Date(),
    transactions: allTransactions
  });
  const allPockets = listPocketRecords();
  const enrichedPockets = allPockets.map((p) => ({
    ...p,
    items: listPocketItems(p.id),
    spent: totalPocketSpending(p.id)
  }));
  const recent = listRecentTransactions(10);
  return {
    totalIncome,
    totalSpending,
    remaining,
    expenseTrend,
    pockets: enrichedPockets,
    recentTransactions: recent
  };
});
const createPocket_createServerFn_handler = createServerRpc({
  id: "8547b6239d6a06bf69eacf8d8ba01863797ac72443576aa0449618a9d8036b02",
  name: "createPocket",
  filename: "src/server/finance.ts"
}, (opts) => createPocket.__executeServer(opts));
const createPocket = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createPocket_createServerFn_handler, async ({
  data
}) => {
  const name = data.name.trim();
  const limitValue = data.budgetLimit ?? null;
  if (!name) {
    throw new Error("Pocket name is required");
  }
  const pocket = createPocketRecord({
    name,
    budgetLimit: limitValue,
    type: data.type,
    resetDay: data.resetDay
  });
  return pocket;
});
const listPockets_createServerFn_handler = createServerRpc({
  id: "9ecd24a1e309f53f1e0ca516e84e41c6187912d9315a027229ec288d321839cd",
  name: "listPockets",
  filename: "src/server/finance.ts"
}, (opts) => listPockets.__executeServer(opts));
const listPockets = createServerFn({
  method: "GET"
}).handler(listPockets_createServerFn_handler, async () => {
  const all = listPocketRecords();
  return all.map((p) => ({
    ...p,
    items: listPocketItems(p.id),
    spent: totalPocketSpending(p.id)
  }));
});
const archivePocket_createServerFn_handler = createServerRpc({
  id: "dba2f337c63aeca4188aa12bda9b1236fa6783c23bcf3da73bb58fc02c8299ff",
  name: "archivePocket",
  filename: "src/server/finance.ts"
}, (opts) => archivePocket.__executeServer(opts));
const archivePocket = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(archivePocket_createServerFn_handler, async ({
  data
}) => {
  const archived = archivePocketRecord(data.id);
  if (!archived) {
    throw new Error("Pocket not found");
  }
  return archived;
});
const createPocketItem_createServerFn_handler = createServerRpc({
  id: "eaf8e89607d3b0486a2601c34a04a2a2f4e1806b7530588aebf0154a689bec0f",
  name: "createPocketItem",
  filename: "src/server/finance.ts"
}, (opts) => createPocketItem.__executeServer(opts));
const createPocketItem = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createPocketItem_createServerFn_handler, async ({
  data
}) => {
  if (!data.name.trim()) throw new Error("Item name required");
  return createPocketItemRecord({
    pocketId: data.pocketId,
    name: data.name
  });
});
const togglePocketItem_createServerFn_handler = createServerRpc({
  id: "a0bb503f7b4c30e85df0cc90a38296aaea4bb98a133c9765dabd076456ea51fb",
  name: "togglePocketItem",
  filename: "src/server/finance.ts"
}, (opts) => togglePocketItem.__executeServer(opts));
const togglePocketItem = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(togglePocketItem_createServerFn_handler, async ({
  data
}) => {
  const updated = togglePocketItemRecord(data.id);
  if (!updated) throw new Error("Item not found");
  return updated;
});
const deletePocketItem_createServerFn_handler = createServerRpc({
  id: "07a70d2437ca43515b7c7f6efd729da44eb15cd9c1d4d3d202ab296793bb4123",
  name: "deletePocketItem",
  filename: "src/server/finance.ts"
}, (opts) => deletePocketItem.__executeServer(opts));
const deletePocketItem = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(deletePocketItem_createServerFn_handler, async ({
  data
}) => {
  deletePocketItemRecord(data.id);
  return {
    ok: true
  };
});
const createTransactionFromSmartInput_createServerFn_handler = createServerRpc({
  id: "1b2e31df34f80caf04cb5275d757b9a994ef02b8c2b07586982114472e45fc97",
  name: "createTransactionFromSmartInput",
  filename: "src/server/finance.ts"
}, (opts) => createTransactionFromSmartInput.__executeServer(opts));
const createTransactionFromSmartInput = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(createTransactionFromSmartInput_createServerFn_handler, async ({
  data
}) => {
  const parsed = parseSmartInput(data.text);
  if (!parsed.amount || parsed.amount <= 0) {
    throw new Error("Tidak menemukan nominal di input");
  }
  const categorizationEnabled = data.enableSmartCategorization !== false;
  const timestamp = data.date != null && data.date !== "" ? Date.parse(data.date) : Date.now();
  const pocketId = typeof data.pocketId === "number" && Number.isFinite(data.pocketId) ? data.pocketId : null;
  const created = createTransactionRecord({
    description: parsed.description,
    amount: parsed.amount,
    type: parsed.type,
    category: categorizationEnabled ? parsed.category : null,
    pocketId,
    date: Math.floor(timestamp / 1e3)
  });
  return created;
});
const deleteTransaction_createServerFn_handler = createServerRpc({
  id: "6b62ebe496c159e725c4a1571bc97830b291a24b97be8851614179dfab0579e2",
  name: "deleteTransaction",
  filename: "src/server/finance.ts"
}, (opts) => deleteTransaction.__executeServer(opts));
const deleteTransaction = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(deleteTransaction_createServerFn_handler, async ({
  data
}) => {
  deleteTransactionRecord(data.id);
  return {
    ok: true
  };
});
const updatePocketBudget_createServerFn_handler = createServerRpc({
  id: "a879879235d807c09622eb2074a8ebe40a6f6f01f7a887a9392fc9c8353f1a29",
  name: "updatePocketBudget",
  filename: "src/server/finance.ts"
}, (opts) => updatePocketBudget.__executeServer(opts));
const updatePocketBudget = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(updatePocketBudget_createServerFn_handler, async ({
  data
}) => {
  const pockets = listPocketRecords();
  const pocket = pockets.find((p) => p.id === data.id);
  if (!pocket) {
    throw new Error("Pocket not found");
  }
  pocket.budgetLimit = data.budgetLimit;
  return pocket;
});
const getPocketSpending_createServerFn_handler = createServerRpc({
  id: "ff67c4b03db143e9b1067e5daad005a96c8344104aa7f6f0f52c2478fe3a31ec",
  name: "getPocketSpending",
  filename: "src/server/finance.ts"
}, (opts) => getPocketSpending.__executeServer(opts));
const getPocketSpending = createServerFn({
  method: "GET"
}).inputValidator((data) => data).handler(getPocketSpending_createServerFn_handler, async ({
  data
}) => {
  const total = totalPocketSpending(data.pocketId);
  return total;
});
export {
  archivePocket_createServerFn_handler,
  createPocketItem_createServerFn_handler,
  createPocket_createServerFn_handler,
  createTransactionFromSmartInput_createServerFn_handler,
  deletePocketItem_createServerFn_handler,
  deleteTransaction_createServerFn_handler,
  getDashboardData_createServerFn_handler,
  getPocketSpending_createServerFn_handler,
  listPockets_createServerFn_handler,
  togglePocketItem_createServerFn_handler,
  updatePocketBudget_createServerFn_handler
};
