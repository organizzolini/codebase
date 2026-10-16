import path from "node:path";

import type {
  ConformetryConfiguration,
  GeneratorHookContext,
} from "@conformetry/configuration";

/** Where this example's files sit, relative to the workspace root. */
const EXAMPLE_PATH =
  "projects/ic-suite/conformetry/conformetry-examples/examples/hooks";

/** What a name may be made of, checked before anything is written. */
const ACCEPTED_NAME = /^[a-z][a-z0-9-]*$/;

const conformetryConfiguration: ConformetryConfiguration = [
  {
    description:
      "A one-file template whose hooks refuse a bad name and stamp a receipt",
    hooks: {
      // Runs after the template is rendered, and before the formatter. A hook
      // writes through `context.filesystem`, the adapter the run itself uses,
      // so the write lands wherever the host sends writes. The path is built
      // from `configurationDirectoryPath`, so it sits beside this file however
      // the command was invoked.
      postGenerate: async (context: GeneratorHookContext): Promise<void> => {
        const receiptPath = path.join(
          context.configurationDirectoryPath,
          "receipts",
          `${context.input["name"] ?? ""}.log`,
        );

        await context.filesystem.writeFile(
          receiptPath,
          `${context.generatedFilePaths.join("\n")}\n`,
        );
        // Added to the list so the host formats it like a rendered file.
        context.generatedFilePaths.push(receiptPath);
        process.stdout.write(`Receipt written: ${receiptPath}\n`);
      },
      // Runs before a single file is written, so throwing here leaves the
      // output directory exactly as it was.
      preGenerate: (context: GeneratorHookContext): void => {
        const name = context.input["name"] ?? "";

        if (!ACCEPTED_NAME.test(name)) {
          throw new Error(
            `Refused "${name}": a name is lowercase letters, digits and hyphens, and starts with a letter.`,
          );
        }
      },
    },
    inputs: {
      name: { description: "Receipt name in kebab-case", type: "string" },
    },
    instances: [],
    name: "receipt",
    templatePath: `${EXAMPLE_PATH}/templates/receipt`,
  },
];

export default conformetryConfiguration;
