import Link from "next/link"
import { notFound } from "next/navigation"
import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"

import { getCompetitionPageData } from "@/app/actions/getCompetitionPageData"
import { SiteHeader } from "@/components/site-header"
import { Button } from "@/components/ui/button"
import { TerminalText } from "@/components/terminal-text"
import { formatDate } from "@/lib/utils"
import { ChevronLeft, FileText } from "lucide-react"

export default async function CompetitionPage(props: { params: Promise<{ name: string }> }) {
  const { name } = await props.params
  const data = await getCompetitionPageData(name)

  if (!data) notFound()

  const { competition, readme, writeups } = data

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
                <Link href="/competitions">
                  <ChevronLeft className="h-4 w-4" />
                  Back to competitions
                </Link>
              </Button>
            </div>

            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-10">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 border border-primary/30 px-3 py-1 text-sm">
                  <TerminalText text={`$ cat /competitions/${competition.name}/README.md`} typingSpeed={50} />
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  {competition.name}
                </h1>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                  Competition overview and writeups
                </p>
              </div>
            </div>

            {/* README */}
            <div id="readme" className="relative mb-12">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm" />
              <div className="relative bg-black border border-primary/30 rounded-xl overflow-hidden">
                <div className="bg-gray-900 px-4 py-2 flex items-center gap-2 border-b border-primary/20">
                  <FileText className="h-4 w-4 text-primary" />
                  <div className="text-xs text-muted-foreground font-mono">README.md</div>
                </div>

                <div className="p-4 md:p-6">
                  {readme ? (
                    <>
                      <div className="text-xs text-muted-foreground mb-4 font-mono">Last updated: {formatDate(readme.createdAt)}</div>
                      <div className="prose prose-invert prose-green max-w-none">
                        <ReactMarkdown remarkPlugins={[remarkGfm, remarkBreaks]}>{readme.content}</ReactMarkdown>
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground">
                      <p className="mb-2">No README found for this competition yet.</p>
                      <p className="font-mono text-sm">
                        Create a non-draft post titled <span className="text-primary">README</span> (or <span className="text-primary">README.md</span>)
                        and tag it with <span className="text-primary">{competition.name}</span>.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Writeups */}
            <div className="space-y-4">
              <div className="flex items-baseline justify-between gap-4">
                <h2 className="text-2xl font-bold">Writeups</h2>
                <div className="text-sm text-muted-foreground">{writeups.length} total</div>
              </div>

              {writeups.length === 0 ? (
                <div className="text-muted-foreground">No writeups tagged with this competition yet.</div>
              ) : (
                <div className="space-y-4">
                  {writeups.map((post) => (
                    <Link key={post.id} href={`/writeups/${post.slug}`} className="block group">
                      <div className="relative">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative bg-black border border-primary/30 hover:border-primary/60 rounded-xl p-4 md:p-5 transition-all duration-300">
                          <div className="flex items-center justify-between gap-4 mb-2">
                            <div className="text-lg font-semibold text-white group-hover:text-primary transition-colors duration-300">
                              {post.title}
                            </div>
                            <div className="text-xs text-muted-foreground">{post.createdAt ? formatDate(post.createdAt) : null}</div>
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-2">{post.excerpt}</div>
                          <div className="mt-3 text-xs text-primary/80 font-mono">
                            {post.categoryName ? post.categoryName : "Uncategorized"}
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
  )
}
