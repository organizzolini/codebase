// ♟️ Constants

import { z } from "zod";

import { assertNoCollisions } from "./configuration.utilities";

import type { GeneratorHook } from "@conformetry/core";

/**
 * Raised when a run names no configuration file.
 *
 * There is no default file and no filename search, since a guessed file would be silently wrong.
 */
export class ConfigurationPathRequiredError extends Error {
  constructor(surface: string) {
    super(
      `A conformetry configuration path is required, but ${surface} is missing or blank. No default file is assumed and none is searched for.`,
    );
    this.name = "ConfigurationPathRequiredError";
    this.surface = surface;
  }

  public readonly surface: string;
}

/** Raised when the configuration path points to an unsupported file type. */
export class UnknownConfigurationFileTypeError extends Error {
  constructor(filePath: string) {
    super(`Unsupported configuration file type: ${filePath}`);
    this.name = "UnknownConfigurationFileTypeError";
  }
}

/** Marks the workspace root during an upward search from the process cwd. */
export const WORKSPACE_MANIFEST_FILENAME = "pnpm-workspace.yaml";

/** Extensions the config loader can read. */
export const SUPPORTED_CONFIGURATION_EXTENSIONS = new Set([
  ".cjs",
  ".cts",
  ".js",
  ".json",
  ".jsonc",
  ".mjs",
  ".mts",
  ".ts",
]);

/** Any JSON value, used to accept arbitrary JSON Schema input fragments. */
const jsonSchemaDefinitionSchema: z.ZodType = z.lazy(() => {
  return z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonSchemaDefinitionSchema),
    z.record(z.string(), jsonSchemaDefinitionSchema),
  ]);
});

/**
 * A function hook. Zod cannot check arity or return type, so it refuses only a
 * non-function and names the hook.
 */
const generatorHookSchema = (hookName: string): z.ZodType<GeneratorHook> => {
  return z.custom<GeneratorHook>((value) => typeof value === "function", {
    message: `The ${hookName} hook must be a function`,
  });
};

/**
 * Validates the generator list from a config file. Generator objects are
 * strict, so an undeclared key is reported rather than stripped.
 */
export const conformetryConfigurationSchema = z
  .array(
    z.strictObject({
      description: z.string().optional(),
      // Strict for the same reason the generator is: a misspelt hook name
      // would otherwise be stripped and the hook silently never run.
      hooks: z
        .strictObject({
          postGenerate: generatorHookSchema("postGenerate").optional(),
          preGenerate: generatorHookSchema("preGenerate").optional(),
        })
        .optional(),
      // Each input is a JSON Schema fragment, so it must be an object; its own
      // fields may hold any JSON value.
      inputs: z
        .record(z.string(), z.record(z.string(), jsonSchemaDefinitionSchema))
        .optional(),
      instances: z
        .array(
          z.object({
            exclude: z.array(z.string()).optional(),
            // Optional because a group naming only `tags` is meaningful to a
            // host that resolves them: it names where a generator may be run
            // without claiming anything there is an instance yet.
            patterns: z.array(z.string()).optional(),
            substitutions: z.record(z.string(), z.string()).optional(),
            tags: z.array(z.string()).optional(),
            threshold: z.number().min(0).max(1).optional(),
          }),
        )
        .optional(),
      name: z.string(),
      templatePath: z.string(),
      threshold: z.number().min(0).max(1).optional(),
    }),
  )
  .superRefine(assertNoCollisions);
