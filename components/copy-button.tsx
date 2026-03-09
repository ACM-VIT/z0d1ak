"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy } from "lucide-react";

interface CopyButtonProps {
  text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="text-xs border-primary/30 text-primary hover:bg-primary/10"
          >
            <Copy className="h-3.5 w-3.5 mr-1" />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="bg-black border-primary/30">
          <p>Copy markdown to clipboard</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
