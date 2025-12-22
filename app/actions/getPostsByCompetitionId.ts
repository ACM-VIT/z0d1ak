"use server";

import { db } from "@/lib/db";
import { posts, categories } from "@/drizzle/schema";
import { and, eq } from "drizzle-orm";
import { getTagsForPosts } from "@/app/actions/getTagsForPosts";

export async function getPostsByCompetitionId(competitionId: string) {
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      categoryName: categories.name,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.competitionId, competitionId), eq(posts.isDraft, false)));

  const tagMap = await getTagsForPosts(rows.map((post) => post.id));

  const mapped = rows.map((post) => ({
    ...post,
    tags: tagMap[post.id] ?? [],
  }));
  return mapped;
}
