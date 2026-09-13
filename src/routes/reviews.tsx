import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "./reservations";

export const Route = createFileRoute("/reviews")({
  head: () => ({
    meta: [
      { title: "Reviews — Mithaas" },
      { name: "description", content: "What guests say about dining and ordering at Mithaas." },
      { property: "og:title", content: "Reviews — Mithaas" },
      { property: "og:description", content: "Guest reviews and dish ratings." },
    ],
  }),
  component: () => <ComingSoon title="Guest reviews" note="Verified reviews per dish arrive with the order flow." />,
});
