"use server"

import { db } from "@/lib/db"
import { competitions, posts, categories, users } from "@/drizzle/schema"
import { and, desc, eq } from "drizzle-orm"

export type CompetitionWriteup = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  createdAt: string
  categoryName: string | null
  authorName: string | null
}

function isReadmeLikePost(post: Pick<CompetitionWriteup, "title" | "slug">) {
  const title = post.title.trim().toLowerCase()
  const slug = post.slug.trim().toLowerCase()

  return (
    title === "readme" ||
    title === "readme.md" ||
    slug === "readme" ||
    slug.endsWith("-readme") ||
    slug.endsWith("-readme-md")
  )
}

export async function getCompetitionPageData(competitionNameParam: string) {
  const competitionName = decodeURIComponent(competitionNameParam)

  const foundCompetition = await db
    .select({
      id: competitions.id,
      name: competitions.name,
    })
    .from(competitions)
    .where(eq(competitions.name, competitionName))
    .limit(1)

  const competition = foundCompetition[0] ?? null
  if (!competition) return null

  const postsForCompetition = await db
    .select({
      id: posts.id,
      title: posts.title,
      slug: posts.slug,
      excerpt: posts.excerpt,
      content: posts.content,
      createdAt: posts.createdAt,
      categoryName: categories.name,
      authorName: users.name,
    })
    .from(posts)
    .leftJoin(users, eq(posts.authorId, users.id))
    .leftJoin(categories, eq(posts.categoryId, categories.id))
    .where(and(eq(posts.competitionId, competition.id), eq(posts.isDraft, false)))
    .orderBy(desc(posts.createdAt))

  const formattedPosts: CompetitionWriteup[] = postsForCompetition.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    createdAt: p.createdAt?.toISOString() ?? "",
    categoryName: p.categoryName ?? null,
    authorName: p.authorName ?? null,
  }))

  const readme = formattedPosts.find(isReadmeLikePost) ?? null
  const writeups = formattedPosts.filter((p) => !readme || p.id !== readme.id)

  return {
    competition,
    readme,
    writeups,
  }
}
