"use server";

import { getLatestPostsFromWriteups } from "@/lib/writeups";

export async function getLatestPosts(limit: number = 3) {
  return getLatestPostsFromWriteups(limit);
}
