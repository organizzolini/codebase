import type { ConformetryConfiguration } from "@conformetry/configuration";

/** Where this example's files sit, relative to the workspace root. */
const EXAMPLE_PATH =
  "projects/ic-suite/conformetry/conformetry-examples/examples/case-variants";

const conformetryConfiguration: ConformetryConfiguration = [
  {
    description: "Every derived case variant, in file paths and file contents",
    inputs: {
      name: { description: "Component name in kebab-case", type: "string" },
      // Declaring a derived variant as an input is what lets a caller override
      // it. Conformetry derives all four case variants from `name`, and an
      // explicit value of the same name always wins over the derived one.
      nameCamelCase: {
        description: "Camel-case name, overriding the derived variant",
        type: "string",
      },
      owner: { description: "Owning team", type: "string" },
    },
    instances: [
      {
        patterns: [`${EXAMPLE_PATH}/instances/*`],
        // `owner` has no derived value, so this group supplies it.
        //
        // `nameCamelCase` would derive `searchBar`; the explicit `spelledOutByHand` wins in both generation and validation.
        substitutions: { nameCamelCase: "spelledOutByHand", owner: "platform" },
      },
    ],
    name: "case-variants",
    templatePath: `${EXAMPLE_PATH}/templates/case-variants`,
  },
];

export default conformetryConfiguration;
