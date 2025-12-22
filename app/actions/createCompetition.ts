"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { eq } from "drizzle-orm"

import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { competitions } from "@/drizzle/schema"

export async function createCompetition(formData: FormData) {
  const session = await getServerSession(authOptions)
  const canEdit = session?.user?.role === "member"
  if (!canEdit) {
    throw new Error("Unauthorized")
  }

  const name = String(formData.get("name") || "").trim()
  if (!name) {
    throw new Error("Competition name is required")
  }
  if (name.length > 256) {
    throw new Error("Competition name is too long")
  }

  const existing = await db
    .select({ id: competitions.id })
    .from(competitions)
    .where(eq(competitions.name, name))
    .limit(1)

  if (!existing.length) {
    await db.insert(competitions).values({ name })
  }

  revalidatePath("/dashboard")
  revalidatePath("/competitions")
}
