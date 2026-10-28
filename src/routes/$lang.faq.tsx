import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang/faq")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: `/${params.lang}`, hash: "faq" });
  },
});
