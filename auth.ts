import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Resend from "next-auth/providers/resend";
import { db } from "@/lib/db";
import { staff } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  pgTable,
  text,
  integer,
  primaryKey,
  timestamp,
} from "drizzle-orm/pg-core";
import type { AdapterAccount } from "next-auth/adapters";

// ── Auth.js adapter tables (separate from our app tables) ────────────────────
// Auth.js needs users, accounts, sessions, verification_tokens tables.
// We keep these separate from our `staff` table but link them by email.

export const authUsers = pgTable("auth_users", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
});

export const authAccounts = pgTable(
  "auth_accounts",
  {
    userId: text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })]
);

export const authSessions = pgTable("auth_sessions", {
  sessionToken: text("session_token").notNull().primaryKey(),
  userId: text("user_id").notNull().references(() => authUsers.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const authVerificationTokens = pgTable(
  "auth_verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })]
);

// ── NextAuth config ───────────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: authUsers,
    accountsTable: authAccounts,
    sessionsTable: authSessions,
    verificationTokensTable: authVerificationTokens,
  }),

  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.AUTH_FROM_EMAIL ?? "[FROM_EMAIL]",
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      // Only allow sign-in for known staff emails
      if (!user.email) return false;
      const [staffMember] = await db
        .select({ id: staff.id })
        .from(staff)
        .where(eq(staff.email, user.email.toLowerCase()))
        .limit(1);
      return !!staffMember;
    },

    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        // Attach staff role to session
        const [staffMember] = await db
          .select({ role: staff.role })
          .from(staff)
          .where(eq(staff.email, session.user.email!.toLowerCase()))
          .limit(1);
        (session.user as typeof session.user & { role?: string }).role =
          staffMember?.role ?? "ops";
      }
      return session;
    },
  },

  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
});
