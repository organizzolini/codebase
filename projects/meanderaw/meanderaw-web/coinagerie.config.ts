import { coinagerieConfiguration } from "@codebase/configuration/coinagerie.config";

export default {
  ...coinagerieConfiguration,
  outputs: [
    {
      description:
        "The words this project uses that the root glossary does not define, regenerated with `nx run meanderaw-web:coinagerie-check:write`.",
      path: "coinagerie.md",
      type: "markdown",
    },
  ],
};
