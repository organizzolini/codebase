// 🛠️ Utilities

import type {
  MeasureCommandOptions,
  ResolvedCodometerConfiguration,
} from "@codometer/configuration";

/**
 * Applies `--inputs`, then keeps the inputs `--only-inputs` names and drops the limits written against the others. Refuses an unknown name, and mixing the two.
 */
export function selectInputs(
  loaded: ResolvedCodometerConfiguration,
  options: MeasureCommandOptions,
): { configuration: ResolvedCodometerConfiguration; errors: string[] } {
  const configuration = applyInputsOverride(loaded, options.inputs);
  const names = options.onlyInputs;

  if (names === undefined) {
    return { configuration, errors: [] };
  }

  if (options.inputs !== undefined) {
    return {
      configuration,
      errors: ["--only-inputs cannot be combined with --inputs"],
    };
  }

  const configured = configuration.inputs.map((input) => input.name);
  const unknown = names.filter((name) => !configured.includes(name));

  if (unknown.length > 0) {
    const quote = (list: string[]): string =>
      list.map((name) => `"${name}"`).join(", ");

    return {
      configuration,
      errors: [
        `--only-inputs names no configured input: ${quote(unknown)}. Configured inputs: ${quote(configured)}.`,
      ],
    };
  }

  const dropped = configured.filter((name) => !names.includes(name));

  return {
    configuration: {
      ...configuration,
      inputs: configuration.inputs.filter((input) =>
        names.includes(input.name),
      ),
      limits: configuration.limits.filter(
        (limit) =>
          !dropped.some((input) =>
            limitTargetsInput(configuration, limit.metric, input),
          ),
      ),
    },
    errors: [],
  };
}

/**
 * Replaces every configured input with the `--inputs` globs, measured as the `language` analysis with no other input active.
 */
function applyInputsOverride(
  configuration: ResolvedCodometerConfiguration,
  globs: string[] | undefined,
): ResolvedCodometerConfiguration {
  if (globs === undefined) {
    return configuration;
  }

  return {
    ...configuration,
    inputs: [
      {
        analyses: ["language"],
        compression: "none",
        directory: ".",
        exclude: [],
        include: globs,
        name: "Command Line",
      },
    ],
  };
}

/**
 * Whether a limit is written against an input: by its name in front of the metric, or unqualified where that input is the default.
 */
function limitTargetsInput(
  configuration: ResolvedCodometerConfiguration,
  metric: string,
  input: string,
): boolean {
  if (metric.startsWith(`${input}.`)) {
    return true;
  }

  const isQualified = configuration.inputs.some((configured) =>
    metric.startsWith(`${configured.name}.`),
  );

  return !isQualified && configuration.defaultInput === input;
}
