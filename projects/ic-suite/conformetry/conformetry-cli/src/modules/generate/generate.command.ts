import path from "node:path";

import {
  ConfigurationService,
  InputError,
  missingDirectoryError,
} from "@conformetry/configuration";
import { GenerationService } from "@conformetry/generation";
import { Injectable } from "@nestjs/common";
import { Command, CommandRunner, Option } from "nest-commander";

import { LoggerService } from "@codebase/observability";

import {
  CONFIGURATION_FLAG_SURFACE,
  removedGeneratorOptionError,
  unknownTemplateError,
} from "../../conformetry-cli.constants.js";

import { missingTemplateError } from "./generate.constants";

import type { GenerateCommandOptions } from "./generate.types";
import type {
  ConformetryConfiguration,
  JsonSchemaDefinition,
} from "@conformetry/configuration";

/**
 * Renders a conformetry template into a directory.
 *
 * Unknown options pass through, since a template's parameters are known only once it is chosen.
 * `--template` is used rather than `--name`, because most templates take a `name` parameter.
 */
@Command({
  allowUnknownOptions: true,
  description: "Render a template into a new instance",
  name: "generate",
})
@Injectable()
export class GenerateCommand extends CommandRunner {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly generationService: GenerationService,
    private readonly logger: LoggerService,
  ) {
    super();
    this.logger.setContext(GenerateCommand.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Resolves the template's inputs and writes its files. */
  private async generate(
    passedParameters: readonly string[],
    options: GenerateCommandOptions,
  ): Promise<void> {
    const rawArguments = [...passedParameters, ...process.argv.slice(2)];

    this.rejectRemovedGeneratorOption(rawArguments);

    const configurationPath =
      await this.configurationService.resolveConfigurationPath(options.config);
    const configuration =
      await this.configurationService.loadConformetryConfiguration(
        configurationPath,
      );
    const templateName = await this.resolveTemplateName({
      configuration,
      templateName: options.template,
    });

    this.logger.debug("🏗 Generating a conformetry instance", undefined, {
      template: templateName,
    });

    const definition = this.requireDefinition(configuration, templateName);

    const directory = this.requireDirectory(options, definition.name);

    // Every input is required: mustache renders a missing placeholder as empty
    // rather than failing, so an optional input would silently leave a hole.
    const schema: JsonSchemaDefinition = {
      properties: definition.inputs,
      required: Object.keys(definition.inputs),
    };
    const inputs = await this.configurationService.resolveGeneratorInputs({
      rawArguments,
      schema,
    });

    const result = await this.generationService.runGenerator({
      configurationDirectoryPath: path.dirname(configurationPath),
      definition: {
        // Forwarded only when declared, so a generator with none reaches the
        // runtime exactly as it did before hooks existed.
        ...(definition.hooks === undefined ? {} : { hooks: definition.hooks }),
        name: definition.name,
        templateDirectoryPath: definition.templatePath,
      },
      inputs,
      instancePath: directory,
    });

    // The file list is what the caller asked for, so it goes to stdout; the
    // log line carries the same facts as data a telemetry backend can group.
    process.stdout.write(
      `${result.generatedFilePaths.map((filePath) => `  ${filePath}`).join("\n")}\n`,
    );
    this.logger.info("✨ Generated instance files", undefined, {
      count: result.generatedFilePaths.length,
      outputDirectoryPath: result.outputDirectoryPath,
    });
  }

  /**
   * Logs a refused command line and fails the run, rather than crashing on it.
   */
  private rejectCommandLine(error: InputError): void {
    this.logger.error("🚫 Rejected the command line", undefined, {
      reason: error.message,
    });
    process.exitCode = 1;
  }

  /**
   * Refuses the removed `--generator` flag, since ignoring it would silently drop input.
   */
  private rejectRemovedGeneratorOption(rawArguments: readonly string[]): void {
    const isRemovedOption = rawArguments.some((argument) => {
      return argument === "--generator" || argument.startsWith("--generator=");
    });

    if (isRemovedOption) {
      this.logger.error("🚫 Rejected a removed option", undefined, {
        option: "--generator",
      });
      throw removedGeneratorOptionError();
    }
  }

  /** The configured template of that name, or a refusal listing the real ones. */
  private requireDefinition(
    configuration: ConformetryConfiguration,
    templateName: string,
  ): ConformetryConfiguration[number] {
    const definition = configuration.find((generator) => {
      return generator.name === templateName;
    });

    if (definition === undefined) {
      this.logger.error("🚫 Rejected an unknown template", undefined, {
        template: templateName,
      });
      throw unknownTemplateError({
        availableTemplateNames: configuration.map(
          (generator) => generator.name,
        ),
        templateName,
      });
    }

    return definition;
  }

  /**
   * The directory to write into, or a refusal when none was named.
   *
   * Checked before any input is asked for.
   */
  private requireDirectory(
    options: GenerateCommandOptions,
    templateName: string,
  ): string {
    if (options.directory === undefined) {
      this.logger.error("🚫 Rejected a run with no directory", undefined, {
        template: templateName,
      });
      throw missingDirectoryError({ generatorName: templateName });
    }

    return options.directory;
  }

  /**
   * Settles which template to render, or none.
   *
   * Prompts only at a terminal: a non-terminal stdin once hung a CI job.
   */
  private async resolveTemplateName(args: {
    configuration: ConformetryConfiguration;
    templateName: string | undefined;
  }): Promise<string> {
    if (args.templateName !== undefined) {
      return args.templateName;
    }

    const availableNames = args.configuration.map((generator) => {
      return generator.name;
    });

    if (!this.configurationService.isAtTerminal()) {
      throw missingTemplateError(availableNames);
    }

    // The loaded configuration is handed over as-is: a definition already
    // carries the name and description a choice needs, and mapping it here
    // would be a second source the picker could disagree with.
    const chosenName = await this.configurationService.promptForTemplate(
      args.configuration,
    );

    if (chosenName === undefined) {
      throw missingTemplateError(availableNames);
    }

    return chosenName;
  }

  // 🌎 Public Methods

  /** Parses the required configuration path. */
  @Option({
    description: "Path to the conformetry configuration file",
    flags: "--config <path>",
    required: true,
  })
  public parseConfig(value: string | undefined): string {
    return this.configurationService.requireConfigurationPath(
      value,
      CONFIGURATION_FLAG_SURFACE,
    );
  }

  /** Parses the output directory override. */
  @Option({
    description: "Directory to write generated files into",
    flags: "--directory [path]",
  })
  public parseDirectory(value: string | undefined): string | undefined {
    return this.configurationService.parseOptionalOption(value);
  }

  /**
   * Parses the name of the template to render.
   *
   * Optional, so a bare `generate` reaches the picker.
   */
  @Option({
    description: "Name of the template to render",
    flags: "--template [name]",
  })
  public parseTemplate(value: string | undefined): string | undefined {
    return this.configurationService.parseOptionalOption(value);
  }

  /**
   * Renders the template, reporting a refused command line as one.
   *
   * Only an `InputError` is caught; other failures keep their stack.
   */
  public async run(
    passedParameters: string[],
    options: GenerateCommandOptions,
  ): Promise<void> {
    try {
      await this.generate(passedParameters, options);
    } catch (error) {
      if (!(error instanceof InputError)) {
        throw error;
      }

      this.rejectCommandLine(error);
    }
  }
}
