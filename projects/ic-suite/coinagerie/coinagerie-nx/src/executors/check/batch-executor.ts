// 🛠️ Utilities

import { runBatch } from "./executor.utilities";

import type {
  CheckBatchExecutorArguments,
  CheckBatchTaskResult,
} from "./executor.types";

/**
 * Judges every task Nx batched for this executor from one command-line process.
 *
 * One `coinagerie-check` task per project used to start its own `node`, load
 * a transpiler, and boot a NestJS container — about eight seconds to read one
 * project's words in about half of one. A batch starts the command line once
 * and names every project to it, so each still passes or fails alone and is
 * still cached alone: Nx hashes and replays batched tasks one by one.
 */
export default async function checkBatchExecutor(
  ...args: CheckBatchExecutorArguments
): Promise<Record<string, CheckBatchTaskResult>> {
  const results = await runBatch(...args);

  printFailures(results);

  return results;
}

/**
 * Prints what each failed task found, under the task's id.
 *
 * Nx keeps a batch task's output for the cache but does not print it, where
 * the single executor writes its report to stdout. Without this a failed
 * check is a red task that never says which glossary disagreed. Passing tasks
 * print nothing.
 */
function printFailures(results: Record<string, CheckBatchTaskResult>): void {
  for (const [taskId, result] of Object.entries(results)) {
    if (!result.success) {
      process.stdout.write(`\n> ${taskId}\n${result.terminalOutput}\n`);
    }
  }
}
