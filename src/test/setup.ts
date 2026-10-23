import "@testing-library/jest-dom/vitest";

Object.defineProperty(window, "scrollTo", {
  writable: true,
  value: () => {},
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    dispatchEvent: () => {},
  }),
});

Object.defineProperty(document, "elementFromPoint", {
  writable: true,
  value: (x: number, y: number) => {
    const all = document.querySelectorAll("*");
    for (let i = all.length - 1; i >= 0; i--) {
      const el = all[i] as HTMLElement;
      const rect = el.getBoundingClientRect();
      if (rect && (rect.width > 0 || rect.height > 0)) {
        if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
          return el;
        }
      }
    }
    return document.body;
  },
});
