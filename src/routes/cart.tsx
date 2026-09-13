import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BadgePercent,
  Bike,
  Loader2,
  Minus,
  Plus,
  ShoppingBag,
  Store,
  Trash2,
  UtensilsCrossed,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useCart, FREE_DELIVERY_ABOVE } from "@/lib/cart";
import { couponsQuery } from "@/lib/menu-queries";
import { placeOrder } from "@/lib/order-queries";
import { addonLabels } from "@/lib/customize";
import { foodImage } from "@/lib/images";
import { inr } from "@/lib/format";
import { useAuth, displayName } from "@/lib/use-auth";
import type { OrderType } from "@/lib/types";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Mithaas" },
      { name: "description", content: "Review your Mithaas order, apply coupons and check out in seconds." },
      { property: "og:title", content: "Your Cart — Mithaas" },
      { property: "og:description", content: "Review and place your Mithaas order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartPage,
});

const ORDER_TYPES: { value: OrderType; label: string; icon: typeof Bike }[] = [
  { value: "delivery", label: "Delivery", icon: Bike },
  { value: "takeaway", label: "Takeaway", icon: Store },
  { value: "dinein", label: "Dine-in", icon: UtensilsCrossed },
];

function CartPage() {
  const cart = useCart();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, loading } = useAuth();
  const couponsQ = useQuery(couponsQuery);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [table, setTable] = useState("");
  const [notes, setNotes] = useState("");

  const customerName = name || (user ? displayName(user) : "");
  const phoneOk = /^[0-9+\-\s]{8,15}$/.test(phone.trim());
  const addressOk = cart.orderType !== "delivery" || address.trim().length > 8;
  const canOrder = cart.lines.length > 0 && customerName.trim().length > 1 && phoneOk && addressOk;

  const applyCoupon = (raw: string) => {
    const wanted = raw.trim().toUpperCase();
    const found = (couponsQ.data ?? []).find((c) => c.code.toUpperCase() === wanted);
    if (!found) {
      toast.error("That coupon code isn't valid.");
      return;
    }
    if (cart.totals.subtotal < Number(found.min_order)) {
      toast.error(`Add ${inr(Number(found.min_order) - cart.totals.subtotal)} more to use ${found.code}.`);
      return;
    }
    cart.setCoupon(found);
    setCode("");
    toast.success(`${found.code} applied`, { description: found.title });
  };

  const orderM = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in to place your order.");
      return placeOrder(user.id, {
        orderType: cart.orderType,
        customerName,
        phone,
        address: cart.orderType === "delivery" ? address : null,
        tableLabel: cart.orderType === "dinein" ? table || "Walk-in" : null,
        notes: notes || null,
        couponCode: cart.coupon?.code ?? null,
        paymentMethod: "upi",
        lines: cart.lines,
        totals: cart.totals,
      });
    },
    onSuccess: (order) => {
      cart.clear();
      void queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order placed — tracking is live", { description: `Arriving in about ${order.eta_minutes} min.` });
      void navigate({ to: "/orders" });
    },
    onError: (e: Error) => toast.error(e.message || "Could not place your order."),
  });

  if (cart.lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
        <span className="gradient-warm mx-auto grid h-16 w-16 place-items-center rounded-full text-primary-foreground">
          <ShoppingBag className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-6 font-display text-3xl">Your cart is empty</h1>
        <p className="mt-3 text-muted-foreground">
          Add a few dishes from the menu and they'll show up right here with your customisations.
        </p>
        <Button asChild className="mt-8 rounded-full">
          <Link to="/menu">Browse the menu</Link>
        </Button>
      </div>
    );
  }

  const toFreeDelivery = FREE_DELIVERY_ABOVE - cart.totals.subtotal;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Your cart</span>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">
          {cart.count} {cart.count === 1 ? "item" : "items"} ready to cook
        </h1>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="space-y-6">
          <div className="glass rounded-3xl p-5 sm:p-6">
            <h2 className="font-display text-lg">How would you like it?</h2>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {ORDER_TYPES.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => cart.setOrderType(value)}
                  className={`flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3 text-sm transition ${
                    cart.orderType === value
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border/60 text-muted-foreground hover:border-primary/50"
                  }`}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  {label}
                </button>
              ))}
            </div>
          </div>

          <ul className="space-y-4">
            {cart.lines.map((line) => (
              <motion.li
                key={line.lineId}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass flex gap-4 rounded-3xl p-4"
              >
                <img
                  src={foodImage(line.imageKey)}
                  alt={line.name}
                  loading="lazy"
                  width={160}
                  height={160}
                  className="h-24 w-24 shrink-0 rounded-2xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-display text-lg">{line.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {line.spice}
                        {line.addons.length > 0 ? ` · ${addonLabels(line.addons).join(", ")}` : ""}
                      </p>
                      {line.instructions && (
                        <p className="mt-1 text-xs italic text-muted-foreground">“{line.instructions}”</p>
                      )}
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
                      aria-label={`Remove ${line.name}`}
                      onClick={() => cart.remove(line.lineId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 rounded-full border border-border p-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full"
                        aria-label="Decrease quantity"
                        onClick={() => cart.setQty(line.lineId, line.quantity - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-5 text-center text-sm font-semibold">{line.quantity}</span>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 rounded-full"
                        aria-label="Increase quantity"
                        onClick={() => cart.setQty(line.lineId, Math.min(20, line.quantity + 1))}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <span className="font-display text-lg">{inr(line.unitPrice * line.quantity)}</span>
                  </div>
                </div>
              </motion.li>
            ))}
          </ul>

          <div className="glass space-y-4 rounded-3xl p-5 sm:p-6">
            <h2 className="font-display text-lg">Delivery details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="cart-name">Name</Label>
                <Input
                  id="cart-name"
                  className="mt-2"
                  value={customerName}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div>
                <Label htmlFor="cart-phone">Phone</Label>
                <Input
                  id="cart-phone"
                  className="mt-2"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
                {phone && !phoneOk && <p className="mt-1 text-xs text-destructive">Enter a valid phone number.</p>}
              </div>
              {cart.orderType === "delivery" && (
                <div className="sm:col-span-2">
                  <Label htmlFor="cart-address">Delivery address</Label>
                  <Textarea
                    id="cart-address"
                    className="mt-2"
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Flat, street, landmark, city"
                  />
                </div>
              )}
              {cart.orderType === "dinein" && (
                <div className="sm:col-span-2">
                  <Label htmlFor="cart-table">Table</Label>
                  <Input
                    id="cart-table"
                    className="mt-2"
                    value={table}
                    onChange={(e) => setTable(e.target.value)}
                    placeholder="e.g. T12"
                  />
                </div>
              )}
              <div className="sm:col-span-2">
                <Label htmlFor="cart-notes">Notes for the kitchen</Label>
                <Textarea
                  id="cart-notes"
                  className="mt-2"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ring the bell twice, less spicy overall…"
                />
              </div>
            </div>
          </div>
        </section>

        <aside>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass sticky top-24 space-y-5 rounded-3xl p-6"
          >
            <h2 className="font-display text-xl">Bill summary</h2>

            <div>
              {cart.coupon ? (
                <div className="flex items-center justify-between gap-2 rounded-2xl border border-primary/40 bg-primary/10 px-3 py-2 text-sm">
                  <span className="inline-flex items-center gap-2">
                    <BadgePercent className="h-4 w-4 text-primary" aria-hidden />
                    <span className="font-mono">{cart.coupon.code}</span>
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7"
                    aria-label="Remove coupon"
                    onClick={() => cart.setCoupon(null)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Coupon code"
                    aria-label="Coupon code"
                  />
                  <Button variant="outline" className="rounded-full" onClick={() => applyCoupon(code)}>
                    Apply
                  </Button>
                </div>
              )}
              {!cart.coupon && (couponsQ.data ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {(couponsQ.data ?? []).slice(0, 4).map((c) => (
                    <button key={c.id} type="button" onClick={() => applyCoupon(c.code)}>
                      <Badge variant="secondary" className="cursor-pointer font-mono text-[10px]">
                        {c.code}
                      </Badge>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <dl className="space-y-2 text-sm">
              <SummaryRow label="Item total" value={inr(cart.totals.subtotal)} />
              {cart.totals.discount > 0 && (
                <SummaryRow label="Coupon discount" value={`− ${inr(cart.totals.discount)}`} accent />
              )}
              <SummaryRow label="Taxes (5%)" value={inr(cart.totals.tax)} />
              <SummaryRow
                label="Delivery"
                value={cart.totals.deliveryFee === 0 ? "Free" : inr(cart.totals.deliveryFee)}
              />
              <div className="flex items-center justify-between border-t border-border/60 pt-3 font-display text-xl">
                <span>To pay</span>
                <span>{inr(cart.totals.total)}</span>
              </div>
            </dl>

            {cart.orderType === "delivery" && toFreeDelivery > 0 && (
              <p className="text-xs text-muted-foreground">
                Add {inr(toFreeDelivery)} more for free delivery.
              </p>
            )}

            {loading ? (
              <Button className="w-full rounded-full" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
              </Button>
            ) : user ? (
              <Button
                className="w-full rounded-full"
                disabled={!canOrder || orderM.isPending}
                onClick={() => orderM.mutate()}
              >
                {orderM.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <ShoppingBag className="mr-2 h-4 w-4" />
                )}
                Place order · {inr(cart.totals.total)}
              </Button>
            ) : (
              <Button asChild className="w-full rounded-full">
                <Link to="/auth" search={{ redirect: "/cart" }}>
                  Sign in to order
                </Link>
              </Button>
            )}
            {user && !canOrder && (
              <p className="text-center text-xs text-muted-foreground">
                Add your name, phone{cart.orderType === "delivery" ? " and delivery address" : ""} to continue.
              </p>
            )}
          </motion.div>
        </aside>
      </div>
    </div>
  );
}

function SummaryRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={accent ? "font-medium text-primary" : "font-medium"}>{value}</dd>
    </div>
  );
}
