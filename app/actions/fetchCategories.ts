"use server";

import { fetchCategoriesFromWriteups } from "@/lib/writeups";

export async function fetchCategoriesAction() {
  return fetchCategoriesFromWriteups();
}
