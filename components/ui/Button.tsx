"use client";

import { AnimatePresence, motion } from "motion/react";
import { forwardRef, useState } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "default" | "sm";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Replaces label with a spinner */
  loading?: boolean;
  /** Replaces label with checkmark + "Added" for 1.2 s then reverts */
  success?: boolean;
}

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-press active:scale-[0.98] focus-visible:outline-accent",
  secondary:
    "bg-surface text-ink border border-line hover:bg-[var(--line)] active:scale-[0.98] focus-visible:outline-ink",
  ghost:
    "text-accent hover:text-accent-press underline-offset-2 hover:underline active:scale-[0.98] focus-visible:outline-accent",
};

const SIZES: Record<ButtonSize, string> = {
  default: "px-6 py-3 text-[17px]",
  sm: "px-4 py-2 text-[14px]",
};

const BASE =
  "inline-flex items-center justify-center gap-2 font-medium rounded-[980px] " +
  "transition-[background-color,transform,color] duration-[120ms] ease-[cubic-bezier(0.22,1,0.36,1)] " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 select-none";

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "default",
    loading = false,
    success = false,
    disabled,
    children,
    className = "",
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      className={[
        BASE,
        VARIANTS[variant],
        SIZES[size],
        isDisabled && "opacity-50 cursor-not-allowed",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      <AnimatePresence mode="wait" initial={false}>
        {loading ? (
          <motion.span
            key="spinner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex items-center gap-2"
            aria-label="Loading"
          >
            <Spinner />
          </motion.span>
        ) : success ? (
          <motion.span
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex items-center gap-2"
          >
            <CheckIcon />
            Added
          </motion.span>
        ) : (
          <motion.span
            key="label"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            {children}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
});

Button.displayName = "Button";
export { Button };

/* ── Internal icons ─────────────────────────────────────────── */
function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="3"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 8l3.5 3.5L13 5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Demo hook: simulates the Add-to-Bag sequence */
export function useAddToBag(onAdd?: () => void) {
  const [state, setState] = useState<"idle" | "loading" | "success">("idle");

  async function trigger() {
    if (state !== "idle") return;
    setState("loading");
    await new Promise((r) => setTimeout(r, 600));
    setState("success");
    onAdd?.();
    await new Promise((r) => setTimeout(r, 1200));
    setState("idle");
  }

  return { loading: state === "loading", success: state === "success", trigger };
}
