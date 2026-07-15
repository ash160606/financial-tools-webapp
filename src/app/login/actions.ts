"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE } from "@/config/auth";
import { isValidCode, tokenFor } from "@/lib/auth";

export type LoginState = { error: string | null };

/**
 * Validate the submitted code and, on success, set the auth cookie and send the
 * visitor home. On failure the error is returned for the form to display.
 */
export async function login(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const code = String(formData.get("code") ?? "").trim();

  if (!isValidCode(code)) {
    return { error: "That code didn't work. Try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, tokenFor(code), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });

  // redirect() throws to interrupt the action, so it must come after the cookie
  // is set and must not sit inside a try/catch.
  redirect("/");
}
