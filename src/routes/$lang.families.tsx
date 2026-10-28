import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/families")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: `/${params.lang}`, hash: "families" });
  },
});
