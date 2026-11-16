import fs from "node:fs";
import path from "node:path";

import { onTestFinished } from "vitest";

import { writeFileTree } from "../file-tree/file-tree.utilities";
import { makeDirectory } from "../temporary-directory/temporary-directory.utilities";

import type { GuideGapOptions, StageExampleOptions } from "./example-run.types";

/** Names what is missing from one example's guide: its README, and its link in the package guide's index. */
export function findGuideGaps(
  exampleName: string,
  options: GuideGapOptions,
): string[] {
  const { examplesDirectory, packageGuide } = options;

  return [
    fs.existsSync(path.join(examplesDirectory, exampleName, "README.md"))
      ? ""
      : `${exampleName} has no README.md`,
    packageGuide.includes(`(examples/${exampleName}/README.md)`)
      ? ""
      : `${exampleName} is not linked from the README's index table`,
  ].filter((problem) => problem !== "");
}

/** Lists the folders in `directory`, alphabetically, minus any in `excluded`. */
export function listExampleNames(
  directory: string,
  excluded?: Iterable<string>,
): string[] {
  const skipped = new Set<string>(excluded);

  return fs
    .readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !skipped.has(entry.name))
    .map((entry) => entry.name)
    .toSorted();
}

/** Removes a staged copy, whether or not the run that made it passed. */
export function removeStagedExample(root: string): void {
  fs.rmSync(root, { force: true, recursive: true });
}

/** Copies a directory into a fresh temporary one and returns its root. */
export function stageExample(options: StageExampleOptions): string {
  const {
    files = {},
    git = false,
    label,
    parent,
    removeAfterTest = false,
    source,
  } = options;
  const root = makeDirectory(label, parent);

  if (removeAfterTest) {
    onTestFinished(() => {
      removeStagedExample(root);
    });
  }

  fs.cpSync(source, root, { recursive: true });

  if (git) {
    fs.mkdirSync(path.join(root, ".git"));
  }

  writeFileTree(root, files);

  return root;
}
