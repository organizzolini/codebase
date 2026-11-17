import { codometerConfiguration } from "@codebase/configuration/codometer.config";

export default {
  ...codometerConfiguration,
  // GraphQL Code Generator writes these; the root ignore file is anchored to the
  // repository, so it matches nothing from here and the exclusion is restated.
  exclude: ["src/graphql/generated/**"],
};
