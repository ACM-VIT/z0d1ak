"use server"

import { db } from "@/lib/db"
import { competitions } from "@/drizzle/schema"
import { asc } from "drizzle-orm"

export async function fetchCompetitions() {
  return db
    .select({
      id: competitions.id,
      name: competitions.name,
    })
    .from(competitions)
    .orderBy(asc(competitions.name))
}
