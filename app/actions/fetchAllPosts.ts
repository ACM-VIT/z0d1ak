"use server";

import {
  fetchAllPostsFromWriteups,
  type FetchWriteupsParams,
} from "@/lib/writeups";

export interface FetchPostsParams extends FetchWriteupsParams {}

export async function fetchAllPosts(params: FetchPostsParams = {}) {
  return fetchAllPostsFromWriteups(params);
}
