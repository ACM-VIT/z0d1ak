"use server";

import { db } from "@/lib/db";
import { posts, tags, post_tags } from "@/drizzle/schema";
import { nanoid } from "nanoid";
import { validate as isValidUUID } from "uuid";
import { fetchCategoriesAction } from "@/app/actions/fetchCategories";
import { eq } from "drizzle-orm";

async function resolveCategoryUUID(providedCategory: string): Promise<string> {
  const trimmed = providedCategory.trim() || "misc";
  
  if (isValidUUID(trimmed)) {
    return trimmed;
  }
  
  const allCategories = await fetchCategoriesAction();
  
  const matchedCategory = allCategories.find(
    (cat) => cat.name.toLowerCase() === trimmed.toLowerCase()
  );

  if (!matchedCategory || !isValidUUID(matchedCategory.id)) {
    throw new Error("Invalid category identifier provided.");
  }

  return matchedCategory.id;
}

export async function createWriteup(data: {
  title: string;
  categoryId: string;
  content: string;
  competitionId?: string | null;
  solveScript?: string;
  authorId: string;
  isDraft?: boolean;
  tags?: string[];
}) {
  const categoryUUID = await resolveCategoryUUID(data.categoryId);
  const competitionId = data.competitionId?.trim();
  if (competitionId && !isValidUUID(competitionId)) {
    throw new Error("Invalid competition identifier provided.");
  }

  const excerpt =
    data.content.substring(0, 150) + (data.content.length > 150 ? "..." : "");
  const slug =
    data.title.toLowerCase().replace(/\s+/g, "-") + "-" + nanoid(5);

  const newPost = await db
    .insert(posts)
    .values({
      title: data.title,
      slug,
      excerpt,
      content: data.content,
      solveScript: data.solveScript,
      competitionId: competitionId || null,
      categoryId: categoryUUID,
      authorId: data.authorId,
      isDraft: data.isDraft ?? false,
    })
    .returning();

  const postId = newPost[0].id;

  if (data.tags && data.tags.length > 0) {
    for (const tagName of data.tags) {
      const trimmedTag = tagName.trim();
      if (!trimmedTag) continue;
      
      const existingTag = await db
        .select()
        .from(tags)
        .where(eq(tags.name, trimmedTag))
        .limit(1);

      let tagId: string;
      if (existingTag.length > 0) {
        tagId = existingTag[0].id;
      } else {
        const newTag = await db
          .insert(tags)
          .values({ name: trimmedTag })
          .returning();
        tagId = newTag[0].id;
      }
      
      await db.insert(post_tags).values({ postId, tagId });
    }
  }

  return newPost;
}
