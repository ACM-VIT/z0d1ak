"use client";

import { cn } from "@/lib/utils";

interface GlitchTextProps {
  text: string;
  className?: string;
}

export function GlitchText({ text, className }: GlitchTextProps) {
  return (
    <span className={cn("glitch", className)} data-text={text}>
      {text}
    </span>
  );
}
