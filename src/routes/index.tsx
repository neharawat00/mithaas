import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight, Bike, CalendarDays, Clock, MapPin, ShoppingBag, Sparkles, Users, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { FoodCard } from "@/components/food/food-card";
import { ItemDialog } from "@/components/food/item-dialog";
import { categoriesQuery, couponsQuery, menuItemsQuery } from "@/lib/menu-queries";
import { heroImage } from "@/lib/images";
import { inr } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useAuth, displayName } from "@/lib/use-auth";
import type { MenuItem, OrderType } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mithaas — A Taste Worth Coming Back For" },
      {
        name: "description",
        content:
          "Order authentic Indian food online, reserve a table or build a smart meal with Mithaas AI. Handcrafted flavours, modern experience.",
      },
      { property: "og:title", content: "Mithaas — A Taste Worth Coming Back For" },
      {
        property: "og:description",
        content: "Premium Indian dining, online ordering, reservations and an AI food concierge.",
      },
    ],
  }),
  component: Home,
});

const MODES: { id: OrderType; label: string; Icon: typeof Utensils }[] = [
  { id: "dinein", label: "Dine In", Icon: Utensils },
  { id: "takeaway", label: "Takeaway", Icon: ShoppingBag },
  { id: "delivery", label: "Delivery", Icon: Bike },
];

function Home() {
  const cart = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [picked, setPicked] = useState<MenuItem | null>(null);
  const { data: items, isLoading } = useQuery(menuItemsQuery);
  const { data: categories } = useQuery(categoriesQuery);
  const { data: coupons } = useQuery(couponsQuery);
  const [guests, setGuests] = useState("2");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState("20:00");
  const [address, setAddress] = useState("");

  const bestsellers = (items ?? []).filter((i) => i.is_bestseller).slice(0, 8);
  const chefSpecials = (items ?? []).filter((i) => i.is_chef_special).slice(0, 4);

  return (
    <div className="pb-24 lg:pb-0">
      {/* HERO */}
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="A brass thali of Mithaas signature dishes"
          width={1920}
          height={1200}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/85 via-ink/70 to-background" />
        <div className="relative mx-auto max-w-[1400px] px-4 py-20 sm:px-6 sm:py-28 lg:py-36">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-brass/40 bg-ink/40 px-3 py-1 text-xs font-medium uppercase tracking-[0.2em] text-brass">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Since 1998
            </span>
            <h1 className="mt-5 font-display text-4xl leading-[1.05] text-surface-foreground sm:text-6xl lg:text-7xl">
              A Taste Worth <span className="text-gradient-warm">Coming Back</span> For.
            </h1>
            <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
              Discover authentic flavours, handcrafted with passion and served with a modern touch.
            </p>
            {user && (
              <p className="mt-4 font-display text-lg">Welcome back, {displayName(user)} 👋</p>
            )}
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-full">
                <Link to="/menu">Order Now</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-full">
                <Link to="/reservations">Reserve a Table</Link>
              </Button>
              <Button asChild size="lg" variant="ghost" className="rounded-full">
                <Link to="/menu">
                  Explore Menu <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* SMART WIDGET */}
      <section className="mx-auto -mt-10 max-w-[1400px] px-4 sm:px-6" aria-label="Quick booking and ordering">
        <div className="glass rounded-3xl p-4 shadow-[var(--shadow-lift)] sm:p-6">
          <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
            {MODES.map(({ id, label, Icon }) => (
              <Button
                key={id}
                variant={cart.orderType === id ? "default" : "outline"}
                className="shrink-0 rounded-full"
                onClick={() => cart.setOrderType(id)}
              >
                <Icon className="mr-2 h-4 w-4" aria-hidden />
                {label}
              </Button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cart.orderType === "delivery" ? (
              <>
                <label className="grid gap-1.5 lg:col-span-2">
                  <span className="text-xs font-medium text-muted-foreground">Delivery address</span>
                  <Input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Flat, street, landmark"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="text-xs font-medium text-muted-foreground">Delivery time</span>
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </label>
              </>
            ) : (
              <>
                <label className="grid gap-1.5">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <MapPin className="h-3 w-3" aria-hidden /> Location
                  </span>
                  <Input defaultValue="Gurugram · Sector 29" readOnly />
                </label>
                <label className="grid gap-1.5">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <CalendarDays className="h-3 w-3" aria-hidden /> Date
                  </span>
                  <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                </label>
                <label className="grid gap-1.5">
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Clock className="h-3 w-3" aria-hidden /> Time
                  </span>
                  <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                </label>
              </>
            )}
            <label className="grid gap-1.5">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Users className="h-3 w-3" aria-hidden /> Guests
              </span>
              <Input
                type="number"
                min={1}
                max={20}
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </label>
          </div>

          <Button
            className="mt-4 w-full rounded-full sm:w-auto"
            onClick={() =>
              cart.orderType === "dinein"
                ? navigate({
                    to: "/reservations",
                    search: { date, time, guests: Number(guests) || 2 },
                  })
                : navigate({ to: "/menu" })
            }
          >
            {cart.orderType === "dinein" ? "Find a table" : "Start ordering"}
          </Button>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto mt-16 max-w-[1400px] px-4 sm:px-6">
        <SectionHead
          eyebrow="Explore"
          title="Browse by craving"
          action={{ to: "/menu", label: "Full menu" }}
        />
        <div className="hide-scrollbar mt-6 flex gap-3 overflow-x-auto pb-2">
          {(categories ?? []).map((c) => (
            <Link
              key={c.id}
              to="/menu"
              search={{ category: c.slug }}
              className="surface-card flex shrink-0 items-center gap-2 px-4 py-3 transition-colors hover:border-primary"
            >
              <span aria-hidden className="text-xl">
                {c.emoji}
              </span>
              <span className="text-sm font-medium">{c.name}</span>
            </Link>
          ))}
          {!categories && <Skeleton className="h-14 w-full rounded-2xl" />}
        </div>
      </section>

      {/* BESTSELLERS */}
      <section className="mx-auto mt-16 max-w-[1400px] px-4 sm:px-6">
        <SectionHead eyebrow="Loved by guests" title="Bestsellers this week" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading &&
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[22rem] rounded-3xl" />
            ))}
          {bestsellers.map((item) => (
            <FoodCard key={item.id} item={item} onOpen={setPicked} />
          ))}
        </div>
      </section>

      {/* CHEF SPECIALS */}
      <section className="mx-auto mt-16 max-w-[1400px] px-4 sm:px-6">
        <SectionHead eyebrow="From our kitchen" title="Chef's specials" />
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {chefSpecials.map((item) => (
            <FoodCard key={item.id} item={item} onOpen={setPicked} />
          ))}
        </div>
      </section>

      {/* OFFERS */}
      <section className="mx-auto mt-16 max-w-[1400px] px-4 sm:px-6">
        <SectionHead eyebrow="Save more" title="Today's offers" action={{ to: "/offers", label: "All offers" }} />
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(coupons ?? []).slice(0, 3).map((c) => (
            <div key={c.id} className="surface-card p-5">
              <p className="font-display text-xl">{c.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{c.description}</p>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="gradient-warm rounded-full px-3 py-1 text-sm font-bold text-primary-foreground">
                  {c.code}
                </span>
                <span className="text-xs text-muted-foreground">Min {inr(Number(c.min_order))}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI CTA */}
      <section className="mx-auto mt-16 max-w-[1400px] px-4 sm:px-6">
        <div className="surface-card grid gap-6 overflow-hidden p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div className="min-w-0">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Mithaas AI
            </span>
            <h2 className="mt-3 font-display text-3xl sm:text-4xl">
              Not sure what to order? Just ask.
            </h2>
            <p className="mt-3 max-w-xl text-muted-foreground">
              “I want something spicy under ₹400”, “What should I order for 4 people?”, “Suggest a
              dessert after paneer tikka” — our AI concierge builds the order for you.
            </p>
          </div>
          <Button asChild size="lg" className="rounded-full">
            <Link to="/meal-builder">
              <Sparkles className="mr-2 h-4 w-4" aria-hidden /> Build my meal
            </Link>
          </Button>
        </div>
      </section>

      <ItemDialog item={picked} onClose={() => setPicked(null)} />
    </div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: { to: string; label: string };
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
      <div className="min-w-0">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          {eyebrow}
        </span>
        <h2 className="mt-2 font-display text-2xl sm:text-3xl">{title}</h2>
      </div>
      {action && (
        <Link
          to={action.to}
          className="shrink-0 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {action.label} →
        </Link>
      )}
    </div>
  );
}
