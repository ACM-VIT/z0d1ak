"use server";

import { getPostsByCompetitionIdFromWriteups } from "@/lib/writeups";

export async function getPostsByCompetitionId(competitionId: string) {
  return getPostsByCompetitionIdFromWriteups(competitionId);
}
