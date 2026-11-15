import fs, { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";

/** Reads through the default export, as code that writes `import fs from "node:fs"` does. */
export function existsThroughDefault(file: string): boolean {
  return fs.existsSync(file);
}

/** Reads through a named export, as code that writes `import { readFileSync }` does. */
export function readThroughNamed(file: string): string {
  return readFileSync(file, "utf8");
}

/** Reads through `node:fs/promises`. */
export async function readThroughPromises(file: string): Promise<string> {
  return readFile(file, "utf8");
}
