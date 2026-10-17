import { mkdir, writeFile } from "node:fs/promises";
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
      // may write anything; this one records what the run produced.
      postGenerate: async (context: GeneratorHookContext): Promise<void> => {
        const receiptPath = path.join(
          context.outputDirectoryPath,
          context.input["name"] ?? "",
          "receipt.log",
        );

        await mkdir(path.dirname(receiptPath), { recursive: true });
        await writeFile(
          receiptPath,
          `${context.generatedFilePaths.join("\n")}\n`,
          "utf8",
        );
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
