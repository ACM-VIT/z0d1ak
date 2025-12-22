"use server";

import { db } from "@/lib/db";
import { posts, tags, post_tags, categories } from "@/drizzle/schema";
import { and, eq, sql } from "drizzle-orm";

export async function getPostsByCompetitionId(competitionId: string) {
  const rows = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      tags: sql<string>`COALESCE(array_to_json(array_remove(array_agg(DISTINCT ${tags.name}), null)), '[]')`.as(
        "tags",
      ),
      categoryName: categories.name,
    })
    .from(posts)
    .leftJoin(post_tags, eq(posts.id, post_tags.postId))
    .leftJoin(tags, eq(post_tags.tagId, tags.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.competitionId, competitionId), eq(posts.isDraft, false)))
    .groupBy(posts.id, categories.name);

  const mapped = rows.map((post) => ({
    ...post,
    tags:
      typeof post.tags === "string" && post.tags.length > 0
        ? JSON.parse(post.tags)
        : Array.isArray(post.tags)
          ? post.tags
          : [],
  }));
  return mapped;
}
