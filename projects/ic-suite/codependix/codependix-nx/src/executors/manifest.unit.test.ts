import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

/** This package's root, where both manifests and the build configuration sit. */
const PACKAGE_DIRECTORY = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../..",
);

/** Whether a parsed JSON value is an object rather than a scalar or array. */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Reads one JSON manifest from this package's root. */
function readManifest(fileName: string): Record<string, unknown> {
  return readRecord(
    JSON.parse(
      readFileSync(path.join(PACKAGE_DIRECTORY, fileName), "utf8"),
    ) as unknown,
    fileName,
  );
}

/** One object-valued field of a parsed manifest, or a refusal naming it. */
function readRecord(value: unknown, field: string): Record<string, unknown> {
  if (!isRecord(value)) {
    throw new TypeError(`${field} is not a JSON object`);
  }

  return value;
}

const { name, publishConfig } = readManifest("package.json");
const publishedExports = readRecord(
  readRecord(publishConfig, "publishConfig")["exports"],
  "publishConfig.exports",
);
const executors = readRecord(
  readManifest("executors.json")["executors"],
  "executors",
);

/**
 * Resolves one subpath through the published `exports` map's single-wildcard
 * pattern, the way Node would for a consumer that installed the tarball.
 */
function resolvePublished(subpath: string): string | undefined {
  for (const [key, target] of Object.entries(publishedExports)) {
    const [prefix = "", suffix] = key.split("*");

    if (
      typeof target === "string" &&
      suffix !== undefined &&
      subpath.startsWith(prefix) &&
      subpath.endsWith(suffix)
    ) {
      return target
        .split("*")
        .join(subpath.slice(prefix.length, subpath.length - suffix.length));
    }
  }

  return undefined;
}

// The build names its entry points one by one, so a file `executors.json`
// points at but `vite.config.ts` does not list is in the source and missing
// from the tarball: the plugin then fails to load in every consumer, with
// nothing in the workspace's own runs to say so.
describe("executors.json", () => {
  it.each(
    Object.entries(executors).flatMap(([executorName, entry]) =>
      ["implementation", "batchImplementation"]
        .filter((field) => field in readRecord(entry, executorName))
        .map((field): [string, string] => [executorName, field]),
    ),
  )("builds and ships the %s executor's %s", (executorName, field) => {
    expect.hasAssertions();

    const specifier = String(
      readRecord(executors[executorName], executorName)[field],
    );
    const subpath = specifier.slice(`${String(name)}/`.length);

    expect(specifier.startsWith(`${String(name)}/src/executors/`)).toBe(true);
    expect(resolvePublished(`./${subpath}`)).toBe(`./dist/${subpath}.js`);
    expect(existsSync(path.join(PACKAGE_DIRECTORY, `${subpath}.ts`))).toBe(
      true,
    );
    expect(
      readFileSync(path.join(PACKAGE_DIRECTORY, "vite.config.ts"), "utf8"),
    ).toContain(`"${subpath}":`);
  });
});
