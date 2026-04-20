import bundleData from "./generated/writeups-bundle.json";

export const WRITEUPS_ROOT = "z0d1ak-writeups";

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

export interface WriteupMember {
  id: string;
  name: string;
  slug: string;
  writeupCount: number;
  writeups: WriteupSummary[];
}

export interface FetchWriteupsParams {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
}

interface WriteupsBundle {
  generatedAt: string;
  source: {
    owner: string;
    repo: string;
    ref: string;
    rawBase: string;
    rootPrefix: string;
  };
  competitions: WriteupCompetition[];
  writeups: WriteupSummary[];
}

const DEFAULT_AUTHOR = { name: "Team z0d1ak" } as const;

function ensureBundleShape(bundle: unknown): asserts bundle is WriteupsBundle {
  if (!bundle || typeof bundle !== "object") {
    throw new Error("Invalid writeups bundle: expected an object");
  }

  const maybeBundle = bundle as Partial<WriteupsBundle>;
  if (!Array.isArray(maybeBundle.competitions)) {
    throw new Error("Invalid writeups bundle: competitions must be an array");
  }

  if (!Array.isArray(maybeBundle.writeups)) {
    throw new Error("Invalid writeups bundle: writeups must be an array");
  }

  if (!maybeBundle.source?.rawBase || !maybeBundle.source?.rootPrefix) {
    throw new Error("Invalid writeups bundle: missing source metadata");
  }
}

const bundle = (() => {
  ensureBundleShape(bundleData);
  return bundleData as WriteupsBundle;
})();

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

function uniqueStrings(values: Array<string | null | undefined>): string[] {
  return [
    ...new Set(values.map((value) => (value ?? "").trim()).filter(Boolean)),
  ];
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

function getRelativeSourcePath(value: string): string {
  return value.split("\\").join("/");
}

function stripRootPrefix(repoRelativePath: string): string {
  const rootPrefix = `${bundle.source.rootPrefix}/`;
  return repoRelativePath.startsWith(rootPrefix)
    ? repoRelativePath.slice(rootPrefix.length)
    : repoRelativePath;
}

function isExternalOrAnchorUrl(value: string): boolean {
  return /^(?:[a-z][a-z\d+.-]*:|\/\/|#|\/)/i.test(value);
}

function normalizePosixPath(pathValue: string): string {
  const suffixStart = pathValue.search(/[?#]/);
  const input =
    suffixStart >= 0 ? pathValue.slice(0, suffixStart) : pathValue;
  const suffix = suffixStart >= 0 ? pathValue.slice(suffixStart) : "";
  const parts = input.split("/");
  const stack: string[] = [];

  for (const part of parts) {
    if (!part || part === ".") continue;
    if (part === "..") {
      stack.pop();
      continue;
    }
    stack.push(part);
  }

  return `${stack.join("/")}${suffix}`;
}

export function resolveWriteupAssetUrl(
  readmePath: string,
  value: string,
  kind: "raw" | "blob" = "raw",
): string {
  if (!value || isExternalOrAnchorUrl(value)) {
    return value;
  }

  const rootPrefix = stripRootPrefix(readmePath);
  const baseDirectory = rootPrefix.split("/").slice(0, -1).join("/");
  const resolved = normalizePosixPath(`${baseDirectory}/${value}`);

  const base =
    kind === "raw"
      ? bundle.source.rawBase
      : `https://github.com/${bundle.source.owner}/${bundle.source.repo}/blob/${bundle.source.ref}`;

  return `${base}/${resolved}`;
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

async function loadCompetition(
  competitionName: string,
): Promise<WriteupCompetition | null> {
  return (
    bundle.competitions.find(
      (competition) => competition.name === competitionName,
    ) ?? null
  );
}

async function loadAllCompetitionNames(): Promise<string[]> {
  return bundle.competitions.map((competition) => competition.name);
}

async function loadWriteupsForCompetition(
  competitionName: string,
): Promise<WriteupSummary[]> {
  return bundle.writeups
    .filter((writeup) => writeup.competitionName === competitionName)
    .sort(compareWriteupsByDateDesc);
}

async function loadAllWriteups(): Promise<WriteupSummary[]> {
  return [...bundle.writeups].sort(compareWriteupsByDateDesc);
}

export async function fetchCategoriesFromWriteups(): Promise<
  WriteupCategory[]
> {
  const categoryNames = uniqueStrings(
    bundle.writeups.map((writeup) => writeup.categoryName),
  );

  return categoryNames
    .sort((a, b) => a.localeCompare(b))
    .map((name) => ({
      id: makeStableId("category", name),
      name,
    }));
}

export async function fetchCompetitionsFromWriteups(): Promise<
  WriteupCompetition[]
> {
  return [...bundle.competitions].sort(compareCompetitionsByDateDesc);
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
      `${WRITEUPS_ROOT}/${found.competitionName}`,
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
      `${WRITEUPS_ROOT}/${found.competitionName}`,
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
  userId: string,
): Promise<WriteupSummary[]> {
  const normalizedUserId = decodeURIComponent(userId).trim().toLowerCase();
  if (!normalizedUserId) return [];

  const allWriteups = await loadAllWriteups();

  return allWriteups.filter(
    (writeup) => writeup.author?.name.trim().toLowerCase() === normalizedUserId,
  );
}

export async function getMembersFromWriteups(): Promise<WriteupMember[]> {
  const allWriteups = await loadAllWriteups();
  const memberMap = new Map<string, WriteupMember>();

  for (const writeup of allWriteups) {
    const memberName = writeup.author?.name?.trim() || DEFAULT_AUTHOR.name;
    const memberId = makeStableId("member", memberName);
    const existing = memberMap.get(memberId);

    if (existing) {
      existing.writeups.push(writeup);
      existing.writeupCount = existing.writeups.length;
      continue;
    }

    memberMap.set(memberId, {
      id: memberId,
      name: memberName,
      slug: slugify(memberName),
      writeupCount: 1,
      writeups: [writeup],
    });
  }

  return [...memberMap.values()]
    .map((member) => ({
      ...member,
      writeups: [...member.writeups].sort(compareWriteupsByDateDesc),
      writeupCount: member.writeups.length,
    }))
    .sort((a, b) => {
      if (b.writeupCount !== a.writeupCount) {
        return b.writeupCount - a.writeupCount;
      }

      return a.name.localeCompare(b.name);
    });
}

export async function getMemberPageDataFromWriteups(
  memberNameParam: string,
): Promise<{
  member: Pick<WriteupMember, "id" | "name" | "slug" | "writeupCount">;
  writeups: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    createdAt: string;
    categoryName: string | null;
    competitionName: string;
    authorName: string | null;
  }>;
} | null> {
  const memberName = decodeURIComponent(memberNameParam).trim();
  if (!memberName) return null;

  const members = await getMembersFromWriteups();
  const member = members.find(
    (entry) =>
      entry.name.toLowerCase() === memberName.toLowerCase() ||
      entry.slug === slugify(memberName),
  );

  if (!member) return null;

  return {
    member: {
      id: member.id,
      name: member.name,
      slug: member.slug,
      writeupCount: member.writeupCount,
    },
    writeups: member.writeups.map((writeup) => ({
      id: writeup.id,
      title: writeup.title,
      slug: writeup.slug,
      excerpt: writeup.excerpt,
      content: writeup.content,
      createdAt: writeup.createdAt,
      categoryName: writeup.categoryName,
      competitionName: writeup.competitionName,
      authorName: writeup.author?.name ?? null,
    })),
  };
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
  const allWriteups = await loadAllWriteups();
  const writeup = allWriteups.find((entry) => entry.readmePath === readmePath);

  if (!writeup) return [];

  const assetMatches = [...writeup.content.matchAll(/!?\[[^\]]*\]\(([^)]+)\)/g)]
    .map((match) => (match[1] ?? "").trim())
    .filter((value) => value && !isExternalOrAnchorUrl(value));

  return uniqueStrings(
    assetMatches.map((relativePath) =>
      resolveWriteupAssetUrl(writeup.readmePath, relativePath, "raw"),
    ),
  );
}
