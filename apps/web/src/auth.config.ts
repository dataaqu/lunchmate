import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";

/**
 * Edge-compatible Auth.js configuration.
 *
 * Only providers and logic that can run on the Edge runtime live here, so
 * `middleware.ts` can import it without pulling in Node-only dependencies
 * (the Nodemailer email provider and the Drizzle adapter are added in
 * `auth.ts`). See https://authjs.dev/guides/edge-compatibility.
 */
export const authConfig = {
  // JWT sessions so the token can be validated cross-app by the Hono API
  // (see T3.5 — the bridge uses the shared NEXTAUTH_SECRET).
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    // No protected routes yet — auth state is made available app-wide and
    // route protection is layered on in later tasks (e.g. the comment form).
    authorized() {
      return true;
    },
    // Persist the user id on the token at sign-in so it survives in the JWT.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // Expose the user id on the session for client/server consumers.
    session({ session, token }) {
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
