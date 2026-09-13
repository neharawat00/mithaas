import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type WaitlistEntry = {
  id: string;
  guest_name: string;
  phone: string;
  requested_date: string;
  requested_time: string;
  guests: number;
  seating: string;
  notes: string | null;
  status: string;
  notified_at: string | null;
  hold_expires_at: string | null;
  promoted_reservation_id: string | null;
  created_at: string;
};

export function myWaitlistQuery(userId: string | null) {
  return queryOptions({
    queryKey: ["waitlist", userId],
    enabled: Boolean(userId),
    refetchInterval: 30_000,
    queryFn: async (): Promise<WaitlistEntry[]> => {
      const { data, error } = await supabase
        .from("reservation_waitlist")
        .select("*")
        .order("requested_date", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as WaitlistEntry[];
    },
  });
}

export type WaitlistInput = {
  guest_name: string;
  phone: string;
  requested_date: string;
  requested_time: string;
  guests: number;
  seating: string;
  notes: string | null;
};

export async function joinWaitlist(userId: string, input: WaitlistInput) {
  const { data, error } = await supabase
    .from("reservation_waitlist")
    .insert({ ...input, user_id: userId })
    .select("*")
    .single();
  if (error) throw error;
  return data as WaitlistEntry;
}

export async function leaveWaitlist(id: string) {
  const { error } = await supabase.from("reservation_waitlist").delete().eq("id", id);
  if (error) throw error;
}

/** Position in the queue for one of my waiting entries (1 = next in line). */
export async function waitlistPosition(id: string) {
  const { data, error } = await supabase.rpc("waitlist_position", { _id: id });
  if (error) throw error;
  return (data as number | null) ?? null;
}

/** Releases holds that timed out and promotes the next guest in each freed slot. */
export async function releaseExpiredHolds() {
  const { data, error } = await supabase.rpc("release_expired_holds");
  if (error) throw error;
  return (data as number | null) ?? 0;
}
