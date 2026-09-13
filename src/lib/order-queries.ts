import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CartLine, OrderType } from "./types";

export type OrderRow = {
  id: string;
  order_type: string;
  status: string;
  customer_name: string;
  phone: string;
  address: string | null;
  table_label: string | null;
  notes: string | null;
  coupon_code: string | null;
  subtotal: number;
  discount: number;
  tax: number;
  delivery_fee: number;
  total: number;
  payment_method: string;
  payment_status: string;
  eta_minutes: number;
  created_at: string;
  updated_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  item_id: string | null;
  name: string;
  unit_price: number;
  quantity: number;
  customizations: { spice?: string; addons?: string[]; instructions?: string } | null;
};

export type OrderWithItems = OrderRow & { items: OrderItemRow[] };

/** Live tracking stages, with the minute offset from order placement. */
export const ORDER_STAGES = [
  { key: "received", label: "Order received", note: "We have your order", at: 0 },
  { key: "confirmed", label: "Confirmed & paid", note: "Kitchen has the ticket", at: 1 },
  { key: "preparing", label: "Cooking now", note: "Fresh off the tandoor", at: 3 },
  { key: "packed", label: "Packed & sealed", note: "Quality checked", at: 12 },
  { key: "on_the_way", label: "On the way", note: "Rider heading to you", at: 16 },
  { key: "delivered", label: "Delivered", note: "Enjoy your meal", at: 30 },
] as const;

export type StageKey = (typeof ORDER_STAGES)[number]["key"];

export function stageIndex(status: string) {
  const i = ORDER_STAGES.findIndex((s) => s.key === status);
  return i < 0 ? 0 : i;
}

function labelFor(orderType: string, key: StageKey) {
  if (orderType === "delivery") return key;
  return key === "on_the_way" ? "ready" : key;
}

export function stageLabel(orderType: string, key: StageKey) {
  if (orderType === "delivery") return ORDER_STAGES.find((s) => s.key === key)!.label;
  if (key === "on_the_way") return orderType === "dinein" ? "Serving at your table" : "Ready for pickup";
  if (key === "delivered") return orderType === "dinein" ? "Served" : "Picked up";
  return ORDER_STAGES.find((s) => s.key === key)!.label;
}

/** Status the order should be in, given how long ago it was placed. */
export function expectedStatus(order: OrderRow, now = Date.now()): string {
  const elapsed = (now - new Date(order.created_at).getTime()) / 60000;
  const scale = order.eta_minutes / 30;
  let current: StageKey = "received";
  for (const stage of ORDER_STAGES) {
    if (elapsed >= stage.at * scale) current = stage.key;
  }
  return labelFor(order.order_type, current);
}

export function etaMinutesLeft(order: OrderRow, now = Date.now()) {
  const elapsed = (now - new Date(order.created_at).getTime()) / 60000;
  return Math.max(0, Math.ceil(order.eta_minutes - elapsed));
}

export function isFinalStatus(status: string) {
  return status === "delivered" || status === "ready" || status === "cancelled";
}

export function myOrdersQuery(userId: string | null) {
  return queryOptions({
    queryKey: ["orders", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<OrderWithItems[]> => {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((o) => {
        const { order_items, ...rest } = o as unknown as OrderRow & { order_items: OrderItemRow[] };
        return {
          ...rest,
          subtotal: Number(rest.subtotal),
          discount: Number(rest.discount),
          tax: Number(rest.tax),
          delivery_fee: Number(rest.delivery_fee),
          total: Number(rest.total),
          items: (order_items ?? []).map((i) => ({ ...i, unit_price: Number(i.unit_price) })),
        };
      });
    },
  });
}

export type PlaceOrderInput = {
  orderType: OrderType;
  customerName: string;
  phone: string;
  address: string | null;
  tableLabel: string | null;
  notes: string | null;
  couponCode: string | null;
  paymentMethod: string;
  lines: CartLine[];
  totals: { subtotal: number; discount: number; tax: number; deliveryFee: number; total: number };
};

export async function placeOrder(userId: string, input: PlaceOrderInput) {
  const eta = input.orderType === "delivery" ? 38 : input.orderType === "takeaway" ? 22 : 18;
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: userId,
      order_type: input.orderType,
      status: "received",
      customer_name: input.customerName,
      phone: input.phone,
      address: input.address,
      table_label: input.tableLabel,
      notes: input.notes,
      coupon_code: input.couponCode,
      subtotal: input.totals.subtotal,
      discount: input.totals.discount,
      tax: input.totals.tax,
      delivery_fee: input.totals.deliveryFee,
      total: input.totals.total,
      payment_method: input.paymentMethod,
      eta_minutes: eta,
    })
    .select("*")
    .single();
  if (error) throw error;

  const rows = input.lines.map((l) => ({
    order_id: (order as OrderRow).id,
    item_id: l.itemId,
    name: l.name,
    unit_price: l.unitPrice,
    quantity: l.quantity,
    customizations: { spice: l.spice, addons: l.addons, instructions: l.instructions },
  }));
  const { error: itemsError } = await supabase.from("order_items").insert(rows);
  if (itemsError) throw itemsError;

  return order as OrderRow;
}

/** Push the order to the stage it should be in — keeps live tracking honest across devices. */
export async function syncOrderStatus(order: OrderRow) {
  const next = expectedStatus(order);
  if (next === order.status || order.status === "cancelled") return null;
  const { error } = await supabase.from("orders").update({ status: next }).eq("id", order.id);
  if (error) throw error;
  return next;
}

export async function cancelOrder(id: string) {
  const { error } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
  if (error) throw error;
}
