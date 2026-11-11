import type { CodometerConfiguration } from "@codometer/configuration";

// See the [statistics guide](./README.md).
/** A counter with `patterns` counts files; one with `symbols` counts declarations. */
const codometerConfiguration: CodometerConfiguration = {
  custom: [
    // 🗂️ By file pattern — one badge per naming convention.
    { label: "Service Files", patterns: ["**/*.service.ts"] },
    { label: "Unit Tests", patterns: ["**/*.unit.test.ts"] },
    // `color` is a shields.io hexadecimal triplet. Counters that omit one
    // take the next color from the built-in palette, cycling so a counter
    // keeps its color between runs.
    {
      color: "16a34a",
      label: "Integration Tests",
      patterns: ["**/*.integration.test.ts"],
    },

    // 🔣 By symbol shape — one badge per declaration shape, rendered into
    // the `typescript` group rather than the default `conventions` one.
    {
      group: "typescript",
      label: "Static Methods",
      symbols: { kinds: ["method"], modifiers: ["static"] },
    },
    // The trap `CatalogService.blank` exists for: a class field holding an
    // arrow function is a static **property**, and carries none of a
    // method's modifiers. Asking for static methods never finds it.
    {
      group: "typescript",
      label: "Static Properties",
      symbols: { kinds: ["property"], modifiers: ["static"] },
    },
    // The same symbol matcher, narrowed. `patterns` here says where to
    // look, not what to count: this is still counting methods, and it
    // finds three of the four because the fourth is in
    // `javascript/receipt.js`.
    {
      group: "typescript",
      label: "Service Static Methods",
      patterns: ["**/*.service.ts"],
      symbols: { kinds: ["method"], modifiers: ["static"] },
    },
    {
      group: "typescript",
      label: "Exported Interfaces",
      symbols: { kinds: ["interface"], modifiers: ["export"] },
    },
  ],
  format: "markdown",
  python: { command: "uv run python" },
};

export default codometerConfiguration;
