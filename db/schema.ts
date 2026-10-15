import { pgTable, serial, text, integer, doublePrecision, timestamp } from "drizzle-orm/pg-core";

export const budgetItems = pgTable("budget_items", {
  id: serial().primaryKey(),
  position: integer().notNull().default(0),
  item: text().notNull().default(""),
  category: text().notNull().default("production"),
  priority: text().notNull().default("Medium"),
  startDate: text("start_date").notNull().default(""),
  endDate: text("end_date").notNull().default(""),
  price: doublePrecision().notNull().default(0),
  other: doublePrecision().notNull().default(0),
  tax: doublePrecision().notNull().default(11),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
