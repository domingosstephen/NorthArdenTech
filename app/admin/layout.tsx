import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "./_components/AdminSidebar";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s — Admin", default: "Admin — NorthArdenTech" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const role = (session.user as typeof session.user & { role?: string }).role;

  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      <AdminSidebar role={role} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
