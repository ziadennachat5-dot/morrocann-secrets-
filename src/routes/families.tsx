import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/families")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "families" });
  },
});
