// 🏷️ Types

import type { ConformetryConfiguration } from "../configuration/configuration.types.js";
import type { Substitutions } from "../rendering/rendering.types";
import type { TemplateDefinition } from "../template-discovery/template-discovery.types.js";
import type { PreparedValidationDocument } from "@conformetry/core";

/** Arguments for expanding instance globs into instances. */
export interface FindInstancesArguments {
  /** Globs naming paths that are never instances. A matching directory or file is dropped. */
  readonly exclude?: string[] | undefined;
  /** Glob patterns, resolved against the working directory. */
  readonly patterns: string[];
  /**
   * Applied to every instance these patterns produce. Callers needing per-project
   * values call once per project rather than passing a lookup table.
   */
  readonly substitutions?: Substitutions;
  /** Applied to every instance these patterns produce, when the group sets one. */
  readonly threshold?: number;
  readonly workingDirectory: string;
}

/**
 * A place a template's tree is rendered into, with the name it renders with.
 *
 * The host's glob expansion supplies it.
 */
export interface Instance {
  /**
   * Absolute paths narrowing the match, or `undefined` for the whole tree. A file
   * glob narrows this, so a template describing those files fits better.
   */
  readonly fileScope?: string[];
  /** Drives the name substitutions — a directory basename or a filename stem. */
  readonly nameStem: string;
  /**
   * Directory the template's tree is laid over: for a folder-producing template,
   * the folder's parent; for loose files, their directory.
   */
  readonly path: string;
  /**
   * Caller-supplied substitutions beyond the derived name variants, such as
   * `type`. Mustache renders a missing placeholder as empty, so each one must
   * arrive here.
   */
  readonly substitutions?: Substitutions;
  /**
   * Lowest conformance score this instance may have, from the instance group
   * that located it. The narrowest of the three levels, so it wins.
   */
  readonly threshold?: number;
}

/** A file a matched template requires its instance to have. */
export interface InstanceFile {
  readonly instance: MatchedInstance;
  readonly instanceFilePath: string;
  readonly templateFilePath: string;
}

/** An instance paired with the template that best explains it. */
export interface MatchedInstance {
  readonly instance: Instance;
  /** How many of the template's files the instance already has. */
  readonly matchedFileCount: number;
  /**
   * Random stand-ins for placeholders nothing supplied, keyed by placeholder.
   * Validation swaps each for the instance's own text there.
   */
  readonly placeholderValues?: Substitutions;
  /** Every value the template renders with, stand-ins included. */
  readonly substitutions: Substitutions;
  readonly template: TemplateDefinition;
}

/** Documents prepared for one matched instance. */
export interface PreparedInstanceDocuments {
  readonly documents: PreparedValidationDocument[];
  readonly instance: MatchedInstance;
}

/** Arguments for preparing comparison documents for matched instances. */
export interface PrepareDocumentsArguments {
  readonly fileExtensions: string[];
  readonly instances: MatchedInstance[];
}

/** The outcome of resolving a set of instances against a set of templates. */
export interface ResolvedInstances {
  readonly matched: MatchedInstance[];
  readonly unmatched: UnmatchedInstance[];
}

/**
 * Arguments for taking an inventory of templates and instances.
 *
 * Both filters narrow the pairing, so an entry that survives neither drops out.
 */
export interface ResolveInventoryArguments {
  readonly configuration: ConformetryConfiguration;
  /** Globs narrowing which instances count; the configured ones when absent. */
  readonly instancePatterns?: string[] | undefined;
  /** Template names narrowing which templates count; all of them when absent. */
  readonly templateNames?: string[] | undefined;
  readonly workingDirectory: string;
}

/**
 * One template weighed against an instance during matching.
 *
 * `matchRatio` measures fit by file presence alone, not conformance score.
 */
export interface TemplateMatch {
  readonly matchedFileCount: number;
  /** Share of the template's files the instance already has, 0 to 1. */
  readonly matchRatio: number;
  /** The stand-ins this template needed — see `MatchedInstance`. */
  readonly placeholderValues: Substitutions;
  /** The instance's substitutions with those stand-ins added. */
  readonly substitutions: Substitutions;
  readonly template: TemplateDefinition;
}

/** An instance no template explains well enough to validate against. */
export interface UnmatchedInstance {
  readonly instance: Instance;
  readonly reason: UnmatchedReason;
  /** Templates that tied, when the reason is `ambiguous`. */
  readonly tiedTemplateNames: string[];
}

/**
 * Why an instance went unmatched. Reported, not skipped: a glob asserts the
 * directory is an instance, so no match is a finding.
 */
export type UnmatchedReason = "ambiguous" | "no-match";
