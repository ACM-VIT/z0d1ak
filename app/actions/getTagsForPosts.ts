"use server";

import { db } from "@/lib/db";
import { post_tags, tags } from "@/drizzle/schema";
import { eq, inArray } from "drizzle-orm";

export async function getTagsForPosts(postIds: string[]) {
  if (postIds.length === 0) return {};

  const rows = await db
    .select({
      postId: post_tags.postId,
      name: tags.name,
    })
    .from(post_tags)
    .innerJoin(tags, eq(post_tags.tagId, tags.id))
    .where(inArray(post_tags.postId, postIds));

  const tagMap: Record<string, string[]> = {};
  for (const row of rows) {
    if (!tagMap[row.postId]) tagMap[row.postId] = [];
    tagMap[row.postId].push(row.name);
  }

  return tagMap;
}
