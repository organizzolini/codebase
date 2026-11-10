// 🛠️ Utilities

import { runAddressExecutor } from "../../modules/address/address.utilities";

import type { AddressExecutorOptions } from "../address.types";
import type { ExecutorContext } from "@nx/devkit";

/**
 * Prints every call stack above and below each named callable, resolved within the target's Nx scope.
 */
export default async function depthExecutor(
  options: AddressExecutorOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  return await runAddressExecutor({ context, kind: "depth", options });
}
