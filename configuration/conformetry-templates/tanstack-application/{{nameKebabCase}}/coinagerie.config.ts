import { coinagerieConfiguration } from "@codebase/configuration/coinagerie.config";

export default {
  ...coinagerieConfiguration,
  outputs: [
    {
      description:
        "The words this project uses that the root glossary does not define, regenerated with `nx run {{nameKebabCase}}:coinagerie-check:write`.",
      path: "README.md",
      type: "markdown",
    },
  ],
};
