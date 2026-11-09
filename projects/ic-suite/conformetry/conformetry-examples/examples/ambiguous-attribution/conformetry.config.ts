import type { ConformetryConfiguration } from "@conformetry/configuration";

/** Where this example's files sit, relative to the workspace root. */
const EXAMPLE_PATH =
  "projects/ic-suite/conformetry/conformetry-examples/examples/ambiguous-attribution";

const conformetryConfiguration: ConformetryConfiguration = [
  {
    description: "A two-file template: the document, and its notes",
    inputs: {
      name: { description: "Document name in kebab-case", type: "string" },
    },
    // Both templates claim these paths, but only one group declares them. A
    // run unions groups into one list, so repeated globs report every finding once per group.
    instances: [{ patterns: [`${EXAMPLE_PATH}/instances/*`] }],
    name: "overview",
    templatePath: `${EXAMPLE_PATH}/templates/overview`,
  },
  {
    description: "A two-file template: the document, and its summary",
    inputs: {
      name: { description: "Document name in kebab-case", type: "string" },
    },
    instances: [],
    name: "digest",
    templatePath: `${EXAMPLE_PATH}/templates/digest`,
  },
];

export default conformetryConfiguration;
