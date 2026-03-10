"use server";

import { getMembersFromWriteups } from "@/lib/writeups";

export async function getMembers() {
  const members = await getMembersFromWriteups();

  return members.map((member) => ({
    id: member.id,
    name: member.name,
    slug: member.slug,
    writeupCount: member.writeupCount,
  }));
}
