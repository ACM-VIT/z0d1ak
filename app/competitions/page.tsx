import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { TerminalText } from "@/components/terminal-text";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getLatestCompetitionsFromWriteups } from "@/lib/writeups";
import { unstable_cache } from "next/cache";
import FileStructure from "@/components/file-structure";

interface Competition {
  id: string;
  name: string;
  latestPost: string | null;
  postCount: number;
}

const getCachedCompetitions = unstable_cache(
  async () => {
    return getLatestCompetitionsFromWriteups(100);
  },
  ["all-competitions"],
  { revalidate: 3600 },
);

export default async function CompetitionsPage() {
  const competitions: Competition[] = await getCachedCompetitions();

  return (
    <div className="flex min-h-screen flex-col bg-black text-green-500">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-white">
            CTF Competitions
          </h1>
          <div className="inline-block rounded-lg bg-black border border-primary/30 px-3 py-1 text-sm mb-4">
            <TerminalText text="$ ls -R /competitions" typingSpeed={50} />
          </div>
        </div>

        <div className="bg-gray-900 border border-primary/30 rounded-lg p-6">
          <div className="mb-4 font-mono">
            <span className="text-blue-400">root@z0d1ak</span>:
            <span className="text-green-400">~</span>$ ls -R /competitions
          </div>
          <FileStructure competitions={competitions} />
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button
              variant="outline"
              size="lg"
              className="gap-2 border-primary/50 text-primary hover:bg-primary/10"
            >
              <ChevronRight className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
