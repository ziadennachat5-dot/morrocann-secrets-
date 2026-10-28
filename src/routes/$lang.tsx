import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/$lang")({
  beforeLoad: ({ params }) => {
    if (params.lang !== "fr" && params.lang !== "ar") {
      throw notFound();
    }
  },
  component: Outlet,
});
