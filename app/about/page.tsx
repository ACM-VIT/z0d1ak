import Link from "next/link";
import {
  ExternalLink,
  Github,
  Terminal,
  ChevronLeft,
  FileText,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { TerminalPrompt, TerminalShell } from "@/components/terminal-shell";
import { Button } from "@/components/ui/button";
import { TerminalText } from "@/components/terminal-text";

const REPOSITORIES = [
  {
    name: "Website Source",
    url: "https://github.com/ACM-VIT/z0d1ak",
    description: "Main source code for the z0d1ak website.",
  },
  {
    name: "Writeup Source",
    url: "https://github.com/ACM-VIT/z0d1ak-writeups",
    description: "Repository containing the markdown writeups and assets.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SiteHeader />

      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6 max-w-5xl">
            <div className="mb-6">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 text-primary border-primary/30 hover:bg-primary/10"
                asChild
              >
                <Link href="/">
                  <ChevronLeft className="h-4 w-4" />
                  Back to home
                </Link>
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 border border-primary/30 px-3 py-1 text-sm">
                  <TerminalText
                    text="$ cat /etc/z0d1ak/about"
                    typingSpeed={50}
                  />
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  About z0d1ak
                </h1>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  A CTF team blog for sharing writeups, documenting solves, and
                  making challenge knowledge easier to explore.
                </p>
              </div>
            </div>

            <div className="grid gap-8">
              <TerminalShell title="about.txt">
                <div className="space-y-4">
                  <TerminalPrompt text="whoami" />
                  <p className="text-white">z0d1ak - ACM-VIT CTF team blog</p>

                  <TerminalPrompt text="cat /etc/motd" />
                  <div className="bg-primary/5 border-l-4 border-primary p-3">
                    <p className="text-white">
                      We solve CTF challenges, publish writeups, and share what
                      we learn with the community.
                    </p>
                  </div>

                  <TerminalPrompt text="ls /features" />
                  <div className="grid gap-3 text-sm md:grid-cols-3">
                    <div className="rounded-lg border border-primary/20 bg-black/50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-primary">
                        <FileText className="h-4 w-4" />
                        <span className="font-semibold">Writeups</span>
                      </div>
                      <p className="text-muted-foreground">
                        Organized challenge writeups with author and competition
                        metadata.
                      </p>
                    </div>

                    <div className="rounded-lg border border-primary/20 bg-black/50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-primary">
                        <Terminal className="h-4 w-4" />
                        <span className="font-semibold">Competitions</span>
                      </div>
                      <p className="text-muted-foreground">
                        Browse events and track the challenges solved in each
                        competition.
                      </p>
                    </div>

                    <div className="rounded-lg border border-primary/20 bg-black/50 p-4">
                      <div className="mb-2 flex items-center gap-2 text-primary">
                        <Github className="h-4 w-4" />
                        <span className="font-semibold">Open Source</span>
                      </div>
                      <p className="text-muted-foreground">
                        Both the website and writeup sources are available
                        publicly on GitHub.
                      </p>
                    </div>
                  </div>
                </div>
              </TerminalShell>

              <TerminalShell title="sources.env">
                <div className="space-y-4">
                  <TerminalPrompt text="printenv | grep SOURCE_" />
                  <p className="text-sm text-muted-foreground">
                    Public repositories powering this project:
                  </p>

                  <div className="space-y-4">
                    {REPOSITORIES.map((repository) => (
                      <div
                        key={repository.url}
                        className="rounded-lg border border-primary/20 bg-black/50 p-4"
                      >
                        <div className="mb-2 flex items-center gap-2 text-white">
                          <Github className="h-4 w-4 text-primary" />
                          <span className="font-semibold">
                            {repository.name}
                          </span>
                        </div>

                        <p className="mb-3 text-sm text-muted-foreground">
                          {repository.description}
                        </p>

                        <Link
                          href={repository.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                        >
                          {repository.url}
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </TerminalShell>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
