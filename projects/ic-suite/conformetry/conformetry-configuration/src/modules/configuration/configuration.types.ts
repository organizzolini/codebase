// 🏷️ Types

import type { ConformetryInstanceGroup } from "../instance-group/instance-group.types";
import type { conformetryConfigurationSchema } from "./configuration.constants";
import type { GeneratorHooks } from "@conformetry/core";
import type { z } from "zod";

/** The loaded config: one entry per generator, as an array. */
export type ConformetryConfiguration = ConformetryGeneratorDefinition[];

/** One generator, with the template it renders and the instances it governs. */
export interface ConformetryGeneratorDefinition {
  description?: string;
  /**
   * Functions run around generation: `preGenerate` before writing, `postGenerate`
   * after rendering. Left off when a generator declares none.
   */
  hooks?: GeneratorHooks;
  /** Values substituted into the template, each a JSON Schema fragment. */
  inputs: Record<string, ConformetryGeneratorInputDefinition>;
  /**
   * Where this generator's output already lives. Validation expands these to
   * find what to check; generation reads them to place new instances.
   */
  instances: ConformetryInstanceGroup[];
  name: string;
  /** The template folder, relative to the workspace root. */
  templatePath: string;
  /**
   * Lowest passing conformance score, 0 to 1. Unset rather than defaulted, so a
   * run-level `--threshold` can still apply.
   */
  threshold?: number;
}

/** One configurable input, expressed as a JSON Schema fragment. */
export type ConformetryGeneratorInputDefinition = Record<string, unknown>;

/** JSON Schema fragment for generator inputs: `properties` and `required` only. */
export interface JsonSchemaDefinition {
  [key: string]: unknown;
  properties?: Record<string, unknown>;
}

/** One generator entry exactly as Zod parsed it, before defaults are applied. */
export type ParsedGeneratorEntry = z.infer<
  typeof conformetryConfigurationSchema
>[number];
