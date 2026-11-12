import { existsSync } from "node:fs";
import path from "node:path";

import {
  DEFAULT_JSON_INDENTATION,
  DEFAULT_MARKDOWN_END_MARKER,
  DEFAULT_MARKDOWN_START_MARKER,
  REPOSITORY_ROOT_MARKERS,
} from "@codometer/configuration";
import { Injectable } from "@nestjs/common";

import type { MeasurementScope } from "../markdown/markdown.types";
import type {
  ListOutputPathsArguments,
  ResolveDestinationsArguments,
  ResolveDestinationsResult,
  ResolvedJsonDestination,
  ResolvedMarkdownDestination,
  RunDestinations,
} from "./destinations.types";
import type { ResolvedCodometerOutput } from "@codometer/configuration";

/**
 * Resolves which file each of a run's outputs lands in. Kept apart from the command so it can be tested without a measurement.
 */
@Injectable()
export class DestinationsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Finds the first output of the given type, if the configuration named one. */
  private findConfiguredOutput<Type extends ResolvedCodometerOutput["type"]>(
    outputs: readonly ResolvedCodometerOutput[],
    type: Type,
  ): Extract<ResolvedCodometerOutput, { type: Type }> | undefined {
    return outputs.find(
      (output): output is Extract<ResolvedCodometerOutput, { type: Type }> =>
        output.type === type,
    );
  }

  /** Where the report goes, if this run resolves that destination at all. */
  private resolveJson(
    args: ResolveDestinationsArguments,
    named: boolean,
    errors: string[],
  ): ResolvedJsonDestination | undefined {
    const { outputJson } = args.options;

    if (named && outputJson === undefined) {
      return undefined;
    }

    const configured = this.findConfiguredOutput(
      args.configuration.outputs,
      "json",
    );

    if (typeof outputJson === "string") {
      return {
        custom: configured?.custom ?? [],
        indentation: configured?.indentation ?? DEFAULT_JSON_INDENTATION,
        path: path.resolve(args.workingDirectory, outputJson),
      };
    }

    if (configured === undefined) {
      // `outputJson === true` is a bare flag, asking this run to write the
      // report wherever the configuration says to — refused when nothing
      // does, since there is then nowhere to put it. `undefined` with
      // nothing configured either is simply not part of this run.
      if (outputJson === true) {
        errors.push(
          `--output-json needs a path, or a "json" entry in the configuration's "outputs" to resolve one from: neither was found, so there is nowhere to write it. Pass --output-json <path>, or declare a "json" output.`,
        );
      }

      return undefined;
    }

    return {
      custom: configured.custom,
      indentation: configured.indentation,
      path: path.resolve(args.workingDirectory, configured.path),
    };
  }

  /**
   * Which markdown file the badge block goes into, if any. The path comes from the command line or a configured `markdown` output.
   */
  private resolveMarkdown(
    args: ResolveDestinationsArguments,
    named: boolean,
    errors: string[],
  ): ResolvedMarkdownDestination | undefined {
    const { outputMarkdown } = args.options;

    if (named && outputMarkdown === undefined) {
      return undefined;
    }

    const configured = this.findConfiguredOutput(
      args.configuration.outputs,
      "markdown",
    );

    if (typeof outputMarkdown === "string") {
      return {
        custom: configured?.custom ?? [],
        description: configured?.description,
        endMarker: configured?.endMarker ?? DEFAULT_MARKDOWN_END_MARKER,
        path: this.resolvePath(args.workingDirectory, outputMarkdown),
        startMarker: configured?.startMarker ?? DEFAULT_MARKDOWN_START_MARKER,
        type: "markdown",
        write: configured?.write,
      };
    }

    if (configured === undefined) {
      // `outputMarkdown === true` is a bare flag, refused when the
      // configuration names no markdown output at all — there is then
      // neither a path nor a `write` function to resolve a destination from.
      // `undefined` with nothing configured either is simply not part of
      // this run.
      if (outputMarkdown === true) {
        errors.push(
          `--output-markdown needs a path, or a "markdown" entry in the configuration's "outputs" to resolve one from: neither was found, so there is nowhere to write it. Pass --output-markdown <path>, or declare a "markdown" output.`,
        );
      }

      return undefined;
    }

    return {
      custom: configured.custom,
      description: configured.description,
      endMarker: configured.endMarker,
      path: this.resolvePath(args.workingDirectory, configured.path),
      startMarker: configured.startMarker,
      type: "markdown",
      write: configured.write,
    };
  }

  /** Turns a written destination path into an absolute one. */
  private resolvePath(
    workingDirectory: string,
    destinationPath: string | undefined,
  ): string | undefined {
    return destinationPath === undefined
      ? undefined
      : path.resolve(workingDirectory, destinationPath);
  }

  // 🌎 Public Methods

  /**
   * Lists the files this run writes, relative to the measured directory. These are also excluded from measurement.
   */
  listOutputPaths(args: ListOutputPathsArguments): string[] {
    const paths = [
      args.destinations.json?.path,
      args.destinations.markdown?.path,
    ];

    return paths
      .filter((destinationPath) => destinationPath !== undefined)
      .map((destinationPath) =>
        path
          .relative(args.workingDirectory, destinationPath)
          .split(path.sep)
          .join("/"),
      );
  }

  /**
   * Which markdown destination the console renders. Resolved from configuration alone, so every custom counter prints; an explicit `--output-markdown` path is still honored.
   */
  resolveConsoleMarkdown(
    args: ResolveDestinationsArguments,
  ): ResolvedMarkdownDestination | undefined {
    return this.resolveMarkdown(args, false, []);
  }

  /**
   * Resolves the files this run writes, refusing a bare `--output-*` flag when the configuration names no matching output.
   */
  resolveDestinations(
    args: ResolveDestinationsArguments,
  ): ResolveDestinationsResult {
    const named =
      args.options.outputJson !== undefined ||
      args.options.outputMarkdown !== undefined;
    const errors: string[] = [];
    const destinations: RunDestinations = {
      json: this.resolveJson(args, named, errors),
      markdown: this.resolveMarkdown(args, named, errors),
    };

    return { destinations, errors };
  }

  /**
   * Whether a run covers a whole repository or one project. Decided from the measured directory alone, by marker files, never by walking upward.
   */
  selectScope(workingDirectory: string): MeasurementScope {
    const isRepository = REPOSITORY_ROOT_MARKERS.some((marker) =>
      existsSync(path.join(workingDirectory, marker)),
    );

    return isRepository ? "repository" : "project";
  }
}
