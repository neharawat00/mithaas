import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "./reservations";

export const Route = createFileRoute("/catering")({
  head: () => ({
    meta: [
      { title: "Events & Catering — Mithaas" },
      { name: "description", content: "Weddings, corporate dinners and private celebrations catered by Mithaas." },
      { property: "og:title", content: "Events & Catering — Mithaas" },
      { property: "og:description", content: "Let Mithaas cater your next celebration." },
    ],
  }),
  component: () => <ComingSoon title="Events & catering" note="Enquiry forms and package builders are part of the next phase." />,
});
