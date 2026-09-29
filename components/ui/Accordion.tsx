"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export interface AccordionProps {
  question: string;
  children: React.ReactNode;
  /** Open by default */
  defaultOpen?: boolean;
}

export function Accordion({ question, children, defaultOpen = false }: AccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-line">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between py-5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        <span className="text-[17px] font-medium text-ink pr-4">{question}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.32, ease: [0.65, 0, 0.35, 1] }}
          className="shrink-0 text-ink-2"
          aria-hidden
        >
          <ChevronDown />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.65, 0, 0.35, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="pb-5 text-[17px] leading-relaxed text-ink-2">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ChevronDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M5 7.5l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
