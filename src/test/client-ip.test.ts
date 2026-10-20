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
});
