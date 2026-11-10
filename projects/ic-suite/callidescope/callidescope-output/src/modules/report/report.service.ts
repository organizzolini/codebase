import { Injectable } from "@nestjs/common";

import {
  COLLAPSED_PARAMETERS,
  DEPRECATED_MARKER,
  ENTRY_FRAME_PREFIX,
  NESTED_FRAME_PREFIX,
  SENTENCE_END_PATTERN,
  SIGNATURE_LIMIT,
  SUMMARY_LIMIT,
  SUMMARY_PREFIX,
  TRUNCATION_SUFFIX,
} from "./report.constants";

import type { StackFrame } from "@callidescope/core";

/**
 * Renders one call stack as an indented tree.
 *
 * Plain text rather than a markdown list, because the indentation is the thing
 * that makes a stack readable and a list would have every renderer reflow it.
 * Whatever embeds this is responsible for putting it in a fence.
 */
@Injectable()
export class ReportService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Reads a summary's opening sentence, when it has more than one. */
  private readFirstSentence(summary: string): string | undefined {
    const match = SENTENCE_END_PATTERN.exec(summary);

    return match === null ? undefined : summary.slice(0, match.index + 1);
  }

  /** Renders one frame at its indentation, with whatever it says about itself. */
  private renderFrame(args: { depth: number; frame: StackFrame }): string {
    const indent = "  ".repeat(args.depth);
    const prefix = args.depth === 0 ? ENTRY_FRAME_PREFIX : NESTED_FRAME_PREFIX;
    const { filePath, line } = args.frame.location;
    const head = `${indent}${prefix} ${args.frame.displayName}${this.renderSignature(args.frame)}${this.renderMarkers(args.frame)} [${filePath}:${String(line)}]`;
    const summary = args.frame.documentation?.summary ?? "";

    return summary.length === 0
      ? head
      : `${head}\n${indent}   ${SUMMARY_PREFIX} ${this.shortenSummary(summary)}`;
  }

  /** Renders what a frame warns about: that it recurses, that it is on its way out. */
  private renderMarkers(frame: StackFrame): string {
    const cycle = frame.isCycle ? " (cycle)" : "";

    return (frame.documentation?.isDeprecated ?? false)
      ? `${cycle} ${DEPRECATED_MARKER}`
      : cycle;
  }

  /**
   * Renders a callable's signature, collapsing a long one while keeping the return type.
   */
  private renderSignature(frame: StackFrame): string {
    const { signature } = frame;

    if (signature === undefined) {
      return "()";
    }

    return signature.text.length <= SIGNATURE_LIMIT
      ? signature.text
      : `${COLLAPSED_PARAMETERS}: ${signature.returnType}`;
  }

  /**
   * Shortens a summary to fit an indented frame, keeping the opening sentence whole, or
   * cutting on a word and marking it.
   */
  private shortenSummary(summary: string): string {
    if (summary.length <= SUMMARY_LIMIT) {
      return summary;
    }

    const sentence = this.readFirstSentence(summary);

    if (sentence !== undefined && sentence.length <= SUMMARY_LIMIT) {
      return sentence;
    }

    const clipped = summary.slice(0, SUMMARY_LIMIT);
    const lastSpace = clipped.lastIndexOf(" ");
    const kept = lastSpace === -1 ? clipped : clipped.slice(0, lastSpace);

    return `${kept.trimEnd()}${TRUNCATION_SUFFIX}`;
  }

  // 🌎 Public Methods

  /**
   * Renders every frame of a stack, entry point first, from anything holding a frame list, not only
   * a full `CallStack`.
   */
  public renderStackTree(stack: { frames: readonly StackFrame[] }): string {
    return stack.frames
      .map((frame, depth) => this.renderFrame({ depth, frame }))
      .join("\n");
  }
}
