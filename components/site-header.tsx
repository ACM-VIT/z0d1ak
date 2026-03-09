"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, TerminalIcon, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function SiteHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        isScrolled
          ? "border-primary/30 bg-black/90 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 border border-primary/20 overflow-hidden group-hover:bg-primary/20 transition-colors">
            <TerminalIcon className="h-4 w-4 text-primary" />
            <div className="absolute inset-0 border border-primary/10 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
          <span className="text-xl font-bold text-primary relative">
            z0d1ak
            <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-300"></span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-1">
          <Link href="/writeups">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary hover:bg-primary/10 px-3 h-9"
            >
              <span className="text-primary/70 mr-1.5">&gt;</span> Writeups
            </Button>
          </Link>
          <Link href="/competitions">
            <Button
              variant="ghost"
              className="text-primary hover:text-primary hover:bg-primary/10 px-3 h-9"
            >
              <span className="text-primary/70 mr-1.5">&gt;</span> Competitions
            </Button>
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className={`text-primary hover:bg-primary/10 transition-colors ${isScrolled ? "" : "bg-black/50"}`}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="bg-black border-l border-primary/20 text-primary p-0 w-[280px] sm:w-[350px]"
            onInteractOutside={() => setIsMenuOpen(false)}
          >
            <div className="flex flex-col h-full">
              <div className="border-b border-primary/20 p-4 flex items-center justify-between">
                <Link
                  href="/"
                  className="flex items-center space-x-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-md bg-primary/10 border border-primary/20">
                    <TerminalIcon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-xl font-bold">z0d1ak</span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-primary hover:bg-primary/10"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex flex-col gap-0 flex-1">
                <Link
                  href="/writeups"
                  className="p-4 hover:bg-primary/10 border-b border-primary/10 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-primary/70 mr-2">&gt;</span> Writeups
                </Link>
                <Link
                  href="/competitions"
                  className="p-4 hover:bg-primary/10 border-b border-primary/10 flex items-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-primary/70 mr-2">&gt;</span>{" "}
                  Competitions
                </Link>
              </nav>
              <div className="p-4 border-t border-primary/20 font-mono text-xs">
                <div className="text-muted-foreground">
                  <span className="text-green-500">z0d1ak@ctf</span>:
                  <span className="text-blue-500">~</span>$ exit
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
