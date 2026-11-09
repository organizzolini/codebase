import { ConfigurationService } from "@callidescope/configuration";
import { AddressService } from "@callidescope/graph";
import { Injectable } from "@nestjs/common";

import { CallidescopeService } from "../callidescope/callidescope.service";

import { ADDRESS_NOT_FOUND_ADVICE } from "./address-lookup.constants";

import type {
  LocatedWorkspace,
  ResolveAddressArguments,
} from "./address-lookup.types";
import type { AddressCommandOptions } from "@callidescope/configuration";
import type { CallableAddressResolution } from "@callidescope/graph";

/**
 * Resolves `depth` and `breadth`'s callable address into a callable, sharing
 * every step the two commands would otherwise duplicate: loading the
 * configuration, tracing the workspace, and matching the address against
 * what was found.
 */
@Injectable()
export class AddressLookupService {
  // 🏗 Dependency Injection

  constructor(
    private readonly addressService: AddressService,
    private readonly callidescopeService: CallidescopeService,
    private readonly configurationService: ConfigurationService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * States why a resolution cannot be acted on, or nothing when it can.
   * One message per failure kind.
   */
  public describeProblem(args: {
    address: string;
    resolution: CallableAddressResolution;
  }): string | undefined {
    const { resolution } = args;

    if (resolution.kind === "resolved") {
      return undefined;
    }

    if (resolution.kind === "invalid") {
      return resolution.reason;
    }

    if (resolution.kind === "not-found") {
      return `No callable matches "${args.address}". ${ADDRESS_NOT_FOUND_ADVICE}`;
    }

    return `"${args.address}" matches more than one declaration. ${this.addressService.describeCandidates(
      { address: args.address, candidates: resolution.candidates },
    )}`;
  }

  /**
   * Every traced callable, as an address that resolves to it.
   * Lets a caller pick from what exists, not recall a name.
   */
  public listAddresses(workspace: LocatedWorkspace): string[] {
    return this.addressService.listAddresses(workspace.located.callablesById);
  }

  /** Loads the configuration and traces the workspace, matching nothing yet. */
  public async locate(
    options: AddressCommandOptions,
  ): Promise<LocatedWorkspace> {
    const {
      authoredLimits,
      configuration,
      configurationPath,
      format,
      workspaceRoot,
    } = await this.configurationService.prepareLookup(options);
    const located = await this.callidescopeService.locate({
      authoredLimits,
      configuration,
      configurationPath,
      // The flag and the configured list were already merged by the one
      // resolver that does that, so this reads the answer rather than
      // choosing between them a second way.
      directories: configuration.directories,
      workspaceRoot,
    });

    return { configuration, format, located, workspaceRoot };
  }

  /** Matches an address against a workspace already traced. */
  public resolve(args: ResolveAddressArguments): CallableAddressResolution {
    return this.addressService.resolve({
      address: args.address,
      callablesById: args.workspace.located.callablesById,
      workspaceRoot: args.workspace.workspaceRoot,
    });
  }
}
