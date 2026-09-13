import { Link } from "@tanstack/react-router";
import { Instagram, MapPin, Phone } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-border bg-surface pb-24 pt-14 lg:pb-14">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <span className="font-display text-xl tracking-[0.2em]">MITHAAS</span>
          <p className="text-sm text-muted-foreground">
            Where Every Bite Feels Like Home. Authentic flavours, handcrafted with passion and
            served with a modern touch.
          </p>
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="h-4 w-4" aria-hidden /> +91 98100 00000
          </p>
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" aria-hidden /> Sector 29, Gurugram
          </p>
        </div>

        <nav className="space-y-2" aria-label="Explore">
          <h2 className="font-display text-base">Explore</h2>
          {[
            { to: "/menu", label: "Digital Menu" },
            { to: "/meal-builder", label: "Smart Meal Builder" },
            { to: "/offers", label: "Offers & Coupons" },
            { to: "/rewards", label: "Mithaas Rewards" },
          ].map((l) => (
            <Link key={l.to} to={l.to} className="block text-sm text-muted-foreground hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>

        <nav className="space-y-2" aria-label="Visit">
          <h2 className="font-display text-base">Visit</h2>
          {[
            { to: "/reservations", label: "Reserve a Table" },
            { to: "/locations", label: "Our Locations" },
            { to: "/catering", label: "Events & Catering" },
            { to: "/reviews", label: "Reviews" },
          ].map((l) => (
            <Link key={l.to} to={l.to} className="block text-sm text-muted-foreground hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="space-y-3">
          <h2 className="font-display text-base">Hours</h2>
          <p className="text-sm text-muted-foreground">Mon – Thu · 11:00 – 23:00</p>
          <p className="text-sm text-muted-foreground">Fri – Sun · 10:00 – 00:00</p>
          <p className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Instagram className="h-4 w-4" aria-hidden /> @mithaas
          </p>
        </div>
      </div>
      <p className="mx-auto mt-10 max-w-[1400px] px-4 text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Mithaas Hospitality. Demo experience — payments, delivery
        tracking and locations are simulated for demonstration.
      </p>
    </footer>
  );
}
