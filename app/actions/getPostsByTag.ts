"use server";

import { getPostsByTagFromWriteups } from "@/lib/writeups";

export async function getPostsByTag(tag: string) {
  return getPostsByTagFromWriteups(tag);
}
