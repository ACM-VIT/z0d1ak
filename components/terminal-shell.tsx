import type React from "react";

interface TerminalShellProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  maxHeight?: string;
}

interface TerminalPromptProps {
  text: string;
  className?: string;
}

interface TerminalWindowHeaderProps {
  title: string;
}

export function TerminalPrompt({
  text,
  className = "",
}: TerminalPromptProps) {
  return (
    <div className={`font-mono text-sm md:text-base ${className}`}>
      <span className="text-green-500">z0d1ak@ctf</span>
      <span className="text-muted-foreground">:</span>
      <span className="text-blue-500">~</span>
      <span className="text-muted-foreground">$</span>{" "}
      <span className="text-primary">{text}</span>
    </div>
  );
}

export function TerminalWindowHeader({
  title,
}: TerminalWindowHeaderProps) {
  return (
    <div className="flex items-center gap-2 bg-gray-900 px-4 py-2 border-b border-primary/20">
      <div className="h-3 w-3 rounded-full bg-destructive"></div>
      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
      <div className="h-3 w-3 rounded-full bg-green-500"></div>
      <div className="ml-2 text-xs text-muted-foreground font-mono">
        {title}
      </div>
    </div>
  );
}

export function TerminalShell({
  title,
  children,
  className = "",
  fullWidth = false,
  maxHeight = "",
}: TerminalShellProps) {
  return (
    <div
      className={`bg-black border border-primary/30 rounded-lg overflow-hidden ${
        fullWidth ? "w-full" : "max-w-4xl mx-auto"
      } ${className}`}
      style={{ maxHeight: maxHeight || "none" }}
    >
      <TerminalWindowHeader title={title} />
      <div
        className={`p-4 md:p-6 font-mono ${
          maxHeight ? "overflow-auto" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}
