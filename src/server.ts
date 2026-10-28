import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";
import { withSecurityHeaders } from "./lib/security-headers";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

import { getLocalizedPath } from "./lib/seo";
import type { Lang } from "./lib/i18n";

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
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

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      const normalizedResponse = await normalizeCatastrophicSsrResponse(response);
      return withSecurityHeaders(
        normalizedResponse,
        {
          supabaseUrl: process.env["VITE_SUPABASE_URL"],
          analyticsScriptUrl: process.env["VITE_PLAUSIBLE_SCRIPT_URL"],
        },
        new URL(request.url).protocol === "https:",
      );
    } catch (error) {
      console.error(error);
      return withSecurityHeaders(
        new Response(renderErrorPage(), {
          status: 500,
          headers: { "content-type": "text/html; charset=utf-8" },
        }),
        {
          supabaseUrl: process.env["VITE_SUPABASE_URL"],
          analyticsScriptUrl: process.env["VITE_PLAUSIBLE_SCRIPT_URL"],
        },
        new URL(request.url).protocol === "https:",
      );
    }
  },
};
