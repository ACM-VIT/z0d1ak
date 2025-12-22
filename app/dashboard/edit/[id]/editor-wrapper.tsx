"use client";

import { useState, useEffect } from "react";
import Editor from "@/components/editor";

function EditorWrapper({ post }: { post: any }) {
  const [isReady, setIsReady] = useState(false);
  const storageKey = `ctf-writeup-${post.id}`;

  useEffect(() => {
    const basePayload = {
      title: post.title,
      content: post.content,
      solveScript: post.solveScript || "",
      excerpt: post.excerpt,
      isDraft: post.isDraft,
      category: post.categoryId,
      competitionId: post.competitionId || "",
      tags: post.tags || [],
    };

    const existing = localStorage.getItem(storageKey);
    if (existing) {
      try {
        const parsed = JSON.parse(existing);
        const merged = {
          ...basePayload,
          ...parsed,
        };

        if (!merged.category) merged.category = basePayload.category;
        if (!merged.competitionId) merged.competitionId = basePayload.competitionId;

        localStorage.setItem(storageKey, JSON.stringify(merged));
      } catch (error) {
        localStorage.setItem(storageKey, JSON.stringify(basePayload));
      }
    } else {
      localStorage.setItem(storageKey, JSON.stringify(basePayload));
    }
    setIsReady(true);
  }, [post, storageKey]);

  if (!isReady) return null;

  return (
    <div className="container mx-auto py-8">
      <Editor postId={post.id} />
    </div>
  );
}

export { EditorWrapper };
