import fs from "node:fs";
import path from "node:path";

import {
  corpusDirectory,
  examplesDirectory,
  packageDirectory,
  runCodometer,
} from "./codometer.js";

/**
 * Runs every example this package ships, the way its own guide says to.
 *
 * This is the discoverable entry point the package lacked: one command that
 * exercises all of it and prints what each configuration prints. It is a smoke
 * gate rather than a semantic one — the exit code each guide promises, and
 * nothing about the numbers, which the `*.integration.test.ts` suites assert
 * in the prose that explains them.
 *
 * It also holds the two checks that keep the guides complete rather than
 * correct: every configuration must be named below, and every example must
 * carry a `README.md`. Both fail on an example added without documenting it,
 * which is the drift no assertion about output would ever notice.
 */

// 🗂️ The examples

/** Fixture directories, with no README to skew guide counts. */
const FIXTURE_DIRECTORIES = new Set(["compiled", "corpus"]);

/** Exit code per example under `--check limits`, keyed by path. */
const EXPECTED_EXIT_CODES: Record<string, number> = {
  "compression/brotli.config.ts": 0,
  "compression/gzip.config.ts": 0,
  "compression/none.config.ts": 0,
  "discovery/nested/codometer.config.ts": 0,
  "documentation/codometer.config.ts": 1,
  "documentation/comments.config.ts": 1,
  "documentation/yaml-comments.config.ts": 1,
  "limits/ambiguous.config.ts": 1,
  "limits/default-target.config.ts": 0,
  "limits/empty-target-limited.config.ts": 1,
  "limits/empty-target-unlimited.config.ts": 0,
  "limits/fail.config.ts": 1,
  "limits/unbound.config.ts": 1,
  "limits/units.config.ts": 1,
  "limits/unqualified.config.ts": 1,
  "limits/unreadable-unit.config.ts": 1,
  "limits/warn.config.ts": 0,
  "output/codometer.config.ts": 0,
  "output/custom-render.config.ts": 0,
  "output/custom-write.config.ts": 0,
  "output/renamed-markers.config.ts": 0,
  "output/self-excluded.config.ts": 0,
  "python/default-interpreter.config.ts": 0,
  "python/unreachable-interpreter.config.ts": 0,
  "python/uv.config.ts": 0,
  "staleness/codometer.config.ts": 0,
  "statistics/codometer.config.ts": 0,
  "targets/codometer.config.ts": 0,
  "targets/ignored.config.ts": 0,
  "targets/reordered.config.ts": 0,
  "write-check/codometer.config.ts": 1,
};

// 🔍 Discovery

/** Every configuration file an example carries, relative to `examples/`. */
function readConfigurations(exampleName: string): string[] {
  const found: string[] = [];

  const walk = (directory: string): void => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);

      if (entry.isDirectory()) walk(entryPath);
      else if (entry.name.endsWith(".config.ts")) {
        found.push(path.relative(examplesDirectory, entryPath));
      }
    }
  };

  walk(path.join(examplesDirectory, exampleName));

  return found.toSorted();
}

/** Every example directory, alphabetically — the order is the listing's own. */
function readExampleNames(): string[] {
  return fs
    .readdirSync(examplesDirectory, { withFileTypes: true })
    .filter(
      (entry) => entry.isDirectory() && !FIXTURE_DIRECTORIES.has(entry.name),
    )
    .map((entry) => entry.name)
    .toSorted();
}

// 🏃 Running

/** The package guide, read once so the index table can be checked against it. */
function readPackageGuide(): string {
  return fs.readFileSync(path.join(packageDirectory, "README.md"), "utf8");
}

/** One configuration, run against the corpus and gated on the promised code. */
function runConfiguration(relativePath: string): boolean {
  const expected = EXPECTED_EXIT_CODES[relativePath];

  if (expected === undefined) {
    console.error(
      `❌ examples/${relativePath} has no expected exit code. Add one to EXPECTED_EXIT_CODES.`,
    );

    return false;
  }

  const run = runCodometer(
    [
      "--config",
      path.join(examplesDirectory, relativePath),
      "--check",
      "limits",
    ],
    corpusDirectory,
  );

  if (run.exitCode === expected) {
    console.info(`   ✅ ${relativePath} exited ${run.exitCode}`);

    return true;
  }

  console.error(
    `   ❌ ${relativePath} exited ${run.exitCode}, its guide says ${expected}`,
  );
  console.error(run.standardError.trim());

  return false;
}

/**
 * Checks one example: its guide must exist and be linked from the index, and every configuration must hold.
 */
function runExample(exampleName: string, packageGuide: string): boolean {
  console.info(`📁 ${exampleName}`);

  let held = true;

  if (!fs.existsSync(path.join(examplesDirectory, exampleName, "README.md"))) {
    console.error(`   ❌ ${exampleName} has no README.md`);
    held = false;
  }

  if (!packageGuide.includes(`(examples/${exampleName}/README.md)`)) {
    console.error(
      `   ❌ ${exampleName} is not linked from the README's index table`,
    );
    held = false;
  }

  for (const relativePath of readConfigurations(exampleName)) {
    if (!runConfiguration(relativePath)) held = false;
  }

  return held;
}

// 🚀 Entry point

const exampleNames = readExampleNames();

console.info(
  `⏲️ Running ${exampleNames.length} codometer examples over the sample corpus.\n`,
);

const packageGuide = readPackageGuide();
const outcomes = exampleNames.map((exampleName) =>
  runExample(exampleName, packageGuide),
);

const documented = new Set(
  exampleNames.flatMap((exampleName) => readConfigurations(exampleName)),
);
const orphaned = Object.keys(EXPECTED_EXIT_CODES).filter(
  (relativePath) => !documented.has(relativePath),
);

for (const relativePath of orphaned) {
  console.error(
    `❌ EXPECTED_EXIT_CODES names examples/${relativePath}, which does not exist.`,
  );
}

const failed = outcomes.filter((held) => !held).length + orphaned.length;

if (failed === 0) {
  console.info("\n✅ Every example ran as its guide says.");
} else {
  console.error(`\n❌ ${failed} example(s) did not match their guides.`);
}

process.exitCode = failed === 0 ? 0 : 1;
