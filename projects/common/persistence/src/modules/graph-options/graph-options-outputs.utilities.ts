// 🌎 Utilities

import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  GraphOptionsError,
  graphOutputDirectoryMessage,
  graphOutputExistsMessage,
  graphOutputParentMessage,
  graphOutputSameFileMessage,
} from "./graph-options.constants";

import type { GraphModel } from "../graph-mermaid/graph-mermaid.types";
import type {
  GraphOutputFile,
  GraphOutputRequest,
  GraphOutputs,
} from "./graph-options.types";

/** Dry-run lines naming each output file and whether it is created or replaced. */
export function graphOutputDryRunMessages(outputs: GraphOutputs): string[] {
  return graphOutputPaths(outputs).map(
    (file) =>
      `🔍 Planning to ${fs.existsSync(file) ? "overwrite" : "create"} ${file}`,
  );
}

/** The output files a run writes, in JSON then Markdown order, each absolute. */
export function graphOutputPaths(outputs: GraphOutputs): string[] {
  return [outputs.json, outputs.markdown].filter(
    (file): file is string => file !== undefined,
  );
}

/** The graph as pretty JSON that parses back to the same model, with a trailing newline. */
export function renderGraphJson(graph: GraphModel): string {
  return `${JSON.stringify(graph, null, 2)}\n`;
}

/**
 * Resolves output paths against the working directory and checks them before
 * connecting.
 * @throws GraphOptionsError naming the first output that cannot be written.
 */
export function resolveGraphOutputs({
  json,
  markdown,
  overwrite = false,
}: GraphOutputRequest): GraphOutputs {
  const outputs = {
    json: json === undefined ? undefined : path.resolve(json),
    markdown: markdown === undefined ? undefined : path.resolve(markdown),
    overwrite,
  };
  if (outputs.json !== undefined && outputs.json === outputs.markdown) {
    throw new GraphOptionsError(graphOutputSameFileMessage(outputs.json));
  }
  if (outputs.json !== undefined) {
    checkOutputFile("--output-json", outputs.json, overwrite);
  }
  if (outputs.markdown !== undefined) {
    checkOutputFile("--output-markdown", outputs.markdown, overwrite);
  }
  return outputs;
}

/**
 * Writes files through partials beside them, creating folders, so a failed
 * write leaves none behind. Without `overwrite`, refuses a file that now exists.
 */
export function writeGraphOutputs(
  files: readonly GraphOutputFile[],
  { overwrite }: { readonly overwrite: boolean },
): void {
  const partials = files.map((file) => ({
    ...file,
    partial: `${file.path}.${randomUUID()}.partial`,
  }));
  try {
    for (const { content, partial, path: file } of partials) {
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(partial, content, "utf8");
    }
    if (!overwrite) {
      for (const { path: file } of partials) {
        if (fs.existsSync(file)) {
          throw new GraphOptionsError(graphOutputExistsMessage(file));
        }
      }
    }
    for (const { partial, path: file } of partials) {
      fs.renameSync(partial, file);
    }
  } catch (error) {
    for (const { partial } of partials) {
      fs.rmSync(partial, { force: true });
    }
    throw error;
  }
}

/**
 * Refuses a directory, an existing file without `--overwrite`, and a parent
 * folder that cannot take a new file.
 */
function checkOutputFile(
  flag: "--output-json" | "--output-markdown",
  file: string,
  overwrite: boolean,
): void {
  if (fs.existsSync(file)) {
    if (fs.statSync(file).isDirectory()) {
      throw new GraphOptionsError(graphOutputDirectoryMessage(flag, file));
    }
    if (!overwrite) {
      throw new GraphOptionsError(graphOutputExistsMessage(file));
    }
  }
  const parent = nearestExistingFolder(path.dirname(file));
  if (!fs.statSync(parent).isDirectory() || !isWritable(parent)) {
    throw new GraphOptionsError(graphOutputParentMessage(flag, parent));
  }
}

/** Whether the process may write into `target`. */
function isWritable(target: string): boolean {
  try {
    fs.accessSync(target, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/** `folder`, or its nearest ancestor that exists; the filesystem root always does. */
function nearestExistingFolder(folder: string): string {
  let current = folder;
  while (!fs.existsSync(current)) {
    current = path.dirname(current);
  }
  return current;
}
