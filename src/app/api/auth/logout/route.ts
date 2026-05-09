export const runtime = "edge";

import { NextResponse } from "next/server";
import { USER_COOKIE_NAME } from "@/lib/user-auth";
import { checkOrigin } from "@/lib/csrf";

export async function POST(request: Request) {
  const csrfError = checkOrigin(request);
  if (csrfError) return csrfError;
  const response = NextResponse.json({ success: true });
  response.headers.set(
    "Set-Cookie",
    `${USER_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0`,
  );
  return response;
}
