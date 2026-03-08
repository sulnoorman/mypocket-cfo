import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

const url = (import.meta as any).env?.VITE_DATABASE_URL ?? ((globalThis as any).process?.env?.DATABASE_URL as string)
const client = postgres(url as string, { max: 1, ssl: "require" })
export const db = drizzle(client, { schema })
export { schema }
