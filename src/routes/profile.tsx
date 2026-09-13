import { createFileRoute } from "@tanstack/react-router";
import { ComingSoon } from "./reservations";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — Mithaas" },
      { name: "description", content: "Manage your Mithaas profile, addresses and preferences." },
      { property: "og:title", content: "Your Profile — Mithaas" },
      { property: "og:description", content: "Your Mithaas account and saved preferences." },
    ],
  }),
  component: () => <ComingSoon title="Your profile" note="Accounts, addresses and favourites come with the auth step." />,
});
