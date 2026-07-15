import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { brand } from "@/config/brand";
import { AUTH_ENABLED, AUTH_COOKIE } from "@/config/auth";
import { expectedToken } from "@/lib/auth";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in",
};

/** Advisor initials for the small monogram mark, e.g. "Kuntal Shah" -> "KS". */
function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function LoginPage() {
  // Nothing to guard when the gate is off, and no reason to re-prompt a visitor
  // who already holds a valid cookie.
  if (!AUTH_ENABLED) redirect("/");

  const token = (await cookies()).get(AUTH_COOKIE)?.value;
  if (token && token === expectedToken()) redirect("/");

  return (
    <main className="relative flex min-h-screen flex-1 flex-col items-center justify-center bg-[#f5f5f7] px-6 text-[#1d1d1f]">
      <div className="login-enter flex w-full max-w-[360px] flex-col items-center text-center">
        <span
          aria-hidden
          className="flex size-11 items-center justify-center rounded-full border border-[#d2d2d7] bg-white text-sm font-medium tracking-tight"
        >
          {initials(brand.advisor)}
        </span>

        <h1 className="mt-6 text-2xl font-semibold tracking-[-0.02em]">
          Enter your code
        </h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[#86868b]">
          These illustrations are private.
        </p>

        <LoginForm />
      </div>

      <p className="absolute bottom-6 text-[11px] tracking-wide text-[#a1a1a6]">
        For illustration only
      </p>
    </main>
  );
}
