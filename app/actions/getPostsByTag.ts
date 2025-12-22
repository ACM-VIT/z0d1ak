"use server";

import { db } from "@/lib/db";
import { posts, post_tags, categories } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getTagsForPosts } from "@/app/actions/getTagsForPosts";

export async function getPostsByTag(tagId: string) {
  const postsForTag = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      categoryName: categories.name,
    })
    .from(posts)
    .leftJoin(post_tags, eq(posts.id, post_tags.postId))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(post_tags.tagId, tagId), eq(posts.isDraft, false)));

  const tagMap = await getTagsForPosts(postsForTag.map((post) => post.id));

  return postsForTag.map((post) => ({
    ...post,
    tags: tagMap[post.id] ?? [],
  }));
}
