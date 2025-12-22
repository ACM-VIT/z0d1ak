"use server";

import { db } from "@/lib/db";
import { posts } from "@/drizzle/schema";
import { eq, not, and, desc } from "drizzle-orm";
import { getTagsForPosts } from "@/app/actions/getTagsForPosts";

export async function getRelatedPosts(currentPostId: string, categoryId: string, limit = 2) {
  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      createdAt: posts.createdAt,
    })
    .from(posts)
    .where(
      and(
        eq(posts.categoryId, categoryId),
        not(eq(posts.id, currentPostId)),
        eq(posts.isDraft, false)
      )
    )
    .orderBy(desc(posts.createdAt))
    .limit(limit);

  const tagMap = await getTagsForPosts(result.map((post) => post.id));

  return result.map((post) => ({
    ...post,
    createdAt: post.createdAt?.toISOString() ?? "",
    tags: tagMap[post.id] ?? [],
  }));
}
