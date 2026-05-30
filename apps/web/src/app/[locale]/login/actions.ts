"use server";

import { AuthError } from "next-auth";
import { getTranslations } from "next-intl/server";

import { signIn } from "@/auth";

/**
 * Server actions backing the login UI (T3.3).
 *
 * Google sign-in redirects to the provider, so its action lets the
 * `NEXT_REDIRECT` propagate. The email magic-link runs with
 * `redirect: false` so the client form can surface a toast instead of a
 * full navigation, and degrades gracefully when the Nodemailer provider
 * is inactive (no `EMAIL_SERVER` configured — see `auth.ts`).
 */

export type MagicLinkResult = { ok: true } | { ok: false; error: string };

export async function signInWithGoogle(): Promise<void> {
  await signIn("google", { redirectTo: "/" });
}

export async function sendMagicLink(email: string): Promise<MagicLinkResult> {
  const t = await getTranslations("Login");
  try {
    await signIn("nodemailer", { email, redirect: false, redirectTo: "/" });
    return { ok: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        ok: false,
        error: t("errorMagicFailed"),
      };
    }
    // Provider not configured (no EMAIL_SERVER) or unexpected failure.
    return {
      ok: false,
      error: t("errorEmailUnavailable"),
    };
  }
}
