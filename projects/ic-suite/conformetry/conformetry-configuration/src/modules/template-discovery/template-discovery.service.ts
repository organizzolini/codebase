import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";

import { RenderingService } from "../rendering/rendering.service";

import type { ConformetryConfiguration } from "../configuration/configuration.types";
import type { Substitutions } from "../rendering/rendering.types";
import type { TemplateDefinition } from "./template-discovery.types";
import type { PreparedValidationDocument } from "@conformetry/core";

/**
 * Reads template folders and maps their files onto instance files.
 *
 * A template's tree is laid over the instance path verbatim, so a template creates a folder by containing it.
 * Rendering goes through `RenderingService` so validation substitutes exactly as generation did.
 */
@Injectable()
export class TemplateDiscoveryService {
  // 🏗 Dependency Injection

  constructor(private readonly renderingService: RenderingService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Lists every file under a directory, recursively and sorted. */
  private collectFilePaths(directoryPath: string): string[] {
    if (!fs.existsSync(directoryPath)) {
      return [];
    }

    const filePaths: string[] = [];
    const pendingDirectoryPaths = [directoryPath];

    while (pendingDirectoryPaths.length > 0) {
      const currentDirectoryPath = pendingDirectoryPaths.pop();

      if (currentDirectoryPath === undefined) {
        continue;
      }

      for (const entry of fs.readdirSync(currentDirectoryPath, {
        withFileTypes: true,
      })) {
        const entryPath = path.join(currentDirectoryPath, entry.name);

        if (entry.isDirectory()) {
          pendingDirectoryPaths.push(entryPath);
        } else if (entry.isFile()) {
          filePaths.push(entryPath);
        }
      }
    }

    return filePaths.toSorted();
  }

  /** Every placeholder a template's file contents and paths interpolate. */
  private collectPlaceholderNames(args: {
    directoryPath: string;
    filePaths: string[];
  }): string[] {
    return [
      ...new Set(
        args.filePaths.flatMap((filePath) => {
          return [
            path.relative(args.directoryPath, filePath),
            fs.readFileSync(filePath, "utf8"),
          ].flatMap((template) => {
            return this.renderingService.collectInterpolatedNames(template);
          });
        }),
      ),
    ];
  }

  // 🌎 Public Methods

  /**
   * Reads one template folder.
   *
   * The folder is the whole definition — nothing but the files it contains is
   * needed to validate against it.
   */
  public collectTemplate(args: {
    name: string;
    templatePath: string;
    threshold?: number | undefined;
  }): TemplateDefinition {
    const filePaths = this.collectFilePaths(args.templatePath);

    return {
      directoryPath: args.templatePath,
      filePaths,
      name: args.name,
      placeholderNames: this.collectPlaceholderNames({
        directoryPath: args.templatePath,
        filePaths,
      }),
      ...(args.threshold === undefined ? {} : { threshold: args.threshold }),
    };
  }

  /**
   * Reads every configured generator's template folder, resolving each path once.
   */
  public collectTemplates(args: {
    configuration: ConformetryConfiguration;
    workingDirectory: string;
  }): TemplateDefinition[] {
    return args.configuration.map((generator) => {
      return this.collectTemplate({
        name: generator.name,
        templatePath: path.resolve(
          args.workingDirectory,
          generator.templatePath,
        ),
        threshold: generator.threshold,
      });
    });
  }

  /**
   * Counts how many of a template's files the instance path already has.
   *
   * A file scope limits the count to the files it lists.
   */
  public countMatchingFiles(args: {
    fileScope?: string[] | undefined;
    instancePath: string;
    substitutions: Substitutions;
    template: TemplateDefinition;
  }): number {
    const scope =
      args.fileScope === undefined ? undefined : new Set(args.fileScope);

    return args.template.filePaths.filter((templateFilePath) => {
      const instanceFilePath = this.resolveInstanceFilePath({
        instancePath: args.instancePath,
        substitutions: args.substitutions,
        templateDirectoryPath: args.template.directoryPath,
        templateFilePath,
      });

      if (scope !== undefined && !scope.has(instanceFilePath)) {
        return false;
      }

      return fs.existsSync(instanceFilePath);
    }).length;
  }

  /**
   * Pairs one template file with its instance, rendering the template.
   *
   * Returns `undefined` when the instance is missing, which the file-existence pass reports instead.
   */
  public prepareDocument(args: {
    instancePath: string;
    substitutions: Substitutions;
    templateDirectoryPath: string;
    templateFilePath: string;
  }): PreparedValidationDocument | undefined {
    const instanceFilePath = this.resolveInstanceFilePath(args);

    if (!fs.existsSync(instanceFilePath)) {
      return undefined;
    }

    return {
      filename: path.basename(instanceFilePath),
      instance: fs.readFileSync(instanceFilePath, "utf8"),
      instanceFilePath,
      renderedTemplate: this.renderingService.renderContent({
        subject: args.templateFilePath,
        substitutions: args.substitutions,
        templateContent: fs.readFileSync(args.templateFilePath, "utf8"),
      }),
      templateFilePath: args.templateFilePath,
    };
  }

  /** Maps a template file path to the instance file path it governs. */
  public resolveInstanceFilePath(args: {
    instancePath: string;
    substitutions: Substitutions;
    templateDirectoryPath: string;
    templateFilePath: string;
  }): string {
    return path.join(
      args.instancePath,
      this.renderingService.renderPath({
        subject: args.templateFilePath,
        substitutions: args.substitutions,
        templatePath: path.relative(
          args.templateDirectoryPath,
          args.templateFilePath,
        ),
      }),
    );
  }
}
