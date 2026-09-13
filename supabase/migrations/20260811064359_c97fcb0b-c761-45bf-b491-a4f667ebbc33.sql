-- ROLES
CREATE TYPE public.app_role AS ENUM ('customer','staff','admin');

CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  points integer NOT NULL DEFAULT 0,
  tier text NOT NULL DEFAULT 'Sweet Starter',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own roles read" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- MENU
CREATE TABLE public.menu_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  emoji text,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.menu_categories TO anon, authenticated;
GRANT ALL ON public.menu_categories TO service_role;
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.menu_categories FOR SELECT USING (true);
CREATE POLICY "categories admin write" ON public.menu_categories FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TABLE public.menu_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid NOT NULL REFERENCES public.menu_categories(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  price numeric(10,2) NOT NULL,
  image_key text NOT NULL DEFAULT 'default',
  rating numeric(2,1) NOT NULL DEFAULT 4.5,
  review_count integer NOT NULL DEFAULT 0,
  is_veg boolean NOT NULL DEFAULT true,
  spice_level integer NOT NULL DEFAULT 1,
  prep_minutes integer NOT NULL DEFAULT 15,
  calories integer,
  is_bestseller boolean NOT NULL DEFAULT false,
  is_chef_special boolean NOT NULL DEFAULT false,
  is_available boolean NOT NULL DEFAULT true,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX menu_items_category_idx ON public.menu_items(category_id);
CREATE INDEX menu_items_name_idx ON public.menu_items(lower(name));
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT ALL ON public.menu_items TO service_role;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "items public read" ON public.menu_items FOR SELECT USING (true);
CREATE POLICY "items admin write" ON public.menu_items FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER menu_items_touch BEFORE UPDATE ON public.menu_items FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- COUPONS
CREATE TABLE public.coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  discount_type text NOT NULL DEFAULT 'percent',
  discount_value numeric(10,2) NOT NULL,
  min_order numeric(10,2) NOT NULL DEFAULT 0,
  max_discount numeric(10,2),
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons public read" ON public.coupons FOR SELECT USING (is_active);
CREATE POLICY "coupons admin write" ON public.coupons FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ORDERS
CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_type text NOT NULL DEFAULT 'delivery',
  status text NOT NULL DEFAULT 'received',
  customer_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text,
  table_label text,
  notes text,
  coupon_code text,
  subtotal numeric(10,2) NOT NULL DEFAULT 0,
  discount numeric(10,2) NOT NULL DEFAULT 0,
  tax numeric(10,2) NOT NULL DEFAULT 0,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  total numeric(10,2) NOT NULL DEFAULT 0,
  payment_method text NOT NULL DEFAULT 'upi',
  payment_status text NOT NULL DEFAULT 'paid_demo',
  eta_minutes integer NOT NULL DEFAULT 35,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX orders_user_idx ON public.orders(user_id);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders own read" ON public.orders FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders own insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "orders update" ON public.orders FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'));
CREATE TRIGGER orders_touch BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.menu_items(id) ON DELETE SET NULL,
  name text NOT NULL,
  unit_price numeric(10,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  customizations jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX order_items_order_idx ON public.order_items(order_id);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order items read" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id
    AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "order items insert" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- RESERVATIONS
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code text NOT NULL DEFAULT upper(substr(md5(random()::text),1,6)),
  guest_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  reserved_date date NOT NULL,
  reserved_time text NOT NULL,
  guests integer NOT NULL DEFAULT 2,
  seating text NOT NULL DEFAULT 'indoor',
  occasion text,
  notes text,
  status text NOT NULL DEFAULT 'confirmed',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reservations_user_idx ON public.reservations(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "res read" ON public.reservations FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "res insert" ON public.reservations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "res update" ON public.reservations FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = user_id OR public.has_role(auth.uid(),'staff') OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "res delete" ON public.reservations FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER reservations_touch BEFORE UPDATE ON public.reservations FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- REVIEWS
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid REFERENCES public.menu_items(id) ON DELETE CASCADE,
  author_name text NOT NULL DEFAULT 'Guest',
  rating integer NOT NULL DEFAULT 5,
  comment text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX reviews_item_idx ON public.reviews(item_id);
GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "reviews own insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews own update" ON public.reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "reviews own delete" ON public.reviews FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- FAVORITES
CREATE TABLE public.favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES public.menu_items(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;
GRANT ALL ON public.favorites TO service_role;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "fav own" ON public.favorites FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- SEED CATEGORIES
INSERT INTO public.menu_categories (slug, name, emoji, sort_order) VALUES
 ('starters','Starters','🔥',1),
 ('chaat','Chaat','🌶️',2),
 ('north-indian','North Indian','🍛',3),
 ('south-indian','South Indian','🥞',4),
 ('biryani-rice','Biryani & Rice','🍚',5),
 ('breads','Breads','🫓',6),
 ('chinese','Chinese','🥢',7),
 ('desserts','Desserts','🍮',8),
 ('mithai','Mithai','🍬',9),
 ('beverages','Beverages','🥤',10),
 ('combos','Combos','🍱',11),
 ('kids','Kids Menu','🧸',12);

-- SEED ITEMS
INSERT INTO public.menu_items (category_id, slug, name, description, price, image_key, rating, review_count, is_veg, spice_level, prep_minutes, calories, is_bestseller, is_chef_special, tags)
SELECT c.id, v.slug, v.name, v.description, v.price, v.image_key, v.rating, v.review_count, v.is_veg, v.spice, v.prep, v.cal, v.best, v.chef, v.tags
FROM (VALUES
 ('starters','paneer-tikka','Paneer Tikka','Char-grilled cottage cheese marinated in yoghurt and aromatic spices.',299,'starter',4.8,412,true,2,18,320,true,true,ARRAY['paneer','grilled','tandoori','vegetarian']),
 ('starters','hara-bhara-kebab','Hara Bhara Kebab','Spinach, green peas and paneer patties, pan-seared till golden.',249,'starter',4.6,188,true,1,16,260,false,false,ARRAY['healthy','spinach','vegetarian']),
 ('starters','veg-seekh-kebab','Veg Seekh Kebab','Smoky minced vegetable skewers finished over charcoal.',269,'starter',4.5,142,true,2,20,290,false,false,ARRAY['grilled','smoky']),
 ('starters','dahi-ke-kebab','Dahi Ke Kebab','Melt-in-mouth hung curd kebabs with cardamom and cashew.',279,'starter',4.7,166,true,1,18,310,false,true,ARRAY['creamy','mild']),
 ('starters','tandoori-mushroom','Tandoori Mushroom','Button mushrooms in a bell pepper and mint marinade.',259,'starter',4.4,96,true,2,17,180,false,false,ARRAY['mushroom','grilled']),
 ('chaat','dahi-puri','Dahi Puri','Crisp puris filled with sweet yoghurt, tamarind and pomegranate.',149,'chaat',4.7,244,true,1,8,220,true,false,ARRAY['street food','sweet','tangy']),
 ('chaat','samosa-chaat','Samosa Chaat','Crushed samosas layered with chole, chutneys and sev.',169,'chaat',4.6,198,true,2,10,380,false,false,ARRAY['street food','spicy']),
 ('chaat','aloo-tikki','Aloo Tikki Chaat','Golden potato tikkis with yoghurt and mint chutney.',159,'chaat',4.5,151,true,2,12,340,false,false,ARRAY['street food']),
 ('chaat','pani-puri','Pani Puri','Six puris with spiced mint water and tangy tamarind.',129,'chaat',4.8,301,true,3,7,180,true,false,ARRAY['spicy','street food']),
 ('north-indian','paneer-butter-masala','Paneer Butter Masala','Cottage cheese in a silky tomato-cashew gravy with a hint of honey.',349,'curry',4.9,624,true,1,22,520,true,true,ARRAY['paneer','creamy','mild','bestseller']),
 ('north-indian','dal-makhani','Dal Makhani','Black lentils simmered overnight with butter and cream.',299,'curry',4.8,517,true,1,25,430,true,false,ARRAY['dal','creamy','slow cooked']),
 ('north-indian','shahi-paneer','Shahi Paneer','Royal Mughlai gravy of cashew, saffron and cardamom.',359,'curry',4.7,288,true,1,22,540,false,true,ARRAY['paneer','rich']),
 ('north-indian','kadhai-paneer','Kadhai Paneer','Paneer tossed with peppers and freshly pounded kadhai masala.',339,'curry',4.6,241,true,3,20,470,false,false,ARRAY['paneer','spicy']),
 ('north-indian','chole-bhature','Chole Bhature','Punjabi spiced chickpeas with two fluffy bhature.',269,'curry',4.7,389,true,2,20,690,true,false,ARRAY['punjabi','filling']),
 ('north-indian','malai-kofta','Malai Kofta','Paneer dumplings in a delicate white gravy.',369,'curry',4.6,134,true,1,24,560,false,false,ARRAY['creamy','mild']),
 ('north-indian','bhindi-masala','Bhindi Do Pyaza','Crisp okra with onions and roasted spices.',259,'curry',4.4,112,true,2,18,240,false,false,ARRAY['dry','homestyle']),
 ('south-indian','masala-dosa','Masala Dosa','Crisp rice crepe with spiced potato, sambar and chutneys.',219,'south',4.8,468,true,1,15,410,true,false,ARRAY['dosa','breakfast']),
 ('south-indian','idli-sambar','Idli Sambar','Steamed rice cakes with lentil sambar and coconut chutney.',159,'south',4.6,254,true,1,12,280,false,false,ARRAY['healthy','steamed']),
 ('south-indian','medu-vada','Medu Vada','Crisp lentil doughnuts served hot with chutney.',149,'south',4.5,163,true,2,14,300,false,false,ARRAY['fried']),
 ('south-indian','uttapam','Onion Uttapam','Thick savoury pancake with onion, chilli and coriander.',199,'south',4.5,127,true,2,16,350,false,false,ARRAY['breakfast']),
 ('biryani-rice','veg-biryani','Veg Dum Biryani','Long-grain basmati layered with vegetables and sealed with dough.',329,'biryani',4.8,502,true,2,28,610,true,true,ARRAY['biryani','dum','aromatic']),
 ('biryani-rice','biryani-special','Mithaas Special Biryani','Our signature biryani with paneer, nuts, saffron and boiled egg option.',399,'biryani',4.9,318,true,3,30,720,true,true,ARRAY['biryani','signature','spicy']),
 ('biryani-rice','jeera-rice','Jeera Rice','Basmati tempered with cumin and ghee.',179,'biryani',4.5,142,true,1,14,320,false,false,ARRAY['light']),
 ('biryani-rice','curd-rice','Curd Rice','Comforting South Indian curd rice with tempering.',169,'biryani',4.4,88,true,1,12,290,false,false,ARRAY['cooling','mild']),
 ('breads','butter-naan','Butter Naan','Tandoor-baked naan brushed with white butter.',69,'bread',4.8,712,true,1,8,220,true,false,ARRAY['naan']),
 ('breads','garlic-naan','Garlic Naan','Naan studded with garlic and coriander.',89,'bread',4.8,556,true,1,8,240,true,false,ARRAY['naan','garlic']),
 ('breads','tandoori-roti','Tandoori Roti','Whole-wheat roti straight off the clay oven.',49,'bread',4.5,301,true,1,7,160,false,false,ARRAY['healthy']),
 ('breads','lachha-paratha','Lachha Paratha','Flaky layered paratha with ghee.',79,'bread',4.7,268,true,1,10,280,false,false,ARRAY['flaky']),
 ('chinese','veg-manchurian','Veg Manchurian','Vegetable dumplings in a glossy garlic-chilli sauce.',279,'chinese',4.5,204,true,3,18,400,false,false,ARRAY['spicy','indo-chinese']),
 ('chinese','hakka-noodles','Hakka Noodles','Wok-tossed noodles with julienned vegetables.',249,'chinese',4.6,266,true,2,16,470,true,false,ARRAY['noodles','indo-chinese']),
 ('chinese','chilli-paneer','Chilli Paneer','Paneer tossed with peppers in a hot garlic sauce.',299,'chinese',4.6,192,true,4,17,430,false,false,ARRAY['spicy','paneer']),
 ('chinese','fried-rice','Schezwan Fried Rice','Fiery schezwan fried rice with crunchy vegetables.',239,'chinese',4.4,158,true,4,15,450,false,false,ARRAY['spicy','rice']),
 ('desserts','gulab-jamun','Gulab Jamun','Two warm khoya dumplings soaked in rose cardamom syrup.',129,'dessert',4.9,688,true,1,6,320,true,true,ARRAY['sweet','warm','dessert']),
 ('desserts','rasmalai','Rasmalai','Soft chenna discs in saffron-pistachio milk.',149,'dessert',4.8,472,true,1,6,290,true,false,ARRAY['sweet','chilled','dessert']),
 ('desserts','gajar-ka-halwa','Gajar Ka Halwa','Slow-cooked carrot halwa with ghee and almonds.',159,'dessert',4.7,233,true,1,8,380,false,false,ARRAY['sweet','warm','winter']),
 ('desserts','kulfi','Malai Kulfi','Dense hand-churned kulfi with pistachio.',119,'dessert',4.6,197,true,1,4,260,false,false,ARRAY['sweet','chilled']),
 ('desserts','jalebi-rabri','Jalebi with Rabri','Crisp jalebi paired with thickened saffron rabri.',179,'dessert',4.8,214,true,1,8,450,false,true,ARRAY['sweet','festive']),
 ('mithai','kaju-katli','Kaju Katli (250g)','Diamond-cut cashew fudge with edible silver.',449,'mithai',4.9,356,true,1,5,600,true,false,ARRAY['mithai','gifting']),
 ('mithai','motichoor-ladoo','Motichoor Ladoo (250g)','Fine boondi ladoos with cardamom and melon seeds.',329,'mithai',4.7,188,true,1,5,580,false,false,ARRAY['mithai','festive']),
 ('mithai','soan-papdi','Soan Papdi (250g)','Feather-light flaky sweet with pistachio.',249,'mithai',4.5,121,true,1,5,520,false,false,ARRAY['mithai']),
 ('mithai','besan-barfi','Besan Barfi (250g)','Roasted gram flour barfi rich with ghee.',369,'mithai',4.6,104,true,1,5,610,false,true,ARRAY['mithai']),
 ('beverages','lassi','Sweet Lassi','Thick chilled yoghurt drink with a saffron swirl.',119,'beverage',4.7,342,true,1,5,240,true,false,ARRAY['cooling','drink']),
 ('beverages','masala-chai','Masala Chai','Slow-brewed chai with ginger, cardamom and clove.',79,'beverage',4.8,521,true,2,7,110,true,false,ARRAY['hot','drink']),
 ('beverages','cold-coffee','Cold Coffee','Frothy cold coffee with a scoop of vanilla.',159,'beverage',4.6,231,true,1,6,280,false,false,ARRAY['cold','drink']),
 ('beverages','fresh-lime','Fresh Lime Soda','Sweet or salted, freshly squeezed lime with soda.',89,'beverage',4.5,178,true,1,4,90,false,false,ARRAY['refreshing','drink']),
 ('beverages','jaljeera','Jaljeera Cooler','Tangy cumin cooler with mint and black salt.',99,'beverage',4.4,96,true,2,5,70,false,false,ARRAY['tangy','drink']),
 ('combos','thali-royal','Mithaas Royal Thali','Paneer butter masala, dal makhani, biryani, two breads, salad, gulab jamun.',649,'combo',4.9,412,true,2,25,1180,true,true,ARRAY['thali','family','value']),
 ('combos','combo-duo','Date Night Duo','Two starters, two mains, breads, one dessert to share.',999,'combo',4.8,168,true,2,30,1600,true,false,ARRAY['couple','value']),
 ('combos','family-feast','Family Feast (4)','A complete four-person spread of starters, mains, rice and sweets.',1899,'combo',4.8,131,true,2,35,3200,false,true,ARRAY['family','value']),
 ('combos','student-combo','Student Saver Combo','Chole bhature with lassi at a friendly price.',299,'combo',4.6,209,true,2,18,880,false,false,ARRAY['student','value']),
 ('kids','mini-paneer-wrap','Mini Paneer Wrap','Soft wrap with mild paneer filling, no chilli.',179,'kids',4.6,88,true,0,12,340,false,false,ARRAY['kids','mild']),
 ('kids','cheese-toast','Cheese Grill Toast','Buttery grilled toast oozing with cheese.',149,'kids',4.5,74,true,0,10,320,false,false,ARRAY['kids','mild']),
 ('kids','choco-shake','Choco Shake','Thick chocolate milkshake with sprinkles.',159,'kids',4.7,102,true,0,6,380,false,false,ARRAY['kids','sweet'])
) AS v(cat, slug, name, description, price, image_key, rating, review_count, is_veg, spice, prep, cal, best, chef, tags)
JOIN public.menu_categories c ON c.slug = v.cat;

-- SEED COUPONS
INSERT INTO public.coupons (code, title, description, discount_type, discount_value, min_order, max_discount, expires_at) VALUES
 ('MITHAAS10','10% off your order','Flat 10% off on all orders above ₹499.','percent',10,499,150, now() + interval '90 days'),
 ('FIRSTBITE','₹150 off first order','New to Mithaas? Enjoy ₹150 off your first order above ₹599.','flat',150,599,NULL, now() + interval '180 days'),
 ('WEEKEND20','20% weekend special','20% off on weekend dine-in and delivery orders above ₹999.','percent',20,999,400, now() + interval '60 days'),
 ('STUDENT15','15% student offer','15% off for students on orders above ₹299.','percent',15,299,120, now() + interval '120 days'),
 ('FAMILY300','₹300 off family feasts','₹300 off on orders above ₹1799. Perfect for the whole family.','flat',300,1799,NULL, now() + interval '90 days'),
 ('MITHAI50','₹50 off sweets','₹50 off on any mithai box above ₹299.','flat',50,299,NULL, now() + interval '45 days');