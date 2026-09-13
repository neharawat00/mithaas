import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "./reservations";

export const Route = createFileRoute("/meal-builder")({
  head: () => ({
    meta: [
      { title: "Smart Meal Builder — Mithaas" },
      { name: "description", content: "Let Mithaas AI build a balanced meal for your budget, mood and group size." },
      { property: "og:title", content: "Smart Meal Builder — Mithaas" },
      { property: "og:description", content: "AI-built meals tuned to your budget and taste." },
    ],
  }),
  component: () => (
    <ComingSoon
      title="Smart meal builder"
      note="Meanwhile, tap the sparkle button to chat with Mithaas AI — it already recommends dishes from our live menu."
    />
  ),
});
