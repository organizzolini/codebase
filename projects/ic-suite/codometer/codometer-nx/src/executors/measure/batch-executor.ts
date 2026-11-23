// 🛠️ Utilities

import { runBatch } from "./executor.utilities";

import type {
  MeasureBatchExecutorArguments,
  MeasureBatchTaskResult,
} from "./executor.types";

/**
 * Measures every Nx-batched task in one process per distinct measurement. Each task still
 * passes, fails and is cached alone.
 */
export default async function measureBatchExecutor(
  ...args: MeasureBatchExecutorArguments
): Promise<Record<string, MeasureBatchTaskResult>> {
  const results = await runBatch(...args);

  printFailures(results);

  return results;
}

/**
 * Prints each failed task's output under its id. Nx caches batch output without
 * printing it, so a failure would otherwise be silent.
 */
function printFailures(results: Record<string, MeasureBatchTaskResult>): void {
  for (const [taskId, result] of Object.entries(results)) {
    if (!result.success) {
      process.stdout.write(`\n> ${taskId}\n${result.terminalOutput}\n`);
    }
  }
}
