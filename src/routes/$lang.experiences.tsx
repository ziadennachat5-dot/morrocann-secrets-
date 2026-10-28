import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/experiences")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: `/${params.lang}`, hash: "experience" });
  },
});
