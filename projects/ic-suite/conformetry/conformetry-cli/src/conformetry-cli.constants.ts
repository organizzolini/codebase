import { z } from "zod";

/**
 * Indent width for machine-readable output.
 *
 * Shared by every command with a `--json` mode, so the two listings are
 * parseable the same way.
 */
export const JSON_INDENT = 2;

/**
 * How a refusal names the `--config` flag. The configuration layer owns the
 * requirement and its wording; this is only the flag's name.
 */
export const CONFIGURATION_FLAG_SURFACE = "the --config flag";

/**
 * Refuses an unknown template name. Shared by `generate` and `validate`, since
 * silently dropping it would report a vacuous pass.
 */
export const unknownTemplateError = (args: {
  availableTemplateNames: readonly string[];
  templateName: string;
}): Error =>
  new Error(
    `Unknown template "${args.templateName}". Available: ${args.availableTemplateNames.join(", ")}`,
  );

/**
 * Rejects `--generator`, which `--template` replaced. Commander accepts unknown
 * flags for template inputs, so this loud error is the only signal.
 */
export const removedGeneratorOptionError = (): Error =>
  new Error(
    "--generator was removed. Pass --template instead: it is the word the configuration, the templates command, and the conformance report already use.",
  );

// 🌱 Add environment schema fields here
export const environmentSchema = z.object({});
