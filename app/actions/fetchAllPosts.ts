"use server";

import { db } from "@/lib/db";
import { posts, categories, users } from "@/drizzle/schema";
import { eq, desc, like, and, count } from "drizzle-orm";
import { getTagsForPosts } from "@/app/actions/getTagsForPosts";

export interface FetchPostsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}

export async function fetchAllPosts({
  page = 1,
  limit = 10,
  categoryId,
  search,
}: FetchPostsParams = {}) {
  const offset = (page - 1) * limit;
  const conditions = [eq(posts.isDraft, false)];

  if (categoryId) {
    conditions.push(eq(posts.categoryId, categoryId));
  }
  if (search) {
    conditions.push(like(posts.title, `%${search}%`));
  }

  const whereCondition = conditions.length > 1 ? and(...conditions) : conditions[0];

  const postsResult = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      createdAt: posts.createdAt,
      categoryName: categories.name,
      author: {
        name: users.name,
      },
    })
    .from(posts)
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .leftJoin(users, eq(posts.authorId, users.id))
    .where(whereCondition)
    .orderBy(desc(posts.createdAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ total: count() })
    .from(posts)
    .where(whereCondition);

  const totalCount = countResult[0]?.total ?? 0;

  const tagMap = await getTagsForPosts(postsResult.map((post) => post.id));

  const formattedPosts = postsResult.map((post) => ({
    ...post,
    createdAt: post.createdAt?.toISOString() ?? "",
    tags: tagMap[post.id] ?? [],
  }));

  return { posts: formattedPosts, totalCount, page, limit };
}
