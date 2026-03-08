import { pgEnum, pgTable, serial, text, timestamp, uuid, integer, boolean, numeric } from "drizzle-orm/pg-core"

export const pocketType = pgEnum("pocket_type", ["recurring", "project"])
export const pocketStatus = pgEnum("pocket_status", ["active", "archived"])
export const transactionType = pgEnum("transaction_type", ["income", "expense"])

export const pockets = pgTable("pockets", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  name: text("name").notNull(),
  budgetLimit: numeric("budget_limit", { precision: 12, scale: 2 }),
  type: pocketType("type").notNull(),
  status: pocketStatus("status").notNull().default("active"),
  resetDay: integer("reset_day"),
  lastResetAt: timestamp("last_reset_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
})

export const pocketItems = pgTable("pocket_items", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  pocketId: integer("pocket_id").notNull().references(() => pockets.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  isChecked: boolean("is_checked").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
})

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id").notNull(),
  description: text("description").notNull(),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  type: transactionType("type").notNull(),
  category: text("category"),
  pocketId: integer("pocket_id").references(() => pockets.id, { onDelete: "set null" }),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow()
})
