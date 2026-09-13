import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addDays, format, isBefore, startOfDay } from "date-fns";
import { motion } from "framer-motion";
import { BellRing, CalendarCheck, Check, Clock, Loader2, Minus, Plus, Sparkles, Users, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth, displayName } from "@/lib/use-auth";
import {
  OCCASIONS,
  SEATING,
  TIME_SLOTS,
  cancelReservation,
  createReservation,
  myReservationsQuery,
  slotCapacity,
  type Reservation,
} from "@/lib/reservation-queries";
import {
  joinWaitlist,
  leaveWaitlist,
  myWaitlistQuery,
  type WaitlistEntry,
} from "@/lib/waitlist-queries";

export const Route = createFileRoute("/reservations")({
  validateSearch: (
    search: Record<string, unknown>,
  ): { date?: string | undefined; time?: string | undefined; guests?: number | undefined } => ({
    date: typeof search['date'] === "string" ? (search['date'] as string) : undefined,
    time: typeof search['time'] === "string" ? (search['time'] as string) : undefined,
    guests: typeof search['guests'] === "number" ? (search['guests'] as number) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Reserve a Table — Mithaas" },
      { name: "description", content: "Book your table at Mithaas in seconds — pick a date, time and party size." },
      { property: "og:title", content: "Reserve a Table — Mithaas" },
      { property: "og:description", content: "Reserve your Mithaas dining experience online." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReservationsPage,
});

export function ComingSoon({ title, note }: { title: string; note: string }) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Mithaas</span>
      <h1 className="mt-3 font-display text-3xl sm:text-4xl">{title}</h1>
      <p className="mt-4 text-muted-foreground">{note}</p>
    </div>
  );
}

function ReservationsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();

  const today = startOfDay(new Date());
  const [date, setDate] = useState<Date | undefined>(() => {
    if (search.date) {
      const parsed = startOfDay(new Date(search.date));
      if (!Number.isNaN(parsed.getTime()) && !isBefore(parsed, today)) return parsed;
    }
    return today;
  });
  const [time, setTime] = useState<string>(search.time ?? "");
  const [guests, setGuests] = useState<number>(search.guests && search.guests > 0 ? search.guests : 2);
  const [seating, setSeating] = useState<string>("indoor");
  const [occasion, setOccasion] = useState<string>("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);
  const [waitSlot, setWaitSlot] = useState<string | null>(null);


  const dateKey = date ? format(date, "yyyy-MM-dd") : "";
  const guestName = name || (user ? displayName(user) : "");

  const reservationsQ = useQuery(myReservationsQuery(user?.id ?? null));
  const upcoming = useMemo(
    () =>
      (reservationsQ.data ?? []).filter(
        (r) => r.status !== "cancelled" && !isBefore(startOfDay(new Date(r.reserved_date)), today),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [reservationsQ.data],
  );

  const createM = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in to reserve a table.");
      return createReservation(user.id, {
        guest_name: guestName,
        phone,
        reserved_date: dateKey,
        reserved_time: time,
        guests,
        seating,
        occasion: occasion || null,
        notes: notes || null,
      });
    },
    onSuccess: (res) => {
      setConfirmed(res);
      setNotes("");
      void queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast.success(`Table confirmed — ${res.code}`, {
        description: `${format(new Date(res.reserved_date), "EEE d MMM")} at ${res.reserved_time} for ${res.guests}.`,
      });
    },
    onError: (e: Error) => toast.error(e.message || "Could not create the reservation."),
  });

  const waitlistQ = useQuery(myWaitlistQuery(user?.id ?? null));
  const waitlist = useMemo<WaitlistEntry[]>(
    () =>
      (waitlistQ.data ?? []).filter(
        (w) => !isBefore(startOfDay(new Date(w.requested_date)), today),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [waitlistQ.data],
  );

  const cancelM = useMutation({
    mutationFn: cancelReservation,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Reservation cancelled.");
    },
    onError: () => toast.error("Could not cancel that reservation."),
  });

  const joinM = useMutation({
    mutationFn: async (slot: string) => {
      if (!user) throw new Error("Please sign in to join the waitlist.");
      return joinWaitlist(user.id, {
        guest_name: guestName,
        phone,
        requested_date: dateKey,
        requested_time: slot,
        guests,
        seating,
        notes: notes || null,
      });
    },
    onSuccess: (entry) => {
      setWaitSlot(null);
      void queryClient.invalidateQueries({ queryKey: ["waitlist"] });
      toast.success("You're on the waitlist", {
        description: `${format(new Date(entry.requested_date), "EEE d MMM")} at ${entry.requested_time} — we'll alert you the moment a table opens.`,
      });
    },
    onError: (e: Error) => toast.error(e.message || "Could not join the waitlist."),
  });

  const leaveM = useMutation({
    mutationFn: leaveWaitlist,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["waitlist"] });
      toast.success("Removed from the waitlist.");
    },
    onError: () => toast.error("Could not update your waitlist."),
  });

  const phoneOk = /^[0-9+\-\s]{8,15}$/.test(phone.trim());
  const canSubmit = Boolean(dateKey && time && guests > 0 && guestName.trim().length > 1 && phoneOk);


  if (confirmed) {
    return <Confirmation reservation={confirmed} onNew={() => setConfirmed(null)} />;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:py-16">
      <header className="max-w-2xl">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Reservations</span>
        <h1 className="mt-3 font-display text-3xl sm:text-4xl">Reserve your table at Mithaas</h1>
        <p className="mt-3 text-muted-foreground">
          Choose a date, a seating you love and we'll hold the table for 15 minutes past your slot.
        </p>
      </header>

      <div className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="glass rounded-3xl p-5 sm:p-7">
          <div className="grid gap-7 sm:grid-cols-2">
            <div>
              <Label className="text-sm font-semibold">1. Pick a date</Label>
              <div className="mt-3 rounded-2xl border border-border/60 p-2">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => {
                    setDate(d ?? undefined);
                    setTime("");
                  }}
                  disabled={(d) => isBefore(startOfDay(d), today) || isBefore(addDays(today, 60), startOfDay(d))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-7">
              <div>
                <Label className="text-sm font-semibold">2. Party size</Label>
                <div className="mt-3 flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    aria-label="Fewer guests"
                    onClick={() => setGuests((g) => Math.max(1, g - 1))}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="flex min-w-24 items-center justify-center gap-2 font-display text-2xl">
                    <Users className="h-5 w-5 text-primary" aria-hidden /> {guests}
                  </span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="rounded-full"
                    aria-label="More guests"
                    onClick={() => setGuests((g) => Math.min(20, g + 1))}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {guests > 8 && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Parties above 8 are seated as a joined table — our host will call to confirm.
                  </p>
                )}
              </div>

              <div>
                <Label className="text-sm font-semibold">3. Choose a slot</Label>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const left = slotCapacity(dateKey, slot);
                    const full = left === 0;
                    const active = time === slot;
                    const queued = waitlist.some(
                      (w) => w.requested_date === dateKey && w.requested_time === slot && w.status !== "cancelled",
                    );
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => (full ? setWaitSlot(slot) : setTime(slot))}
                        className={`rounded-xl border px-2 py-2 text-xs font-medium transition ${
                          active
                            ? "border-primary bg-primary text-primary-foreground"
                            : full
                              ? "border-dashed border-border/70 text-muted-foreground hover:border-primary/60 hover:text-primary"
                              : "border-border/60 hover:border-primary/60 hover:text-primary"
                        }`}
                      >
                        {slot}
                        {full ? (
                          <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                            {queued ? "on waitlist" : "join waitlist"}
                          </span>
                        ) : (
                          !active && (
                            <span className="mt-0.5 block text-[10px] font-normal text-muted-foreground">
                              {left <= 3 ? `${left} left` : "available"}
                            </span>
                          )
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  Fully booked slots are dashed — tap one to join the waitlist and we'll alert you if a table frees up.
                </p>
              </div>


              <div>
                <Label className="text-sm font-semibold">4. Seating</Label>
                <div className="mt-3 grid gap-2">
                  {SEATING.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      onClick={() => setSeating(s.value)}
                      className={`flex items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                        seating === s.value ? "border-primary bg-primary/10 text-foreground" : "border-border/60"
                      }`}
                    >
                      {s.label}
                      {seating === s.value && <Check className="h-4 w-4 text-primary" aria-hidden />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 border-t border-border/60 pt-7 sm:grid-cols-2">
            <div>
              <Label htmlFor="guest-name" className="text-sm font-semibold">
                Guest name
              </Label>
              <Input
                id="guest-name"
                className="mt-2"
                value={guestName}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label htmlFor="guest-phone" className="text-sm font-semibold">
                Phone
              </Label>
              <Input
                id="guest-phone"
                className="mt-2"
                value={phone}
                inputMode="tel"
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
              />
              {phone && !phoneOk && <p className="mt-1 text-xs text-destructive">Enter a valid phone number.</p>}
            </div>
            <div className="sm:col-span-2">
              <Label className="text-sm font-semibold">Occasion (optional)</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {OCCASIONS.map((o) => (
                  <button
                    key={o}
                    type="button"
                    onClick={() => setOccasion((prev) => (prev === o ? "" : o))}
                    className={`rounded-full border px-3 py-1 text-xs transition ${
                      occasion === o ? "border-primary bg-primary/10 text-primary" : "border-border/60"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="guest-notes" className="text-sm font-semibold">
                Requests for the kitchen or host
              </Label>
              <Textarea
                id="guest-notes"
                className="mt-2"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="High chair, jain food, quiet corner…"
              />
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass sticky top-24 rounded-3xl p-6"
          >
            <h2 className="font-display text-xl">Your booking</h2>
            <dl className="mt-4 space-y-3 text-sm">
              <Row label="Date" value={date ? format(date, "EEEE, d MMMM yyyy") : "—"} />
              <Row label="Time" value={time || "Select a slot"} />
              <Row label="Guests" value={`${guests} ${guests === 1 ? "guest" : "guests"}`} />
              <Row label="Seating" value={SEATING.find((s) => s.value === seating)?.label ?? seating} />
              {occasion && <Row label="Occasion" value={occasion} />}
            </dl>

            {loading ? (
              <Button className="mt-6 w-full rounded-full" disabled>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading
              </Button>
            ) : user ? (
              <Button
                className="mt-6 w-full rounded-full"
                disabled={!canSubmit || createM.isPending}
                onClick={() => createM.mutate()}
              >
                {createM.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CalendarCheck className="mr-2 h-4 w-4" />
                )}
                Confirm reservation
              </Button>
            ) : (
              <div className="mt-6 space-y-2">
                <Button
                  className="w-full rounded-full"
                  onClick={() => navigate({ to: "/auth", search: { redirect: "/reservations" } })}
                >
                  Sign in to reserve
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  We only use your account to send the confirmation code.
                </p>
              </div>
            )}
            {!canSubmit && user && (
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Pick a slot and add your name and phone to confirm.
              </p>
            )}
          </motion.div>

          {user && upcoming.length > 0 && (
            <div className="glass rounded-3xl p-6">
              <h2 className="font-display text-lg">Upcoming tables</h2>
              <ul className="mt-4 space-y-3">
                {upcoming.map((r) => (
                  <li key={r.id} className="rounded-2xl border border-border/60 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{format(new Date(r.reserved_date), "EEE d MMM")}</span>
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        {r.code}
                      </Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden /> {r.reserved_time}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" aria-hidden /> {r.guests}
                      </span>
                      <span className="capitalize">{r.seating}</span>
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                      disabled={cancelM.isPending}
                      onClick={() => cancelM.mutate(r.id)}
                    >
                      <X className="mr-1 h-3 w-3" /> Cancel
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {waitSlot && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass rounded-3xl border border-primary/30 p-6"
            >
              <h2 className="flex items-center gap-2 font-display text-lg">
                <BellRing className="h-4 w-4 text-primary" aria-hidden /> Join the waitlist
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {date ? format(date, "EEE d MMM") : "—"} at {waitSlot} is fully booked. We'll notify you on{" "}
                {phone || "your phone"} the moment a table frees up.
              </p>
              <dl className="mt-4 space-y-2 text-sm">
                <Row label="Guests" value={String(guests)} />
                <Row label="Seating" value={SEATING.find((s) => s.value === seating)?.label ?? seating} />
              </dl>
              {user ? (
                <div className="mt-5 flex gap-2">
                  <Button
                    className="flex-1 rounded-full"
                    disabled={joinM.isPending || !dateKey || guestName.trim().length < 2 || !phoneOk}
                    onClick={() => joinM.mutate(waitSlot)}
                  >
                    {joinM.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Join waitlist
                  </Button>
                  <Button variant="ghost" className="rounded-full" onClick={() => setWaitSlot(null)}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  className="mt-5 w-full rounded-full"
                  onClick={() => navigate({ to: "/auth", search: { redirect: "/reservations" } })}
                >
                  Sign in to join the waitlist
                </Button>
              )}
              {user && (guestName.trim().length < 2 || !phoneOk) && (
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Add your name and phone above so we can reach you.
                </p>
              )}
            </motion.div>
          )}

          {user && waitlist.length > 0 && (
            <div className="glass rounded-3xl p-6">
              <h2 className="font-display text-lg">My waitlist</h2>
              <ul className="mt-4 space-y-3">
                {waitlist.map((w) => (
                  <li key={w.id} className="rounded-2xl border border-border/60 p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold">{format(new Date(w.requested_date), "EEE d MMM")}</span>
                      <Badge
                        variant={w.status === "notified" ? "default" : "secondary"}
                        className="text-[10px] capitalize"
                      >
                        {w.status === "notified" ? "table available" : w.status}
                      </Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden /> {w.requested_time}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" aria-hidden /> {w.guests}
                      </span>
                      <span className="capitalize">{w.seating}</span>
                    </p>
                    {w.status === "notified" && (
                      <p className="mt-1 text-xs text-primary">
                        A table opened up — book it now before it goes.
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                      disabled={leaveM.isPending}
                      onClick={() => leaveM.mutate(w.id)}
                    >
                      <X className="mr-1 h-3 w-3" /> Leave waitlist
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

function Confirmation({ reservation, onNew }: { reservation: Reservation; onNew: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-3xl p-8 text-center"
      >
        <span className="gradient-warm mx-auto grid h-14 w-14 place-items-center rounded-full text-primary-foreground">
          <Check className="h-7 w-7" aria-hidden />
        </span>
        <h1 className="mt-5 font-display text-3xl">Table confirmed</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          A confirmation is saved to your account. Show this code at the host desk.
        </p>
        <p className="mt-6 font-mono text-3xl tracking-[0.3em] text-primary">{reservation.code}</p>

        <dl className="mt-8 space-y-3 text-left text-sm">
          <Row label="Guest" value={reservation.guest_name} />
          <Row label="Date" value={format(new Date(reservation.reserved_date), "EEEE, d MMMM yyyy")} />
          <Row label="Time" value={reservation.reserved_time} />
          <Row label="Guests" value={String(reservation.guests)} />
          <Row label="Seating" value={SEATING.find((s) => s.value === reservation.seating)?.label ?? reservation.seating} />
          {reservation.occasion && <Row label="Occasion" value={reservation.occasion} />}
          <Row label="Phone" value={reservation.phone} />
        </dl>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild className="rounded-full">
            <Link to="/menu">
              <Sparkles className="mr-2 h-4 w-4" /> Pre-browse the menu
            </Link>
          </Button>
          <Button variant="outline" className="rounded-full" onClick={onNew}>
            Book another table
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
