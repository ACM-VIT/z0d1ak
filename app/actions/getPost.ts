"use server";

import {
  getPostByIdFromWriteups,
  getPostBySlugFromWriteups,
} from "@/lib/writeups";

export async function getPostBySlug(slug: string) {
  return getPostBySlugFromWriteups(slug);
}

export async function getPostById(id: string) {
  return getPostByIdFromWriteups(id);
}
