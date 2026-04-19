"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getSession } from "@/lib/session";
import { db, schema } from "@/lib/db";

export type ProfileFormState = { error: string | null };

export async function completeProfileAction(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const session = await getSession();
  if (!session) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const ageRaw = String(formData.get("age") ?? "").trim();
  const age = Number(ageRaw);

  if (!name || name.length > 100) {
    return { error: "Enter a name (1–100 characters)." };
  }
  if (!Number.isInteger(age) || age < 5 || age > 18) {
    return { error: "Age must be a whole number between 5 and 18." };
  }

  await db
    .update(schema.user)
    .set({ name, age, updatedAt: new Date() })
    .where(eq(schema.user.id, session.user.id));

  revalidatePath("/account/bookings");
  redirect("/account/bookings");
}
