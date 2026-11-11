import { Injectable } from "@nestjs/common";
import {
  getLeadingCommentRanges,
  type Node,
  type SourceFile,
} from "typescript";

import { TODO_COMMENT_PATTERN } from "./typescript.constants";

import type {
  CommentComparison,
  CompareCommentsArguments,
  ExtractedComment,
} from "./typescript.types";

/**
 * Checks that a file carries the comments its template requires, in order.
 *
 * Order matters for section marker comments, so matching is a subsequence check,
 * not a set check.
 */
@Injectable()
export class TypescriptCommentsService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Reports each template comment absent from the instance, or out of order.
   *
   * Every template comment is one requirement, whatever its length.
   */
  public compareComments(args: CompareCommentsArguments): CommentComparison {
    const instanceComments = this.extractComments(args.instanceSourceFile);
    const templateComments = this.extractComments(args.templateSourceFile);
    const missingComments: ExtractedComment[] = [];
    let searchIndex = 0;

    for (const templateComment of templateComments) {
      const isPlaceholder = TODO_COMMENT_PATTERN.test(templateComment.text);
      const relativeIndex = instanceComments
        .slice(searchIndex)
        .findIndex((instanceComment) => {
          return isPlaceholder || instanceComment.text === templateComment.text;
        });

      if (relativeIndex === -1) {
        missingComments.push(templateComment);
        continue;
      }

      searchIndex += relativeIndex + 1;
    }

    return { missingComments, totalWeight: templateComments.length };
  }

  /**
   * Collects every comment in a source file, in source order.
   *
   * Reads the trivia before each token, so no comment is missed.
   */
  public extractComments(sourceFile: SourceFile): ExtractedComment[] {
    const commentsByPosition = new Map<number, ExtractedComment>();

    const visit = (node: Node): void => {
      const children = node.getChildren(sourceFile);

      if (children.length === 0) {
        for (const range of getLeadingCommentRanges(
          sourceFile.text,
          node.getFullStart(),
        ) ?? []) {
          commentsByPosition.set(range.pos, {
            position: range.pos,
            text: sourceFile.text.slice(range.pos, range.end).trim(),
          });
        }

        return;
      }

      for (const child of children) {
        visit(child);
      }
    };

    visit(sourceFile);

    return [...commentsByPosition.values()].toSorted(
      (leftComment, rightComment) => {
        return leftComment.position - rightComment.position;
      },
    );
  }
}
