"use client";

import { useState, useTransition, use } from "react";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui";

interface Props {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

export function LoginForm({ searchParams }: Props) {
  const params = use(searchParams);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await signIn("resend", {
        email,
        callbackUrl: params.callbackUrl ?? "/admin",
        redirect: false,
      });
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div className="rounded-[16px] border border-line bg-bg p-6 text-center space-y-2">
        <p className="text-[17px] font-semibold text-ink">Check your email.</p>
        <p className="text-[14px] text-ink-2">
          We sent a sign-in link to <span className="font-medium text-ink">{email}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {params.error && (
        <p className="rounded-[12px] bg-[#FFF2F2] border border-[#FECACA] px-4 py-3 text-[14px] text-[#B91C1C]">
          {params.error === "AccessDenied"
            ? "Your email is not authorised. Contact the store owner."
            : "Sign-in failed. Try again."}
        </p>
      )}
      <div>
        <label className="block text-[14px] font-medium text-ink mb-1" htmlFor="email">
          Staff email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-[12px] border border-line bg-bg px-4 py-3 text-[15px] text-ink placeholder:text-ink-2 focus:outline-2 focus:outline-offset-2 focus:outline-accent"
        />
      </div>
      <Button type="submit" variant="primary" className="w-full" loading={isPending}>
        Send sign-in link
      </Button>
    </form>
  );
}
