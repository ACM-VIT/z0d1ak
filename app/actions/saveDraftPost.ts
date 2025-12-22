"use server";

import { db } from "@/lib/db";
import { posts, tags, post_tags, categories } from "@/drizzle/schema";
import { nanoid } from "nanoid";
import { validate as isValidUUID } from "uuid";
import { eq } from "drizzle-orm";
import { fetchCategoriesAction } from "@/app/actions/fetchCategories";

async function resolveCategoryUUID(providedCategory: string): Promise<string> {
  const trimmed = providedCategory?.trim() || "misc";

  if (isValidUUID(trimmed)) {
    const allCategories = await fetchCategoriesAction();
    const exists = allCategories.some(cat => cat.id === trimmed);
    if (exists) {
      return trimmed;
    }
  }

  // Try to find category by name
  const allCategories = await fetchCategoriesAction();
  const matchedCategory = allCategories.find(
    (cat) => cat.name.toLowerCase() === trimmed.toLowerCase()
  );

  if (matchedCategory && isValidUUID(matchedCategory.id)) {
    return matchedCategory.id;
  }

  const miscCategory = allCategories.find(cat => cat.name.toLowerCase() === "misc");
  if (miscCategory && isValidUUID(miscCategory.id)) {
    return miscCategory.id;
  }

  try {
    const newMiscCategory = await db.insert(categories)
      .values({
        name: "misc"
      })
      .returning();
    return newMiscCategory[0].id;
  } catch (error) {
    const allCats = await fetchCategoriesAction();
    const misc = allCats.find(cat => cat.name.toLowerCase() === "misc");
    if (misc) {
      return misc.id;
    }
    throw new Error("Could not resolve category");
  }
}

export async function saveDraftPost(data: {
  title: string;
  categoryId: string;
  content: string;
  competitionId?: string | null;
  solveScript?: string;
  authorId: string;
  draftId?: string | null;
  tags?: string[];
}) {
  const categoryUUID = await resolveCategoryUUID(data.categoryId);
  const competitionId = data.competitionId?.trim();
  if (competitionId && !isValidUUID(competitionId)) {
    throw new Error("Invalid competition identifier provided.");
  }
  const excerpt =
    data.content.substring(0, 150) + (data.content.length > 150 ? "..." : "");

  if (data.draftId) {
    const updatedDraft = await db
      .update(posts)
      .set({
        title: data.title,
        categoryId: categoryUUID,
        content: data.content,
        solveScript: data.solveScript,
        competitionId: competitionId || null,
        excerpt,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, data.draftId))
      .returning();

    if (!updatedDraft.length) {
      throw new Error("Draft not found or update failed");
    }

    const postId = data.draftId;

    if (data.tags) {
      await db.delete(post_tags).where(eq(post_tags.postId, postId));

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

    return updatedDraft[0];
  } else {
    const slug =
      data.title.toLowerCase().replace(/\s+/g, "-") + "-" + nanoid(5);
    const newDraft = await db
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
        isDraft: true,
      })
      .returning();

    if (!newDraft.length) {
      throw new Error("Failed to create draft");
    }

    const postId = newDraft[0].id;

    if (data.tags) {
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

    return newDraft[0];
  }
}
