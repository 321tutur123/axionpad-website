export const runtime = "edge";

import { NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { getAuthenticatedUserId } from "@/lib/user-auth";

interface UpdateProfileBody {
  first_name?: string;
  last_name?: string;
}

interface UserRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export async function PATCH(request: Request) {
  const userId = await getAuthenticatedUserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: UpdateProfileBody;
  try {
    body = (await request.json()) as UpdateProfileBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const firstName = (body.first_name ?? "").trim();
  const lastName = (body.last_name ?? "").trim();

  if (!firstName || !lastName) {
    return NextResponse.json({ error: "First name and last name are required" }, { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);
  const { env } = getRequestContext();

  await env.DB.prepare("UPDATE users SET first_name = ?, last_name = ?, updated_at = ? WHERE id = ?")
    .bind(firstName, lastName, now, userId)
    .run();

  const user = await env.DB.prepare("SELECT id, email, first_name, last_name FROM users WHERE id = ?")
    .bind(userId)
    .first<UserRow>();

  if (!user) {
    return NextResponse.json({ error: "Unable to load account" }, { status: 500 });
  }

  return NextResponse.json({ user });
}
