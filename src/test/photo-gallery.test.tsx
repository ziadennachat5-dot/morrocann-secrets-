import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { PhotoGallery } from "@/components/site/PhotoGallery";
import { I18nProvider } from "@/lib/i18n";

afterEach(cleanup);

describe("PhotoGallery", () => {
  it("opens photos and supports arrow-key navigation and Escape", () => {
    render(
      <I18nProvider>
        <PhotoGallery />
      </I18nProvider>,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /View photo: A man and woman share a Moroccan meal/ }),
    );

    const dialog = screen.getByRole("dialog");
    expect(screen.getByRole("img", { name: /A man and woman share a Moroccan meal/ })).toBeTruthy();

    fireEvent.keyDown(dialog, { key: "ArrowRight" });
    expect(screen.getByRole("img", { name: /Four people stand together/ })).toBeTruthy();

    fireEvent.keyDown(dialog, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
