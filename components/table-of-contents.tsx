"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X, List, ChevronRight, Terminal } from "lucide-react";

interface SidebarTableOfContentsProps {
  content: string;
  className?: string;
}

export default function SidebarTableOfContents({
  content,
  className = "",
}: SidebarTableOfContentsProps) {
  const [activeId, setActiveId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const cleanedContent = content.replace(/```[\s\S]*?```/g, "");
  const headings = cleanedContent.match(/#{1,4}\s.+/g) || [];
  const toc = headings.map((heading) => {
    const level = (heading.match(/^#+/) || [""])[0].length;
    const title = heading.replace(/^#+\s/, "");
    const id = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    return { level, title, id };
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const headingElements = Array.from(
      document.querySelectorAll("h1, h2, h3, h4"),
    );
    if (headingElements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting);
        if (visibleEntries.length > 0) {
          visibleEntries.sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-30% 0px -70% 0px",
        threshold: 0,
      },
    );

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [content]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => {
      const scrollY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      if (scrollY + viewportHeight >= documentHeight - 50) {
        const headingElements = Array.from(
          document.querySelectorAll("h1, h2, h3, h4"),
        );
        if (headingElements.length > 0) {
          setActiveId(headingElements[headingElements.length - 1].id);
        }
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (toc.length === 0) return null;

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed bottom-4 right-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full bg-black border border-primary/50 shadow-[0_0_15px_rgba(0,255,170,0.3)] hover:shadow-[0_0_20px_rgba(0,255,170,0.5)] transition-all duration-300"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="h-5 w-5 text-primary" />
          ) : (
            <List className="h-5 w-5 text-primary" />
          )}
          <span className="sr-only">Toggle table of contents</span>
        </Button>
      </div>

      {/* Table of Contents Sidebar */}
      <div
        className={`
          fixed z-40 h-screen top-24 right-0 transform
          bg-black/90 backdrop-blur-md border-l border-primary/30
          w-72 transition-all duration-300 ease-in-out overflow-y-auto
          ${isOpen ? "translate-x-0 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]" : "translate-x-full"}
          md:translate-x-0 md:shadow-[-5px_0_20px_rgba(0,0,0,0.3)]
          ${className}
        `}
      >
        <div className="p-4 sticky top-0 bg-black/80 backdrop-blur-sm border-b border-primary/20 z-10">
          <div className="flex items-center gap-2 mb-2">
            <Terminal className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-bold text-white">
              <span className="text-primary">./</span>contents.sh
            </h3>
          </div>
          <div className="text-xs text-muted-foreground font-mono mb-2">
            <span className="text-green-500">z0d1ak@ctf</span>
            <span className="text-muted-foreground">:</span>
            <span className="text-blue-500">~</span>
            <span className="text-muted-foreground">$</span>{" "}
            <span className="text-primary">cat sections.md</span>
          </div>
        </div>

        <nav className="p-4">
          <div className="space-y-1">
            {toc.map((item, index) => (
              <a
                key={index}
                href={`#${item.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const element = document.getElementById(item.id);
                  if (element) {
                    const offset = 80;
                    const elementPosition = element.getBoundingClientRect().top;
                    const offsetPosition =
                      elementPosition + window.pageYOffset - offset;

                    window.scrollTo({
                      top: offsetPosition,
                      behavior: "smooth",
                    });
                  }
                  if (window.innerWidth < 768) setIsOpen(false);
                }}
                className={`
                  group flex items-center text-sm py-1.5 px-2 rounded-md transition-all duration-200
                  ${
                    activeId === item.id
                      ? "bg-primary/10 text-primary font-medium border-l-2 border-primary"
                      : "hover:bg-primary/5 text-muted-foreground hover:text-white border-l-2 border-transparent"
                  }
                  ${item.level === 1 ? "font-medium" : ""}
                  ${item.level === 2 ? "pl-4" : ""}
                  ${item.level === 3 ? "pl-6" : ""}
                  ${item.level === 4 ? "pl-8" : ""}
                `}
              >
                <ChevronRight
                  className={`h-3 w-3 mr-1 transition-transform duration-200 ${activeId === item.id ? "text-primary" : "text-muted-foreground group-hover:text-white"} ${activeId === item.id ? "rotate-90" : "rotate-0"}`}
                />
                <span className="truncate">{item.title}</span>
              </a>
            ))}
          </div>
        </nav>

        <div className="p-4 mt-4 border-t border-primary/20">
          <div className="text-xs text-muted-foreground font-mono">
            <span className="text-green-500">z0d1ak@ctf</span>
            <span className="text-muted-foreground">:</span>
            <span className="text-blue-500">~</span>
            <span className="text-muted-foreground">$</span>{" "}
            <span className="text-primary animate-pulse">_</span>
          </div>
        </div>
      </div>
    </>
  );
}
