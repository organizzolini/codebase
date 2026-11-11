import type { ConformetryConfiguration } from "@conformetry/configuration";

/** The example's own folder, since every path resolves from the root. */
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
