import { NextResponse } from "next/server";
import { getPostsByCompetitionId } from "@/app/actions/getPostsByCompetitionId";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const competitionId = searchParams.get("competitionId");

  if (!competitionId) {
    return NextResponse.json({ error: "Missing competitionId" }, { status: 400 });
  }

  const posts = await getPostsByCompetitionId(competitionId);
  return NextResponse.json(posts);
}
