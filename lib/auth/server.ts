"use server";

import { ServerAuth } from "@/lib/auth/server-auth";

export async function getUser() {
  return await ServerAuth.getCurrentUser();
}
