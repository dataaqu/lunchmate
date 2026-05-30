"use client";

import * as React from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";
import { LoginDialog } from "@/components/login-dialog";
import { toggleFavorite } from "@/app/[locale]/favorites/actions";
import { cn } from "@/lib/utils";

interface Props {
  placeId: string;
  /** Server-resolved initial state — whether the current user favorited this. */
  initialFavorited: boolean;
  /** Whether a user is signed in. Anonymous clicks open the login dialog. */
  isAuthenticated: boolean;
  className?: string;
  /** Notified after a successful toggle — e.g. the favorites list removes the
   *  card when this returns `false`. */
  onToggle?: (favorited: boolean) => void;
}

/**
 * The ♥ favorite toggle (T4.2). Optimistically flips state, then confirms via
 * the `toggleFavorite` server action (which holds the Auth.js ↔ Hono bridge
 * token). Reverts and toasts on failure; anonymous users get the login dialog.
 */
export function FavoriteButton({
  placeId,
  initialFavorited,
  isAuthenticated,
  className,
  onToggle,
}: Props) {
  const t = useTranslations("Favorites");
  const [favorited, setFavorited] = React.useState(initialFavorited);
  const [loginOpen, setLoginOpen] = React.useState(false);
  const [pending, startTransition] = React.useTransition();

  function handleToggle() {
    if (!isAuthenticated) {
      setLoginOpen(true);
      return;
    }

    const next = !favorited;
    setFavorited(next); // optimistic

    startTransition(async () => {
      const result = await toggleFavorite(placeId, next);
      if (!result.ok) {
        setFavorited(!next); // revert
        if (result.error === "unauthenticated") {
          setLoginOpen(true);
        } else {
          toast.error(t("toggleError"));
        }
        return;
      }
      onToggle?.(next);
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-pressed={favorited}
        aria-label={favorited ? t("removeAria") : t("addAria")}
        disabled={pending}
        onClick={handleToggle}
        className={className}
      >
        <Heart
          className={cn(
            "size-5 transition-colors",
            favorited
              ? "fill-red-500 text-red-500"
              : "text-muted-foreground",
          )}
        />
      </Button>
      <LoginDialog open={loginOpen} onOpenChange={setLoginOpen} />
    </>
  );
}
