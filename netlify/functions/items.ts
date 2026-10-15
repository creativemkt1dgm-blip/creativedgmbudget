import type { Config, Context } from "@netlify/functions";
import { asc, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { budgetItems } from "../../db/schema.js";

const MAX_ITEMS = 100;
const DATE_RE = /^(\d{4}-\d{2}-\d{2})?$/;

// Picks only known fields from the request body and coerces them to safe values.
function clean(body: any) {
  const out: Partial<typeof budgetItems.$inferInsert> = {};
  if (!body || typeof body !== "object") return out;
  const str = (v: unknown, max: number) => String(v ?? "").slice(0, max);
  const num = (v: unknown) => {
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  };
  if ("item" in body) out.item = str(body.item, 500);
  if ("cat" in body) out.category = str(body.cat, 100);
  if ("priority" in body) out.priority = str(body.priority, 50);
  if ("start" in body && DATE_RE.test(String(body.start ?? ""))) out.startDate = str(body.start, 10);
  if ("end" in body && DATE_RE.test(String(body.end ?? ""))) out.endDate = str(body.end, 10);
  if ("price" in body) out.price = num(body.price);
  if ("other" in body) out.other = num(body.other);
  if ("tax" in body) out.tax = num(body.tax);
  return out;
}

// Maps a database row to the shape the page uses.
function toClient(r: typeof budgetItems.$inferSelect) {
  return {
    id: r.id,
    item: r.item,
    cat: r.category,
    priority: r.priority,
    start: r.startDate,
    end: r.endDate,
    price: r.price,
    other: r.other,
    tax: r.tax,
  };
}

export default async (req: Request, context: Context) => {
  const id = context.params.id ? Number(context.params.id) : null;
  if (context.params.id && !Number.isInteger(id)) {
    return Response.json({ error: "Invalid id" }, { status: 400 });
  }

  if (req.method === "GET" && id === null) {
    const rows = await db.select().from(budgetItems).orderBy(asc(budgetItems.position), asc(budgetItems.id));
    return Response.json(rows.map(toClient));
  }

  if (req.method === "POST" && id === null) {
    const [{ count }] = await db.select({ count: sql<number>`count(*)::int` }).from(budgetItems);
    if (count >= MAX_ITEMS) {
      return Response.json({ error: `Maksimal ${MAX_ITEMS} item` }, { status: 400 });
    }
    const body = await req.json().catch(() => ({}));
    const [{ next }] = await db
      .select({ next: sql<number>`coalesce(max(${budgetItems.position}), 0) + 1` })
      .from(budgetItems);
    const [row] = await db
      .insert(budgetItems)
      .values({ ...clean(body), position: next })
      .returning();
    return Response.json(toClient(row), { status: 201 });
  }

  if (req.method === "PATCH" && id !== null) {
    const body = await req.json().catch(() => ({}));
    const [row] = await db
      .update(budgetItems)
      .set({ ...clean(body), updatedAt: new Date() })
      .where(eq(budgetItems.id, id))
      .returning();
    if (!row) return Response.json({ error: "Not found" }, { status: 404 });
    return Response.json(toClient(row));
  }

  if (req.method === "DELETE" && id !== null) {
    await db.delete(budgetItems).where(eq(budgetItems.id, id));
    return new Response(null, { status: 204 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: ["/api/items", "/api/items/:id"],
};
