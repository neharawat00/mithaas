import { Link } from "@tanstack/react-router";
import { Home, Package, ShoppingBag, User, UtensilsCrossed } from "lucide-react";
import { useCart } from "@/lib/cart";

const TABS = [
  { to: "/", label: "Home", Icon: Home, exact: true },
  { to: "/menu", label: "Menu", Icon: UtensilsCrossed, exact: false },
  { to: "/cart", label: "Cart", Icon: ShoppingBag, exact: false },
  { to: "/orders", label: "Orders", Icon: Package, exact: false },
  { to: "/profile", label: "Profile", Icon: User, exact: false },
] as const;

export function MobileTabBar() {
  const cart = useCart();
  return (
    <nav
      aria-label="Primary"
      className="glass fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 gap-1 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 lg:hidden"
    >
      {TABS.map(({ to, label, Icon, exact }) => (
        <Link
          key={to}
          to={to}
          activeOptions={{ exact }}
          className="relative flex flex-col items-center gap-1 rounded-xl py-1 text-[11px] font-medium text-muted-foreground"
          activeProps={{ className: "text-primary" }}
        >
          <Icon className="h-5 w-5" aria-hidden />
          {label}
          {to === "/cart" && cart.count > 0 && (
            <span className="gradient-warm absolute right-2 top-0 grid h-4 min-w-4 place-items-center rounded-full px-1 text-[9px] font-bold text-primary-foreground">
              {cart.count}
            </span>
          )}
        </Link>
      ))}
    </nav>
  );
}
