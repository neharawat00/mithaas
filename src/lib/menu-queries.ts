import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Coupon, MenuCategory, MenuItem } from "./types";

export const categoriesQuery = queryOptions({
  queryKey: ["menu-categories"],
  staleTime: 5 * 60 * 1000,
  queryFn: async (): Promise<MenuCategory[]> => {
    const { data, error } = await supabase
      .from("menu_categories")
      .select("id, slug, name, emoji, sort_order")
      .order("sort_order");
    if (error) throw error;
    return (data ?? []) as MenuCategory[];
  },
});

export const menuItemsQuery = queryOptions({
  queryKey: ["menu-items"],
  staleTime: 5 * 60 * 1000,
  queryFn: async (): Promise<MenuItem[]> => {
    const { data, error } = await supabase
      .from("menu_items")
      .select("*")
      .order("is_bestseller", { ascending: false })
      .order("name");
    if (error) throw error;
    return (data ?? []).map((d) => ({ ...d, price: Number(d.price), rating: Number(d.rating) })) as MenuItem[];
  },
});

export const couponsQuery = queryOptions({
  queryKey: ["coupons"],
  staleTime: 5 * 60 * 1000,
  queryFn: async (): Promise<Coupon[]> => {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("is_active", true)
      .order("min_order");
    if (error) throw error;
    return (data ?? []) as Coupon[];
  },
});

export function searchItems(items: MenuItem[], term: string) {
  const q = term.trim().toLowerCase();
  if (!q) return [];
  return items
    .map((item) => {
      const haystack = [item.name, item.description, ...item.tags].join(" ").toLowerCase();
      let score = 0;
      if (item.name.toLowerCase().startsWith(q)) score += 6;
      if (item.name.toLowerCase().includes(q)) score += 4;
      if (item.tags.some((t) => t.toLowerCase().includes(q))) score += 3;
      if (haystack.includes(q)) score += 1;
      if (q === "veg" || q === "vegetarian") score += item.is_veg ? 2 : -5;
      if (q === "spicy") score += item.spice_level >= 3 ? 4 : 0;
      if (q === "sweet" || q === "dessert") score += item.tags.includes("sweet") ? 4 : 0;
      return { item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || b.item.rating - a.item.rating)
    .map((r) => r.item);
}
