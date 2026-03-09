"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TerminalTextProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  startDelay?: number;
}

export function TerminalText({
  text,
  className,
  typingSpeed = 50,
  startDelay = 0,
}: TerminalTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    timeout = setTimeout(() => {
      setIsTyping(true);
      let i = 0;
      const intervalId = setInterval(() => {
        if (i < text.length) {
          setDisplayText(text.substring(0, i + 1));
          i++;
        } else {
          clearInterval(intervalId);
          setIsTyping(false);
        }
      }, typingSpeed);

      return () => clearInterval(intervalId);
    }, startDelay);

    return () => clearTimeout(timeout);
  }, [text, typingSpeed, startDelay]);

  return (
    <span className={cn("terminal-text font-mono", className)}>
      {displayText}
      {isTyping && <span className="typing"></span>}
    </span>
  );
}
