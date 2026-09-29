import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { auditLog, staff } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Audit log" };
export const dynamic = "force-dynamic";

export default async function AuditLogPage() {
  const session = await auth();
  const role = (session?.user as Record<string, unknown> & { role?: string })?.role;

  // Owner-only page
  if (role !== "owner") redirect("/admin");

  const rows = await db
    .select({
      id: auditLog.id,
      action: auditLog.action,
      entityType: auditLog.entityType,
      entityId: auditLog.entityId,
      payload: auditLog.payload,
      createdAt: auditLog.createdAt,
      staffEmail: staff.email,
      staffRole: staff.role,
    })
    .from(auditLog)
    .leftJoin(staff, eq(staff.id, auditLog.staffId))
    .orderBy(desc(auditLog.createdAt))
    .limit(500);

  const ACTION_COLOURS: Record<string, string> = {
    approve_review: "text-ok",
    full_refund: "text-[#B91C1C]",
    partial_refund: "text-warn",
    purchase_label: "text-accent",
    mark_shipped: "text-accent",
    update_family_status: "text-ink-2",
    update_variant_price: "text-ink-2",
    set_stock: "text-ink-2",
    create_unit: "text-ok",
    resend_confirmation: "text-ink-2",
    update_note: "text-ink-2",
  };

  return (
    <div className="p-8 max-w-[1200px]">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[24px] font-semibold text-ink">Audit log</h1>
        <span className="text-[13px] text-ink-2">{rows.length} entries (latest 500)</span>
      </div>

      <div className="rounded-[16px] border border-line overflow-hidden">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-surface border-b border-line text-left">
              {["Time", "Staff", "Action", "Entity", "Details"].map((h) => (
                <th key={h} className="px-4 py-3 text-ink-2 font-normal">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-surface/50 transition-colors duration-[80ms]">
                <td className="px-4 py-2 text-ink-2 whitespace-nowrap tabular-nums text-[12px]">
                  {new Date(row.createdAt).toLocaleString("en-US", {
                    month: "short", day: "numeric",
                    hour: "numeric", minute: "2-digit",
                  })}
                </td>
                <td className="px-4 py-2 text-ink-2 text-[12px] max-w-[140px] truncate">
                  {row.staffEmail ?? "—"}
                </td>
                <td className={["px-4 py-2 font-mono text-[11px] font-semibold", ACTION_COLOURS[row.action] ?? "text-ink"].join(" ")}>
                  {row.action}
                </td>
                <td className="px-4 py-2 text-ink-2 text-[12px]">
                  {row.entityType && (
                    <span className="capitalize">{row.entityType}</span>
                  )}
                  {row.entityId && (
                    <span className="font-mono text-[10px] block text-ink-2/60 truncate max-w-[120px]">
                      {row.entityId}
                    </span>
                  )}
                </td>
                <td className="px-4 py-2 font-mono text-[11px] text-ink-2 max-w-[240px] truncate">
                  {row.payload ? JSON.stringify(row.payload) : "—"}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-ink-2">
                  No audit entries yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
