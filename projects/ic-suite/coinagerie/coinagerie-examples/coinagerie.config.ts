import { coinagerieConfiguration } from "../../../../configuration/coinagerie.config.js";

export default {
  ...coinagerieConfiguration,
  exclude: {
    ...coinagerieConfiguration.exclude,
    paths: ["examples/**"],
  },
  outputs: [
    {
      description:
        "The words this project uses that the root glossary does not define, regenerated with `nx run coinagerie-examples:coinagerie-check:write`.",
      path: "README.md",
      type: "markdown",
    },
  ],
};
