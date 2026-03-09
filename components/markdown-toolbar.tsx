"use client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  LinkIcon,
  ImageIcon,
  List,
  ListOrdered,
  CheckSquare,
  Table,
  Code,
  Terminal,
  Flag,
  FileCode2,
} from "lucide-react";

interface MarkdownToolbarProps {
  onInsert: (syntax: string, selectionOffset?: number) => void;
}

export function MarkdownToolbar({ onInsert }: MarkdownToolbarProps) {
  return (
    <TooltipProvider>
      <div className="flex flex-wrap items-center gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={() => onInsert("# $1", 2)}
            >
              <Heading1 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black border-primary/30">
            <p>Heading 1</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={() => onInsert("## $1", 3)}
            >
              <Heading2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black border-primary/30">
            <p>Heading 2</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={() => onInsert("### $1", 4)}
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black border-primary/30">
            <p>Heading 3</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6 mx-1 bg-primary/20" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={() => onInsert("**$1**", 2)}
            >
              <Bold className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black border-primary/30">
            <p>Bold (Ctrl+B)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={() => onInsert("*$1*", 1)}
            >
              <Italic className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black border-primary/30">
            <p>Italic (Ctrl+I)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={() => onInsert("[$1](url)", 1)}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black border-primary/30">
            <p>Link (Ctrl+K)</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={() => onInsert("![alt text](image-url)", 2)}
            >
              <ImageIcon className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black border-primary/30">
            <p>Image</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6 mx-1 bg-primary/20" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={() => onInsert("- $1", 2)}
            >
              <List className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black border-primary/30">
            <p>Bullet List</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={() => onInsert("1. $1", 3)}
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black border-primary/30">
            <p>Numbered List</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={() => onInsert("- [ ] $1", 6)}
            >
              <CheckSquare className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black border-primary/30">
            <p>Task List</p>
          </TooltipContent>
        </Tooltip>
        <Separator orientation="vertical" className="h-6 mx-1 bg-primary/20" />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={() => onInsert("```\n$1\n```", 4)}
            >
              <Code className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black border-primary/30">
            <p>Code Block</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={() => onInsert("```python\n$1\n```", 10)}
            >
              <FileCode2 className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black border-primary/30">
            <p>Python Code Block</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={() => onInsert("```bash\n$1\n```", 8)}
            >
              <Terminal className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black border-primary/30">
            <p>Terminal/Bash</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={() =>
                onInsert(
                  "| Header | Header |\n| ------ | ------ |\n| Cell | Cell |\n| Cell | Cell |",
                  2,
                )
              }
            >
              <Table className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black border-primary/30">
            <p>Table</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
              onClick={() => onInsert("`flag{$1}`", 6)}
            >
              <Flag className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent className="bg-black border-primary/30">
            <p>Flag Format</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
