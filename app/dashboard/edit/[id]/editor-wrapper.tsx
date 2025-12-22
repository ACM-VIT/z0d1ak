"use client";

import { useState, useEffect } from "react";
import Editor from "@/components/editor";

function EditorWrapper({ post }: { post: any }) {
  const [isReady, setIsReady] = useState(false);
  const storageKey = post.isDraft ? `ctf-writeup-draft-${post.id}` : `ctf-writeup-${post.id}`;

  useEffect(() => {
    if (!localStorage.getItem(storageKey)) {
      localStorage.setItem(
        storageKey,
        JSON.stringify({
          title: post.title,
          content: post.content,
          solveScript: post.solveScript || "",
          excerpt: post.excerpt,
          isDraft: post.isDraft,
          category: post.categoryId,
          competitionId: post.competitionId || "",
          tags: post.tags || [],
        })
      );
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
