"use server";

import { getTagsForPostsFromWriteups } from "@/lib/writeups";

export async function getTagsForPosts(postIds: string[]) {
  return getTagsForPostsFromWriteups(postIds);
}
