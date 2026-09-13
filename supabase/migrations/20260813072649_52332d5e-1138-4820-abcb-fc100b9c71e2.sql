CREATE TABLE public.reservation_waitlist (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  requested_date date NOT NULL,
  requested_time text NOT NULL,
  guests integer NOT NULL DEFAULT 2,
  seating text NOT NULL DEFAULT 'indoor',
  notes text,
  status text NOT NULL DEFAULT 'waiting',
  notified_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservation_waitlist TO authenticated;
GRANT ALL ON public.reservation_waitlist TO service_role;

ALTER TABLE public.reservation_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "waitlist read" ON public.reservation_waitlist FOR SELECT TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "waitlist insert" ON public.reservation_waitlist FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "waitlist update" ON public.reservation_waitlist FOR UPDATE TO authenticated
USING (auth.uid() = user_id OR has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'staff'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "waitlist delete" ON public.reservation_waitlist FOR DELETE TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX reservation_waitlist_slot_idx ON public.reservation_waitlist (requested_date, requested_time);

CREATE TRIGGER reservation_waitlist_touch BEFORE UPDATE ON public.reservation_waitlist
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();