import type { CodometerConfiguration } from "@codometer/configuration";

/**
 * A `write` that adds lines to the built-in badge rendering via `renderBadges()`.
 *
 * See the [output guide](./README.md).
 */
const codometerConfiguration: CodometerConfiguration = {
  format: "markdown",
  outputs: [
    {
      path: "statistics.md",
      type: "markdown",
      write: ({ anchors, renderBadges, statistics }) =>
        anchors.syncAnchoredBlock({
          content: [
            `**${statistics.sourceFiles} source files**, `,
            `${statistics.linesOfCode} lines of code.\n`,
            renderBadges(),
          ].join(""),
        }),
    },
  ],
  python: { command: "uv run python" },
};

export default codometerConfiguration;
