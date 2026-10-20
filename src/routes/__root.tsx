import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import cormorantGaramond600 from "@fontsource/cormorant-garamond/files/cormorant-garamond-latin-600-normal.woff2?url";
import figtree400 from "@fontsource/figtree/files/figtree-latin-400-normal.woff2?url";
import figtree600 from "@fontsource/figtree/files/figtree-latin-600-normal.woff2?url";
import appCss from "../styles.css?url";
import { BRAND_NAME, TAGLINE, BRAND_DESCRIPTION } from "@/lib/brand";
import { I18nProvider } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n";
import { SiteLayout } from "@/components/site/Layout";

function NotFoundComponent() {
  return <NotFoundContent />;
}

function NotFoundContent() {
  const { t } = useI18n();
  return (
    <section className="zellige-bg flex min-h-[60vh] items-center justify-center bg-sand px-4 py-16">
      <div className="max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="eyebrow">{BRAND_NAME}</p>
        <h1 className="mt-3 font-display text-7xl text-primary">404</h1>
        <h2 className="mt-4 text-3xl">{t.errorPages.notFoundTitle}</h2>
        <p className="mt-3 text-muted-foreground">{t.errorPages.notFoundBody}</p>
        <Link to="/" className="btn btn-primary mt-6">
          {t.errorPages.home}
        </Link>
      </div>
    </section>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  return (
    <I18nProvider>
      <ErrorContent reset={reset} />
    </I18nProvider>
  );
}

function ErrorContent({ reset }: Pick<ErrorComponentProps, "reset">) {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <section className="zellige-bg flex min-h-[70vh] items-center justify-center bg-sand px-4 py-16">
      <div className="max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <p className="eyebrow">{BRAND_NAME}</p>
        <h1 className="mt-4 text-3xl text-foreground">{t.errorPages.errorTitle}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t.errorPages.errorBody}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn btn-primary"
          >
            {t.errorPages.retry}
          </button>
          <a href="/" className="btn btn-ghost">
            {t.errorPages.home}
          </a>
        </div>
      </div>
    </section>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: `${BRAND_NAME} — ${TAGLINE}` },
      { name: "description", content: BRAND_DESCRIPTION },
      { property: "og:site_name", content: BRAND_NAME },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@moroccansecrets" },
      { name: "theme-color", content: "#8B1A1A" },
    ],
    links: [
      {
        rel: "preload",
        href: cormorantGaramond600,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: figtree400,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: figtree600,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" dir="ltr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <SiteLayout>
          <Outlet />
        </SiteLayout>
      </I18nProvider>
    </QueryClientProvider>
  );
}
