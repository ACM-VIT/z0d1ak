"use server";

import { getRelatedPostsFromWriteups } from "@/lib/writeups";

export async function getRelatedPosts(
  currentPostId: string,
  categoryId: string,
  limit = 2,
) {
  const relatedPosts = await getRelatedPostsFromWriteups(
    currentPostId,
    categoryId,
    limit,
  );

  return relatedPosts.map((post) => ({
    ...post,
    createdAt: post.createdAt ?? "",
    tags: post.tags ?? [],
    authorName: post.author?.name ?? null,
  }));
}
