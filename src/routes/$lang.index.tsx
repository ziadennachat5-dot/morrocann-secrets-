import { createFileRoute } from "@tanstack/react-router";
import { HomePage, loadHomePageData } from "@/routes/index";
import { pageHead } from "@/lib/seo";
import type { Lang } from "@/lib/i18n";

export const Route = createFileRoute("/$lang/")({
  loader: loadHomePageData,
  head: ({ loaderData, params }) =>
    pageHead("/", params.lang as Lang, undefined, undefined, {
      experiences: loaderData?.experiences,
      faqs: loaderData?.faqs,
    }),
  component: function LocalizedHome() {
    const data = Route.useLoaderData();
    return <HomePage data={data} />;
  },
});
