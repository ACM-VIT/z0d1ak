"use server";

import { db } from "@/lib/db";
import { posts, users, categories, competitions } from "@/drizzle/schema";
import { eq, and } from "drizzle-orm";
import { getTagsForPosts } from "@/app/actions/getTagsForPosts";

export async function getPostBySlug(slug: string) {
  const decodedSlug = decodeURIComponent(slug);
  console.log("getPostBySlug called with slug:", slug);
  console.log("Decoded slug:", decodedSlug);

  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      content: posts.content,
      solveScript: posts.solveScript,
      competitionId: posts.competitionId,
      competitionName: competitions.name,
      createdAt: posts.createdAt,
      category: categories.name,
      author: {
        name: users.name,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(competitions, eq(posts.competitionId, competitions.id))
    .where(and(eq(posts.slug, decodedSlug), eq(posts.isDraft, false)));

  console.log("getPostBySlug: raw query result:", result);
  if (!result[0]) return null;
  const post = result[0];
  const tagMap = await getTagsForPosts([post.id]);
  return {
    ...post,
    createdAt: post.createdAt?.toISOString() ?? "",
    tags: tagMap[post.id] ?? [],
  };
}

export async function getPostById(id: string) {
  const result = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      content: posts.content,
      solveScript: posts.solveScript,
      competitionId: posts.competitionId,
      isDraft: posts.isDraft,
      categoryId: posts.categoryId,
      createdAt: posts.createdAt,
      category: categories.name,
      author: {
        name: users.name,
      },
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(eq(posts.id, id));

  if (!result[0]) return null;
  const post = result[0];
  const tagMap = await getTagsForPosts([post.id]);
  return {
    ...post,
    createdAt: post.createdAt?.toISOString() ?? "",
    tags: tagMap[post.id] ?? [],
  };
}
