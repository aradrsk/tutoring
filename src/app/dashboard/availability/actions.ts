"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db, schema } from "@/lib/db";

async function requireTeacher() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  if (session.user.role !== "teacher") throw new Error("Forbidden");
  return session;
}

function parseHm(hm: string): string | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return `${h.toString().padStart(2, "0")}:${m[2]}`;
}

export async function addRuleAction(formData: FormData) {
  await requireTeacher();
  const dowRaw = String(formData.get("day_of_week") ?? "");
  const start = parseHm(String(formData.get("start_time") ?? ""));
  const end = parseHm(String(formData.get("end_time") ?? ""));
  const dow = Number(dowRaw);
  if (!Number.isInteger(dow) || dow < 0 || dow > 6) throw new Error("Invalid day");
  if (!start || !end) throw new Error("Invalid time");
  if (start >= end) throw new Error("End must be after start");

  await db.insert(schema.availabilityRules).values({
    dayOfWeek: dow,
    startTime: start,
    endTime: end,
  });
  revalidatePath("/dashboard/availability");
  revalidatePath("/");
}

export async function deleteRuleAction(formData: FormData) {
  await requireTeacher();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");
  await db.delete(schema.availabilityRules).where(eq(schema.availabilityRules.id, id));
  revalidatePath("/dashboard/availability");
  revalidatePath("/");
}

export async function toggleRuleAction(formData: FormData) {
  await requireTeacher();
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  if (!id) throw new Error("Missing id");
  await db
    .update(schema.availabilityRules)
    .set({ active: !active })
    .where(eq(schema.availabilityRules.id, id));
  revalidatePath("/dashboard/availability");
  revalidatePath("/");
}

export async function addBlockAction(formData: FormData) {
  await requireTeacher();
  const date = String(formData.get("date") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim() || null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error("Invalid date");

  // If the date is already blocked, update the reason instead of duplicating.
  const existing = await db
    .select()
    .from(schema.availabilityBlocks)
    .where(eq(schema.availabilityBlocks.date, date))
    .limit(1);

  if (existing[0]) {
    await db
      .update(schema.availabilityBlocks)
      .set({ reason })
      .where(eq(schema.availabilityBlocks.id, existing[0].id));
  } else {
    await db.insert(schema.availabilityBlocks).values({ date, reason });
  }

  revalidatePath("/dashboard/availability");
  revalidatePath("/");
}

export async function deleteBlockAction(formData: FormData) {
  await requireTeacher();
  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");
  await db
    .delete(schema.availabilityBlocks)
    .where(and(eq(schema.availabilityBlocks.id, id)));
  revalidatePath("/dashboard/availability");
  revalidatePath("/");
}
