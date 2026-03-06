import { createServerFn } from "@tanstack/react-start"
import { listAllTransactions } from "../db/client"

const DEFAULT_OLLAMA_ENDPOINT = "http://localhost:11434/api/generate"
const DEFAULT_OLLAMA_MODEL = "llama3"

export type AiFinanceAnswer = {
  answer: string
  usedRuleBased: boolean
}

type AiClient = {
  generate: (input: { prompt: string }) => Promise<string>
}

function createLocalAiClient(): AiClient {
  return {
    async generate(input) {
      return `Local AI belum dikonfigurasi. Prompt yang diterima: ${input.prompt}`
    }
  }
}

function createOllamaClient(endpoint: string, model: string): AiClient {
  const safeEndpoint = endpoint.trim()
  return {
    async generate(input) {
      const res = await fetch(safeEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          prompt: input.prompt,
          stream: false
        })
      })
      if (!res.ok) {
        throw new Error(`AI endpoint error: ${res.status} ${res.statusText}`)
      }
      const data = (await res.json()) as { response?: string; answer?: string; output?: string; text?: string }
      return data.response ?? data.answer ?? data.output ?? data.text ?? ""
    }
  }
}

function createGenericHttpClient(endpoint: string): AiClient {
  const safeEndpoint = endpoint.trim()
  return {
    async generate(input) {
      const res = await fetch(safeEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: input.prompt })
      })
      if (!res.ok) {
        throw new Error(`AI endpoint error: ${res.status} ${res.statusText}`)
      }
      const data = (await res.json()) as {
        answer?: string
        output?: string
        text?: string
        response?: string
      }
      return data.answer ?? data.output ?? data.text ?? data.response ?? ""
    }
  }
}

function formatCurrencyIdr(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(amount)
}

function getLastMonthRange(now: Date) {
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
  return {
    start: Math.floor(start.getTime() / 1000),
    end: Math.floor(end.getTime() / 1000)
  }
}

async function answerRuleBased(question: string) {
  const lower = question.toLowerCase()
  const now = new Date()
  if (lower.includes("jajan") && lower.includes("bulan lalu")) {
    const range = getLastMonthRange(now)
    const all = listAllTransactions()
    const total = all
      .filter(
        (tx) =>
          tx.type === "expense" &&
          tx.date >= range.start &&
          tx.date <= range.end
      )
      .reduce((sum, tx) => sum + tx.amount, 0)
    const formatted = formatCurrencyIdr(total)
    return `Perkiraan total jajan bulan lalu adalah ${formatted}.`
  }
  return null
}

export const askFinanceQuestion = createServerFn({
  method: "POST"
})
  .inputValidator(
    (data: { question: string; endpoint?: string | null; systemPrompt?: string | null }) => data
  )
  .handler(async ({ data }) => {
    const trimmed = data.question.trim()
    if (!trimmed) {
      throw new Error("Pertanyaan tidak boleh kosong")
    }
    const ruleBased = await answerRuleBased(trimmed)
    if (ruleBased) {
      return {
        answer: ruleBased,
        usedRuleBased: true
      } satisfies AiFinanceAnswer
    }
    const basePrompt =
      data.systemPrompt && data.systemPrompt.trim().length > 0
        ? data.systemPrompt.trim()
        : "Kamu adalah asisten keuangan pribadi. Gunakan bahasa Indonesia santai."
    const fullPrompt = `${basePrompt}\nPertanyaan: ${trimmed}`

    const endpoint = data.endpoint?.trim()
    const aiClient =
      endpoint && endpoint.length > 0
        ? createGenericHttpClient(endpoint)
        : createOllamaClient(DEFAULT_OLLAMA_ENDPOINT, DEFAULT_OLLAMA_MODEL)
    const answer = await aiClient.generate({
      prompt: fullPrompt
    })
    return {
      answer,
      usedRuleBased: false
    } satisfies AiFinanceAnswer
  })
