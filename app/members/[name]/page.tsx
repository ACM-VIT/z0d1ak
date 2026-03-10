import Link from "next/link";
import { notFound } from "next/navigation";

import { getMemberPageData } from "@/app/actions/getMemberPageData";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { TerminalText } from "@/components/terminal-text";
import { formatDate } from "@/lib/utils";
import { ChevronLeft, User } from "lucide-react";

export default async function MemberPage(props: {
  params: Promise<{ name: string }>;
}) {
  const { name } = await props.params;
  const data = await getMemberPageData(name);

  if (!data) notFound();

  const { member, writeups } = data;

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
                <Link href="/members">
                  <ChevronLeft className="h-4 w-4" />
                  Back to members
                </Link>
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 border border-primary/30 px-3 py-1 text-sm">
                  <TerminalText
                    text={`$ find /members/${member.slug} -type f -name README.md`}
                    typingSpeed={50}
                  />
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {member.name}
                </h1>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Member profile and authored writeups
                </p>
              </div>
            </div>

            <div className="mb-10">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm" />
                <div className="relative bg-black border border-primary/30 rounded-xl p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full border border-primary/30 bg-primary/10 p-3">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground font-mono">
                        member://{member.slug}
                      </div>
                      <div className="text-lg font-semibold text-white">
                        {member.writeupCount} writeup
                        {member.writeupCount === 1 ? "" : "s"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Writeups */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl font-bold">Authored Writeups</h2>
                <div className="text-sm text-muted-foreground">
                  {writeups.length} total
                </div>
              </div>

              {writeups.length === 0 ? (
                <div className="text-muted-foreground">
                  No writeups found for this member yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {writeups.map((post) => (
                    <Link
                      key={post.id}
                      href={`/writeups/${post.slug}`}
                      className="block group"
                    >
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative bg-black border border-primary/30 rounded-xl p-4 md:p-5">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <div className="text-lg font-semibold text-white group-hover:text-primary transition-colors duration-300">
                              {post.title}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {post.createdAt
                                ? formatDate(post.createdAt)
                                : null}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {post.excerpt}
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-mono">
                            <span className="text-primary/80">
                              {post.categoryName
                                ? post.categoryName
                                : "Uncategorized"}
                            </span>
                            <span className="text-muted-foreground">
                              {post.competitionName}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
