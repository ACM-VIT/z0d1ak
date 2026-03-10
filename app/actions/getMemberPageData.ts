"use server";

import { getMemberPageDataFromWriteups } from "@/lib/writeups";

export type MemberWriteup = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  createdAt: string;
  categoryName: string | null;
  competitionName: string;
  authorName: string | null;
};

export async function getMemberPageData(memberNameParam: string) {
  return getMemberPageDataFromWriteups(memberNameParam);
}
