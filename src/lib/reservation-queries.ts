import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Reservation = {
  id: string;
  code: string;
  guest_name: string;
  phone: string;
  reserved_date: string;
  reserved_time: string;
  guests: number;
  seating: string;
  occasion: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

export const TIME_SLOTS = [
  "12:00 PM",
  "12:30 PM",
  "1:00 PM",
  "1:30 PM",
  "2:00 PM",
  "2:30 PM",
  "7:00 PM",
  "7:30 PM",
  "8:00 PM",
  "8:30 PM",
  "9:00 PM",
  "9:30 PM",
  "10:00 PM",
] as const;

export const SEATING = [
  { value: "indoor", label: "Indoor — climate controlled" },
  { value: "outdoor", label: "Courtyard — open air" },
  { value: "private", label: "Private dining nook" },
  { value: "bar", label: "Chef's counter" },
] as const;

export const OCCASIONS = ["Birthday", "Anniversary", "Business dinner", "Date night", "Family celebration"] as const;

/** Deterministic pseudo availability so slots feel alive without a booking engine. */
export function slotCapacity(date: string, time: string) {
  let h = 0;
  const key = `${date}|${time}`;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) % 9973;
  return h % 12; // tables left, 0 = full
}

export function myReservationsQuery(userId: string | null) {
  return queryOptions({
    queryKey: ["reservations", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<Reservation[]> => {
      const { data, error } = await supabase
        .from("reservations")
        .select("*")
        .order("reserved_date", { ascending: true })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Reservation[];
    },
  });
}

export type ReservationInput = {
  guest_name: string;
  phone: string;
  reserved_date: string;
  reserved_time: string;
  guests: number;
  seating: string;
  occasion: string | null;
  notes: string | null;
};

export async function createReservation(userId: string, input: ReservationInput) {
  const { data, error } = await supabase
    .from("reservations")
    .insert({ ...input, user_id: userId })
    .select("*")
    .single();
  if (error) throw error;
  return data as Reservation;
}

export async function cancelReservation(id: string) {
  const { error } = await supabase.from("reservations").update({ status: "cancelled" }).eq("id", id);
  if (error) throw error;
}
