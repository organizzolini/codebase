import path from "node:path";

import { ConfigurationService } from "@conformetry/configuration";
import { Injectable } from "@nestjs/common";

import { PROJECT_INPUT_NAME } from "../paths/paths.constants";
import { ScopeService } from "../scope/scope.service";

import {
  GENERATED_FILE_NOTICE,
  GENERATORS_SCHEMA_PATH,
  JSON_INDENT,
} from "./generator.constants";

import type { ProjectScope } from "../instances/instances.types";
import type { EmitPluginArguments, EmittedFile } from "./generator.types";
import type { ConformetryGeneratorDefinition } from "@conformetry/configuration";

/**
 * Derives an Nx generator plugin from the conformetry configuration.
 *
 * Emits the `generators.json`, factories, and schemas that Nx needs, so none are hand-maintained. `nx sync:check` keeps them honest.
 */
@Injectable()
export class GeneratorService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly scopeService: ScopeService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Builds the module Nx calls into for one generator.
   *
   * One file per generator, since Nx does not pass a generator its own name.
   */
  private buildGeneratorModule(
    definition: ConformetryGeneratorDefinition,
  ): string {
    return [
      GENERATED_FILE_NOTICE,
      "",
      'import { runConformetryGenerator } from "@conformetry/nx";',
      "",
      'import type { Tree } from "@nx/devkit";',
      "",
      "/**",
      ` * Runs the \`${definition.name}\` conformetry generator.`,
      " */",
      "export async function generate(",
      "  tree: Tree,",
      "  options?: Record<string, unknown>,",
      "): Promise<void> {",
      "  await runConformetryGenerator({",
      `    generatorName: "${definition.name}",`,
      "    ...(options === undefined ? {} : { options }),",
      "    tree,",
      "  });",
      "}",
      "",
    ].join("\n");
  }

  /**
   * Builds the `generators.json` Nx reads.
   *
   * Schema paths stay inside the emitted plugin, so they resolve wherever it is installed.
   */
  private buildGeneratorsManifest(args: {
    definitions: ConformetryGeneratorDefinition[];
    outputPath: string;
  }): string {
    const generators: Record<string, unknown> = {};

    for (const definition of args.definitions) {
      generators[definition.name] = {
        ...(definition.description === undefined
          ? {}
          : { description: definition.description }),
        factory: `./src/generators/${definition.name}#generate`,
        schema: `./src/schemas/${definition.name}.json`,
      };
    }

    return this.stringify({
      // Relative to wherever the plugin was emitted, not a fixed number of
      // levels up: the output path is configurable, and a `..` count that only
      // works two directories deep is how the previous hand-written manifest
      // ended up pointing at nothing.
      $schema: path
        .relative(args.outputPath, GENERATORS_SCHEMA_PATH)
        .split(path.sep)
        .join("/"),
      generators,
    });
  }

  /**
   * Builds one generator's JSON schema from its configured inputs.
   *
   * Every input is required, since mustache would otherwise render a missing one as empty.
   */
  private buildSchema(args: {
    definition: ConformetryGeneratorDefinition;
    scopedProjectNames: string[] | undefined;
  }): string {
    return this.stringify({
      $schema: "http://json-schema.org/schema",
      ...(args.definition.description === undefined
        ? {}
        : { description: args.definition.description }),
      properties: this.buildSchemaProperties(args),
      required: Object.keys(args.definition.inputs),
      title: args.definition.name,
      type: "object",
    });
  }

  /**
   * Builds the properties, narrowing the project input to the scope.
   *
   * Left alone when no scope applies: an empty `enum` would read as broken.
   */
  private buildSchemaProperties(args: {
    definition: ConformetryGeneratorDefinition;
    scopedProjectNames: string[] | undefined;
  }): Record<string, unknown> {
    const projectInput = args.definition.inputs[PROJECT_INPUT_NAME];

    if (
      projectInput === undefined ||
      args.scopedProjectNames === undefined ||
      args.scopedProjectNames.length === 0
    ) {
      return args.definition.inputs;
    }

    return {
      ...args.definition.inputs,
      [PROJECT_INPUT_NAME]: {
        ...projectInput,
        enum: args.scopedProjectNames,
        "x-prompt": {
          items: args.scopedProjectNames,
          message: `Which project should this ${args.definition.name} go in?`,
          type: "list",
        },
      },
    };
  }

  /**
   * The projects a generator's tagged groups admit, or nothing when it has
   * none.
   */
  private resolveScopedProjectNames(args: {
    definition: ConformetryGeneratorDefinition;
    projects: readonly ProjectScope[] | undefined;
  }): string[] | undefined {
    if (args.projects === undefined) {
      return undefined;
    }

    const scopedProjectNames = this.scopeService.resolveScopedProjectNames({
      groups: args.definition.instances,
      projects: [...args.projects],
    });

    // No tagged group means the generator says nothing about where it belongs,
    // so the prompt is left alone rather than emptied.
    return scopedProjectNames.length === 0 ? undefined : scopedProjectNames;
  }

  /** Serializes emitted JSON the way the workspace formatter would. */
  private stringify(value: unknown): string {
    return `${JSON.stringify(value, undefined, JSON_INDENT)}\n`;
  }

  // 🌎 Public Methods

  /**
   * Returns every file the consumer's generator plugin consists of.
   *
   * Pure with respect to disk; the caller writes them through a `Tree`.
   */
  public async emitPlugin(args: EmitPluginArguments): Promise<EmittedFile[]> {
    const configuration =
      await this.configurationService.loadConformetryConfiguration(
        args.configurationPath,
      );
    const definitions = configuration.toSorted((left, right) => {
      return left.name.localeCompare(right.name);
    });

    return [
      {
        content: this.buildGeneratorsManifest({
          definitions,
          outputPath: args.outputPath,
        }),
        filePath: path.join(args.outputPath, "generators.json"),
      },
      ...definitions.map((definition) => {
        return {
          content: this.buildGeneratorModule(definition),
          filePath: path.join(
            args.outputPath,
            `src/generators/${definition.name}.ts`,
          ),
        };
      }),
      ...definitions.map((definition) => {
        return {
          content: this.buildSchema({
            definition,
            scopedProjectNames: this.resolveScopedProjectNames({
              definition,
              projects: args.projects,
            }),
          }),
          filePath: path.join(
            args.outputPath,
            `src/schemas/${definition.name}.json`,
          ),
        };
      }),
      {
        // The wrappers import the plugin at runtime, so the emitted package
        // has to declare it — otherwise `nx g` resolves the factory and then
        // fails inside it, which reads as a broken generator rather than a
        // missing install.
        content: this.stringify({
          dependencies: {
            "@conformetry/nx": "workspace:*",
            "@nx/devkit": "catalog:",
          },
          generators: "./generators.json",
          name: args.packageName,
          nx: { generators: "./generators.json" },
          private: true,
          type: "module",
          version: "0.0.1",
        }),
        filePath: path.join(args.outputPath, "package.json"),
      },
    ];
  }
}
