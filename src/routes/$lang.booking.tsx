import { createFileRoute, redirect } from "@tanstack/react-router";
import { BookingPage } from "@/routes/booking";
import { pageHead } from "@/lib/seo";
import type { Lang } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/booking")({
  beforeLoad: ({ params }) => {
    throw redirect({ to: `/${params.lang}`, hash: "booking" });
  },
  head: ({ params }) => pageHead("/booking", params.lang as Lang),
  component: BookingPage,
});
