import { TEMPLATE_HASH_SOURCE } from "./plugin.constants";

/**
 * Builds the command that digests the template folders.
 *
 * A Node program, not `find` and `shasum`, so it behaves the same everywhere.
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
