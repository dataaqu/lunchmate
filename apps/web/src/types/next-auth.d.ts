import type { DefaultSession } from "next-auth";

// Augment the session so consumers get a typed `user.id` (set from the JWT
// `sub` in the session callback). Used by the Hono bridge and comment author
// checks in later tasks.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
