"use server";

import { fetchCompetitionsFromWriteups } from "@/lib/writeups";

export async function fetchCompetitions() {
  const competitions = await fetchCompetitionsFromWriteups();

  return competitions.map((competition) => ({
    id: competition.id,
    name: competition.name,
  }));
}
