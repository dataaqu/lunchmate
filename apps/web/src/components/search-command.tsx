"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { MapPin, Search } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface Suggestion {
  placeId: string;
  primaryText: string;
  secondaryText: string | null;
}

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

/**
 * Command-K search palette (T4.1). Opens with ⌘K / Ctrl+K or the header
 * trigger, queries the Hono `/api/places/autocomplete` proxy with a 300 ms
 * debounce, and navigates to the place detail page on select. Client-side
 * filtering is disabled (`shouldFilter={false}`) because the server already
 * returns the relevant, ordered matches.
 */
export function SearchCommand() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<Suggestion[]>([]);
  const [loading, setLoading] = React.useState(false);

  const trimmed = query.trim();

  // Single entry point for open/close so closing always clears transient state.
  const handleOpenChange = React.useCallback((next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery("");
      setSuggestions([]);
      setLoading(false);
    }
  }, []);

  // Clearing / loading state on input change happens in this handler (an event
  // callback) rather than an effect, so no setState fires synchronously inside
  // an effect body.
  function handleQueryChange(value: string) {
    setQuery(value);
    if (value.trim().length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }

  // ⌘K / Ctrl+K toggles the palette from anywhere.
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, handleOpenChange]);

  // Debounced autocomplete fetch (300 ms), with in-flight cancellation. Only
  // async callbacks touch state here — never the effect body itself.
  React.useEffect(() => {
    if (trimmed.length < MIN_QUERY_LENGTH) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(
        `${apiUrl}/api/places/autocomplete?q=${encodeURIComponent(trimmed)}`,
        { signal: controller.signal },
      )
        .then((r) => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`);
          return r.json() as Promise<{ suggestions?: Suggestion[] }>;
        })
        .then((data) => {
          setSuggestions(data.suggestions ?? []);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === "AbortError") return;
          console.error("[SearchCommand]", err);
          setSuggestions([]);
          setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [trimmed]);

  function handleSelect(placeId: string) {
    handleOpenChange(false);
    router.push(`/place/${encodeURIComponent(placeId)}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="ძებნა სახელით"
        className="inline-flex h-9 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground shadow-xs outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <Search className="size-4" />
        <span className="hidden sm:inline">ძებნა სახელით…</span>
        <kbd className="pointer-events-none ml-1 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:inline-flex">
          ⌘K
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={handleOpenChange}
        title="ძებნა სახელით"
        description="მოძებნე რესტორანი, კაფე ან სწრაფი კვების ობიექტი სახელით"
        commandProps={{ shouldFilter: false }}
      >
        <CommandInput
          placeholder="მოძებნე ობიექტი სახელით…"
          value={query}
          onValueChange={handleQueryChange}
        />
        <CommandList>
          {loading && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              იძებნება…
            </div>
          )}

          {!loading && trimmed.length < MIN_QUERY_LENGTH && (
            <div className="py-6 text-center text-sm text-muted-foreground">
              აკრიფე მინიმუმ {MIN_QUERY_LENGTH} სიმბოლო…
            </div>
          )}

          {!loading &&
            trimmed.length >= MIN_QUERY_LENGTH &&
            suggestions.length === 0 && (
              <CommandEmpty>ვერაფერი მოიძებნა.</CommandEmpty>
            )}

          {suggestions.length > 0 && (
            <CommandGroup heading="ობიექტები">
              {suggestions.map((s) => (
                <CommandItem
                  key={s.placeId}
                  value={s.placeId}
                  onSelect={() => handleSelect(s.placeId)}
                  className="gap-3"
                >
                  <MapPin className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate">{s.primaryText}</span>
                    {s.secondaryText && (
                      <span className="truncate text-xs text-muted-foreground">
                        {s.secondaryText}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
