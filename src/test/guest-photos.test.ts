import { describe, expect, it } from "vitest";
import { filterPhotosWithConsent } from "@/lib/guest-photos.functions";

describe("filterPhotosWithConsent", () => {
  it("returns only photos with confirmed guest consent", () => {
    expect(
      filterPhotosWithConsent([
        { id: "pending", guest_consent_confirmed: false },
        { id: "approved", guest_consent_confirmed: true },
      ]),
    ).toEqual([{ id: "approved", guest_consent_confirmed: true }]);
  });

  it("does not expose photos when consent is pending", () => {
    expect(filterPhotosWithConsent([{ guest_consent_confirmed: false }])).toEqual([]);
  });
});
