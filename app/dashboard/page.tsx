import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { getUserPosts } from "@/app/actions/getUserPosts";
import { fetchCompetitions } from "@/app/actions/fetchCompetitions";
import { getCompetitionParticipants } from "@/app/actions/competitionParticipants";
import DashboardClient from "./dashboard-client";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id || session.user.role !== "member") {
    redirect("/login");
  }

  const posts = await getUserPosts(session.user.id);
  const competitions = await fetchCompetitions();
  const competitionsWithParticipants = await Promise.all(
    competitions.map(async (competition) => ({
      ...competition,
      participants: await getCompetitionParticipants(competition.id),
    }))
  );

  return <DashboardClient session={session} posts={posts} competitions={competitionsWithParticipants} />;
}
