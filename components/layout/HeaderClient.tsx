"use client";

import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useCart } from "@/components/providers/CartProvider";
import { NavFlyout } from "./NavFlyout";
import type { Family } from "@/lib/commerce/types";
import { Sheet } from "@/components/ui";

interface HeaderClientProps {
  currentFamilies: Family[];
  prevFamilies: Family[];
}

const NAV_LINKS = [
  { label: "iPhone Duo", href: "/iphone-duo" },
  { label: "Compare", href: "/compare" },
  { label: "Pre-owned guide", href: "/pre-owned" },
  { label: "Support", href: "/support" },
] as const;

export function HeaderClient({ currentFamilies, prevFamilies }: HeaderClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const [flyoutOpen, setFlyoutOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const flyoutTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { itemCount, openCart, lastAddedAt } = useCart();

  /* Scroll → hairline + blur */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Close flyout & mobile menu on route change */
  useEffect(() => {
    setFlyoutOpen(false);
    setMobileOpen(false);
  }, []);

  /* Hover-intent: 120ms delay before opening */
  const handleIPhoneEnter = useCallback(() => {
    flyoutTimer.current = setTimeout(() => setFlyoutOpen(true), 120);
  }, []);

  const handleIPhoneLeave = useCallback(() => {
    clearTimeout(flyoutTimer.current);
  }, []);

  const closeFlyout = useCallback(() => {
    clearTimeout(flyoutTimer.current);
    setFlyoutOpen(false);
  }, []);

  const handleFlyoutMouseEnter = useCallback(() => {
    clearTimeout(flyoutTimer.current);
  }, []);

  const handleFlyoutMouseLeave = useCallback(() => {
    setFlyoutOpen(false);
  }, []);

  return (
    <>
      {/* ── Header bar ─────────────────────────────────────────── */}
      <header
        className={[
          "sticky top-0 z-40 h-14 overflow-visible",
          "transition-[border-color,backdrop-filter,background-color] duration-[200ms]",
          scrolled
            ? "border-b border-line"
            : "border-b border-transparent",
        ].join(" ")}
        style={{
          backgroundColor: "rgba(255,255,255,0.72)",
          backdropFilter: scrolled ? "saturate(180%) blur(20px)" : "none",
          WebkitBackdropFilter: scrolled ? "saturate(180%) blur(20px)" : "none",
        }}
      >
        <div
          className="mx-auto flex h-full items-center justify-between px-6"
          style={{ maxWidth: "var(--max-w-content)" }}
        >
          {/* Wordmark */}
          <Link
            href="/"
            className="text-[17px] font-semibold text-ink tracking-[-0.02em] shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded-sm"
          >
            NorthArdenTech
          </Link>

          {/* Desktop nav — hidden on mobile */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main">
            {/* iPhone — has flyout */}
            <div
              onMouseEnter={handleIPhoneEnter}
              onMouseLeave={handleIPhoneLeave}
              className="relative"
            >
              <Link
                href="/iphone"
                className={[
                  "px-3 py-2 rounded-md text-[14px] transition-colors duration-[120ms]",
                  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
                  flyoutOpen ? "text-accent" : "text-ink hover:text-ink/70",
                ].join(" ")}
                onClick={closeFlyout}
              >
                iPhone
              </Link>
            </div>

            {NAV_LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                className="px-3 py-2 rounded-md text-[14px] text-ink hover:text-ink/70 transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right icons */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Search (placeholder) */}
            <button
              aria-label="Search"
              className="p-2 rounded-md text-ink hover:text-ink/70 transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <SearchIcon />
            </button>

            {/* Bag */}
            <BagButton count={itemCount} lastAddedAt={lastAddedAt} onClick={openCart} />

            {/* Mobile hamburger */}
            <button
              aria-label="Open menu"
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-md text-ink hover:text-ink/70 transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <HamburgerIcon />
            </button>
          </div>
        </div>

        {/* ── Nav flyout (desktop) ─────────────────────────────── */}
        <div
          onMouseEnter={handleFlyoutMouseEnter}
          onMouseLeave={handleFlyoutMouseLeave}
        >
          <AnimatePresence>
            {flyoutOpen && (
              <NavFlyout
                currentFamilies={currentFamilies}
                prevFamilies={prevFamilies}
                onClose={closeFlyout}
              />
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* ── Page dim backdrop (behind flyout, in front of content) */}
      <AnimatePresence>
        {flyoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
            className="fixed inset-0 z-20 bg-black/40"
            aria-hidden
            onClick={closeFlyout}
          />
        )}
      </AnimatePresence>

      {/* ── Mobile nav sheet ───────────────────────────────────── */}
      <Sheet
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        title="Menu"
      >
        <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
          <MobileNavLink href="/iphone" onClick={() => setMobileOpen(false)}>
            iPhone
          </MobileNavLink>
          {NAV_LINKS.map((l) => (
            <MobileNavLink
              key={l.label}
              href={l.href}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </MobileNavLink>
          ))}
        </nav>
      </Sheet>
    </>
  );
}

/* ── Sub-components ────────────────────────────────────────────── */

function BagButton({
  count,
  lastAddedAt,
  onClick,
}: {
  count: number;
  lastAddedAt: number;
  onClick: () => void;
}) {
  const [bump, setBump] = useState(false);
  const prevLastAdded = useRef(lastAddedAt);

  useEffect(() => {
    if (lastAddedAt !== prevLastAdded.current && lastAddedAt > 0) {
      prevLastAdded.current = lastAddedAt;
      setBump(true);
      const t = setTimeout(() => setBump(false), 400);
      return () => clearTimeout(t);
    }
  }, [lastAddedAt]);

  return (
    <motion.button
      aria-label={count > 0 ? `Bag, ${count} item${count !== 1 ? "s" : ""}` : "Bag"}
      onClick={onClick}
      animate={{ scale: bump ? 1.15 : 1 }}
      transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      className="relative p-2 rounded-md text-ink hover:text-ink/70 transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      <BagIcon />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-white text-[10px] font-semibold"
            aria-hidden
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="px-2 py-3 text-[17px] font-medium text-ink rounded-lg hover:bg-surface transition-colors duration-[120ms] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
    >
      {children}
    </Link>
  );
}

/* ── Icons ─────────────────────────────────────────────────────── */
function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M6 8V6a4 4 0 018 0v2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <rect x="2" y="8" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.75" />
    </svg>
  );
}

function HamburgerIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden>
      <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
