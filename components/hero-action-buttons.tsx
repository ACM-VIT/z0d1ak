import Link from "next/link";
import { FileText, Terminal, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

interface HeroActionButtonsProps {
  className?: string;
  fullWidth?: boolean;
}

const baseButtonClassName = "gap-2 w-full sm:w-auto";

export function HeroActionButtons({
  className = "",
  fullWidth = false,
}: HeroActionButtonsProps) {
  const widthClassName = fullWidth ? "w-full" : baseButtonClassName;

  return (
    <div className={`flex flex-col sm:flex-row gap-3 pt-4 ${className}`.trim()}>
      <Link href="/writeups" className={widthClassName}>
        <Button variant="hacker" size="lg" className={widthClassName}>
          <FileText className="h-4 w-4" />
          Browse Writeups
        </Button>
      </Link>

      <Link href="/members" className={widthClassName}>
        <Button
          variant="outline"
          size="lg"
          className={`${widthClassName} border-primary/50 text-primary hover:bg-primary/10`}
        >
          <Users className="h-4 w-4" />
          Meet the Members
        </Button>
      </Link>
    </div>
  );
}
