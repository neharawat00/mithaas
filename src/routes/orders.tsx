import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Check,
  ChefHat,
  Clock,
  MapPin,
  Package,
  RefreshCw,
  ShoppingBag,
  Truck,
  X,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/use-auth";
import { useCart } from "@/lib/cart";
import { inr, shortId } from "@/lib/format";
import { foodImage } from "@/lib/images";
import { menuItemsQuery } from "@/lib/menu-queries";
import {
  ORDER_STAGES,
  cancelOrder,
  etaMinutesLeft,
  expectedStatus,
  isFinalStatus,
  myOrdersQuery,
  stageIndex,
  stageLabel,
  syncOrderStatus,
  type OrderWithItems,
} from "@/lib/order-queries";

export const Route = createFileRoute("/orders")({
  head: () => ({
    meta: [
      { title: "My Orders — Live Tracking | Mithaas" },
      {
        name: "description",
        content:
          "Track your Mithaas order live from kitchen to doorstep, and reorder your past favourites in one tap.",
      },
      { property: "og:title", content: "My Orders — Live Tracking | Mithaas" },
      { property: "og:description", content: "Live order tracking and one-tap reorder at Mithaas." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersPage,
});

const STAGE_ICONS = [Check, ChefHat, ChefHat, Package, Truck, MapPin];

function useTicker(ms = 15000) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), ms);
    return () => window.clearInterval(id);
  }, [ms]);
}

function OrdersPage() {
  const { user, loading } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const cart = useCart();
  useTicker();

  const ordersQ = useQuery(myOrdersQuery(user?.id ?? null));
  const menuQ = useQuery(menuItemsQuery);
  const orders = ordersQ.data ?? [];

  const live = useMemo(() => orders.filter((o) => !isFinalStatus(o.status)), [orders]);
  const past = useMemo(() => orders.filter((o) => isFinalStatus(o.status)), [orders]);

  // Live tracking: keep statuses honest, and listen for kitchen-side changes.
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const push = async () => {
      const current = qc.getQueryData<OrderWithItems[]>(["orders", user.id]) ?? [];
      const pending = current.filter((o) => !isFinalStatus(o.status));
      let changed = false;
      for (const o of pending) {
        if (expectedStatus(o) !== o.status) {
          try {
            await syncOrderStatus(o);
            changed = true;
          } catch {
            /* ignore transient errors */
          }
        }
      }
      if (changed && !cancelled) qc.invalidateQueries({ queryKey: ["orders", user.id] });
    };
    void push();
    const id = window.setInterval(push, 20000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, [user, qc, orders.length]);

  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("orders-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["orders", user.id] }),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, qc]);

  const cancelM = useMutation({
    mutationFn: (id: string) => cancelOrder(id),
    onSuccess: () => {
      toast.success("Order cancelled");
      qc.invalidateQueries({ queryKey: ["orders", user?.id] });
    },
    onError: () => toast.error("Couldn't cancel that order."),
  });

  const reorder = (order: OrderWithItems) => {
    const items = menuQ.data ?? [];
    let added = 0;
    let skipped = 0;
    for (const line of order.items) {
      const item = items.find((i) => i.id === line.item_id) ?? items.find((i) => i.name === line.name);
      if (!item || !item.is_available) {
        skipped += 1;
        continue;
      }
      cart.add({
        itemId: item.id,
        slug: item.slug,
        name: item.name,
        imageKey: item.image_key,
        unitPrice: line.unit_price,
        quantity: line.quantity,
        spice: line.customizations?.spice ?? "medium",
        addons: line.customizations?.addons ?? [],
        instructions: line.customizations?.instructions ?? "",
      });
      added += 1;
    }
    if (!added) {
      toast.error("Those dishes aren't available right now.");
      return;
    }
    toast.success(`${added} item${added > 1 ? "s" : ""} back in your cart`, {
      description: skipped ? `${skipped} dish unavailable and skipped.` : "Review and checkout.",
    });
    void navigate({ to: "/cart" });
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="mt-6 h-64 w-full rounded-3xl" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl">Your orders</h1>
        <p className="mt-3 text-muted-foreground">
          Sign in to follow your live order and reorder past favourites.
        </p>
        <Button asChild className="mt-6">
          <Link to="/auth" search={{ redirect: "/orders" }}>
            Sign in
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:py-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-primary">Live kitchen</p>
          <h1 className="font-display text-3xl md:text-4xl">My orders</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => qc.invalidateQueries({ queryKey: ["orders", user.id] })}
        >
          <RefreshCw className="mr-2 size-4" /> Refresh
        </Button>
      </header>

      {ordersQ.isLoading ? (
        <Skeleton className="mt-8 h-64 w-full rounded-3xl" />
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-3xl border border-border/60 bg-card/60 p-10 text-center backdrop-blur">
          <ShoppingBag className="mx-auto size-10 text-primary" />
          <h2 className="mt-4 font-display text-2xl">No orders yet</h2>
          <p className="mt-2 text-muted-foreground">Your first Mithaas feast is a tap away.</p>
          <Button asChild className="mt-6">
            <Link to="/menu">Browse the menu</Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {live.length > 0 && (
            <section className="space-y-6">
              <h2 className="font-display text-2xl">Tracking now</h2>
              {live.map((o) => (
                <LiveOrderCard
                  key={o.id}
                  order={o}
                  onCancel={() => cancelM.mutate(o.id)}
                  cancelling={cancelM.isPending}
                  onReorder={() => reorder(o)}
                />
              ))}
            </section>
          )}

          {past.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-2xl">Order history</h2>
              {past.map((o) => (
                <PastOrderCard key={o.id} order={o} onReorder={() => reorder(o)} />
              ))}
            </section>
          )}
        </div>
      )}
    </div>
  );
}

function OrderLines({ order }: { order: OrderWithItems }) {
  return (
    <ul className="space-y-3">
      {order.items.map((l) => (
        <li key={l.id} className="flex items-center gap-3">
          <img
            src={foodImage(null)}
            alt=""
            aria-hidden
            className="size-10 shrink-0 rounded-lg object-cover opacity-80"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{l.name}</p>
            <p className="text-xs text-muted-foreground">
              {l.quantity} × {inr(l.unit_price)}
              {l.customizations?.spice ? ` · ${l.customizations.spice}` : ""}
            </p>
          </div>
          <span className="text-sm">{inr(l.unit_price * l.quantity)}</span>
        </li>
      ))}
    </ul>
  );
}

function LiveOrderCard({
  order,
  onCancel,
  cancelling,
  onReorder,
}: {
  order: OrderWithItems;
  onCancel: () => void;
  cancelling: boolean;
  onReorder: () => void;
}) {
  const idx = stageIndex(order.status);
  const left = etaMinutesLeft(order);
  const canCancel = idx <= 1;

  return (
    <article className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{shortId(order.id)}</Badge>
            <Badge className="bg-primary/15 text-primary hover:bg-primary/15">
              {order.order_type === "dinein" ? "Dine-in" : order.order_type === "takeaway" ? "Takeaway" : "Delivery"}
            </Badge>
          </div>
          <h3 className="mt-3 font-display text-2xl">
            {stageLabel(order.order_type, ORDER_STAGES[idx]!.key)}
          </h3>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="size-4" />
            {left > 0 ? `Arriving in about ${left} min` : "Any moment now"}
          </p>
        </div>
        <p className="font-display text-2xl">{inr(order.total)}</p>
      </div>

      <ol className="mt-6 space-y-4">
        {ORDER_STAGES.map((stage, i) => {
          const Icon = STAGE_ICONS[i] ?? Check;
          const done = i <= idx;
          const active = i === idx;
          return (
            <li key={stage.key} className="flex gap-4">
              <div className="flex flex-col items-center">
                <motion.span
                  animate={active ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                  transition={{ repeat: active ? Infinity : 0, duration: 1.8 }}
                  className={`grid size-9 place-items-center rounded-full border ${
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border/70 bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                </motion.span>
                {i < ORDER_STAGES.length - 1 && (
                  <span className={`mt-1 h-8 w-px ${i < idx ? "bg-primary" : "bg-border/70"}`} />
                )}
              </div>
              <div className="pb-1">
                <p className={`text-sm font-medium ${done ? "" : "text-muted-foreground"}`}>
                  {stageLabel(order.order_type, stage.key)}
                </p>
                <p className="text-xs text-muted-foreground">{stage.note}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <Separator className="my-6" />
      <OrderLines order={order} />

      <div className="mt-6 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={onReorder}>
          <RefreshCw className="mr-2 size-4" /> Reorder
        </Button>
        {canCancel && (
          <Button variant="ghost" size="sm" onClick={onCancel} disabled={cancelling}>
            <X className="mr-2 size-4" /> Cancel order
          </Button>
        )}
      </div>
    </article>
  );
}

function PastOrderCard({ order, onReorder }: { order: OrderWithItems; onReorder: () => void }) {
  const [open, setOpen] = useState(false);
  const placed = new Date(order.created_at);
  return (
    <article className="rounded-2xl border border-border/60 bg-card/50 p-5 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{shortId(order.id)}</Badge>
            <Badge variant="outline" className="capitalize">
              {order.status === "cancelled" ? "Cancelled" : stageLabel(order.order_type, "delivered")}
            </Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            {placed.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} ·{" "}
            {order.items.length} item{order.items.length > 1 ? "s" : ""} · {inr(order.total)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOpen((v) => !v)}>
            {open ? "Hide" : "Details"}
          </Button>
          <Button size="sm" onClick={onReorder}>
            <RefreshCw className="mr-2 size-4" /> Reorder
          </Button>
        </div>
      </div>
      {open && (
        <>
          <Separator className="my-4" />
          <OrderLines order={order} />
        </>
      )}
    </article>
  );
}
