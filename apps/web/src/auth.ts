import NextAuth, { type NextAuthConfig } from "next-auth";
import Nodemailer from "next-auth/providers/nodemailer";

import { authConfig } from "./auth.config";

/**
 * Full (Node runtime) Auth.js setup.
 *
 * Extends the edge-safe `authConfig` with the Nodemailer email magic-link
 * provider. Magic links require a database adapter to persist verification
 * tokens — the Drizzle adapter is wired up in T3.2, and the Hono ↔ Auth.js
 * JWT bridge in T3.5. Until `EMAIL_SERVER` is configured the provider stays
 * inactive, so Google sign-in works on its own without an adapter.
 */
const emailProviders =
  process.env.EMAIL_SERVER && process.env.EMAIL_FROM
    ? [
        Nodemailer({
          server: process.env.EMAIL_SERVER,
          from: process.env.EMAIL_FROM,
        }),
      ]
    : [];

const config = {
  ...authConfig,
  providers: [...authConfig.providers, ...emailProviders],
} satisfies NextAuthConfig;

export const { handlers, auth, signIn, signOut } = NextAuth(config);
