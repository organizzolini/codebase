import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

// 🧪 Tests

const FORBIDDEN = /^(execa|verdaccio)(\/|$)/u;

/** Walks relative imports and re-exports from an entry, collecting bare specifiers. */
function reachablePackages(entry: string): string[] {
  const seen = new Set<string>();
  const packages = new Set<string>();
  const queue = [entry];

  for (const file of queue) {
    if (seen.has(file)) {
      continue;
    }
    seen.add(file);
    const source = fs.readFileSync(file, "utf8");

    for (const match of source.matchAll(
      /(?:from|import)\s*\(?\s*["']([^"']+)["']/gu,
    )) {
      const specifier = match[1] ?? "";

      if (specifier.startsWith(".")) {
        const base = path.resolve(path.dirname(file), specifier);
        queue.push(
          ...[`${base}.ts`, `${base}.tsx`].filter((candidate) =>
            fs.existsSync(candidate),
          ),
        );
      } else {
        packages.add(specifier);
      }
    }
  }

  return [...packages];
}

describe("entries", () => {
  it("never reach execa or Verdaccio from any entry but end-to-end", () => {
    const entries = [
      "file-system",
      "index",
      "nestjs",
      "react",
      "react-setup",
      "setup",
    ].map((name) => path.join(import.meta.dirname, `${name}.ts`));

    for (const entry of entries) {
      expect(
        reachablePackages(entry).filter((name) => FORBIDDEN.test(name)),
      ).toStrictEqual([]);
    }
  });

  it("does reach them from end-to-end, so the walk can tell", () => {
    const reached = reachablePackages(
      path.join(import.meta.dirname, "end-to-end.ts"),
    );

    expect(reached).toContain("execa");
    expect(reached).toContain("verdaccio");
  });
});
