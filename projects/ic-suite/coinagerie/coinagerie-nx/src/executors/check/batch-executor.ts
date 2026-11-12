// 🛠️ Utilities

import { runBatch } from "./executor.utilities";

import type {
  CheckBatchExecutorArguments,
  CheckBatchTaskResult,
} from "./executor.types";

/**
 * Judges every Nx-batched task in one command-line process. Each task still
 * passes or fails, and is cached, alone.
 */
export default async function checkBatchExecutor(
  ...args: CheckBatchExecutorArguments
): Promise<Record<string, CheckBatchTaskResult>> {
  const results = await runBatch(...args);

  printFailures(results);

  return results;
}

/**
 * Prints each failed task's output under its id. Nx caches batch output without
 * printing it, so a failure would otherwise be silent.
 */
function printFailures(results: Record<string, CheckBatchTaskResult>): void {
  for (const [taskId, result] of Object.entries(results)) {
    if (!result.success) {
      process.stdout.write(`\n> ${taskId}\n${result.terminalOutput}\n`);
    }
  }
}
