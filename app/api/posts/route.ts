import { NextRequest, NextResponse } from "next/server";

import {
  getPostsByCompetitionIdFromWriteups,
  getPostsByCompetitionNameFromWriteups,
} from "@/lib/writeups";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const competitionName = searchParams.get("competitionName");
  const competitionId = searchParams.get("competitionId");

  try {
    if (competitionName) {
      const posts = await getPostsByCompetitionNameFromWriteups(competitionName);
      return NextResponse.json(posts);
    }

    if (competitionId) {
      const posts = await getPostsByCompetitionIdFromWriteups(competitionId);
      return NextResponse.json(posts);
    }

    return NextResponse.json(
      { error: "Missing competitionName or competitionId query parameter" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Failed to load local writeup posts", error);

    return NextResponse.json(
      { error: "Failed to load local writeup posts" },
      { status: 500 },
    );
  }
}
