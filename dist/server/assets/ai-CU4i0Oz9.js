import { c as createServerRpc, m as listAllTransactions } from "./client-CnZmoSJI.js";
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
function createLocalAiClient() {
  return {
    async generate(input) {
      return `Local AI belum dikonfigurasi. Prompt yang diterima: ${input.prompt}`;
    }
  };
}
function formatCurrencyIdr(amount) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount);
}
function getLastMonthRange(now) {
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  return {
    start: Math.floor(start.getTime() / 1e3),
    end: Math.floor(end.getTime() / 1e3)
  };
}
async function answerRuleBased(question) {
  const lower = question.toLowerCase();
  const now = /* @__PURE__ */ new Date();
  if (lower.includes("jajan") && lower.includes("bulan lalu")) {
    const range = getLastMonthRange(now);
    const all = listAllTransactions();
    const total = all.filter((tx) => tx.type === "expense" && tx.date >= range.start && tx.date <= range.end).reduce((sum, tx) => sum + tx.amount, 0);
    const formatted = formatCurrencyIdr(total);
    return `Perkiraan total jajan bulan lalu adalah ${formatted}.`;
  }
  return null;
}
const askFinanceQuestion_createServerFn_handler = createServerRpc({
  id: "ee4dee9efeb78155814e621f49b93f21ea3413e86e3100280d38adcaa8983e2a",
  name: "askFinanceQuestion",
  filename: "src/server/ai.ts"
}, (opts) => askFinanceQuestion.__executeServer(opts));
const askFinanceQuestion = createServerFn({
  method: "POST"
}).inputValidator((data) => data).handler(askFinanceQuestion_createServerFn_handler, async ({
  data
}) => {
  const trimmed = data.question.trim();
  if (!trimmed) {
    throw new Error("Pertanyaan tidak boleh kosong");
  }
  const ruleBased = await answerRuleBased(trimmed);
  if (ruleBased) {
    return {
      answer: ruleBased,
      usedRuleBased: true
    };
  }
  const aiClient = createLocalAiClient();
  const answer = await aiClient.generate({
    prompt: `Kamu adalah asisten keuangan pribadi. Gunakan bahasa Indonesia santai.
Pertanyaan: ${trimmed}`
  });
  return {
    answer,
    usedRuleBased: false
  };
});
export {
  askFinanceQuestion_createServerFn_handler
};
