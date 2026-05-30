import NextAuth from "next-auth";
import createMiddleware from "next-intl/middleware";

import { authConfig } from "./auth.config";
import { routing } from "./i18n/routing";

// Next.js 16 proxy (formerly "middleware"). Two concerns are layered here:
//   1. Auth.js — built from the edge-safe `authConfig` only, so no Node-only
//      deps (Nodemailer, the DB adapter) leak into the proxy bundle.
//   2. next-intl — locale negotiation + `/ka`·`/en` prefixing (T4.3).
// The `authorized` callback still governs route protection; the auth wrapper
// runs first (populating `req.auth`), then we hand the request to the intl
// middleware to resolve the locale and rewrite/redirect accordingly.
const intlMiddleware = createMiddleware(routing);
const { auth } = NextAuth(authConfig);

export default auth((req) => intlMiddleware(req));

export const config = {
  // Run on every pathname except Next.js internals, the auth API routes, and
  // anything that looks like a file (has a dot). next-intl needs to see "/" so
  // it can redirect to the locale-prefixed home.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
