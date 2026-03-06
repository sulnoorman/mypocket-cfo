import { T as TSS_SERVER_FUNCTION } from "../server.js";
const createServerRpc = (serverFnMeta, splitImportFn) => {
  const url = "/_serverFn/" + serverFnMeta.id;
  return Object.assign(splitImportFn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const pockets = [];
const pocketItems = [];
const transactions = [];
let nextPocketId = 1;
let nextPocketItemId = 1;
let nextTransactionId = 1;
function createPocketRecord(params) {
  const record = {
    id: nextPocketId++,
    name: params.name,
    budgetLimit: params.budgetLimit,
    type: params.type,
    status: "active",
    resetDay: params.resetDay,
    lastResetDate: Math.floor(Date.now() / 1e3),
    createdAt: Math.floor(Date.now() / 1e3)
  };
  pockets.push(record);
  return record;
}
function archivePocketRecord(id) {
  const pocket = pockets.find((p) => p.id === id);
  if (!pocket) {
    return null;
  }
  pocket.status = "archived";
  return pocket;
}
function listPocketRecords() {
  const now = /* @__PURE__ */ new Date();
  const dayOfMonth = now.getDate();
  pockets.forEach((p) => {
    if (p.type === "recurring" && p.status === "active" && p.resetDay && p.lastResetDate) {
      const lastReset = new Date(p.lastResetDate * 1e3);
      const isDifferentMonth = lastReset.getMonth() !== now.getMonth() || lastReset.getFullYear() !== now.getFullYear();
      if (isDifferentMonth && dayOfMonth >= p.resetDay) {
        const items = pocketItems.filter((i) => i.pocketId === p.id);
        items.forEach((i) => i.isChecked = false);
        p.lastResetDate = Math.floor(now.getTime() / 1e3);
      }
    }
  });
  return pockets.filter((p) => p.status === "active").slice().sort((a, b) => a.id - b.id);
}
function createPocketItemRecord(params) {
  const record = {
    id: nextPocketItemId++,
    pocketId: params.pocketId,
    name: params.name,
    isChecked: false
  };
  pocketItems.push(record);
  return record;
}
function togglePocketItemRecord(id) {
  const item = pocketItems.find((i) => i.id === id);
  if (!item) return null;
  item.isChecked = !item.isChecked;
  return item;
}
function deletePocketItemRecord(id) {
  const index = pocketItems.findIndex((i) => i.id === id);
  if (index !== -1) {
    pocketItems.splice(index, 1);
  }
}
function listPocketItems(pocketId) {
  return pocketItems.filter((i) => i.pocketId === pocketId);
}
function createTransactionRecord(params) {
  const record = {
    id: nextTransactionId++,
    description: params.description,
    amount: params.amount,
    type: params.type,
    category: params.category,
    pocketId: params.pocketId,
    date: params.date,
    createdAt: Math.floor(Date.now() / 1e3)
  };
  transactions.push(record);
  return record;
}
function deleteTransactionRecord(id) {
  const index = transactions.findIndex((tx) => tx.id === id);
  if (index !== -1) {
    transactions.splice(index, 1);
  }
}
function listRecentTransactions(limit) {
  return transactions.slice().sort((a, b) => b.date - a.date || b.id - a.id).slice(0, limit);
}
function totalAmountByType(type) {
  return transactions.filter((tx) => tx.type === type).reduce((sum, tx) => sum + tx.amount, 0);
}
function totalPocketSpending(pocketId) {
  return transactions.filter((tx) => tx.pocketId === pocketId && tx.type === "expense").reduce((sum, tx) => sum + tx.amount, 0);
}
function listAllTransactions() {
  return transactions.slice();
}
export {
  totalPocketSpending as a,
  listPocketItems as b,
  createServerRpc as c,
  listRecentTransactions as d,
  createPocketRecord as e,
  archivePocketRecord as f,
  createPocketItemRecord as g,
  togglePocketItemRecord as h,
  deletePocketItemRecord as i,
  deleteTransactionRecord as j,
  createTransactionRecord as k,
  listPocketRecords as l,
  listAllTransactions as m,
  totalAmountByType as t
};
