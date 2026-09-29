"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface NavItem {
  label: string;
  href: string;
  disabled?: boolean;
  note?: string;
}

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin" },
  { label: "Catalog", href: "/admin/catalog" },
  { label: "Inventory", href: "/admin/inventory" },
  { label: "Orders", href: "/admin/orders" },
  { label: "Audit log", href: "/admin/audit" },
];

export function AdminSidebar({ role }: { role?: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] shrink-0 border-r border-line bg-surface flex flex-col">
      <div className="px-5 py-4 border-b border-line">
        <p className="text-[11px] font-semibold tracking-widest uppercase text-ink-2">
          NorthArdenTech
        </p>
        <p className="text-[13px] font-semibold text-ink mt-0.5">Admin</p>
      </div>

      <nav className="flex-1 py-3">
        {NAV.map((item) => {
          if (item.href === "/admin/audit" && role !== "owner") return null;
          const active =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.disabled ? "#" : item.href}
              aria-disabled={item.disabled}
              className={[
                "flex items-center gap-2 px-5 py-2 text-[14px] transition-colors duration-[120ms]",
                active
                  ? "text-accent font-semibold bg-[rgba(11,95,217,0.06)]"
                  : "text-ink hover:text-ink hover:bg-[rgba(0,0,0,0.04)]",
                item.disabled ? "opacity-40 pointer-events-none" : "",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {item.label}
              {item.disabled && (
                <span className="ml-auto text-[10px] text-ink-2 uppercase tracking-wide">
                  {item.note}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-line px-5 py-3">
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="text-[13px] text-ink-2 hover:text-ink transition-colors duration-[120ms]"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
