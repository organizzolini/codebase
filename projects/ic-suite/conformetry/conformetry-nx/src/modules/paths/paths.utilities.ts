import path from "node:path";

/**
 * Whether a workspace-relative directory is one a pattern admits.
 *
 * `*` stands for part of one folder name, never a separator, so
 * `applications/*` admits `applications/caelundas` and not
 * `applications/caelundas/caelundas-web` — depth is stated by the pattern.
 */
export function matchesDirectoryPattern(args: {
  directory: string;
  pattern: string;
}): boolean {
  const directorySegments = path.posix.normalize(args.directory).split("/");
  const patternSegments = args.pattern.split("/");

  return (
    directorySegments.length === patternSegments.length &&
    patternSegments.every((segment, index) => {
      return toSegmentExpression(segment).test(directorySegments[index] ?? "");
    })
  );
}

/**
 * The climb from a generated instance back to the workspace root, with a
 * trailing separator so a template writes `{{workspaceRootRelativePath}}x`.
 *
 * The instance sits one folder below the directory it is generated into, which
 * is why the count is one more than the directory's own depth.
 */
export function resolveWorkspaceRootRelativePath(args: {
  directoryPath: string;
  workspaceRoot: string;
}): string {
  const relativePath = path.relative(args.workspaceRoot, args.directoryPath);
  const depth = relativePath === "" ? 0 : relativePath.split(path.sep).length;

  return "../".repeat(depth + 1);
}

/** The folder a pattern points at before its first wildcard segment. */
export function staticDirectoryPrefix(pattern: string): string {
  const segments = pattern.split("/");
  const globIndex = segments.findIndex((segment) => segment.includes("*"));

  return (globIndex === -1 ? segments : segments.slice(0, globIndex)).join("/");
}

/** Escapes a segment so only `*` acts as a wildcard in it. */
function toSegmentExpression(segment: string): RegExp {
  const escaped = segment
    .split("*")
    .map((part) => part.replaceAll(/[$()+.?[\\\]^{|}]/g, String.raw`\$&`))
    .join("[^/]*");

  return new RegExp(`^${escaped}$`);
}
