import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FoodCard } from "@/components/food/food-card";
import { ItemDialog } from "@/components/food/item-dialog";
import { categoriesQuery, menuItemsQuery } from "@/lib/menu-queries";
import type { MenuItem } from "@/lib/types";

export const Route = createFileRoute("/menu")({
  validateSearch: (search: Record<string, unknown>): { category?: string | undefined } => ({
    category: typeof search['category'] === "string" ? (search['category'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Menu — Mithaas" },
      { name: "description", content: "Explore the full Mithaas menu: starters, curries, biryanis, breads, mithai and more." },
      { property: "og:title", content: "Menu — Mithaas" },
      { property: "og:description", content: "Handcrafted Indian dishes, ready to order online." },
    ],
  }),
  component: MenuPage,
});

function MenuPage() {
  const { category } = Route.useSearch();
  const navigate = Route.useNavigate();
  const [picked, setPicked] = useState<MenuItem | null>(null);
  const { data: categories } = useQuery(categoriesQuery);
  const { data: items, isLoading } = useQuery(menuItemsQuery);

  const active = category ?? "all";
  const catId = (categories ?? []).find((c) => c.slug === active)?.id;
  const visible = (items ?? []).filter((i) => (active === "all" ? true : i.category_id === catId));

  return (
    <div className="mx-auto max-w-[1400px] px-4 pb-28 pt-10 sm:px-6 lg:pb-14">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Digital menu</span>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">Every dish, freshly crafted</h1>

      <div className="hide-scrollbar mt-6 flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={active === "all" ? "default" : "outline"}
          className="shrink-0 rounded-full"
          onClick={() => navigate({ search: {} })}
        >
          All
        </Button>
        {(categories ?? []).map((c) => (
          <Button
            key={c.id}
            variant={active === c.slug ? "default" : "outline"}
            className="shrink-0 rounded-full"
            onClick={() => navigate({ search: { category: c.slug } })}
          >
            <span aria-hidden className="mr-1">{c.emoji}</span>
            {c.name}
          </Button>
        ))}
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading &&
          Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-[22rem] rounded-3xl" />)}
        {visible.map((item) => (
          <FoodCard key={item.id} item={item} onOpen={setPicked} />
        ))}
      </div>

      {!isLoading && visible.length === 0 && (
        <p className="mt-10 text-muted-foreground">No dishes in this category yet.</p>
      )}

      <ItemDialog item={picked} onClose={() => setPicked(null)} />
    </div>
  );
}
