import { coinagerieConfiguration } from "../../../../configuration/coinagerie.config.js";

export default {
  ...coinagerieConfiguration,
  outputs: [
    {
      description:
        "The words this project uses that the root glossary does not define, regenerated with `nx run codependix-configuration:coinagerie-check:write`.",
      path: "coinagerie.md",
      type: "markdown",
    },
  ],
};
