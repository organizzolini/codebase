// 🛠️ Utilities

import { runAddressExecutor } from "../../modules/address/address.utilities";

import type { AddressExecutorOptions } from "../address.types";
import type { ExecutorContext } from "@nx/devkit";

/**
 * Prints each named callable's direct callers and callees, resolved within the target's Nx scope.
 */
export default async function breadthExecutor(
  options: AddressExecutorOptions,
  context: ExecutorContext,
): Promise<{ success: boolean }> {
  return await runAddressExecutor({ context, kind: "breadth", options });
}
