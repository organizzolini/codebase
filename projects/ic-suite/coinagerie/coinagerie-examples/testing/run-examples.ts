import fs from "node:fs";
import path from "node:path";

import {
  examplesDirectory,
  packageDirectory,
  removeStagedExample,
  runCoinagerie,
  stageExample,
} from "./coinagerie.js";
import { CHECK_FAILURE_EXIT_CODES, EXAMPLE_RUNS } from "./runs.js";

import type { ExampleRun } from "./runs.js";

/**
 * Runs every example this package ships, the way its own guide says to.
 *
 * A smoke gate rather than a semantic one: the exit code each guide promises,
 * and nothing about the glossaries, which `examples.integration.test.ts`
 * asserts in the prose that explains them.
 *
 * It also holds the checks that keep the guides complete rather than correct:
 * every example must carry a `README.md` linked from the package guide, must
 * hold a `project/` folder, and must have at least one documented run, and
 * every `check-failures` configuration must be named in `runs.ts`. Each fails
 * on an example added without documenting it, which is the drift no assertion
 * about output would ever notice.
 */

// 🔍 Discovery

/** The problems with how one example is documented, empty when it is sound. */
function findDocumentationGaps(
  exampleName: string,
  packageGuide: string,
): string[] {
  const exampleDirectory = path.join(examplesDirectory, exampleName);

  return [
    fs.existsSync(path.join(exampleDirectory, "README.md"))
      ? ""
      : `${exampleName} has no README.md`,
    fs.existsSync(path.join(exampleDirectory, "project"))
      ? ""
      : `${exampleName} has no project/ folder`,
    packageGuide.includes(`(examples/${exampleName}/README.md)`)
      ? ""
      : `${exampleName} is not linked from the README's index table`,
    EXAMPLE_RUNS.some((documented) => documented.example === exampleName)
      ? ""
      : `${exampleName} has no run in testing/runs.ts`,
  ].filter((problem) => problem !== "");
}

/** The problems with the `check-failures` table, empty when it matches the disk. */
function findFailureGaps(): string[] {
  const onDisk = readCheckFailureNames();
  const named = Object.keys(CHECK_FAILURE_EXIT_CODES).toSorted();

  return [
    ...onDisk
      .filter((name) => !named.includes(name))
      .map(
        (name) => `check-failures/${name}.config.ts has no expected exit code`,
      ),
    ...named
      .filter((name) => !onDisk.includes(name))
      .map(
        (name) =>
          `CHECK_FAILURE_EXIT_CODES names ${name}, which does not exist`,
      ),
  ];
}

// 🏃 Running

/** The names of the `check-failures` configurations on disk. */
function readCheckFailureNames(): string[] {
  return fs
    .readdirSync(path.join(examplesDirectory, "check-failures", "project"))
    .filter((entry) => entry.endsWith(".config.ts"))
    .map((entry) => entry.replace(".config.ts", ""))
    .toSorted();
}

/** Every example directory, alphabetically. */
function readExampleNames(): string[] {
  return fs
    .readdirSync(examplesDirectory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .toSorted();
}

/** One documented run, gated on the exit code its guide promises. */
function runDocumented(documented: ExampleRun): boolean {
  const label = `${documented.example}: coinagerie ${documented.args.join(" ")}`;
  const root = stageExample(documented.example, documented.extraFiles);

  try {
    const run = runCoinagerie(root, documented.args);

    if (run.exitCode === documented.exitCode) {
      console.info(`   ✅ ${label} exited ${run.exitCode}`);
      return true;
    }

    console.error(
      `   ❌ ${label} exited ${run.exitCode}, its guide says ${documented.exitCode}`,
    );
    console.error(run.standardError.trim());
    return false;
  } finally {
    removeStagedExample(root);
  }
}

// 🚀 Entry point

const packageGuide = fs.readFileSync(
  path.join(packageDirectory, "README.md"),
  "utf8",
);
const gaps = [
  ...readExampleNames().flatMap((exampleName) =>
    findDocumentationGaps(exampleName, packageGuide),
  ),
  ...findFailureGaps(),
];

for (const gap of gaps) {
  console.error(`❌ ${gap}`);
}

console.info(`🪙 Running ${EXAMPLE_RUNS.length} documented coinagerie runs.\n`);

const failed =
  EXAMPLE_RUNS.filter((documented) => !runDocumented(documented)).length +
  gaps.length;

if (failed === 0) {
  console.info("\n✅ Every example ran as its guide says.");
} else {
  console.error(`\n❌ ${failed} example(s) did not match their guides.`);
}

process.exitCode = failed === 0 ? 0 : 1;
