"use client";

import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

export interface TooltipProps {
  content: string;
  /** Delay before showing, ms. Default 300. */
  delay?: number;
  children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
}

export function Tooltip({ content, delay = 300, children }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const show = useCallback(() => {
    timer.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    clearTimeout(timer.current);
    setVisible(false);
  }, []);

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className={[
              "pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-2",
              "px-3 py-1.5 rounded-lg bg-ink text-white text-[12px] whitespace-nowrap z-50",
              "shadow-[0_4px_12px_rgba(0,0,0,.15)]",
            ].join(" ")}
          >
            {content}
            {/* caret */}
            <span
              aria-hidden
              className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-ink"
            />
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
