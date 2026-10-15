import { TEMPLATE_HASH_SOURCE } from "./plugin.constants";

/**
 * Builds the shell command, run from the workspace root, that prints a digest
 * of every file under the given template folders.
 *
 * It is a Node program rather than a pipeline of `find` and `shasum` so that it
 * behaves the same wherever Nx runs, and it reads the disk, not Nx's file map.
 */
export function buildTemplateHashCommand(templatePaths: string[]): string {
  const program = TEMPLATE_HASH_SOURCE.replace(
    "DIRECTORIES",
    JSON.stringify(templatePaths),
  )
    .replaceAll(/\s*\n\s*/g, " ")
    .trim();

  return `node -e '${program.replaceAll("'", String.raw`'\''`)}'`;
}
