import type { ConformetryConfiguration } from "@conformetry/configuration";

/**
 * Each example names its own folder once, since every path resolves from the
 * workspace root.
 */
const EXAMPLE_PATH =
  "projects/ic-suite/conformetry/conformetry-examples/examples/hello-template";

const conformetryConfiguration: ConformetryConfiguration = [
  {
    description: "The smallest generator there is: one template file",
    inputs: {
      name: { description: "Greeting name in kebab-case", type: "string" },
    },
    instances: [{ patterns: [`${EXAMPLE_PATH}/instances/*`] }],
    name: "hello",
    templatePath: `${EXAMPLE_PATH}/templates/hello`,
  },
];

export default conformetryConfiguration;
