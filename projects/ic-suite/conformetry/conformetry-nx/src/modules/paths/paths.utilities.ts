import path from "node:path";

/**
 * Whether a workspace-relative directory is one a pattern admits.
 *
 * `*` stands for part of one folder name, never a separator, so
 * `projects/*` admits `projects/caelundas` and not `projects/caelundas/web`.
 * A `**` segment stands for any number of folders, none included, which is how
 * a pattern states that depth does not matter.
 */
export function matchesDirectoryPattern(args: {
  directory: string;
  pattern: string;
}): boolean {
  return matchesSegments({
    directorySegments: path.posix.normalize(args.directory).split("/"),
    patternSegments: args.pattern.split("/"),
  });
}

/** The folder a pattern points at before its first wildcard segment. */
export function staticDirectoryPrefix(pattern: string): string {
  const segments = pattern.split("/");
  const globIndex = segments.findIndex((segment) => segment.includes("*"));

  return (globIndex === -1 ? segments : segments.slice(0, globIndex)).join("/");
}

/** Matches directory segments against pattern segments, honouring `**`. */
function matchesSegments(args: {
  directorySegments: string[];
  patternSegments: string[];
}): boolean {
  const [segment, ...restPattern] = args.patternSegments;

  if (segment === undefined) {
    return args.directorySegments.length === 0;
  }

  if (segment === "**") {
    return (
      args.directorySegments.some((_, skipped) => {
        return matchesSegments({
          directorySegments: args.directorySegments.slice(skipped),
          patternSegments: restPattern,
        });
      }) ||
      matchesSegments({ directorySegments: [], patternSegments: restPattern })
    );
  }

  const [first, ...restDirectory] = args.directorySegments;

  return (
    first !== undefined &&
    toSegmentExpression(segment).test(first) &&
    matchesSegments({
      directorySegments: restDirectory,
      patternSegments: restPattern,
    })
  );
}

/** Escapes a segment so only `*` acts as a wildcard in it. */
function toSegmentExpression(segment: string): RegExp {
  const escaped = segment
    .split("*")
    .map((part) => part.replaceAll(/[$()+.?[\\\]^{|}]/g, String.raw`\$&`))
    .join("[^/]*");

  return new RegExp(`^${escaped}$`);
}
