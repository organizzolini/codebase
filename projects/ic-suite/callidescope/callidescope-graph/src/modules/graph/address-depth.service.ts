import { Injectable } from "@nestjs/common";

import { MAXIMUM_CALL_ADDRESS_STACKS } from "./address-depth.constants";
import { PathsService } from "./paths.service";

import type { DiscoveredCallable } from "../callables/callables.types";
import type {
  AddressDepthTraversalContext,
  AddressDepthTraversalFrame,
  BuildCallAddressStacksArguments,
  CallAddressStack,
  CallAddressTreeResult,
} from "./address-depth.types";
import type { CallableId, StackFrame } from "@callidescope/core";

/**
 * Enumerates every simple path above or below one callable.
 *
 * `PathsService` keeps one deepest path per entry point, which answers "how deep".
 * An address lookup needs every path in each direction, so this walks them all.
 *
 * It is iterative, on an explicit stack, since a widely called utility can sit
 * many frames deep in a caller chain.
 */
@Injectable()
export class AddressDepthService {
  // 🏗 Dependency Injection

  constructor(private readonly pathsService: PathsService) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Follows one neighbor: closes a cycle, stops at an unknown id, or descends. */
  private follow(args: {
    context: AddressDepthTraversalContext;
    frame: AddressDepthTraversalFrame;
    neighborId: CallableId;
    paths: (readonly CallableId[])[];
    pending: AddressDepthTraversalFrame[];
  }): void {
    const { context, frame, neighborId, paths, pending } = args;

    if (frame.path.includes(neighborId)) {
      paths.push([...frame.path, neighborId]);
      return;
    }

    if (!context.callablesById.has(neighborId)) {
      paths.push(frame.path);
      return;
    }

    pending.push({
      currentId: neighborId,
      nextIndex: 0,
      path: [...frame.path, neighborId],
    });
  }

  /** True when a path holds a frame with an unresolved call beneath it. */
  private isLowerBound(args: {
    path: readonly CallableId[];
    unresolvedCallerIds: ReadonlySet<CallableId>;
  }): boolean {
    return args.path.some((id) => args.unresolvedCallerIds.has(id));
  }

  /** Advances one traversal frame: closes it, follows a neighbor, or backtracks. */
  private step(args: {
    context: AddressDepthTraversalContext;
    frame: AddressDepthTraversalFrame;
    paths: (readonly CallableId[])[];
    pending: AddressDepthTraversalFrame[];
  }): void {
    const { context, frame, paths, pending } = args;
    const neighborIds = context.adjacency.get(frame.currentId) ?? [];
    const isFirstCheck = frame.nextIndex === 0;
    const neighborId = neighborIds.at(frame.nextIndex);

    frame.nextIndex += 1;

    if (neighborId === undefined) {
      if (isFirstCheck) {
        paths.push(frame.path);
      }

      pending.pop();
      return;
    }

    this.follow({ context, frame, neighborId, paths, pending });
  }

  /** Turns one raw id path into the frames a report can print. */
  private toStack(args: {
    callablesById: ReadonlyMap<CallableId, DiscoveredCallable>;
    path: readonly CallableId[];
    reversed: boolean;
    unresolvedCallerIds: ReadonlySet<CallableId>;
  }): CallAddressStack {
    const orderedIds = args.reversed ? args.path.toReversed() : args.path;
    const seenIds = new Set<CallableId>();
    const frames: StackFrame[] = [];

    for (const id of orderedIds) {
      const isCycle = seenIds.has(id);
      seenIds.add(id);

      const callable = args.callablesById.get(id);

      if (callable !== undefined) {
        frames.push(this.pathsService.buildFrame({ callable, isCycle }));
      }
    }

    return {
      frames,
      isLowerBound: this.isLowerBound({
        path: args.path,
        unresolvedCallerIds: args.unresolvedCallerIds,
      }),
    };
  }

  /**
   * Walks every simple path from `startId`, capped at `MAXIMUM_CALL_ADDRESS_STACKS`.
   * A neighbor already on the path closes a cycle, and the walk backtracks.
   */
  private traverse(
    context: AddressDepthTraversalContext & { startId: CallableId },
  ): {
    paths: (readonly CallableId[])[];
    truncated: boolean;
  } {
    const paths: (readonly CallableId[])[] = [];
    const pending: AddressDepthTraversalFrame[] = [
      { currentId: context.startId, nextIndex: 0, path: [context.startId] },
    ];

    for (
      let frame = pending.at(-1);
      frame !== undefined;
      frame = pending.at(-1)
    ) {
      if (paths.length >= MAXIMUM_CALL_ADDRESS_STACKS) {
        return { paths, truncated: true };
      }

      this.step({ context, frame, paths, pending });
    }

    return { paths, truncated: false };
  }

  // 🌎 Public Methods

  /** Traces every path from `startId` down to a leaf. */
  public buildDownwardStacks(
    args: BuildCallAddressStacksArguments,
  ): CallAddressTreeResult {
    const traversed = this.traverse({
      adjacency: args.graph.calleeIdsByCaller,
      callablesById: args.callablesById,
      startId: args.startId,
    });

    return {
      stacks: traversed.paths.map((path) =>
        this.toStack({
          callablesById: args.callablesById,
          path,
          reversed: false,
          unresolvedCallerIds: args.graph.unresolvedCallerIds,
        }),
      ),
      truncated: traversed.truncated,
    };
  }

  /** Traces every path from a root caller up to `startId`. */
  public buildUpwardStacks(
    args: BuildCallAddressStacksArguments,
  ): CallAddressTreeResult {
    const traversed = this.traverse({
      adjacency: args.graph.callerIdsByCallee,
      callablesById: args.callablesById,
      startId: args.startId,
    });

    return {
      stacks: traversed.paths.map((path) =>
        this.toStack({
          callablesById: args.callablesById,
          path,
          reversed: true,
          unresolvedCallerIds: args.graph.unresolvedCallerIds,
        }),
      ),
      truncated: traversed.truncated,
    };
  }
}
