import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { TerminalText } from "@/components/terminal-text";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import {
  ChevronRight,
  Search,
  Filter,
  UserIcon,
  Shield,
  Lock,
  FileText,
  Code,
  Database,
  Cpu,
  Network,
  Zap,
  ChevronLeft,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  fetchAllPosts,
  type FetchPostsParams,
} from "@/app/actions/fetchAllPosts";
import { fetchCategoriesAction } from "@/app/actions/fetchCategories";

type Category = {
  id: string;
  name: string;
};

interface PageProps {
  params: Promise<{ [key: string]: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const getQueryParam = (
  param: string | string[] | undefined,
): string | undefined => (Array.isArray(param) ? param[0] : param);

function getCategoryIcon(categoryName: string | null | undefined) {
  if (!categoryName) return <FileText className="h-5 w-5" />;

  const name = categoryName.toLowerCase();
  if (name.includes("web")) return <Code className="h-5 w-5" />;
  if (name.includes("crypto")) return <Lock className="h-5 w-5" />;
  if (name.includes("forensic")) return <Search className="h-5 w-5" />;
  if (name.includes("pwn") || name.includes("exploit"))
    return <Shield className="h-5 w-5" />;
  if (name.includes("reverse")) return <Cpu className="h-5 w-5" />;
  if (name.includes("network")) return <Network className="h-5 w-5" />;
  if (name.includes("database") || name.includes("sql"))
    return <Database className="h-5 w-5" />;
  return <FileText className="h-5 w-5" />;
}

export default async function WriteUpsPage({ searchParams }: PageProps) {
  const _ = await Promise.resolve();
  const sp = await searchParams;

  const paramsObj: FetchPostsParams = {
    page: getQueryParam(sp.page)
      ? Number.parseInt(getQueryParam(sp.page)!, 10)
      : 1,
    limit: getQueryParam(sp.limit)
      ? Number.parseInt(getQueryParam(sp.limit)!, 10)
      : 10,
    categoryId: getQueryParam(sp.categoryId),
    search: getQueryParam(sp.search),
  };

  const { posts, totalCount, page, limit } = await fetchAllPosts(paramsObj);
  const categoriesList: Category[] = await fetchCategoriesAction();

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="flex min-h-screen flex-col bg-black text-white">
      <SiteHeader />

      <main className="flex-1">
        <section className="py-12 md:py-16">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-8">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 border border-primary/30 px-3 py-1 text-sm">
                  <TerminalText
                    text="$ find /writeups -type f | sort"
                    typingSpeed={50}
                  />
                </div>
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  CTF <span className="text-primary">Writeups</span>
                </h1>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Detailed solutions and approaches to various CTF challenges
                </p>
              </div>
            </div>

            {/* Search and Filter */}
            <div className="relative mb-12 max-w-4xl mx-auto">
              <div className="absolute inset-0 bg-primary/5 blur-xl rounded-3xl"></div>
              <div className="relative bg-black/80 backdrop-blur-sm border border-primary/30 rounded-xl p-4 md:p-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search writeups..."
                      className="pl-10 bg-black/50 border-primary/30 focus:border-primary"
                      defaultValue={getQueryParam(sp.search) || ""}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="gap-2 border-primary/30 hover:bg-primary/10"
                    >
                      <Filter className="h-4 w-4" />
                      Filter
                    </Button>
                    <select
                      className="flex h-10 w-full rounded-md border border-primary/30 bg-black/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-300"
                      defaultValue={getQueryParam(sp.categoryId) || ""}
                    >
                      <option value="">All Categories</option>
                      {categoriesList.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8 md:space-y-12">
              {posts.map((post: any, index: number) => (
                <Link
                  key={post.id}
                  href={`/writeups/${post.slug}`}
                  className="block group"
                >
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    <div className="relative bg-black border border-primary/30 rounded-xl overflow-hidden">
                      <div className="flex flex-col md:flex-row">
                        <div className="flex items-center justify-center p-4 md:p-6 md:border-r border-primary/20 bg-black/80">
                          <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                            {getCategoryIcon(post.categoryName)}
                          </div>
                        </div>

                        <div className="flex-1 p-4 md:p-6">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <div className="inline-block rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
                              {post.categoryName ||
                                categoriesList.find(
                                  (c: Category) => c.id === post.categoryId,
                                )?.name ||
                                "Uncategorized"}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(post.createdAt)}
                            </div>
                          </div>

                          <h2 className="text-xl md:text-2xl font-bold mb-2 text-white group-hover:text-primary transition-colors duration-300">
                            {post.title}
                          </h2>

                          <div className="line-clamp-2 text-muted-foreground mb-4">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm, remarkMath]}
                              rehypePlugins={[rehypeKatex]}
                              components={{
                                h1: ({ node, ...props }) => <div {...props} />,
                                h2: ({ node, ...props }) => <div {...props} />,
                                h3: ({ node, ...props }) => <div {...props} />,
                                h4: ({ node, ...props }) => <div {...props} />,
                                p: ({ node, ...props }) => <p {...props} />,
                              }}
                            >
                              {post.excerpt}
                            </ReactMarkdown>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                                <UserIcon className="h-4 w-4 text-primary" />
                              </div>
                              <div className="text-sm font-medium">
                                {post.author?.name || "Anonymous"}
                              </div>
                            </div>

                            <div className="flex items-center text-primary text-sm font-mono">
                              <span className="mr-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                cat writeup.md
                              </span>
                              <Zap className="h-4 w-4 ml-1 animate-pulse" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-primary/20 px-4 py-2 bg-black/90 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Difficulty:
                          </span>
                          <div className="flex gap-1">
                            {Array.from({
                              length: Math.floor(Math.random() * 5) + 1,
                            }).map((_, i) => (
                              <div
                                key={i}
                                className="w-4 h-1 bg-primary rounded-full"
                              ></div>
                            ))}
                          </div>
                        </div>
                        {/* <div className="text-xs text-primary font-mono">flag&#123;{post.id.substring(0, 8)}&#125;</div> */}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <div className="relative">
                <div className="absolute inset-0 bg-primary/5 blur-md rounded-lg"></div>
                <div className="relative bg-black/80 backdrop-blur-sm border border-primary/30 rounded-lg p-2 flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === 1}
                    className="border-primary/30 hover:bg-primary/10"
                    asChild
                  >
                    <Link
                      href={`?page=${page - 1}&limit=${limit}`}
                      scroll={false}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Link>
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }).map((_, idx) => {
                      const pageNum = idx + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          className={
                            pageNum === page
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "border-primary/30 hover:bg-primary/10"
                          }
                          asChild
                        >
                          <Link
                            href={`?page=${pageNum}&limit=${limit}`}
                            scroll={false}
                          >
                            {pageNum}
                          </Link>
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page === totalPages}
                    className="border-primary/30 hover:bg-primary/10"
                    asChild
                  >
                    <Link
                      href={`?page=${page + 1}&limit=${limit}`}
                      scroll={false}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
