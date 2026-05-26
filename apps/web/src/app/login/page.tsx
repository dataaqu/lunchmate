import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoginOptions } from "@/components/login-options";

export const metadata: Metadata = {
  title: "შესვლა",
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="shrink-0 border-b">
        <div className="mx-auto flex w-full max-w-screen-xl items-center gap-3 px-6 py-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/" aria-label="უკან რუკაზე">
              <ArrowLeft className="size-5" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <MapPin className="size-5" />
            <span className="font-semibold tracking-tight">
              თბილისის კვების გიდი
            </span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              ანგარიშზე შესვლა
            </h1>
            <p className="text-sm text-muted-foreground">
              შედით Google-ით ან მიიღეთ შესვლის ბმული ელფოსტაზე.
            </p>
          </div>
          <LoginOptions />
        </div>
      </main>
    </div>
  );
}
