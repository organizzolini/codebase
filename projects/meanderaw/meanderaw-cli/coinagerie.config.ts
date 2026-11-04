import { coinagerieConfiguration } from "../../../configuration/coinagerie.config.js";

export default {
  ...coinagerieConfiguration,
  outputs: [
    {
      description:
        "The words this project uses that the root glossary does not define, regenerated with `nx run meanderaw-cli:coinagerie-check:write`.",
      path: "README.md",
      type: "markdown",
    },
  ],
};
