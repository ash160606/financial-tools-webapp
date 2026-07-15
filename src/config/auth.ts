/**
 * Site-wide sign-in gate.
 *
 * A single shared 6-digit code protects every page. The code itself lives in the
 * environment as SIGNIN_CODE (see .env.local) and never in the repo — only the
 * on/off flag and cookie name live here, because they are safe to ship to the
 * browser. The token comparison happens server-side in src/lib/auth.ts.
 */

/**
 * Master switch. Flip to false to open the whole site: the proxy stops
 * redirecting and the /login page sends visitors straight home.
 */
export const AUTH_ENABLED = true;

/** Name of the httpOnly cookie that marks a signed-in visitor. */
export const AUTH_COOKIE = "fiw_auth";

/** Number of digits in the access code. */
export const CODE_LENGTH = 6;
