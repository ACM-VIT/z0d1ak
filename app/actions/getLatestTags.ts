"use server";

import { db } from "@/lib/db";
import { competitions, posts } from "@/drizzle/schema";
import { eq, sql, desc, and } from "drizzle-orm";

export async function getLatestCompetitions(limit: number = 5) {
  const rows = await db
    .select({
      id: competitions.id,
      name: competitions.name,
      latestPost: sql<Date>`MAX(${posts.createdAt})`.as("latestPost"),
      postCount: sql<number>`COUNT(${posts.id})`.as("postCount"),
    })
    .from(competitions)
    .leftJoin(posts, and(eq(posts.competitionId, competitions.id), eq(posts.isDraft, false)))
    .groupBy(competitions.id)
    .orderBy(desc(sql`MAX(${posts.createdAt})`))
    .limit(limit);

  return rows.map((comp) => ({
    id: comp.id,
    name: comp.name,
    latestPost: comp.latestPost ? new Date(comp.latestPost).toISOString() : null,
    postCount: comp.postCount,
  }));
}
