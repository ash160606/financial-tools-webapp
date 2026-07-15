"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { login, type LoginState } from "./actions";
import { CODE_LENGTH } from "@/config/auth";

const initialState: LoginState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const [value, setValue] = useState("");
  const [shake, setShake] = useState(false);
  const [handledState, setHandledState] = useState(state);

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // A rejected code clears the row and starts the shake. useActionState returns
  // a fresh state object per submission, so a changed identity carrying an error
  // marks a new rejection — reset here during render (React's "adjust state when
  // a value changes" pattern) rather than in an effect.
  if (state !== handledState) {
    setHandledState(state);
    if (state.error) {
      setValue("");
      setShake(true);
    }
  }

  // The rejection's side effects: refocus for the next attempt, then end the
  // shake once it has played.
  useEffect(() => {
    if (!state.error) return;
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
              className="flex h-14 w-11 items-center justify-center rounded-2xl border border-rule bg-surface transition-all duration-200 sm:w-12"
            >
              {value[i] ? (
                <span className="size-2.5 rounded-full bg-ink" />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      <p
        role="alert"
        className={`mt-4 h-5 text-[13px] text-ink transition-opacity duration-200 ${
          state.error ? "opacity-100" : "opacity-0"
        }`}
      >
        {state.error ?? ""}
      </p>

      <button
        type="submit"
        disabled={!complete || pending}
        className="mt-2 rounded-full px-6 py-2.5 text-sm font-medium transition-colors duration-200 enabled:bg-ink enabled:text-paper enabled:hover:bg-ink/90 disabled:bg-rule disabled:text-muted"
      >
        {pending ? "Checking…" : "Continue"}
      </button>
    </form>
  );
}
