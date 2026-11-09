import { Injectable } from "@nestjs/common";
import ts from "typescript";

import { LoggerService } from "@codebase/observability";

import { AddressService } from "../callables/address.service";

import {
  BARREL_FILE_SUFFIX,
  BOOTSTRAP_FILE_SUFFIX,
  BOOTSTRAP_FUNCTION_NAMES,
  COMMAND_RUNNER_METHOD_NAME,
  LIFECYCLE_METHOD_NAMES,
} from "./entries.constants";

import type { DiscoveredCallable } from "../callables/callables.types";
import type {
  ClassificationPassArguments,
  EntryPointCollection,
  EntryPointPassArguments,
  ProjectEntryRules,
  ResolveEntriesArguments,
  UnresolvedEntryPointAddress,
} from "./entries.types";
import type { ResolvedCallidescopeEntryPoints } from "@callidescope/configuration";
import type {
  CallableId,
  EntryPoint,
  EntryPointKind,
} from "@callidescope/core";

/**
 * Decides which callables are the roots of a call stack.
 *
 * Most code is called by a framework rather than by anything in the repository,
 * so roots must be named. A configuration can also name one by address.
 *
 * Orphan promotion catches misses: anything left with no caller becomes a root.
 */
@Injectable()
export class EntriesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly addressService: AddressService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(EntriesService.name);
  }

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Classifies a callable's declaration, or leaves it unrooted. */
  private classify(args: {
    callable: DiscoveredCallable;
    rules: ProjectEntryRules;
  }): EntryPointKind | undefined {
    const { declaration, node } = args.callable;

    if (
      this.hasConfiguredDecorator({
        decorators: args.rules.decorators,
        node: declaration,
      })
    ) {
      return "decorated-method";
    }

    if (LIFECYCLE_METHOD_NAMES.has(node.memberName)) {
      return "lifecycle";
    }

    if (this.isCommandRunnerMethod({ ...args, declaration })) {
      return "decorated-method";
    }

    if (this.isBootstrapFunction(node.location.filePath, node.memberName)) {
      return "module-bootstrap";
    }

    return args.rules.includeExportedFunctions &&
      node.isExported &&
      node.location.filePath.endsWith(BARREL_FILE_SUFFIX)
      ? "exported-function"
      : undefined;
  }

  /** Roots every callable one of the entry-point rules recognizes. */
  private classifyEveryCallable(args: ClassificationPassArguments): void {
    for (const callable of args.resolveArguments.callablesById.values()) {
      const kind = this.classify({
        callable,
        rules: this.readRules(args, callable),
      });

      if (kind !== undefined) {
        args.entryPoints.push({ callableId: callable.node.id, kind });
        args.claimed.add(callable.node.id);
      }
    }
  }

  /** True when a node carries one of the configured framework decorators. */
  private hasConfiguredDecorator(args: {
    decorators: ReadonlySet<string>;
    node: ts.Node;
  }): boolean {
    return this.readDecoratorNames(args.node).some((name) =>
      args.decorators.has(name),
    );
  }

  /** True when a function is a module's own runtime entry point. */
  private isBootstrapFunction(filePath: string, memberName: string): boolean {
    return (
      filePath.endsWith(BOOTSTRAP_FILE_SUFFIX) &&
      BOOTSTRAP_FUNCTION_NAMES.has(memberName)
    );
  }

  /** True when a method is the entry point of a decorated command class. */
  private isCommandRunnerMethod(args: {
    callable: DiscoveredCallable;
    declaration: ts.Node;
    rules: ProjectEntryRules;
  }): boolean {
    if (args.callable.node.memberName !== COMMAND_RUNNER_METHOD_NAME) {
      return false;
    }

    const owner = ts.findAncestor(args.declaration, ts.isClassDeclaration);

    return (
      owner !== undefined &&
      this.hasConfiguredDecorator({
        decorators: args.rules.decorators,
        node: owner,
      })
    );
  }

  /**
   * Every configuration a run resolves addresses for, paired with its project.
   * The workspace one is listed once, under `undefined`.
   */
  private listDeclaringConfigurations(
    args: ResolveEntriesArguments,
  ): [string | undefined, ResolvedCallidescopeEntryPoints][] {
    return [[undefined, args.entryPoints], ...args.entryPointsByProject];
  }

  /** Roots whatever neither a rule nor a declaration claimed, and nothing calls. */
  private promoteOrphans(args: ClassificationPassArguments): void {
    for (const callable of args.resolveArguments.callablesById.values()) {
      const callers =
        args.resolveArguments.graph.callerIdsByCallee.get(callable.node.id) ??
        [];

      if (
        !args.claimed.has(callable.node.id) &&
        callers.length === 0 &&
        this.readRules(args, callable).includeOrphans
      ) {
        args.entryPoints.push({
          callableId: callable.node.id,
          kind: "orphan-root",
        });
        args.claimed.add(callable.node.id);
      }
    }
  }

  /** Reads the names of the decorators applied to a node. */
  private readDecoratorNames(node: ts.Node): string[] {
    if (!ts.canHaveDecorators(node)) {
      return [];
    }

    return (ts.getDecorators(node) ?? []).map((decorator) => {
      const { expression } = decorator;
      const callee = ts.isCallExpression(expression)
        ? expression.expression
        : expression;

      return ts.isIdentifier(callee) ? callee.text : "";
    });
  }

  /**
   * The rules the project owning a callable is judged by. Positional, not an
   * options object, since it runs once per callable.
   */
  private readRules(
    args: ClassificationPassArguments,
    callable: DiscoveredCallable,
  ): ProjectEntryRules {
    return (
      args.rulesByProject.get(callable.node.projectName) ?? args.defaultRules
    );
  }

  /**
   * Roots one declared address, or reports why it named no single callable.
   * Roots are deduplicated by callable, never by the address text.
   */
  private rootDeclaredAddress(
    args: EntryPointPassArguments & {
      address: string;
      projectName: string | undefined;
    },
  ): undefined | UnresolvedEntryPointAddress {
    const resolution = this.addressService.resolve({
      address: args.address,
      callablesById: args.resolveArguments.callablesById,
      workspaceRoot: args.resolveArguments.workspaceRoot,
    });

    if (resolution.kind !== "resolved") {
      return {
        address: args.address,
        projectName: args.projectName,
        resolution,
      };
    }

    if (!args.claimed.has(resolution.id)) {
      args.entryPoints.push({ callableId: resolution.id, kind: "declared" });
      args.claimed.add(resolution.id);
    }

    return undefined;
  }

  /** Roots every declared address, collecting the ones that resolved to nothing. */
  private rootDeclaredAddresses(
    args: EntryPointPassArguments,
  ): UnresolvedEntryPointAddress[] {
    const unresolvedAddresses: UnresolvedEntryPointAddress[] = [];

    for (const [projectName, entryPoints] of this.listDeclaringConfigurations(
      args.resolveArguments,
    )) {
      for (const address of entryPoints.addresses) {
        const unresolved = this.rootDeclaredAddress({
          address,
          projectName,
          ...args,
        });

        if (unresolved !== undefined) {
          unresolvedAddresses.push(unresolved);
        }
      }
    }

    return unresolvedAddresses;
  }

  /** Reads one configuration's entry-point rules into what classification needs. */
  private toRules(
    entryPoints: ResolvedCallidescopeEntryPoints,
  ): ProjectEntryRules {
    return {
      decorators: new Set(entryPoints.decorators),
      includeExportedFunctions: entryPoints.includeExportedFunctions,
      includeOrphans: entryPoints.includeOrphans,
    };
  }

  // 🌎 Public Methods

  /**
   * Resolves every root a run measures depth from, in three passes: rules, then
   * declared addresses, then orphan promotion.
   */
  public resolve(args: ResolveEntriesArguments): EntryPointCollection {
    const entryPoints: EntryPoint[] = [];
    const claimed = new Set<CallableId>();
    const pass = { claimed, entryPoints, resolveArguments: args };
    const classification = {
      ...pass,
      defaultRules: this.toRules(args.entryPoints),
      rulesByProject: new Map(
        [...args.entryPointsByProject].map(([projectName, rules]) => [
          projectName,
          this.toRules(rules),
        ]),
      ),
    };

    this.classifyEveryCallable(classification);

    const unresolvedAddresses = this.rootDeclaredAddresses(pass);

    this.promoteOrphans(classification);

    this.logger.info("🔭 Resolved entry points", undefined, {
      total: entryPoints.length,
    });

    return { entryPoints, unresolvedAddresses };
  }
}
