type SecurityHeaderConfig = {
  supabaseUrl?: string | undefined;
  analyticsScriptUrl?: string | undefined;
};

function configuredOrigin(
  value: string | undefined,
  name: string,
  httpsOnly: boolean,
): string | null {
  if (!value?.trim()) return null;
  const url = new URL(value);
  if (httpsOnly && url.protocol !== "https:") {
    throw new Error(`${name} must use HTTPS.`);
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`${name} must use HTTP or HTTPS.`);
  }
  return url.origin;
}

export function withSecurityHeaders(
  response: Response,
  config: SecurityHeaderConfig,
  isHttps: boolean,
): Response {
  const supabaseOrigin = configuredOrigin(config.supabaseUrl, "VITE_SUPABASE_URL", false);
  const analyticsOrigin = configuredOrigin(
    config.analyticsScriptUrl,
    "VITE_PLAUSIBLE_SCRIPT_URL",
    true,
  );
  const supabaseSocketOrigin = supabaseOrigin
    ? supabaseOrigin.replace(/^https:/, "wss:").replace(/^http:/, "ws:")
    : null;
  const connectSources = [
    "'self'",
    "https://fonts.googleapis.com",
    "https://fonts.gstatic.com",
    supabaseOrigin,
    supabaseSocketOrigin,
    analyticsOrigin,
  ]
    .filter((origin): origin is string => origin !== null)
    .join(" ");
  const scriptSources = ["'self'", "'unsafe-inline'", analyticsOrigin]
    .filter((origin): origin is string => origin !== null)
    .join(" ");
  const imageSources = ["'self'", "data:", "blob:", supabaseOrigin]
    .filter((origin): origin is string => origin !== null)
    .join(" ");
  const headers = new Headers(response.headers);
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "frame-ancestors 'none'",
      "form-action 'self'",
      `script-src ${scriptSources}`,
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      `img-src ${imageSources}`,
      "font-src 'self' data: https://fonts.gstatic.com",
      `connect-src ${connectSources}`,
      ...(isHttps ? ["upgrade-insecure-requests"] : []),
    ].join("; "),
  );
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  if (isHttps) {
    headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
