import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Admin Login — NorthArdenTech",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}) {
  return (
    <main className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-[400px]">
        <div className="mb-8">
          <p className="text-[13px] font-semibold tracking-widest uppercase text-ink-2 mb-1">
            NorthArdenTech
          </p>
          <h1 className="text-[28px] font-semibold text-ink">Staff access</h1>
          <p className="text-[15px] text-ink-2 mt-1">
            Enter your staff email — we&apos;ll send a sign-in link.
          </p>
        </div>
        <LoginForm searchParams={searchParams} />
      </div>
    </main>
  );
}
