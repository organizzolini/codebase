import { z } from "zod";

/** Indent width for `--json` output, shared so every listing parses alike. */
export const JSON_INDENT = 2;

/** The `--config` flag's name, as refusals print it. */
export const CONFIGURATION_FLAG_SURFACE = "the --config flag";

/** Refuses an unknown template name, so `validate` cannot pass vacuously. */
export const unknownTemplateError = (args: {
  availableTemplateNames: readonly string[];
  templateName: string;
}): Error =>
  new Error(
    `Unknown template "${args.templateName}". Available: ${args.availableTemplateNames.join(", ")}`,
  );

/** Rejects the retired `--generator` flag, which commander would accept silently. */
export const removedGeneratorOptionError = (): Error =>
  new Error(
    "--generator was removed. Pass --template instead: it is the word the configuration, the templates command, and the conformance report already use.",
  );

// 🌱 Add environment schema fields here
export const environmentSchema = z.object({});
