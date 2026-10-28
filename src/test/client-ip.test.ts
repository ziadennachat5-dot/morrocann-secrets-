import { describe, expect, it } from "vitest";
import { getClientIp } from "@/lib/client-ip";

describe("getClientIp", () => {
  it("uses the local development address when the Cloudflare header is absent", () => {
    expect(getClientIp(new Request("http://localhost"), true)).toBe("127.0.0.1");
  });

  it("does not use the local development address in production", () => {
    expect(getClientIp(new Request("https://moroccansecrets.com"), false)).toBeNull();
  });

  it("uses the Cloudflare client address in development and production", () => {
    const request = new Request("https://moroccansecrets.com", {
      headers: { "cf-connecting-ip": "203.0.113.42" },
    });

    expect(getClientIp(request, true)).toBe("203.0.113.42");
    expect(getClientIp(request, false)).toBe("203.0.113.42");
  });

  it("uses the x-real-ip or x-forwarded-for address on Vercel deployments", () => {
    const vercelRealIpReq = new Request("https://moroccosecretsmarrakech.com", {
      headers: { "x-real-ip": "198.51.100.12" },
    });
    expect(getClientIp(vercelRealIpReq, false)).toBe("198.51.100.12");

    const vercelForwardedReq = new Request("https://moroccosecretsmarrakech.com", {
      headers: { "x-forwarded-for": "198.51.100.34, 10.0.0.1" },
    });
    expect(getClientIp(vercelForwardedReq, false)).toBe("198.51.100.34");
  });
});
