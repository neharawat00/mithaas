import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/locations")({
  head: () => ({
    meta: [
      { title: "Locations — Mithaas" },
      { name: "description", content: "Find Mithaas outlets, hours and contact details." },
      { property: "og:title", content: "Locations — Mithaas" },
      { property: "og:description", content: "Visit a Mithaas dining house near you." },
    ],
  }),
  component: Locations,
});

const OUTLETS = [
  { name: "Sector 29, Gurugram", hours: "11:00 – 23:00", phone: "+91 98100 00000" },
  { name: "Hauz Khas, New Delhi", hours: "12:00 – 00:00", phone: "+91 98100 00001" },
  { name: "Koregaon Park, Pune", hours: "11:30 – 23:30", phone: "+91 98100 00002" },
];

function Locations() {
  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-28 pt-12 sm:px-6 lg:pb-16">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Visit us</span>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">Our locations</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {OUTLETS.map((o) => (
          <div key={o.name} className="surface-card p-5">
            <p className="font-display text-lg">{o.name}</p>
            <p className="mt-2 text-sm text-muted-foreground">Open daily · {o.hours}</p>
            <p className="text-sm text-muted-foreground">{o.phone}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
