import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Where the examples package keeps its fixtures.
 *
 * Read by path rather than imported, because a package may not depend on the
 * examples that exercise it; `vitest`'s inputs name the same folder so a
 * changed fixture re-runs this suite.
 */
const EXAMPLES_DIRECTORY = path.resolve(
  import.meta.dirname,
  "../../coinagerie-examples/examples",
);

/**
 * The files of one example's `project/` folder, keyed by path relative to it,
 * ready to hand to `createFixtureTree`.
 *
 * `folder` narrows the read to a subfolder — the keys keep their prefix — for
 * a case that wants the example's source without its configurations.
 */
export function readExample(
  exampleName: string,
  folder = ".",
): Record<string, string> {
  const projectDirectory = path.join(
    EXAMPLES_DIRECTORY,
    exampleName,
    "project",
  );

  return Object.fromEntries(
    readdirSync(path.join(projectDirectory, folder), {
      recursive: true,
      withFileTypes: true,
    })
      .filter((entry) => entry.isFile())
      .map((entry) => {
        const absolutePath = path.join(entry.parentPath, entry.name);

        return [
          path.relative(projectDirectory, absolutePath),
          readFileSync(absolutePath, "utf8"),
        ];
      }),
  );
}
