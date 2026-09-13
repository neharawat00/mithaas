import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/story")({
  head: () => ({
    meta: [
      { title: "Our Story — Mithaas" },
      { name: "description", content: "From a single family kitchen in 1998 to a modern Indian dining house." },
      { property: "og:title", content: "Our Story — Mithaas" },
      { property: "og:description", content: "The people, spices and craft behind Mithaas." },
    ],
  }),
  component: Story,
});

function Story() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-28 pt-12 sm:px-6 lg:pb-16">
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Since 1998</span>
      <h1 className="mt-2 font-display text-3xl sm:text-4xl">Our story</h1>
      <div className="mt-6 space-y-5 text-muted-foreground">
        <p>
          Mithaas began in a small family kitchen where recipes were measured in memory, not
          spoons. Three generations later, the same masalas are still ground in-house every
          morning.
        </p>
        <p>
          Our chefs travel each year through Lucknow, Amritsar, Hyderabad and Chettinad to bring
          back techniques rather than trends — slow-cooked handis, clay-oven breads and mithai set
          in copper.
        </p>
        <p>
          The result is a menu that feels familiar and surprising at once: honest Indian food,
          plated with care, served with warmth.
        </p>
      </div>
    </div>
  );
}
