import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/**
 * Examples package fixtures. Read by path, not imported, because this package
 * may not depend on the examples; vitest inputs name the same folder.
 */
const EXAMPLES_DIRECTORY = path.resolve(
  import.meta.dirname,
  "../../coinagerie-examples/examples",
);

/**
 * Lists an example's `project/` files, keyed by relative path. `folder` narrows
 * the read to a subfolder, keeping its prefix in the keys.
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
