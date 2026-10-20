import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CatalogManager } from "@/components/admin/CatalogManager";

afterEach(cleanup);

function renderExperienceManager() {
  return render(
    <CatalogManager
      section="experiences"
      experiences={[]}
      families={[]}
      reviews={[]}
      currency="MAD"
      onSaveCurrency={async () => {}}
      onRefresh={async () => {}}
      onError={() => {}}
    />,
  );
}

describe("experience catalog form", () => {
  it("opens only Basics initially and allows groups to be toggled without reopening", async () => {
    renderExperienceManager();

    const basics = screen.getByText("Basics").closest("details");
    const pricing = screen.getByText("Pricing and capacity").closest("details");
    const content = screen.getByText("Content").closest("details");
    const photo = screen.getByText("Photo").closest("details");

    expect(basics?.open).toBe(true);
    expect(pricing?.open).toBe(false);
    expect(content?.open).toBe(false);
    expect(photo?.open).toBe(false);

    fireEvent.click(screen.getByText("Content"));
    await waitFor(() => expect(content?.open).toBe(true));
    fireEvent.change(screen.getAllByLabelText("EN", { selector: "input" })[0]!, {
      target: { value: "Test title" },
    });
    expect(content?.open).toBe(true);
  });

  it("shows all experience validation errors at the top of the form", async () => {
    renderExperienceManager();
    fireEvent.click(screen.getByRole("button", { name: "Save experience" }));

    const errors = await screen.findByRole("alert");
    expect(errors.textContent).toContain("Experience ID must use lowercase letters");
    expect(errors.textContent).toContain("Enter the title, description, and duration in English");
    expect(errors.textContent).toContain("Enter valid prices and guest limits");
    expect(errors.textContent).toContain("Upload an experience image");
    expect(errors.parentElement?.firstElementChild).toBe(
      screen.getByRole("heading", { name: "Create experience draft" }),
    );
  });
});
