import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, TrendingUp } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { menuItemsQuery, searchItems } from "@/lib/menu-queries";
import { inr } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

const QUICK = ["Paneer", "Biryani", "Sweet", "Spicy", "Vegetarian", "Dessert"];
const RECENT_KEY = "mithaas-recent-search";

export function SearchDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (item: MenuItem) => void;
}) {
  const [term, setTerm] = useState("");
  const { data: items = [] } = useQuery(menuItemsQuery);

  const recent = useMemo<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(window.localStorage.getItem(RECENT_KEY) ?? "[]") as string[];
    } catch {
      return [];
    }
  }, [open]);

  const results = useMemo(() => searchItems(items, term).slice(0, 12), [items, term]);
  const trending = useMemo(
    () => items.filter((i) => i.is_bestseller).slice(0, 6),
    [items],
  );

  const pick = (item: MenuItem) => {
    try {
      const next = [item.name, ...recent.filter((r) => r !== item.name)].slice(0, 5);
      window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    onOpenChange(false);
    setTerm("");
    onSelect(item);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search dishes, e.g. paneer, biryani, sweet…"
        value={term}
        onValueChange={setTerm}
      />
      <CommandList>
        {term && results.length === 0 && <CommandEmpty>No dishes matched “{term}”.</CommandEmpty>}

        {!term && (
          <>
            <CommandGroup heading="Popular searches">
              <div className="flex flex-wrap gap-2 px-2 py-2">
                {QUICK.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setTerm(q)}
                    className="rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </CommandGroup>
            {recent.length > 0 && (
              <CommandGroup heading="Recent searches">
                {recent.map((r) => (
                  <CommandItem key={r} value={`${r} ${term}`} onSelect={() => setTerm(r)}>
                    <Search className="mr-2 h-4 w-4" aria-hidden />
                    {r}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
            <CommandGroup heading="Trending now">
              {trending.map((item) => (
                <CommandItem key={item.id} value={`${item.name} ${item.tags.join(" ")} ${term}`} onSelect={() => pick(item)}>
                  <TrendingUp className="mr-2 h-4 w-4 text-primary" aria-hidden />
                  <span className="truncate">{item.name}</span>
                  <span className="ml-auto text-sm text-muted-foreground">{inr(item.price)}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        {term && results.length > 0 && (
          <CommandGroup heading={`${results.length} result${results.length > 1 ? "s" : ""}`}>
            {results.map((item) => (
              <CommandItem key={item.id} value={`${item.name} ${item.tags.join(" ")} ${term}`} onSelect={() => pick(item)}>
                <span className="truncate">{item.name}</span>
                <span className="ml-auto shrink-0 text-sm text-muted-foreground">
                  {inr(item.price)}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
