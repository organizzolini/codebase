import nodePath from "node:path";

import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * A `write` that picks its destination from the measurement, derived from `path`.
 *
 * See the [output guide](./README.md).
 */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  outputs: [
    {
      path: "statistics.md",
      type: "markdown",
      write: ({ anchors, path, statistics }) =>
        anchors.syncAnchoredBlock({
          path:
            path === undefined || statistics.python.files === 0
              ? path
              : nodePath.join(nodePath.dirname(path), "polyglot.md"),
        }),
    },
  ],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
