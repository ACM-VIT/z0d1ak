import { promises as fs } from "fs";
import path from "path";

export const WRITEUPS_ROOT = path.join(process.cwd(), "z0d1ak-writeups");

export type WriteupTagKind = "date" | "ctf" | "category";

export interface WriteupTag {
  kind: WriteupTagKind;
  value: string;
}

export interface WriteupCompetition {
  id: string;
  name: string;
  slug: string;
  path: string;
  readmePath: string | null;
  readmeContent: string | null;
  date: string | null;
  tags: string[];
  categories: string[];
  writeupCount: number;
}

export interface WriteupSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  createdAt: string;
  competitionId: string;
  competitionName: string;
  competitionSlug: string;
  categoryId: string;
  categoryName: string;
  author: {
    name: string;
  } | null;
  tags: string[];
  sourcePath: string;
  readmePath: string;
}

export interface WriteupDetail extends WriteupSummary {
  solveScript: string;
  competitionPath: string;
  category: string;
}

export interface WriteupCategory {
  id: string;
  name: string;
}

export interface FetchWriteupsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}

const README_FILE = "README.md";
const IGNORED_DIRECTORY_NAMES = new Set([
  ".git",
  ".github",
  ".hooks",
  "node_modules",
]);
const DEFAULT_AUTHOR = { name: "Team z0d1ak" } as const;

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function makeStableId(...parts: string[]): string {
  return parts
    .map((part) => slugify(part))
    .filter(Boolean)
    .join("__");
}

function normalizeText(value: string): string {
  return value.replace(/\r\n/g, "\n").trim();
}

function toPosixPath(value: string): string {
  return value.split(path.sep).join("/");
}

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return [
    ...new Set(values.map((value) => (value ?? "").trim()).filter(Boolean)),
  ];
}

function isDirectoryEntryNameIgnored(name: string): boolean {
  return IGNORED_DIRECTORY_NAMES.has(name);
}

async function pathExists(targetPath: string): Promise<boolean> {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readTextFileIfExists(
  targetPath: string,
): Promise<string | null> {
  try {
    return await fs.readFile(targetPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

async function listDirectories(targetPath: string): Promise<string[]> {
  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  return entries
    .filter(
      (entry) =>
        entry.isDirectory() && !isDirectoryEntryNameIgnored(entry.name),
    )
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

async function listFiles(targetPath: string): Promise<string[]> {
  const entries = await fs.readdir(targetPath, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
}

function extractDateFromCompetitionName(name: string): string | null {
  const isoMatch = name.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (isoMatch) return isoMatch[1];

  const yearMatch = name.match(/\b(20\d{2})\b/);
  if (yearMatch) return `${yearMatch[1]}-01-01`;

  return null;
}

function extractExcerpt(markdown: string, maxLength = 220): string {
  const cleaned = markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[>*_-]{2,}/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength).trimEnd()}…`;
}

function buildWriteupTags(params: {
  createdAt: string;
  competitionName: string;
  categoryName: string;
}): string[] {
  return uniqueStrings([
    params.createdAt,
    params.competitionName,
    params.categoryName,
  ]);
}

function getRelativeSourcePath(fullPath: string): string {
  return toPosixPath(path.relative(process.cwd(), fullPath));
}

function compareWriteupsByDateDesc(
  a: WriteupSummary,
  b: WriteupSummary,
): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
}

function compareCompetitionsByDateDesc(
  a: WriteupCompetition,
  b: WriteupCompetition,
): number {
  const aTime = a.date ? new Date(a.date).getTime() : 0;
  const bTime = b.date ? new Date(b.date).getTime() : 0;

  if (aTime !== bTime) return bTime - aTime;
  return a.name.localeCompare(b.name);
}

async function ensureWriteupsRoot(): Promise<void> {
  const exists = await pathExists(WRITEUPS_ROOT);
  if (!exists) {
    throw new Error(`Writeups repository not found at ${WRITEUPS_ROOT}`);
  }
}

async function loadCompetition(
  competitionName: string,
): Promise<WriteupCompetition | null> {
  await ensureWriteupsRoot();

  const competitionPath = path.join(WRITEUPS_ROOT, competitionName);
  const exists = await pathExists(competitionPath);
  if (!exists) return null;

  const readmePath = path.join(competitionPath, README_FILE);
  const readmeContent = await readTextFileIfExists(readmePath);
  const categoryNames = await listDirectories(competitionPath);

  let writeupCount = 0;
  for (const categoryName of categoryNames) {
    const categoryPath = path.join(competitionPath, categoryName);
    const challengeNames = await listDirectories(categoryPath);
    writeupCount += challengeNames.length;
  }

  const date = extractDateFromCompetitionName(competitionName);

  return {
    id: makeStableId("competition", competitionName),
    name: competitionName,
    slug: slugify(competitionName),
    path: getRelativeSourcePath(competitionPath),
    readmePath: readmeContent ? getRelativeSourcePath(readmePath) : null,
    readmeContent: readmeContent ? normalizeText(readmeContent) : null,
    date,
    tags: uniqueStrings([date, competitionName]),
    categories: categoryNames,
    writeupCount,
  };
}

async function loadAllCompetitionNames(): Promise<string[]> {
  await ensureWriteupsRoot();
  return listDirectories(WRITEUPS_ROOT);
}

async function loadWriteupsForCompetition(
  competitionName: string,
): Promise<WriteupSummary[]> {
  const competitionPath = path.join(WRITEUPS_ROOT, competitionName);
  const categoryNames = await listDirectories(competitionPath);
  const date =
    extractDateFromCompetitionName(competitionName) ??
    new Date(0).toISOString();

  const writeups: WriteupSummary[] = [];

  for (const categoryName of categoryNames) {
    const categoryPath = path.join(competitionPath, categoryName);
    const challengeNames = await listDirectories(categoryPath);

    for (const challengeName of challengeNames) {
      const challengePath = path.join(categoryPath, challengeName);
      const readmePath = path.join(challengePath, README_FILE);
      const content = await readTextFileIfExists(readmePath);

      if (!content) continue;

      const normalizedContent = normalizeText(content);
      const createdAt = extractDateFromCompetitionName(competitionName) ?? date;

      writeups.push({
        id: makeStableId(
          "writeup",
          competitionName,
          categoryName,
          challengeName,
        ),
        slug: slugify(`${competitionName}-${categoryName}-${challengeName}`),
        title: challengeName,
        excerpt: extractExcerpt(normalizedContent),
        content: normalizedContent,
        createdAt,
        competitionId: makeStableId("competition", competitionName),
        competitionName,
        competitionSlug: slugify(competitionName),
        categoryId: makeStableId("category", categoryName),
        categoryName,
        author: { ...DEFAULT_AUTHOR },
        tags: buildWriteupTags({
          createdAt,
          competitionName,
          categoryName,
        }),
        sourcePath: getRelativeSourcePath(challengePath),
        readmePath: getRelativeSourcePath(readmePath),
      });
    }
  }

  return writeups.sort(compareWriteupsByDateDesc);
}

async function loadAllWriteups(): Promise<WriteupSummary[]> {
  const competitionNames = await loadAllCompetitionNames();
  const all = await Promise.all(
    competitionNames.map((competitionName) =>
      loadWriteupsForCompetition(competitionName),
    ),
  );

  return all.flat().sort(compareWriteupsByDateDesc);
}

export async function fetchCategoriesFromWriteups(): Promise<
  WriteupCategory[]
> {
  const competitions = await loadAllCompetitionNames();
  const categoryNames = new Set<string>();

  for (const competitionName of competitions) {
    const competitionPath = path.join(WRITEUPS_ROOT, competitionName);
    const names = await listDirectories(competitionPath);
    names.forEach((name) => categoryNames.add(name));
  }

  return [...categoryNames]
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({
      id: makeStableId("category", name),
      name,
    }));
}

export async function fetchCompetitionsFromWriteups(): Promise<
  WriteupCompetition[]
> {
  const competitionNames = await loadAllCompetitionNames();
  const competitions = await Promise.all(
    competitionNames.map((competitionName) => loadCompetition(competitionName)),
  );

  return competitions
    .filter(
      (competition): competition is WriteupCompetition => competition !== null,
    )
    .sort(compareCompetitionsByDateDesc);
}

export async function fetchAllPostsFromWriteups({
  page = 1,
  limit = 10,
  categoryId,
  search,
}: FetchWriteupsParams = {}) {
  const allWriteups = await loadAllWriteups();

  const normalizedSearch = search?.trim().toLowerCase();
  const filtered = allWriteups.filter((writeup) => {
    const matchesCategory = categoryId
      ? writeup.categoryId === categoryId
      : true;
    const matchesSearch = normalizedSearch
      ? [
          writeup.title,
          writeup.excerpt,
          writeup.content,
          writeup.competitionName,
          writeup.categoryName,
          ...writeup.tags,
        ]
          .join("\n")
          .toLowerCase()
          .includes(normalizedSearch)
      : true;

    return matchesCategory && matchesSearch;
  });

  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safeLimit =
    Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 10;
  const offset = (safePage - 1) * safeLimit;

  return {
    posts: filtered.slice(offset, offset + safeLimit),
    totalCount: filtered.length,
    page: safePage,
    limit: safeLimit,
  };
}

export async function getLatestPostsFromWriteups(
  limit = 3,
): Promise<WriteupSummary[]> {
  const allWriteups = await loadAllWriteups();
  return allWriteups.slice(0, Math.max(0, limit));
}

export async function getPostBySlugFromWriteups(
  slug: string,
): Promise<WriteupDetail | null> {
  const decodedSlug = decodeURIComponent(slug);
  const allWriteups = await loadAllWriteups();
  const found = allWriteups.find((writeup) => writeup.slug === decodedSlug);

  if (!found) return null;

  return {
    ...found,
    solveScript: "",
    competitionPath: getRelativeSourcePath(
      path.join(WRITEUPS_ROOT, found.competitionName),
    ),
    category: found.categoryName,
  };
}

export async function getPostByIdFromWriteups(
  id: string,
): Promise<WriteupDetail | null> {
  const allWriteups = await loadAllWriteups();
  const found = allWriteups.find((writeup) => writeup.id === id);

  if (!found) return null;

  return {
    ...found,
    solveScript: "",
    competitionPath: getRelativeSourcePath(
      path.join(WRITEUPS_ROOT, found.competitionName),
    ),
    category: found.categoryName,
  };
}

export async function getPostsByCompetitionIdFromWriteups(
  competitionId: string,
): Promise<WriteupSummary[]> {
  const allWriteups = await loadAllWriteups();
  return allWriteups.filter(
    (writeup) => writeup.competitionId === competitionId,
  );
}

export async function getPostsByCompetitionNameFromWriteups(
  competitionName: string,
): Promise<WriteupSummary[]> {
  const allWriteups = await loadAllWriteups();
  return allWriteups.filter(
    (writeup) => writeup.competitionName === competitionName,
  );
}

export async function getPostsByTagFromWriteups(
  tag: string,
): Promise<WriteupSummary[]> {
  const normalizedTag = tag.trim().toLowerCase();
  const allWriteups = await loadAllWriteups();

  return allWriteups.filter((writeup) =>
    writeup.tags.some((value) => value.toLowerCase() === normalizedTag),
  );
}

export async function getRelatedPostsFromWriteups(
  currentPostId: string,
  categoryId: string,
  limit = 2,
): Promise<WriteupSummary[]> {
  const allWriteups = await loadAllWriteups();
  return allWriteups
    .filter(
      (writeup) =>
        writeup.id !== currentPostId &&
        (!categoryId || writeup.categoryId === categoryId),
    )
    .slice(0, Math.max(0, limit));
}

export async function getTagsForPostsFromWriteups(
  postIds: string[],
): Promise<Record<string, string[]>> {
  const wanted = new Set(postIds);
  const allWriteups = await loadAllWriteups();
  const tagMap: Record<string, string[]> = {};

  for (const writeup of allWriteups) {
    if (wanted.has(writeup.id)) {
      tagMap[writeup.id] = writeup.tags;
    }
  }

  return tagMap;
}

export async function getCompetitionPageDataFromWriteups(
  competitionNameParam: string,
): Promise<{
  competition: Pick<WriteupCompetition, "id" | "name" | "slug">;
  readme: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    createdAt: string;
    categoryName: string | null;
    authorName: string | null;
  } | null;
  writeups: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    createdAt: string;
    categoryName: string | null;
    authorName: string | null;
  }>;
} | null> {
  const competitionName = decodeURIComponent(competitionNameParam);
  const competition = await loadCompetition(competitionName);

  if (!competition) return null;

  const writeups = await getPostsByCompetitionNameFromWriteups(competitionName);
  const createdAt = competition.date ?? new Date(0).toISOString();

  const readme = competition.readmeContent
    ? {
        id: makeStableId("competition-readme", competition.name),
        title: "README",
        slug: `${competition.slug}-readme`,
        excerpt: extractExcerpt(competition.readmeContent),
        content: competition.readmeContent,
        createdAt,
        categoryName: null,
        authorName: DEFAULT_AUTHOR.name,
      }
    : null;

  return {
    competition: {
      id: competition.id,
      name: competition.name,
      slug: competition.slug,
    },
    readme,
    writeups: writeups.map((writeup) => ({
      id: writeup.id,
      title: writeup.title,
      slug: writeup.slug,
      excerpt: writeup.excerpt,
      content: writeup.content,
      createdAt: writeup.createdAt,
      categoryName: writeup.categoryName,
      authorName: writeup.author?.name ?? null,
    })),
  };
}

export async function getUserPostsFromWriteups(
  _userId: string,
): Promise<WriteupSummary[]> {
  return [];
}

export async function getLatestCompetitionsFromWriteups(limit = 100): Promise<
  Array<{
    id: string;
    name: string;
    latestPost: string | null;
    postCount: number;
  }>
> {
  const competitions = await fetchCompetitionsFromWriteups();
  const allWriteups = await loadAllWriteups();

  return competitions.slice(0, Math.max(0, limit)).map((competition) => {
    const posts = allWriteups.filter(
      (writeup) => writeup.competitionId === competition.id,
    );
    return {
      id: competition.id,
      name: competition.name,
      latestPost: posts[0]?.title ?? null,
      postCount: posts.length,
    };
  });
}

export async function getAllAssetFilesForWriteup(
  readmePath: string,
): Promise<string[]> {
  const absoluteReadmePath = path.join(process.cwd(), readmePath);
  const writeupDir = path.dirname(absoluteReadmePath);
  const files = await listFiles(writeupDir);

  return files
    .filter((file) => file !== README_FILE)
    .map((file) => getRelativeSourcePath(path.join(writeupDir, file)));
}
