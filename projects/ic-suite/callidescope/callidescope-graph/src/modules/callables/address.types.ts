// 🏷️ Types

import type { DiscoveredCallable } from "./callables.types";
import type { CallableId, SourceLocation } from "@callidescope/core";

/** One declaration an ambiguous address could have meant. */
export interface CallableAddressCandidate {
  readonly id: CallableId;
  readonly location: SourceLocation;
}

/** What resolving a callable address produced. A union, since each outcome calls for a different next step. */
export type CallableAddressResolution =
  | {
      readonly candidates: readonly CallableAddressCandidate[];
      readonly kind: "ambiguous";
    }
  | { readonly id: CallableId; readonly kind: "resolved" }
  | { readonly kind: "invalid"; readonly reason: string }
  | { readonly kind: "not-found" };

/** Parts a callable address splits into before it is matched. */
export interface ParsedAddress {
  readonly displayName: string;
  readonly line: number | undefined;
  readonly workspaceRelativePath: string;
}

/** Arguments for resolving one callable address string. */
export interface ResolveAddressArguments {
  readonly address: string;
  readonly callablesById: ReadonlyMap<CallableId, DiscoveredCallable>;
  readonly workspaceRoot: string;
}

/** A resolution that did not name exactly one callable, derived so every failure stays covered. */
export type UnresolvedCallableAddress = Exclude<
  CallableAddressResolution,
  { readonly kind: "resolved" }
>;
