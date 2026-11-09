// ♟️ Constants

import type {
  ConsumerCommandResult,
  PluginTargetExpectation,
} from "./publishable-packages.types";

/**
 * Directory a consumer is created beneath; unset, the OS temp directory. Keep it
 * outside every package, or it resolves the wrong packages.
 */
export const CONSUMER_ROOT_VARIABLE = "PUBLISHABLE_PACKAGES_CONSUMER_ROOT";

/** Prefix of each consumer directory, completed by `mkdtemp`. */
export const CONSUMER_DIRECTORY_PREFIX = "publishable-packages-consumer-";

/**
 * Variables a consumer never inherits: `NX_*` aims its Nx at this workspace;
 * `npm_*`, `pnpm_config_*` and `NODE_OPTIONS` carry its settings, tokens or hooks.
 */
export const INHERITED_VARIABLE_PATTERN =
  /^(?:npm_|nx_|pnpm_config_|force_color$|node_auth_token$|node_options$)/i;

/**
 * Matches terminal color codes, which print even under `FORCE_COLOR=0`, so
 * output compares as the text a person reads.
 */
export const ESCAPE_SEQUENCE_PATTERN = new RegExp(
  String.raw`${String.fromCodePoint(0x1b)}\[[\d;?]*[ -/]*[@-~]`,
  "gu",
);

/** Milliseconds `pnpm install` may take on an oversubscribed runner. */
export const INSTALL_TIMEOUT = 600_000;

/**
 * Largest output a consumer command may print. Node's 1 MiB default is too
 * small for an install log, which would read as failure.
 */
export const MAXIMUM_OUTPUT_BYTES = 64 * 1024 * 1024;

/** Milliseconds any other consumer command may take. */
export const COMMAND_TIMEOUT = 300_000;

/** Lines of a failed command's output repeated in its failure message. */
export const FAILURE_OUTPUT_LINES = 40;

/** Builds the consumer's own `pnpm` approves, as this workspace does. */
export const CONSUMER_ALLOWED_BUILDS = ["@swc/core", "nx"] as const;

/** Tools the consumer pins to the versions this workspace has installed. */
export const CONSUMER_TOOLS = ["@types/node", "nx", "typescript"] as const;

/** Fixture project whose every gate must pass. */
export const HEALTHY_PROJECT = "healthy";

/** Fixture project whose every gate must fail, for a known reason. */
export const BROKEN_PROJECT = "broken";

/** Name the generator writes into the healthy fixture. */
export const GENERATED_INSTANCE = "generated";

/** The one generator the consumer's conformetry configuration declares. */
export const CONSUMER_GENERATOR = "greeting";

/**
 * One inferred target per Nx plugin, with the text its failing fixture prints
 * when the gate itself ran.
 */
export const PLUGIN_TARGET_EXPECTATIONS: readonly PluginTargetExpectation[] = [
  {
    failure: "Call stacks over the depth limit (1)",
    plugin: "@callidescope/nx",
    target: "callidescope-restrict",
  },
  {
    failure: "broken-does-not-reach-healthy",
    plugin: "@codependix/nx",
    target: "codependix-bound",
  },
  {
    failure: 'Missing markdown heading: "Usage"',
    plugin: "@conformetry/nx",
    target: "conformetry-validate",
  },
];

/** Directory, inside the consumer, holding one import file per package. */
export const TYPECHECK_DIRECTORY = "typecheck";

/** Configuration the per-package import check typechecks with. */
export const TYPECHECK_CONFIGURATION = "tsconfig.typecheck.json";

/**
 * The typecheck config: every import file, strictly. Library checking stays
 * off, or `nx`'s own declarations fail and say nothing about the packages.
 */
export const TYPECHECK_CONFIGURATION_CONTENT = `{
  "compilerOptions": {
    "lib": ["ES2023", "DOM"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "noEmit": true,
    "skipLibCheck": true,
    "strict": true,
    "target": "ES2023",
    "types": ["node"]
  },
  "include": ["${TYPECHECK_DIRECTORY}/*.ts"]
}
`;

/**
 * Describes a consumer command that failed, ending with the last lines it
 * printed so a CI log names the cause without a rerun.
 */
export const formatCommandFailure = (
  description: string,
  result: ConsumerCommandResult,
): string => {
  const lines = result.output.trimEnd().split("\n");
  const tail = lines.slice(-FAILURE_OUTPUT_LINES).join("\n");

  return `❌ ${description} (exit ${String(result.status)}):\n${tail}`;
};
