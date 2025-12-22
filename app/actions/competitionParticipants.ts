"use server"

import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth-options"
import { db } from "@/lib/db"
import { competition_participants } from "@/drizzle/schema"
import { asc, eq } from "drizzle-orm"

export type CompetitionParticipant = {
  id: string
  competitionId: string
  name: string
  createdAt: string
}

export async function getCompetitionParticipants(competitionId: string): Promise<CompetitionParticipant[]> {
  const rows = await db
    .select({
      id: competition_participants.id,
      competitionId: competition_participants.competitionId,
      name: competition_participants.name,
      createdAt: competition_participants.createdAt,
    })
    .from(competition_participants)
    .where(eq(competition_participants.competitionId, competitionId))
    .orderBy(asc(competition_participants.createdAt))

  return rows.map((r) => ({
    id: r.id,
    competitionId: r.competitionId,
    name: r.name,
    createdAt: r.createdAt?.toISOString() ?? "",
  }))
}

export async function addCompetitionParticipant(formData: FormData) {
  const session = await getServerSession(authOptions)
  const canEdit = session?.user?.role === "member"
  if (!canEdit) {
    throw new Error("Unauthorized")
  }

  const competitionId = String(formData.get("competitionId") || "").trim()
  const name = String(formData.get("name") || "").trim()

  if (!competitionId) throw new Error("Missing competitionId")
  if (!name) throw new Error("Name is required")
  if (name.length > 256) throw new Error("Name is too long")

  await db.insert(competition_participants).values({
    competitionId,
    name,
  })

  const competitionName = String(formData.get("competitionName") || "").trim()
  if (competitionName) {
    revalidatePath(`/competitions/${encodeURIComponent(competitionName)}`)
  }
  revalidatePath("/competitions")
  revalidatePath("/dashboard")
}
