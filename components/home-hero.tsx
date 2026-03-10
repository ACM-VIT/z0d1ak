"use client";

import { Code, FileText, Search, Shield, Terminal, Zap } from "lucide-react";

import { GlitchText } from "@/components/glitch-text";
import { HeroActionButtons } from "@/components/hero-action-buttons";
import { TerminalText } from "@/components/terminal-text";
import { TerminalPrompt, TerminalShell } from "@/components/terminal-shell";

function AsciiArt() {
  return (
    <pre className="text-primary text-xs md:text-sm font-mono leading-tight overflow-x-auto">
      {`
 ███████╗ ██████╗ ██████╗  ██╗ █████╗ ██╗  ██╗
 ╚══███╔╝██╔═████╗██╔══██╗███║██╔══██╗██║ ██╔╝
   ███╔╝ ██║██╔██║██║  ██║╚██║███████║█████╔╝
  ███╔╝  ████╔╝██║██║  ██║ ██║██╔══██║██╔═██╗
 ███████╗╚██████╔╝██████╔╝ ██║██║  ██║██║  ██╗
 ╚══════╝ ╚═════╝ ╚═════╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝

      `}
    </pre>
  );
}

function SkillsGrid({ compact = false }: { compact?: boolean }) {
  const gridClassName = compact
    ? "grid grid-cols-2 gap-2 my-2"
    : "grid grid-cols-2 sm:grid-cols-3 gap-2 my-2";

  return (
    <div className={gridClassName}>
      <div className="flex items-center gap-2">
        <Code className="h-4 w-4 text-blue-400" />
        <span className="text-blue-400">web</span>
      </div>
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-green-400" />
        <span className="text-green-400">crypto</span>
      </div>
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-yellow-400" />
        <span className="text-yellow-400">forensics</span>
      </div>
      <div className="flex items-center gap-2">
        <Terminal className="h-4 w-4 text-red-400" />
        <span className="text-red-400">pwn</span>
      </div>
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-purple-400" />
        <span className="text-purple-400">reverse</span>
      </div>
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-orange-400" />
        <span className="text-orange-400">OSINT</span>
      </div>
    </div>
  );
}

export function MobileHero() {
  return (
    <div className="space-y-6 text-center px-4">
      <div className="inline-block rounded-lg bg-black border border-primary/30 px-3 py-1 text-sm mb-4 mx-auto">
        <TerminalText text="$ ./welcome.sh" typingSpeed={80} />
      </div>

      <AsciiArt />

      <p className="text-muted-foreground">
        <TerminalText
          text="Hacking challenges, solving puzzles, breaking security."
          typingSpeed={20}
          startDelay={1000}
        />
      </p>

      <TerminalShell title="z0d1ak@ctf:~" className="mx-auto" fullWidth>
        <div className="space-y-3">
          <TerminalPrompt text="whoami" />
          <p className="text-white">z0d1ak - CTF Team</p>

          <TerminalPrompt text="ls -la /skills" />
          <SkillsGrid compact />

          <TerminalPrompt text="./join_team.sh" />
          <p className="text-primary animate-pulse">
            Initializing recruitment process...
          </p>
        </div>
      </TerminalShell>

      <HeroActionButtons fullWidth />
    </div>
  );
}

export function DesktopHero() {
  return (
    <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="inline-block rounded-lg bg-black border border-primary/30 px-3 py-1 text-sm mb-4">
          <TerminalText text="$ ./welcome.sh" typingSpeed={80} />
        </div>

        <div className="space-y-4">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
            <GlitchText text="z0d1ak" className="text-primary" />
            <span className="block mt-2 text-white">Our Blog</span>
          </h1>
          <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
            <TerminalText
              text="Hacking challenges and breaking security."
              typingSpeed={20}
              startDelay={1000}
            />
          </p>
        </div>

        <HeroActionButtons />
      </div>

      <div className="mx-auto lg:ml-auto w-full h-full flex items-center">
        <TerminalShell
          title="z0d1ak@ctf:~"
          className="h-[calc(100vh-10rem)] max-h-[600px]"
          fullWidth
          maxHeight="600px"
        >
          <div className="space-y-4">
            <AsciiArt />

            <TerminalPrompt text="whoami" />
            <p className="text-white">z0d1ak - Cybersecurity CTF Team</p>

            <TerminalPrompt text="ls -la /skills" />
            <SkillsGrid />

            <TerminalPrompt text="cat /etc/motd" />
            <div className="bg-primary/5 border-l-4 border-primary p-2 my-2">
              <p className="text-white">Welcome to the z0d1ak CTF team blog</p>
              <p className="text-white">
                We hack, we learn, we share knowledge.
              </p>
            </div>

            <TerminalPrompt text="cat /etc/banner" />
            <div className="bg-black/50 p-3 rounded border border-primary/20 my-2">
              <p className="text-white">
                🔐 Specializing in web, crypto, and forensics
              </p>
              <p className="text-white">
                🌐 Join our community of CTF enthusiasts
              </p>
            </div>

            <TerminalPrompt text="./join_team.sh" />
            <p className="text-primary animate-pulse">
              Initializing recruitment process...
            </p>
          </div>
        </TerminalShell>
      </div>
    </div>
  );
}
