"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";

type Category = "restaurant" | "cafe" | "fast_food";

const CATEGORIES: { value: Category; emoji: string; label: string }[] = [
  { value: "restaurant", emoji: "🍽️", label: "რესტორანი" },
  { value: "cafe", emoji: "☕", label: "კაფე" },
  { value: "fast_food", emoji: "🍔", label: "სწრაფი კვება" },
];

export function CategoryFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const active = searchParams.get("category") as Category | null;

  function toggle(value: Category) {
    const params = new URLSearchParams(searchParams.toString());
    if (active === value) {
      params.delete("category");
    } else {
      params.set("category", value);
    }
    const qs = params.toString();
    router.replace(qs ? `?${qs}` : "/", { scroll: false });
  }

  return (
    <div className="flex gap-2 rounded-xl bg-white/90 px-3 py-2 shadow-md backdrop-blur-sm">
      {CATEGORIES.map(({ value, emoji, label }) => (
        <Button
          key={value}
          variant={active === value ? "default" : "outline"}
          size="sm"
          onClick={() => toggle(value)}
          aria-pressed={active === value}
        >
          <span aria-hidden="true">{emoji}</span>
          {label}
        </Button>
      ))}
    </div>
  );
}
