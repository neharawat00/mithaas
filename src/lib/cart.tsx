import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { CartLine, Coupon, OrderType } from "./types";

const KEY = "mithaas-cart-v1";

type CartState = {
  lines: CartLine[];
  orderType: OrderType;
  coupon: Coupon | null;
  add: (line: Omit<CartLine, "lineId">) => void;
  setQty: (lineId: string, qty: number) => void;
  remove: (lineId: string) => void;
  clear: () => void;
  setOrderType: (t: OrderType) => void;
  setCoupon: (c: Coupon | null) => void;
  count: number;
  totals: {
    subtotal: number;
    discount: number;
    tax: number;
    deliveryFee: number;
    total: number;
  };
};

const CartContext = createContext<CartState | null>(null);

export const TAX_RATE = 0.05;
export const DELIVERY_FEE = 39;
export const FREE_DELIVERY_ABOVE = 599;

export function computeTotals(lines: CartLine[], coupon: Coupon | null, orderType: OrderType) {
  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  let discount = 0;
  if (coupon && subtotal >= Number(coupon.min_order)) {
    discount =
      coupon.discount_type === "percent"
        ? (subtotal * Number(coupon.discount_value)) / 100
        : Number(coupon.discount_value);
    if (coupon.max_discount) discount = Math.min(discount, Number(coupon.max_discount));
    discount = Math.min(discount, subtotal);
  }
  const taxable = subtotal - discount;
  const tax = taxable * TAX_RATE;
  const deliveryFee =
    orderType === "delivery" && subtotal > 0 && subtotal < FREE_DELIVERY_ABOVE ? DELIVERY_FEE : 0;
  return {
    subtotal,
    discount,
    tax,
    deliveryFee,
    total: Math.max(0, taxable + tax + deliveryFee),
  };
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [orderType, setOrderType] = useState<OrderType>("delivery");
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          lines?: CartLine[];
          orderType?: OrderType;
          coupon?: Coupon | null;
        };
        setLines(parsed.lines ?? []);
        setOrderType(parsed.orderType ?? "delivery");
        setCoupon(parsed.coupon ?? null);
      }
    } catch {
      /* ignore corrupt cart */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(KEY, JSON.stringify({ lines, orderType, coupon }));
  }, [lines, orderType, coupon, ready]);

  const value = useMemo<CartState>(() => {
    const signature = (l: Omit<CartLine, "lineId">) =>
      [l.itemId, l.spice, [...l.addons].sort().join("|"), l.instructions.trim()].join("::");

    return {
      lines,
      orderType,
      coupon,
      add: (line) =>
        setLines((prev) => {
          const idx = prev.findIndex((p) => signature(p) === signature(line));
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = { ...next[idx]!, quantity: next[idx]!.quantity + line.quantity };
            return next;
          }
          return [...prev, { ...line, lineId: crypto.randomUUID() }];
        }),
      setQty: (lineId, qty) =>
        setLines((prev) =>
          qty <= 0
            ? prev.filter((l) => l.lineId !== lineId)
            : prev.map((l) => (l.lineId === lineId ? { ...l, quantity: qty } : l)),
        ),
      remove: (lineId) => setLines((prev) => prev.filter((l) => l.lineId !== lineId)),
      clear: () => {
        setLines([]);
        setCoupon(null);
      },
      setOrderType,
      setCoupon,
      count: lines.reduce((s, l) => s + l.quantity, 0),
      totals: computeTotals(lines, coupon, orderType),
    };
  }, [lines, orderType, coupon]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
