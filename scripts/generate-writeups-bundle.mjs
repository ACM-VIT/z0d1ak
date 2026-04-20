import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OWNER = process.env.WRITEUPS_REPO_OWNER || "ACM-VIT";
const REPO = process.env.WRITEUPS_REPO_NAME || "z0d1ak-writeups";
const REF = process.env.WRITEUPS_REPO_REF || "main";
const ROOT_PREFIX = "z0d1ak-writeups";
const README_FILE = "README.md";

const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;
const RAW_BASE = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${REF}`;

function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

function makeStableId(...parts) {
  return parts
    .map((part) => slugify(part))
    .filter(Boolean)
    .join("__");
}

function normalizeText(value) {
  return value.replace(/\r\n/g, "\n").trim();
}

function extractDateFromCompetitionName(name) {
  const isoMatch = name.match(/\b(20\d{2}-\d{2}-\d{2})\b/);
  if (isoMatch) return isoMatch[1];

  const yearMatch = name.match(/\b(20\d{2})\b/);
  if (yearMatch) return `${yearMatch[1]}-01-01`;

  return null;
}

function extractExcerpt(markdown, maxLength = 220) {
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

function extractAuthorName(markdown) {
  const normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  for (let index = lines.length - 1; index >= 0; index -= 1) {
    if (lines[index].trim() !== "## Author") continue;

    for (let nextIndex = index + 1; nextIndex < lines.length; nextIndex += 1) {
      const candidate = lines[nextIndex].trim();

      if (!candidate) continue;
      if (candidate.startsWith("#")) break;

      return candidate;
    }

    break;
  }

  return null;
}

function uniqueStrings(values) {
  return [
    ...new Set(values.map((value) => (value ?? "").trim()).filter(Boolean)),
  ];
}

function buildWriteupTags({ createdAt, competitionName, categoryName }) {
  return uniqueStrings([createdAt, competitionName, categoryName]);
}

async function githubApi(pathname) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "z0d1ak-writeups-bundle-generator",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }

  const response = await fetch(`${API_BASE}${pathname}`, { headers });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `GitHub API request failed: ${response.status} ${response.statusText} (${pathname})\n${body}`,
    );
  }

  return response.json();
}

async function fetchRawFile(repoPath) {
  const encodedPath = repoPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  const response = await fetch(`${RAW_BASE}/${encodedPath}`);
  if (!response.ok) {
    throw new Error(
      `Failed to fetch raw file (${repoPath}): ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
}

async function runWithConcurrency(items, worker, concurrency = 8) {
  const results = new Array(items.length);
  let nextIndex = 0;

  const runners = Array.from({ length: Math.max(1, concurrency) }, async () => {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= items.length) break;
      results[currentIndex] = await worker(items[currentIndex], currentIndex);
    }
  });

  await Promise.all(runners);
  return results;
}

function toRepoRelativePath(repoPath) {
  return `${ROOT_PREFIX}/${repoPath}`;
}

async function generateBundle() {
  const tree = await githubApi(
    `/git/trees/${encodeURIComponent(REF)}?recursive=1`,
  );
  if (tree.truncated) {
    throw new Error(
      "Git tree response is truncated. Fetching subtree-by-subtree is required.",
    );
  }

  const readmePaths = tree.tree
    .filter(
      (entry) =>
        entry.type === "blob" && entry.path.endsWith(`/${README_FILE}`),
    )
    .map((entry) => entry.path)
    .sort((a, b) => a.localeCompare(b));

  const parsedReadmes = await runWithConcurrency(
    readmePaths,
    async (repoPath) => {
      const parts = repoPath.split("/");
      const content = normalizeText(await fetchRawFile(repoPath));

      if (parts.length === 2) {
        const [competitionName] = parts;
        return {
          kind: "competition",
          competitionName,
          repoPath,
          content,
        };
      }

      if (parts.length === 4) {
        const [competitionName, categoryName, challengeName] = parts;
        return {
          kind: "writeup",
          competitionName,
          categoryName,
          challengeName,
          repoPath,
          content,
        };
      }

      return null;
    },
    10,
  );

  const competitionsMap = new Map();
  const writeups = [];

  for (const item of parsedReadmes) {
    if (!item) continue;

    if (item.kind === "competition") {
      const date = extractDateFromCompetitionName(item.competitionName);
      const existingCompetition = competitionsMap.get(item.competitionName);

      competitionsMap.set(item.competitionName, {
        id: makeStableId("competition", item.competitionName),
        name: item.competitionName,
        slug: slugify(item.competitionName),
        path: toRepoRelativePath(item.competitionName),
        readmePath: toRepoRelativePath(item.repoPath),
        readmeContent: item.content,
        date,
        tags: uniqueStrings([
          ...(existingCompetition?.tags ?? []),
          date,
          item.competitionName,
        ]),
        categories: [...(existingCompetition?.categories ?? [])].sort((a, b) =>
          a.localeCompare(b),
        ),
        writeupCount: existingCompetition?.writeupCount ?? 0,
      });
      continue;
    }

    const createdAt =
      extractDateFromCompetitionName(item.competitionName) ||
      new Date(0).toISOString();

    writeups.push({
      id: makeStableId(
        "writeup",
        item.competitionName,
        item.categoryName,
        item.challengeName,
      ),
      slug: slugify(
        `${item.competitionName}-${item.categoryName}-${item.challengeName}`,
      ),
      title: item.challengeName,
      excerpt: extractExcerpt(item.content),
      content: item.content,
      createdAt,
      competitionId: makeStableId("competition", item.competitionName),
      competitionName: item.competitionName,
      competitionSlug: slugify(item.competitionName),
      categoryId: makeStableId("category", item.categoryName),
      categoryName: item.categoryName,
      author: {
        name: extractAuthorName(item.content) || "Team z0d1ak",
      },
      tags: buildWriteupTags({
        createdAt,
        competitionName: item.competitionName,
        categoryName: item.categoryName,
      }),
      sourcePath: toRepoRelativePath(
        `${item.competitionName}/${item.categoryName}/${item.challengeName}`,
      ),
      readmePath: toRepoRelativePath(item.repoPath),
    });

    const competition = competitionsMap.get(item.competitionName) || {
      id: makeStableId("competition", item.competitionName),
      name: item.competitionName,
      slug: slugify(item.competitionName),
      path: toRepoRelativePath(item.competitionName),
      readmePath: null,
      readmeContent: null,
      date: extractDateFromCompetitionName(item.competitionName),
      tags: uniqueStrings([
        extractDateFromCompetitionName(item.competitionName),
        item.competitionName,
      ]),
      categories: [],
      writeupCount: 0,
    };

    if (!competition.categories.includes(item.categoryName)) {
      competition.categories.push(item.categoryName);
      competition.categories.sort((a, b) => a.localeCompare(b));
    }

    competition.writeupCount += 1;
    competitionsMap.set(item.competitionName, competition);
  }

  const competitions = [...competitionsMap.values()].sort((a, b) => {
    const aTime = a.date ? new Date(a.date).getTime() : 0;
    const bTime = b.date ? new Date(b.date).getTime() : 0;
    if (aTime !== bTime) return bTime - aTime;
    return a.name.localeCompare(b.name);
  });

  writeups.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  return {
    generatedAt: new Date().toISOString(),
    source: {
      owner: OWNER,
      repo: REPO,
      ref: REF,
      rawBase: RAW_BASE,
      rootPrefix: ROOT_PREFIX,
    },
    competitions,
    writeups,
  };
}

async function main() {
  const bundle = await generateBundle();
  const outputDir = path.join(process.cwd(), "lib", "writeups", "generated");
  const outputPath = path.join(outputDir, "writeups-bundle.json");

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(bundle, null, 2)}\n`, "utf8");

  console.log(
    `Generated writeups bundle at ${outputPath} with ${bundle.writeups.length} writeups across ${bundle.competitions.length} competitions.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
