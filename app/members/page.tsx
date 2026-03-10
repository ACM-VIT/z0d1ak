import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { TerminalText } from "@/components/terminal-text";
import Link from "next/link";
import { ChevronRight, User } from "lucide-react";
import { unstable_cache } from "next/cache";
import { getMembers } from "@/app/actions/getMembers";

interface Member {
  id: string;
  name: string;
  slug: string;
  writeupCount: number;
}

const getCachedMembers = unstable_cache(
  async () => {
    return getMembers();
  },
  ["all-members"],
  { revalidate: 3600 },
);

export default async function MembersPage() {
  const members: Member[] = await getCachedMembers();

  return (
    <div className="flex min-h-screen flex-col bg-black text-green-500">
      <SiteHeader />
      <main className="flex-1 container mx-auto px-4 py-16">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-white">Members</h1>
          <div className="inline-block rounded-lg bg-black border border-primary/30 px-3 py-1 text-sm mb-4">
            <TerminalText text="$ ls -R /members" typingSpeed={50} />
          </div>
        </div>

        <div className="bg-gray-900 border border-primary/30 rounded-lg p-6">
          <div className="mb-6 font-mono">
            <span className="text-blue-400">root@z0d1ak</span>:
            <span className="text-green-400">~</span>$ ls -R /members
          </div>

          {members.length === 0 ? (
            <div className="text-muted-foreground font-mono">
              No members found.
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <Link
                  key={member.id}
                  href={`/members/${encodeURIComponent(member.slug)}`}
                  className="group block"
                >
                  <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-black/40 px-4 py-3 transition-colors hover:border-primary/50 hover:bg-black">
                    <div className="flex items-center gap-3 min-w-0">
                      <User className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate text-white group-hover:text-primary">
                        {member.name}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground shrink-0">
                      {member.writeupCount} writeup
                      {member.writeupCount === 1 ? "" : "s"}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
