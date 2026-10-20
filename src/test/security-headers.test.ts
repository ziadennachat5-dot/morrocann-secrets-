import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { withSecurityHeaders } from "@/lib/security-headers";

describe("security response headers", () => {
  it("sets a restrictive CSP and required browser security headers", async () => {
    const response = withSecurityHeaders(
      new Response("ok"),
      {
        supabaseUrl: "https://project.supabase.co",
        analyticsScriptUrl: "https://plausible.example/script.js",
      },
      true,
    );

    expect(response.headers.get("Content-Security-Policy")).toContain("object-src 'none'");
    expect(response.headers.get("Content-Security-Policy")).toContain("https://plausible.example");
    expect(response.headers.get("Content-Security-Policy")).toContain("wss://project.supabase.co");
    expect(response.headers.get("Strict-Transport-Security")).toContain("max-age=31536000");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(response.headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
  });

  it("does not send HSTS for HTTP and rejects non-HTTPS analytics URLs", () => {
    const response = withSecurityHeaders(new Response("ok"), {}, false);
    expect(response.headers.has("Strict-Transport-Security")).toBe(false);
    expect(() =>
      withSecurityHeaders(
        new Response("ok"),
        { analyticsScriptUrl: "http://analytics.example/script.js" },
        false,
      ),
    ).toThrow("VITE_PLAUSIBLE_SCRIPT_URL must use HTTPS.");
  });
});

describe("inquiries row-level security migration", () => {
  it("allows public insert only and restricts reads/updates to admins", () => {
    const migration = readFileSync(
      resolve(process.cwd(), "supabase", "migrations", "20261022000000_public_pages.sql"),
      "utf8",
    );
    const inquiryPolicies = [
      ...migration.matchAll(/CREATE POLICY[^;]+ON public\.inquiries[^;]+;/gi),
    ].map(([policy]) => policy);

    expect(migration).toMatch(/ALTER TABLE public\.inquiries ENABLE ROW LEVEL SECURITY/i);
    expect(migration).toMatch(/REVOKE ALL ON public\.inquiries FROM anon, authenticated/i);
    expect(migration).toMatch(
      /FOR INSERT\s+TO anon, authenticated\s+WITH CHECK \(status = 'new'\)/i,
    );
    expect(inquiryPolicies).toHaveLength(3);
    expect(inquiryPolicies[0]).toMatch(/FOR INSERT/i);
    expect(inquiryPolicies[1]).toMatch(
      /FOR SELECT\s+TO authenticated\s+USING \(public\.is_admin\(\)\)/i,
    );
    expect(inquiryPolicies[2]).toMatch(/FOR UPDATE\s+TO authenticated/i);
    expect(inquiryPolicies.every((policy) => !/FOR DELETE/i.test(policy))).toBe(true);
  });
});
