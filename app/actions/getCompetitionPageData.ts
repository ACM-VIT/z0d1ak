"use server";

import { getCompetitionPageDataFromWriteups } from "@/lib/writeups";

export type CompetitionWriteup = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  createdAt: string;
  categoryName: string | null;
  authorName: string | null;
};

export async function getCompetitionPageData(competitionNameParam: string) {
  return getCompetitionPageDataFromWriteups(competitionNameParam);
}
