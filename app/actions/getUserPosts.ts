"use server";

import { getUserPostsFromWriteups } from "@/lib/writeups";

export async function getUserPosts(userId: string) {
  return getUserPostsFromWriteups(userId);
}
