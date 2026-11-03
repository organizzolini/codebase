import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

describe("coinagerie-vocabulary index", () => {
  it("declares no exports until a ticket adds behavior", () => {
    const source = readFileSync(
      path.join(import.meta.dirname, "index.ts"),
      "utf8",
    );

    expect(source).not.toMatch(/^export\s/mu);
  });
});
