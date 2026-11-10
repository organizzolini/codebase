import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { EXAMPLE_EMOJI, nextExample } from "./reading-order";

import type {
  ExampleDocument,
  ExampleFile,
  ExampleRunMode,
  ExampleRunOutcome,
} from "./types";

// 📄 Rendering

/**
 * Renders every document, writing it or reporting drift. `check` makes the quoted claims fail when behavior changes.
 */
export function deliverDocuments(args: {
  documents: ExampleDocument[];
  mode: ExampleRunMode;
  outputDirectory: string;
}): ExampleRunOutcome {
  const stalePaths: string[] = [];
  let writtenCount = 0;

  for (const document of args.documents) {
    for (const file of resolveFiles(document)) {
      const isCurrent = deliverFile({
        absolutePath: path.resolve(args.outputDirectory, file.relativePath),
        content: file.content,
        mode: args.mode,
      });

      writtenCount += 1;
      if (!isCurrent) stalePaths.push(file.relativePath);
    }
  }

  return { stalePaths, writtenCount };
}

/** Renders a fenced block, defaulting to a language the linter accepts. */
export function fence(body: string, language = "text"): string {
  return `\`\`\`${language}\n${body}\n\`\`\``;
}

/** Renders a value as a fenced JSON block. */
export function fenceJson(value: unknown): string {
  return fence(JSON.stringify(value, null, 2), "json");
}

/**
 * Renders one document as Markdown that `markdownlint` passes unfixed. The `## Run it` and `## Next`
 * sections are rendered, not authored.
 */
export function renderDocument(document: ExampleDocument): string {
  const emoji = EXAMPLE_EMOJI[document.id];
  const heading =
    emoji === undefined ? document.title : `${emoji} ${document.title}`;

  const lines = [
    `# ${heading}`,
    "",
    document.summary,
    "",
    "## Run it",
    "",
    fence("nx run codependix-examples:examples", "bash"),
    "",
    RUN_IT_NOTE,
  ];

  for (const section of document.sections) {
    lines.push("", `## ${section.heading}`, "", section.note, "", section.body);
  }

  lines.push("", "## Next", "", renderNext(document.id));

  return `${lines.join("\n").trimEnd()}\n`;
}

/**
 * Lists every file one document is committed as, Markdown first. Everything lands in that example's
 * own directory, beside its subject.
 */
export function resolveFiles(document: ExampleDocument): ExampleFile[] {
  return [
    {
      content: renderDocument(document),
      relativePath: path.join(document.id, "README.md"),
    },
    ...document.jsonExports.map((jsonExport) => ({
      content: jsonExport.content,
      relativePath: path.join(document.id, jsonExport.fileName),
    })),
  ];
}

/** What every guide says about the command above, rendered once. */
const RUN_IT_NOTE = [
  "Everything below is rendered from the subject in this directory by the real",
  "graph builders, so a claim that stops being true fails a check rather than",
  "misleading anybody. The command above fails if what is committed here has",
  "drifted; `:write` regenerates it.",
].join("\n");

/** Renders a Markdown table from a header row and its body rows. */
export function table(headers: string[], rows: string[][]): string {
  return [
    `| ${headers.join(" | ")} |`,
    `| ${headers.map((header) => "-".repeat(header.length)).join(" | ")} |`,
    ...rows.map((row) => `| ${row.join(" | ")} |`),
  ].join("\n");
}

// 💾 Delivery

/** Writes a file, or reports whether what is on disk already matches. */
function deliverFile(args: {
  absolutePath: string;
  content: string;
  mode: ExampleRunMode;
}): boolean {
  if (args.mode === "check") {
    return readFileOrEmpty(args.absolutePath) === args.content;
  }

  mkdirSync(path.dirname(args.absolutePath), { recursive: true });
  writeFileSync(args.absolutePath, args.content, "utf8");

  return true;
}

/** Reads a file's content, or an empty string when it does not exist yet. */
function readFileOrEmpty(filePath: string): string {
  try {
    return readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}

/** The `## Next` body: the following example, or the way back to the guide. */
function renderNext(id: string): string {
  const following = nextExample(id);

  return following === undefined
    ? "Nothing left — back to the [package guide](../../README.md)."
    : `[${following}](../${following}/README.md).`;
}
