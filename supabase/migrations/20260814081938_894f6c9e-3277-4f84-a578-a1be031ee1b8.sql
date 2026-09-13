-- 1. Reservation holds
ALTER TABLE public.reservations
  ADD COLUMN IF NOT EXISTS hold_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'direct';

-- 2. Waitlist queue metadata
ALTER TABLE public.reservation_waitlist
  ADD COLUMN IF NOT EXISTS hold_expires_at timestamptz,
  ADD COLUMN IF NOT EXISTS promoted_reservation_id uuid REFERENCES public.reservations(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS reservation_waitlist_slot_idx
  ON public.reservation_waitlist (requested_date, requested_time, status, created_at);

-- 3. Queue position for the caller's own entry
CREATE OR REPLACE FUNCTION public.waitlist_position(_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT (
    SELECT count(*)::int + 1
    FROM public.reservation_waitlist w2
    WHERE w2.requested_date = w.requested_date
      AND w2.requested_time = w.requested_time
      AND w2.status = 'waiting'
      AND w2.created_at < w.created_at
  )
  FROM public.reservation_waitlist w
  WHERE w.id = _id AND w.status = 'waiting';
$$;

GRANT EXECUTE ON FUNCTION public.waitlist_position(uuid) TO authenticated;

-- 4. Promote the next waiting guest for a freed slot
CREATE OR REPLACE FUNCTION public.promote_waitlist_slot(_date date, _time text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  w public.reservation_waitlist;
  new_id uuid;
BEGIN
  SELECT * INTO w
  FROM public.reservation_waitlist
  WHERE requested_date = _date
    AND requested_time = _time
    AND status = 'waiting'
  ORDER BY created_at
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF w.id IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.reservations
    (user_id, guest_name, phone, reserved_date, reserved_time, guests, seating, notes, status, hold_expires_at, source)
  VALUES
    (w.user_id, w.guest_name, w.phone, w.requested_date, w.requested_time, w.guests, w.seating, w.notes,
     'hold', now() + interval '15 minutes', 'waitlist')
  RETURNING id INTO new_id;

  UPDATE public.reservation_waitlist
  SET status = 'promoted',
      notified_at = now(),
      hold_expires_at = now() + interval '15 minutes',
      promoted_reservation_id = new_id
  WHERE id = w.id;

  RETURN new_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.promote_waitlist_slot(date, text) TO authenticated, service_role;

-- 5. Release expired holds, then promote the next guest
CREATE OR REPLACE FUNCTION public.release_expired_holds()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  released int := 0;
BEGIN
  FOR r IN
    SELECT id, reserved_date, reserved_time
    FROM public.reservations
    WHERE status = 'hold' AND hold_expires_at IS NOT NULL AND hold_expires_at < now()
  LOOP
    UPDATE public.reservations SET status = 'expired' WHERE id = r.id;
    UPDATE public.reservation_waitlist
      SET status = 'expired'
      WHERE promoted_reservation_id = r.id AND status = 'promoted';
    PERFORM public.promote_waitlist_slot(r.reserved_date, r.reserved_time);
    released := released + 1;
  END LOOP;
  RETURN released;
END;
$$;

GRANT EXECUTE ON FUNCTION public.release_expired_holds() TO authenticated, service_role;

-- 6. Auto-promote when a reservation is cancelled / expired
CREATE OR REPLACE FUNCTION public.reservations_freed_slot()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('cancelled', 'expired') AND OLD.status NOT IN ('cancelled', 'expired') THEN
    PERFORM public.promote_waitlist_slot(NEW.reserved_date, NEW.reserved_time);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS reservations_freed_slot_trg ON public.reservations;
CREATE TRIGGER reservations_freed_slot_trg
AFTER UPDATE OF status ON public.reservations
FOR EACH ROW EXECUTE FUNCTION public.reservations_freed_slot();

-- 7. Realtime for live order tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- 8. More cuisines
INSERT INTO public.menu_categories (slug, name, emoji, sort_order) VALUES
  ('kebabs', 'Kebabs & Tandoor', '🔥', 40),
  ('wraps', 'Wraps & Rolls', '🌯', 41),
  ('continental', 'Continental', '🍽️', 42),
  ('panasian', 'Pan-Asian', '🥢', 43),
  ('pizzapasta', 'Pizza & Pasta', '🍕', 44),
  ('bowls', 'Salads & Bowls', '🥗', 45)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.menu_items
  (category_id, slug, name, description, price, image_key, rating, review_count, is_veg, spice_level, prep_minutes, calories, is_bestseller, is_chef_special, tags)
SELECT c.id, v.slug, v.name, v.description, v.price, v.image_key, v.rating, v.review_count, v.is_veg, v.spice, v.prep, v.cal, v.best, v.chef, v.tags
FROM (VALUES
  ('kebabs','malai-broccoli','Malai Broccoli','Charred broccoli in cheddar-cream marinade, smoked over coal.',389,'starter',4.7,182,true,1,18,240,true,false,ARRAY['tandoor','creamy']),
  ('kebabs','kalmi-kebab','Murgh Kalmi Kebab','Chicken drumsticks in a yoghurt-cardamom marinade, clay-oven roasted.',479,'starter',4.8,311,false,2,22,410,true,false,ARRAY['chicken','tandoor']),
  ('kebabs','tandoori-mushroom','Tandoori Mushroom','Button mushrooms, ajwain and hung curd, finished with lime butter.',349,'starter',4.5,96,true,2,16,190,false,false,ARRAY['tandoor']),
  ('kebabs','galouti-kebab','Galouti Kebab','Lucknowi melt-in-mouth mutton patties with warm sheermal.',629,'starter',4.9,214,false,2,25,520,false,true,ARRAY['mutton','awadhi']),
  ('kebabs','paneer-tikka-lasooni','Lasooni Paneer Tikka','Garlic-forward paneer tikka with bell peppers.',429,'starter',4.6,268,true,3,18,380,false,false,ARRAY['paneer','spicy']),
  ('wraps','paneer-kathi','Paneer Kathi Roll','Flaky paratha, spiced paneer, pickled onions, mint chutney.',249,'bread',4.6,341,true,2,12,470,true,false,ARRAY['roll','street']),
  ('wraps','chicken-seekh-roll','Chicken Seekh Roll','Coal-grilled seekh, egg-washed paratha, chilli mayo.',289,'bread',4.7,402,false,3,14,540,true,false,ARRAY['roll','chicken']),
  ('wraps','aloo-tikki-wrap','Aloo Tikki Wrap','Crisp potato tikki, tamarind drizzle, crunchy sev.',179,'chaat',4.3,158,true,2,10,420,false,false,ARRAY['roll','budget']),
  ('wraps','mutton-shawarma','Mutton Shawarma Roll','Slow-shaved mutton, garlic toum, pickles in pita.',349,'bread',4.6,127,false,2,15,560,false,false,ARRAY['roll','middle-eastern']),
  ('continental','penne-alfredo','Penne Alfredo','Parmesan cream, roasted garlic, cracked pepper.',379,'curry',4.4,143,true,1,18,610,false,false,ARRAY['pasta','creamy']),
  ('continental','grilled-cottage-steak','Grilled Cottage Cheese Steak','Herb-marinated paneer steak, mash and buttered greens.',499,'curry',4.5,88,true,1,22,520,false,true,ARRAY['continental']),
  ('continental','lemon-herb-chicken','Lemon Herb Chicken','Pan-seared chicken breast, lemon butter jus, seasonal veg.',549,'curry',4.6,164,false,1,24,480,true,false,ARRAY['continental','chicken']),
  ('continental','mushroom-risotto','Wild Mushroom Risotto','Arborio rice, porcini stock, truffle oil finish.',529,'curry',4.7,102,true,1,26,590,false,true,ARRAY['risotto']),
  ('panasian','thai-green-curry','Thai Green Curry','Coconut, galangal and basil with garden vegetables.',449,'chinese',4.6,197,true,3,20,430,true,false,ARRAY['thai','coconut']),
  ('panasian','pad-thai','Veg Pad Thai','Rice noodles, tamarind, crushed peanuts, lime.',399,'chinese',4.4,151,true,2,18,520,false,false,ARRAY['thai','noodles']),
  ('panasian','chilli-basil-chicken','Chilli Basil Chicken','Wok-tossed chicken, bird-eye chilli, Thai basil.',469,'chinese',4.7,223,false,4,18,470,false,false,ARRAY['spicy','chicken']),
  ('panasian','dimsum-veg','Steamed Veg Dim Sum','Water chestnut and shiitake parcels, chilli oil dip.',329,'chinese',4.5,176,true,1,14,260,false,false,ARRAY['dimsum','steamed']),
  ('panasian','khao-suey','Burmese Khao Suey','Coconut broth, noodles and a tray of crunchy toppings.',479,'chinese',4.8,134,true,2,22,560,false,true,ARRAY['burmese','comfort']),
  ('pizzapasta','margherita','Wood-Fired Margherita','San Marzano sauce, fior di latte, basil.',399,'bread',4.5,289,true,1,16,680,true,false,ARRAY['pizza']),
  ('pizzapasta','tandoori-paneer-pizza','Tandoori Paneer Pizza','Tikka paneer, red onion, mint aioli swirl.',479,'bread',4.6,214,true,2,18,760,false,false,ARRAY['pizza','fusion']),
  ('pizzapasta','chicken-tikka-pizza','Chicken Tikka Pizza','Smoked chicken tikka, peppers, chipotle drizzle.',529,'bread',4.7,241,false,2,18,810,true,false,ARRAY['pizza','chicken']),
  ('pizzapasta','arrabbiata','Spaghetti Arrabbiata','Slow-cooked tomato, chilli flakes, olive oil.',349,'curry',4.3,118,true,3,16,540,false,false,ARRAY['pasta','spicy']),
  ('pizzapasta','lasagna-veg','Garden Lasagna','Layered pasta, ricotta, roasted vegetables, bechamel.',459,'curry',4.5,96,true,1,24,700,false,false,ARRAY['pasta','baked']),
  ('bowls','buddha-bowl','Mithaas Buddha Bowl','Quinoa, roasted veg, hummus, tahini-lime dressing.',389,'combo',4.5,131,true,1,14,430,false,false,ARRAY['healthy','bowl']),
  ('bowls','tandoori-chicken-salad','Tandoori Chicken Salad','Smoked chicken, greens, pomegranate, mint yoghurt.',429,'combo',4.6,109,false,2,14,360,false,false,ARRAY['healthy','protein']),
  ('bowls','rajma-rice-bowl','Rajma Rice Bowl','Slow-simmered kidney beans, jeera rice, pickled onion.',299,'curry',4.4,204,true,2,12,520,true,false,ARRAY['comfort','bowl']),
  ('bowls','khichdi-bowl','Ghee Khichdi Bowl','Moong dal khichdi, ghee, papad and kadhi shot.',279,'curry',4.3,88,true,1,16,410,false,false,ARRAY['comfort','light']),
  ('bowls','sprout-chaat-bowl','Sprout Chaat Bowl','Moth beans, tamarind, sev and citrus crunch.',229,'chaat',4.2,74,true,2,10,280,false,false,ARRAY['healthy','chaat']),
  ('bowls','biryani-bowl','Single-Serve Dum Biryani Bowl','Sealed handi biryani for one with raita and salan.',379,'biryani',4.8,356,true,3,25,620,true,false,ARRAY['biryani','bowl']),
  ('kebabs','fish-amritsari','Amritsari Fish Tikka','Gram-flour battered river sole, carom and chaat masala.',589,'starter',4.7,142,false,3,20,450,false,false,ARRAY['seafood','tandoor'])
) AS v(cat, slug, name, description, price, image_key, rating, review_count, is_veg, spice, prep, cal, best, chef, tags)
JOIN public.menu_categories c ON c.slug = v.cat
ON CONFLICT (slug) DO NOTHING;