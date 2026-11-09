// 🏷️ Types

import type { LocateOutcome } from "../callidescope/callidescope.types";
import type {
  CallidescopeOutputFormat,
  ResolvedCallidescopeConfiguration,
} from "@callidescope/configuration";

/**
 * A traced workspace, before any address is matched against it.
 * One trace serves both the completion list and the lookup.
 */
export interface LocatedWorkspace {
  readonly configuration: ResolvedCallidescopeConfiguration;
  /** What the lookup prints, resolved from the command line and refused if unknown. */
  readonly format: CallidescopeOutputFormat;
  readonly located: LocateOutcome;
  readonly workspaceRoot: string;
}

/** Arguments for matching an address against an already-traced workspace. */
export interface ResolveAddressArguments {
  readonly address: string;
  readonly workspace: LocatedWorkspace;
}
