"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { login, type LoginState } from "./actions";
import { CODE_LENGTH } from "@/config/auth";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // A rejected code clears the row, shakes it, and refocuses so the next attempt
  // starts clean. Keyed on the action's returned error object identity.
  useEffect(() => {
    if (!state.error) return;
    setValue("");
    setShake(true);
    inputRef.current?.focus();
    const id = window.setTimeout(() => setShake(false), 400);
    return () => window.clearTimeout(id);
  }, [state]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const digits = event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    setValue(digits);
    // Auto-submit the moment the code is complete, Apple-style.
    if (digits.length === CODE_LENGTH && !pending) {
      formRef.current?.requestSubmit();
    }
  }

  const cells = Array.from({ length: CODE_LENGTH });
  const complete = value.length === CODE_LENGTH;

  return (
    <form ref={formRef} action={formAction} className="mt-9 w-full">
      {/* The real field holds the value and captures typing/paste; it sits
          transparent over the cells so the caret and text stay invisible. */}
      <div className={`relative ${shake ? "login-shake" : ""}`}>
        <input
          ref={inputRef}
          id="code"
          name="code"
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={CODE_LENGTH}
          autoComplete="one-time-code"
          autoFocus
          aria-label="Access code"
          aria-invalid={state.error ? true : undefined}
          value={value}
          onChange={handleChange}
          className="absolute inset-0 z-10 w-full cursor-pointer bg-transparent text-transparent caret-transparent outline-none"
        />

        <div
          aria-hidden
          className="flex items-center justify-center gap-1.5 sm:gap-2"
        >
          {cells.map((_, i) => (
            <div
              key={i}
              className="flex h-14 w-11 items-center justify-center rounded-2xl border border-[#d2d2d7] bg-white transition-all duration-200 sm:w-12"
            >
              {value[i] ? (
                <span className="size-2.5 rounded-full bg-[#1d1d1f]" />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <p
        role="alert"
        className={`mt-4 h-5 text-[13px] text-[#1d1d1f] transition-opacity duration-200 ${
          state.error ? "opacity-100" : "opacity-0"
        }`}
      >
        {state.error ?? ""}
      </p>

      <button
        type="submit"
        disabled={!complete || pending}
        className="mt-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors duration-200 enabled:bg-[#1d1d1f] enabled:text-white enabled:hover:bg-black disabled:bg-[#e8e8ed] disabled:text-[#86868b]"
      >
        {pending ? "Checking…" : "Continue"}
      </button>
    </form>
  );
}
