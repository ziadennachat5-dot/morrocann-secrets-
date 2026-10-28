import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

import { getLocalizedPath } from "./lib/seo";
import type { Lang } from "./lib/i18n";

const redirectOldLangMiddleware = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url);
  const langParam = url.searchParams.get("lang");
  if (langParam && (langParam === "en" || langParam === "fr" || langParam === "ar")) {
    url.searchParams.delete("lang");
    const targetPath = getLocalizedPath(url.pathname, langParam as Lang);
    url.pathname = targetPath;
    return new Response(null, {
      status: 301,
      headers: {
        Location: url.toString(),
      },
    });
  }
  return next();
});

// Start installs this automatically when src/start.ts is absent; defining the
// file opts out, so re-add it explicitly to keep server functions protected
// from cross-site requests.
const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

export const startInstance = createStart(() => ({
  functionMiddleware: [attachSupabaseAuth],
  requestMiddleware: [redirectOldLangMiddleware, errorMiddleware, csrfMiddleware],
}));
