/**
 * Server-only helpers for the sign-in gate. This module reads the secret code
 * from the environment and hashes it, so it must never be imported by a client
 * component (the `node:crypto` import would fail the client build anyway).
 *
 * The cookie stores a SHA-256 of the code rather than the code itself: a visitor
 * still needs to know the code to produce a matching token, but the raw code is
 * never written to the browser.
 */
import { createHash } from "node:crypto";

/** The correct access code, read from the environment (empty if unset). */
export function signinCode(): string {
  return process.env.SIGNIN_CODE ?? "";
}

/** Opaque token derived from a code, stored in the auth cookie. */
export function tokenFor(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

/** The token a valid cookie must carry, given the current environment code. */
export function expectedToken(): string {
  return tokenFor(signinCode());
}

/** True when `code` matches the configured access code (and one is configured). */
export function isValidCode(code: string): boolean {
  const expected = signinCode();
  return expected.length > 0 && code === expected;
}
