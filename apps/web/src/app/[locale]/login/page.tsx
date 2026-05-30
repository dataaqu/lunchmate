import type { Metadata } from "next";
import { ArrowLeft, MapPin } from "lucide-react";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LoginOptions } from "@/components/login-options";
import { LanguageSwitcher } from "@/components/language-switcher";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Login" });
  return { title: t("pageTitle") };
}

export default function LoginPage() {
  const t = useTranslations("Login");
  const tc = useTranslations("Common");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="shrink-0 border-b">
        <div className="mx-auto flex w-full max-w-screen-xl items-center gap-3 px-6 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label={tc("backToMap")}>
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <MapPin className="size-5" />
            <span className="font-semibold tracking-tight">
              {tc("appName")}
            </span>
          </div>
          <div className="ml-auto">
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              {t("heading")}
            </h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
          <LoginOptions />
        </div>
      </main>
    </div>
  );
}
