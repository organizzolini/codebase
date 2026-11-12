import path from "node:path";

import { Injectable } from "@nestjs/common";

import type { RunLanguageValidatorArguments } from "./runner.types";
import type {
  ConformetryLanguageValidator,
  LanguageValidatorResult,
  PreparedValidationDocument,
  ValidationFileResult,
} from "@conformetry/core";

/**
 * Runs a language validator over a prepared document set.
 *
 * The shared envelope every language package used to reimplement: selects claimed documents, compares each, groups differences by file. Language packages supply only the comparison.
 */
@Injectable()
export class RunnerService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Returns whether a validator claims a document, by matching the instance
   * file's extension against the validator descriptor.
   */
  private claimsDocument(args: {
    document: PreparedValidationDocument;
    validator: ConformetryLanguageValidator;
  }): boolean {
    const extension = path.extname(args.document.filename);

    return args.validator.descriptor.fileExtensions.includes(extension);
  }

  /** Compares one document and keeps its findings with its requirement size. */
  private validateDocument(args: {
    document: PreparedValidationDocument;
    validator: ConformetryLanguageValidator;
  }): ValidationFileResult {
    const { differences, totalWeight } = args.validator.validateDocument(
      args.document,
    );

    return {
      differences,
      filename: args.document.filename,
      instanceFilePath: args.document.instanceFilePath,
      templateFilePath: args.document.templateFilePath,
      totalWeight,
    };
  }

  // 🌎 Public Methods

  /**
   * Collects the placeholder captures of every document, keyed by value.
   *
   * The first capture of a value wins.
   */
  public captureDocuments(args: {
    documents: PreparedValidationDocument[];
    validators: ConformetryLanguageValidator[];
  }): Record<string, string> {
    return args.documents.reduce<Record<string, string>>(
      (captures, document) => {
        const validator = args.validators.find((candidate) => {
          return this.claimsDocument({ document, validator: candidate });
        });

        return {
          ...validator?.validateDocument(document).captures,
          ...captures,
        };
      },
      {},
    );
  }

  /**
   * Compares the documents a validator claims and returns its aggregated result.
   *
   * Every claimed document adds weight; only failing files are kept.
   */
  public runValidator(
    args: RunLanguageValidatorArguments,
  ): LanguageValidatorResult {
    const documentResults = args.documents
      .filter((document) => {
        return this.claimsDocument({ document, validator: args.validator });
      })
      .map((document) => {
        return this.validateDocument({ document, validator: args.validator });
      });
    const fileResults = documentResults.filter((fileResult) => {
      return fileResult.differences.length > 0;
    });

    return {
      checkedPaths: args.checkedPaths,
      fileResults,
      languageName: args.validator.descriptor.name,
      ok: fileResults.length === 0,
      totalWeight: documentResults.reduce((total, fileResult) => {
        return total + fileResult.totalWeight;
      }, 0),
    };
  }
}
