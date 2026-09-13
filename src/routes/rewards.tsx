import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "./reservations";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "Mithaas Rewards — Mithaas" },
      { name: "description", content: "Earn Mithaas points on every order and unlock tiers and treats." },
      { property: "og:title", content: "Mithaas Rewards" },
      { property: "og:description", content: "Loyalty points, tiers and rewards for regulars." },
    ],
  }),
  component: () => <ComingSoon title="Mithaas Rewards" note="Points, tiers and redemption arrive with the ordering flow." />,
});
