"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Folder, File } from "lucide-react";

interface Competition {
  id: string;
  name: string;
  latestPost: string | null;
  postCount: number;
}

interface FileStructureProps {
  competitions: Competition[];
}

function isReadmeLikePost(post: { title?: string; slug?: string }) {
  const title = (post.title || "").trim().toLowerCase();
  const slug = (post.slug || "").trim().toLowerCase();

  return (
    title === "readme" ||
    title === "readme.md" ||
    slug === "readme" ||
    slug.endsWith("-readme") ||
    slug.endsWith("-readme-md")
  );
}

export default function FileStructure({ competitions }: FileStructureProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [competitionPosts, setCompetitionPosts] = useState<
    Record<string, any[]>
  >({});

  const toggleCompetition = async (competitionName: string) => {
    setExpanded((prev) => ({
      ...prev,
      [competitionName]: !prev[competitionName],
    }));
    if (!competitionPosts[competitionName]) {
      const res = await fetch(
        `/api/posts?competitionName=${encodeURIComponent(competitionName)}`,
      );
      const data = await res.json();
      setCompetitionPosts((prev) => ({ ...prev, [competitionName]: data }));
    }
  };

  return (
    <div className="font-mono text-sm">
      <div className="flex items-center gap-2 text-primary mb-2">
        <Folder className="h-4 w-4" />
        <span>competitions</span>
      </div>
      {competitions.map((competition) => (
        <div
          key={competition.id}
          className="ml-4 border-l border-primary/30 pl-4"
        >
          <div className="flex items-center gap-2 text-white mb-2">
            {expanded[competition.name] ? (
              <ChevronDown
                onClick={() => toggleCompetition(competition.name)}
                className="h-4 w-4 text-primary cursor-pointer"
              />
            ) : (
              <ChevronRight
                onClick={() => toggleCompetition(competition.name)}
                className="h-4 w-4 text-primary cursor-pointer"
              />
            )}
            <Folder className="h-4 w-4 text-yellow-500" />
            <Link
              href={`/competitions/${encodeURIComponent(competition.name)}`}
              className="hover:underline"
            >
              {competition.name}
            </Link>
            <span className="text-xs text-muted-foreground">
              ({competition.postCount} writeups)
            </span>
          </div>
          {expanded[competition.name] && (
            <div className="ml-4 border-l border-primary/30 pl-4">
              <Link
                href={`/competitions/${encodeURIComponent(competition.name)}#readme`}
                className="flex items-center gap-2 text-muted-foreground hover:underline"
              >
                <File className="h-4 w-4" />
                <span>README.md</span>
              </Link>

              {competitionPosts[competition.name] ? (
                competitionPosts[competition.name]
                  .filter((post) => !isReadmeLikePost(post))
                  .map((post, index) => (
                    <Link
                      key={post.id || index}
                      href={`/writeups/${post.slug}`}
                      className="flex items-center gap-2 text-muted-foreground hover:underline"
                    >
                      <File className="h-4 w-4" />
                      <span>{post.title}</span>
                    </Link>
                  ))
              ) : (
                <div className="ml-4">Loading posts...</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
