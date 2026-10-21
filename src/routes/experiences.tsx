import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/experiences")({
  beforeLoad: () => {
    throw redirect({ to: "/", hash: "experiences" });
  },
});
