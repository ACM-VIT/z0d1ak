import type React from "react"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Calendar, Tag, User, ChevronLeft, Shield, Clock, FileText, ExternalLink, Code, Zap, Trophy } from "lucide-react"
import { getPostBySlug } from "@/app/actions/getPost"
import { getRelatedPosts } from "@/app/actions/getRelatedPosts"
import { fetchCategoriesAction } from "@/app/actions/fetchCategories"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import remarkBreaks from "remark-breaks"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

import SidebarTableOfContents from "@/components/table-of-contents"
import LikeComments from "@/components/like-comments"

type HeadingProps = React.HTMLAttributes<HTMLHeadingElement> & {
  children?: React.ReactNode
}

const addIdToHeadings = {
  h1: ({ children, ...props }: HeadingProps) => {
    const text = Array.isArray(children) ? children.join("") : (children || "").toString()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return (
      <h1
        id={id}
        className="text-3xl font-bold mt-8 mb-4 pb-2 border-b border-primary/20 flex items-center gap-2"
        {...props}
      >
        <span className="text-primary">#</span> {children}
      </h1>
    )
  },
  h2: ({ children, ...props }: HeadingProps) => {
    const text = Array.isArray(children) ? children.join("") : (children || "").toString()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return (
      <h2
        id={id}
        className="text-2xl font-bold mt-6 mb-3 pb-1 border-b border-primary/10 flex items-center gap-2"
        {...props}
      >
        <span className="text-primary">##</span> {children}
      </h2>
    )
  },
  h3: ({ children, ...props }: HeadingProps) => {
    const text = Array.isArray(children) ? children.join("") : (children || "").toString()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return (
      <h3 id={id} className="text-xl font-bold mt-5 mb-2 flex items-center gap-2" {...props}>
        <span className="text-primary">###</span> {children}
      </h3>
    )
  },
  h4: ({ children, ...props }: HeadingProps) => {
    const text = Array.isArray(children) ? children.join("") : (children || "").toString()
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
    return (
      <h4 id={id} className="text-lg font-bold mt-4 mb-2 flex items-center gap-2" {...props}>
        <span className="text-primary">####</span> {children}
      </h4>
    )
  },
}

interface WriteupPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function WriteupPage({ params }: WriteupPageProps) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    notFound()
  }

  const postCreatedAt = post.createdAt ?? new Date()
  const postCategoryName = post.category ?? ""
  const authorData = post.author as { name: string; image?: string } | null
  const authorName = authorData?.name || "Unknown Author"
  const solveScript = typeof post.solveScript === "string" ? post.solveScript.trim() : ""
  const competitionName = post.competitionName ?? ""

  const categoriesList = await fetchCategoriesAction()

  const matchedCategory = categoriesList.find((c) => c.name.toLowerCase() === postCategoryName.toLowerCase())
  const postCategoryId = matchedCategory?.id || ""

  const relatedPosts = await getRelatedPosts(post.id, postCategoryId)

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SiteHeader />

      <SidebarTableOfContents content={post.content} />

      <main className="flex-1">
        <article className="container max-w-4xl px-4 py-12 md:py-16 ml-0 md:ml-72">
          {/* Back Button */}
          <div className="mb-8">
            <Link href="/writeups">
              <Button
                variant="outline"
                size="sm"
                className="gap-1 mb-4 text-primary border-primary/30 hover:bg-primary/10"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to writeups
              </Button>
            </Link>

            {/* Header with Terminal-style */}
            <div className="relative mb-8">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm"></div>
              <div className="relative bg-black border border-primary/30 rounded-xl overflow-hidden">
                {/* Terminal Header */}
                <div className="bg-gray-900 px-4 py-2 flex items-center gap-2 border-b border-primary/20">
                  <div className="h-3 w-3 rounded-full bg-destructive"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <div className="ml-2 text-xs text-muted-foreground font-mono">writeup.md - z0d1ak@ctf</div>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs flex items-center gap-1 text-primary border border-primary/30">
                      <Tag className="h-3 w-3" />
                      {matchedCategory?.name || postCategoryName}
                    </div>
                    {competitionName ? (
                      <Link
                        href={`/competitions/${encodeURIComponent(competitionName)}`}
                        className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs flex items-center gap-1 text-primary border border-primary/30 hover:bg-primary/20 transition-colors"
                      >
                        <Trophy className="h-3 w-3" />
                        {competitionName}
                      </Link>
                    ) : null}
                    <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs flex items-center gap-1 text-primary border border-primary/30">
                      <Calendar className="h-3 w-3" />
                      {formatDate(postCreatedAt)}
                    </div>
                    <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs flex items-center gap-1 text-primary border border-primary/30">
                      <Clock className="h-3 w-3" />
                      {Math.ceil(post.content.length / 1000)} min read
                    </div>
                  </div>

                  {/* Title */}
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-6 text-white">
                    {post.title}
                  </h1>

                  {/* Author */}
                  <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20 mb-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden border-2 border-primary/30 shadow-[0_0_10px_rgba(0,255,170,0.2)]">
                      {authorData?.image ? (
                        <Image
                          src={authorData.image || "/placeholder.svg"}
                          alt={authorName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary/10">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-white">{authorName}</div>
                        <Shield className="h-4 w-4 text-primary" />
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        <span className="text-green-500">z0d1ak@ctf</span>
                        <span className="text-muted-foreground">:</span>
                        <span className="text-blue-500">~</span>
                        <span className="text-muted-foreground">$</span>{" "}
                        <span className="text-primary">./author.sh</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/0 rounded-xl blur-lg opacity-50"></div>
            <div className="relative prose prose-invert prose-green max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                components={{
                  ...addIdToHeadings,
                  br: ({ ...props }) => <br className="block mt-3" {...props} />,
                  p: ({ ...props }) => <p className="mb-4 leading-relaxed text-base md:text-lg" {...props} />,
                  ul: ({ ...props }) => <ul className="list-disc pl-8 mb-4 space-y-2" {...props} />,
                  ol: ({ ...props }) => <ol className="list-decimal pl-8 mb-4 space-y-2" {...props} />,
                  li: ({ ...props }) => <li className="mb-1" {...props} />,
                  blockquote: ({ ...props }) => (
                    <blockquote
                      className="border-l-4 border-primary/30 pl-4 italic mb-4 bg-primary/5 p-3 rounded-r-lg"
                      {...props}
                    />
                  ),
                  hr: ({ ...props }) => <hr className="my-6 border-primary/20" {...props} />,
                  table: ({ ...props }) => (
                    <div className="overflow-x-auto mb-4">
                      <table className="w-full border-collapse" {...props} />
                    </div>
                  ),
                  th: ({ ...props }) => (
                    <th className="border border-primary/20 p-2 font-semibold bg-primary/10" {...props} />
                  ),
                  td: ({ ...props }) => <td className="border border-primary/20 p-2" {...props} />,
                  a: ({ ...props }) => (
                    <a
                      className="text-primary no-underline border-b border-dotted border-primary/50 hover:border-primary transition-colors pb-0.5 inline-flex items-center gap-1"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {props.children}
                      <ExternalLink className="h-3 w-3 inline" />
                    </a>
                  ),
                  img: ({ ...props }) => (
                    <div className="my-6 rounded-lg overflow-hidden border border-primary/30 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
                      <img className="max-w-full h-auto rounded-lg" {...props} />
                    </div>
                  ),
                  code({ inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "")
                    return !inline && match ? (
                      <div className="relative my-6 group">
                        <div className="absolute -inset-2 bg-primary/10 rounded-lg blur-sm opacity-50 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="relative">
                          <div className="flex items-center justify-between bg-gray-900 px-4 py-2 text-xs font-mono text-muted-foreground rounded-t-lg border-t border-l border-r border-primary/30">
                            <div className="flex items-center gap-2">
                              <Code className="h-4 w-4 text-primary" />
                              <span>{match[1]}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 rounded-full bg-primary/50"></div>
                              <div className="h-2 w-2 rounded-full bg-primary/30"></div>
                              <div className="h-2 w-2 rounded-full bg-primary/10"></div>
                            </div>
                          </div>
                          <SyntaxHighlighter
                            style={vscDarkPlus}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-b-lg border-b border-l border-r border-primary/30"
                            customStyle={
                              {
                                margin: 0,
                                borderRadius: "0 0 0.5rem 0.5rem",
                                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                              } as React.CSSProperties
                            }
                            {...props}
                          >
                            {String(children).replace(/\n$/, "")}
                          </SyntaxHighlighter>
                        </div>
                      </div>
                    ) : (
                      <code className="bg-primary/10 px-1.5 py-0.5 rounded text-primary font-mono text-sm" {...props}>
                        {children}
                      </code>
                    )
                  },
                  pre: ({ ...props }) => <pre className="overflow-x-auto rounded-lg my-6" {...props} />,
                }}
              >
                {post.content}
              </ReactMarkdown>
            </div>
          </div>

          {solveScript ? (
            <div className="mt-12">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm"></div>
                <div className="relative bg-black border border-primary/30 rounded-xl overflow-hidden">
                  <div className="bg-gray-900 px-4 py-2 flex items-center gap-2 border-b border-primary/20">
                    <Code className="h-4 w-4 text-primary" />
                    <div className="text-xs text-muted-foreground font-mono">solve.sh - z0d1ak@ctf</div>
                  </div>
                  <div className="p-2 md:p-4">
                    <SyntaxHighlighter
                      style={vscDarkPlus}
                      language="text"
                      customStyle={
                        {
                          margin: 0,
                          background: "transparent",
                          padding: "0.75rem",
                          fontSize: "0.85rem",
                          overflowX: "auto",
                        } as React.CSSProperties
                      }
                      className="rounded-lg border border-primary/20"
                    >
                      {solveScript}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {/* Like and Comments Section */}
          <LikeComments postId={post.id} />

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="mt-12 pt-6">
              <div className="relative mb-8">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm"></div>
                <div className="relative bg-black border border-primary/30 rounded-xl p-4 md:p-6">
                  <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-primary/20 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span>Related Writeups</span>
                  </h2>

                  <div className="grid gap-6 md:grid-cols-2">
                    {relatedPosts.map((relatedPost: any) => (
                      <Link key={relatedPost.id} href={`/writeups/${relatedPost.slug}`} className="group">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 to-primary/5 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="relative border border-primary/20 rounded-lg p-4 bg-black/80 hover:bg-black/50 transition-colors duration-300">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                              <Calendar className="h-3 w-3" />
                              {formatDate(relatedPost.createdAt ?? new Date())}
                              <Zap className="h-3 w-3 text-primary ml-auto" />
                            </div>
                            <h3 className="text-lg font-medium mb-2 group-hover:text-primary transition-colors duration-300">
                              {relatedPost.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">{relatedPost.excerpt}</p>
                            <div className="mt-3 text-xs text-primary font-mono opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              cat writeup.md
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </article>
      </main>
    </div>
  )
}
