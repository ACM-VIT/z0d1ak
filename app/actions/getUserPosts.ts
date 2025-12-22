"use server";

import { db } from "@/lib/db";
import { posts, categories } from "@/drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { getTagsForPosts } from "@/app/actions/getTagsForPosts";

function isValidUUID(uuid: string) {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export async function getUserPosts(userId: string) {
  if (!isValidUUID(userId)) {
    return [];
  }

  const userPosts = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      createdAt: posts.createdAt,
      categoryName: categories.name,
      categoryId: posts.categoryId,
      isDraft: posts.isDraft,
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.authorId, userId))
    .orderBy(desc(posts.createdAt));

  const tagMap = await getTagsForPosts(userPosts.map((post) => post.id));

  return userPosts.map((post) => ({
    ...post,
    createdAt: post.createdAt?.toISOString() ?? "",
    tags: tagMap[post.id] ?? [],
  }));
}
