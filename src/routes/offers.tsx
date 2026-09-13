import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { couponsQuery } from "@/lib/menu-queries";
import { inr } from "@/lib/format";

export const Route = createFileRoute("/offers")({
  head: () => ({
    meta: [
      { title: "Offers & Coupons — Mithaas" },
      { name: "description", content: "Current Mithaas offers, coupon codes and combo savings." },
      { property: "og:title", content: "Offers & Coupons — Mithaas" },
      { property: "og:description", content: "Save more on every Mithaas order." },
    ],
  }),
  component: Offers,
});

function Offers() {
  const { data: coupons } = useQuery(couponsQuery);
  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-28 pt-10 sm:px-6 lg:pb-14">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Save more</span>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">Offers &amp; coupons</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(coupons ?? []).map((c) => (
          <div key={c.id} className="surface-card p-5">
            <p className="font-display text-xl">{c.title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="gradient-warm rounded-full px-3 py-1 text-sm font-bold text-primary-foreground">
                {c.code}
              </span>
              <span className="text-xs text-muted-foreground">Min {inr(Number(c.min_order))}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
