import NextAuth from "next-auth";

import { authConfig } from "./auth.config";

// Next.js 16 proxy (formerly "middleware"). Built from the edge-safe
// `authConfig` only, so no Node-only deps (Nodemailer, the DB adapter) leak
// into the proxy bundle. The empty callback proceeds with every request;
// route protection is governed by the `authorized` callback in auth.config.ts.
const { auth } = NextAuth(authConfig);

export default auth(() => {
  // intentionally empty — allow the request to continue
});

export const config = {
  // Skip Next.js internals, the auth API routes, and static assets.
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
