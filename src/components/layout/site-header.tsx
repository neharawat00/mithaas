import { useEffect, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Gift,
  Menu as MenuIcon,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  User,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SearchDialog } from "@/components/food/search-dialog";
import { ItemDialog } from "@/components/food/item-dialog";
import { useCart } from "@/lib/cart";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/use-auth";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/menu", label: "Menu" },
  { to: "/meal-builder", label: "Meal Builder" },
  { to: "/reservations", label: "Reservations" },
  { to: "/offers", label: "Offers" },
  { to: "/story", label: "Our Story" },
] as const;

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [picked, setPicked] = useState<MenuItem | null>(null);
  const cart = useCart();
  const { mode, setMode } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-300",
          scrolled ? "glass shadow-[var(--shadow-lift)]" : "bg-transparent",
        )}
      >
        <div className="mx-auto grid max-w-[1600px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 sm:px-6 lg:grid-cols-[auto_minmax(0,1fr)_auto]">
          <Link to="/" className="flex min-w-0 items-center gap-2" aria-label="Mithaas home">
            <span className="gradient-warm grid h-9 w-9 shrink-0 place-items-center rounded-xl font-display text-lg text-primary-foreground">
              M
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-lg leading-none tracking-[0.18em]">
                MITHAAS
              </span>
              <span className="hidden text-[10px] uppercase tracking-[0.22em] text-muted-foreground sm:block">
                Authentic flavours
              </span>
            </span>
          </Link>

          <nav className="hidden items-center justify-center gap-1 lg:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{ className: "bg-secondary text-foreground" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                {n.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setSearchOpen(true)}
              aria-label="Search dishes"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden rounded-full sm:inline-flex"
              onClick={() => setMode(mode === "dark" ? "light" : "dark")}
              aria-label="Toggle colour theme"
            >
              {mode === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden rounded-full sm:inline-flex"
              onClick={() => navigate({ to: "/rewards" })}
              aria-label="Mithaas Rewards"
            >
              <Gift className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
              onClick={() => navigate({ to: "/cart" })}
              aria-label={`Cart with ${cart.count} items`}
            >
              <ShoppingBag className="h-5 w-5" />
              {cart.count > 0 && (
                <span className="gradient-warm absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[10px] font-bold text-primary-foreground">
                  {cart.count}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="hidden rounded-full sm:inline-flex"
              onClick={() => navigate({ to: user ? "/profile" : "/auth" })}
              aria-label={user ? "Your profile" : "Sign in"}
            >
              <User className="h-5 w-5" />
            </Button>
            <Button asChild className="ml-1 hidden rounded-full md:inline-flex">
              <Link to="/menu">Order Now</Link>
            </Button>

            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full lg:hidden" aria-label="Open menu">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(88vw,20rem)]">
                <div className="mt-8 flex flex-col gap-1">
                  {[
                    ...NAV,
                    { to: "/orders", label: "My Orders" },
                    { to: "/rewards", label: "Rewards" },
                    { to: "/reviews", label: "Reviews" },
                    { to: "/locations", label: "Locations" },
                    { to: "/catering", label: "Events & Catering" },
                    { to: "/profile", label: "Profile" },
                  ].map((n) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      onClick={() => setSheetOpen(false)}
                      className="rounded-xl px-3 py-3 text-base font-medium hover:bg-secondary"
                    >
                      {n.label}
                    </Link>
                  ))}
                  <Button
                    variant="outline"
                    className="mt-3 justify-start rounded-xl"
                    onClick={() => setMode(mode === "dark" ? "light" : "dark")}
                  >
                    {mode === "dark" ? (
                      <Sun className="mr-2 h-4 w-4" />
                    ) : (
                      <Moon className="mr-2 h-4 w-4" />
                    )}
                    {mode === "dark" ? "Light mode" : "Dark mode"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} onSelect={setPicked} />
      <ItemDialog item={picked} onClose={() => setPicked(null)} />
    </>
  );
}

export function CloseIcon() {
  return <X className="h-5 w-5" />;
}
