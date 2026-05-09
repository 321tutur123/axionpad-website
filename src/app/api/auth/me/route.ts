export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getAuthenticatedUserId } from "@/lib/user-auth";

interface UserRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export async function GET(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { env } = getRequestContext();
  const user = await env.DB.prepare("SELECT id, email, first_name, last_name FROM users WHERE id = ?")
    .bind(userId)
    .first<UserRow>();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ user });
}
