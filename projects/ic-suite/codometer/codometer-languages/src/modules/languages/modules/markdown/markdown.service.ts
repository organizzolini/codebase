import { readFileSync } from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { remark } from "remark";
import remarkFrontmatter from "remark-frontmatter";
import remarkGfm from "remark-gfm";

import { LoggerService } from "@codebase/observability";

import { EMPTY_MARKDOWN_RESULT, NODE_COUNTER_KEYS } from "./markdown.constants";

import type { MarkdownInput, MarkdownResult } from "./markdown.types";
import type { Heading, ListItem, Nodes } from "mdast";

/* v8 ignore start -- the decorator helper emits a branch no test can reach */
/**
 * Walks parsed markdown documents to collect structural metrics. Comparison is structural, so a heading counts only when the parser agrees. Frontmatter parses as its own node, or `---` reads as a heading.
 */
@Injectable()
/* v8 ignore stop */
export class MarkdownService {
  // 🏗 Dependency Injection

  constructor(private readonly logger: LoggerService) {
    this.logger.setContext(MarkdownService.name);
  }

  // 🔐 Private Fields

  private readonly processor = remark()
    .use(remarkGfm)
    .use(remarkFrontmatter, ["yaml", "toml"]);

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Records a heading against the field for its depth. */
  private countHeading(node: Heading, result: MarkdownResult): void {
    // mdast types `depth` as 1-6, so the template literal resolves to exactly
    // the six heading fields. No lookup, and therefore no unreachable miss.
    result[`headingLevel${node.depth}`]++;
  }

  /** Records a list item, separating GFM checkboxes from plain bullets. */
  private countListItem(node: ListItem, result: MarkdownResult): void {
    result.listItems++;

    if (typeof node.checked === "boolean") {
      result.taskListItems++;
    }
  }

  /** Records a single node against the running totals. */
  private countNode(node: Nodes, result: MarkdownResult): void {
    if (node.type === "heading") {
      this.countHeading(node, result);
      return;
    }

    if (node.type === "listItem") {
      this.countListItem(node, result);
      return;
    }

    const key = NODE_COUNTER_KEYS[node.type];

    if (key !== undefined) {
      result[key]++;
    }
  }

  /** Walks every node in a parsed document. */
  private walk(node: Nodes, result: MarkdownResult): void {
    this.countNode(node, result);

    // `in` narrows the union to the parent node types, so the recursion is
    // typed all the way down without a cast.
    if (!("children" in node)) {
      return;
    }

    for (const child of node.children) {
      this.walk(child, result);
    }
  }

  // 🌎 Public Methods

  /** Analyze the given markdown files, resolved against the directory. */
  analyze({ markdownFiles, workingDirectory }: MarkdownInput): MarkdownResult {
    const contents: string[] = [];

    for (const filePath of markdownFiles) {
      try {
        contents.push(
          readFileSync(path.resolve(workingDirectory, filePath), "utf8"),
        );
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        this.logger.warn("📝 Skipped markdown analysis", undefined, {
          filePath,
          reason: message,
        });
        continue;
      }
    }

    return this.analyzeContents(contents);
  }

  /**
   * Analyzes markdown source text with no file of its own, such as a notebook's markdown cells. Re-parsing elsewhere would duplicate this counting.
   */
  analyzeContents(contents: string[]): MarkdownResult {
    const result: MarkdownResult = { ...EMPTY_MARKDOWN_RESULT };

    for (const content of contents) {
      const tree = this.processor.parse(content);

      result.files++;
      result.lines += content.split("\n").length;

      for (const child of tree.children) {
        this.walk(child, result);
      }
    }

    return result;
  }
}
