import { Injectable } from "@nestjs/common";

import {
  CONFORMETRY_ERROR_LANGUAGES,
  CONFORMETRY_ERROR_TYPES,
  DEFAULT_CONFORMETRY_ERROR_TYPE,
} from "./differences.constants";

import type {
  BuildMissingDirectoryErrorArguments,
  BuildMissingFileErrorArguments,
} from "./differences.types";
import type {
  ConformetryDifference,
  ConformetryDifferenceLanguage,
  ConformetryDifferenceType,
} from "@conformetry/core";

/**
 * Builds and narrows structured conformance differences.
 *
 * Every validator funnels through here, keeping error wording, the `fix`
 * suggestion, and locations consistent. The `resolve*` guards narrow untrusted
 * payloads, such as JSON from the Python bridge, whose fields may not match the types.
 */
@Injectable()
export class DifferencesService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Builds the error for a missing template directory.
   *
   * Carries no `language`, since a missing directory belongs to no file format.
   */
  public buildMissingDirectoryDifference(
    args: BuildMissingDirectoryErrorArguments,
  ): ConformetryDifference {
    return {
      differenceType: "directory",
      fix: `Create the directory ${args.instanceDirectoryPath} to match the template at ${args.templateDirectoryPath}.`,
      message: `Missing directory: ${args.instanceDirectoryPath}`,
    };
  }

  /**
   * Builds the error for a template file with no instance counterpart.
   *
   * Runs for every template file, whatever its extension.
   */
  public buildMissingFileDifference(
    args: BuildMissingFileErrorArguments,
  ): ConformetryDifference {
    return {
      differenceType: "file",
      fix: `Create the file using the generator, or manually from the template at ${args.templateFilePath}.`,
      message: `Missing file: ${args.instanceFilePath}`,
    };
  }

  /**
   * Narrows an untrusted value to a known error category, falling back to `"code"`.
   *
   * Falls back rather than failing the run.
   */
  public resolveDifferenceType(value: unknown): ConformetryDifferenceType {
    return (
      CONFORMETRY_ERROR_TYPES.find(
        (differenceType) => differenceType === value,
      ) ?? DEFAULT_CONFORMETRY_ERROR_TYPE
    );
  }

  /**
   * Narrows an untrusted value to a known error language, or `undefined`.
   *
   * Callers omit the field rather than store a bogus language.
   */
  public resolveErrorLanguage(
    value: unknown,
  ): ConformetryDifferenceLanguage | undefined {
    return CONFORMETRY_ERROR_LANGUAGES.find((language) => language === value);
  }
}
