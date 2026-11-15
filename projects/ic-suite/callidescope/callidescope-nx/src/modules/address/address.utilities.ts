// 🛠️ Utilities

import path from "node:path";

import {
  resolveAddressService,
  resolveOptionsService,
} from "../plugin/plugin-context.utilities";
import { resolveExecutorScope } from "../plugin/plugin.utilities";

import type { AddressExecutorOptions } from "../../executors/address.types";
import type { ExecutorContext } from "@nx/devkit";

/**
 * Runs the address lookup for the `depth` or `breadth` executor, which differ only in one call.
 */
export async function runAddressExecutor(args: {
  context: ExecutorContext;
  kind: "breadth" | "depth";
  options: AddressExecutorOptions;
}): Promise<{ success: boolean }> {
  const addresses = (args.options.addresses ?? []).filter(
    (address) => address !== "",
  );

  // Refused rather than prompted for: a task runner has nobody to ask, which
  // is the same reason the command line refuses one there.
  if (addresses.length === 0) {
    throw new Error(
      `The callidescope ${args.kind} executor needs --addresses, as in "--addresses=src/foo.service.ts#FooService.bar".`,
    );
  }

  const scope = await resolveExecutorScope({
    context: args.context,
    label: args.kind,
    options: args.options,
  });
  const optionsService = await resolveOptionsService();
  const addressService = await resolveAddressService();
  const lookupOptions = optionsService.readLookupOptions(args.options);
  const lookupArguments = {
    addresses,
    directories: scope.directories,
    ...lookupOptions,
    // Resolved here, against the workspace root, so the loader never has to
    // guess which directory a relative path meant.
    configurationPath: path.resolve(
      args.context.root,
      lookupOptions.configurationPath,
    ),
  };
  const result =
    args.kind === "depth"
      ? await addressService.runDepth(lookupArguments)
      : await addressService.runBreadth(lookupArguments);

  // The report — or the reason the address resolved to nothing — is the
  // executor's product, so it goes to stdout either way.
  process.stdout.write(`${result.report}\n`);

  return { success: result.ok };
}
