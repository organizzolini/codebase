import path from "node:path";

import { Injectable } from "@nestjs/common";

import {
  DIGITS_ONLY_PATTERN,
  LINE_DISAMBIGUATOR_PATTERN,
} from "./address.constants";

import type {
  CallableAddressCandidate,
  CallableAddressResolution,
  ParsedAddress,
  ResolveAddressArguments,
} from "./address.types";
import type { DiscoveredCallable } from "./callables.types";
import type { CallableNode } from "@callidescope/core";

/**
 * Resolves a human-typed callable address to the callable it names.
 *
 * An address is the file path and qualified name callidescope prints in every
 * stack, joined by `#`, such as `src/foo.service.ts#FooService.bar`. It is
 * matched against display names, and an optional `:<line>` suffix separates
 * same-named declarations in one file.
 */
@Injectable()
export class AddressService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Counts how many candidates were declared on each line. */
  private countCandidatesByLine(
    candidates: readonly CallableAddressCandidate[],
  ): Map<number, number> {
    const countsByLine = new Map<number, number>();

    for (const candidate of candidates) {
      const { line } = candidate.location;

      countsByLine.set(line, (countsByLine.get(line) ?? 0) + 1);
    }

    return countsByLine;
  }

  /** States the accepted shape, in front of whatever went wrong. */
  private describeInvalidAddress(address: string): string {
    return `"${address}" is not a callable address. It needs a file path and a qualified name joined by "#", as in "src/foo.service.ts#FooService.bar", optionally followed by ":<line>" to disambiguate.`;
  }

  /** Finds every discovered callable matching the parsed address. */
  private findMatches(
    args: ParsedAddress & {
      callablesById: ReadonlyMap<string, DiscoveredCallable>;
    },
  ): DiscoveredCallable[] {
    const matches: DiscoveredCallable[] = [];

    for (const callable of args.callablesById.values()) {
      const { location } = callable.node;
      const matchesFile = location.filePath === args.workspaceRelativePath;
      const matchesName = callable.node.displayName === args.displayName;
      const matchesLine =
        args.line === undefined || location.line === args.line;

      if (matchesFile && matchesName && matchesLine) {
        matches.push(callable);
      }
    }

    return matches;
  }

  /** Splits a raw address into its file path and symbol path, if well formed. */
  private parseAddress(args: {
    address: string;
    workspaceRoot: string;
  }): ParsedAddress | undefined {
    const separatorIndex = args.address.lastIndexOf("#");

    if (separatorIndex <= 0 || separatorIndex === args.address.length - 1) {
      return undefined;
    }

    const filePath = args.address.slice(0, separatorIndex);
    const symbolPath = args.address.slice(separatorIndex + 1);
    const { displayName, line } = this.parseSymbolPath(symbolPath);

    return {
      displayName,
      line,
      workspaceRelativePath: this.toWorkspaceRelative({
        filePath,
        workspaceRoot: args.workspaceRoot,
      }),
    };
  }

  /** Splits a `:<line>` disambiguator off the end of a symbol path, if present. */
  private parseSymbolPath(symbolPath: string): {
    displayName: string;
    line: number | undefined;
  } {
    const separatorIndex = symbolPath.lastIndexOf(":");
    const suffix = symbolPath.slice(separatorIndex + 1);

    if (separatorIndex === -1 || !DIGITS_ONLY_PATTERN.test(suffix)) {
      return { displayName: symbolPath, line: undefined };
    }

    return {
      displayName: symbolPath.slice(0, separatorIndex),
      line: Number(suffix),
    };
  }

  /** Writes one callable as the address that names it, with no disambiguator. */
  private toAddress(node: CallableNode): string {
    return `${node.location.filePath}#${node.displayName}`;
  }

  /** Turns matched callables into the candidates an ambiguous result names. */
  private toCandidates(
    matches: readonly DiscoveredCallable[],
  ): CallableAddressCandidate[] {
    return matches.map((callable) => ({
      id: callable.node.id,
      location: callable.node.location,
    }));
  }

  /** Resolves a file path, relative to the workspace root, to POSIX form. */
  private toWorkspaceRelative(args: {
    filePath: string;
    workspaceRoot: string;
  }): string {
    const absolutePath = path.resolve(args.workspaceRoot, args.filePath);

    return path
      .relative(args.workspaceRoot, absolutePath)
      .split(path.sep)
      .join("/");
  }

  // 🌎 Public Methods

  /**
   * Names what an ambiguous address could have meant, each as an address that
   * would pick it. Same-line declarations name a column instead.
   */
  public describeCandidates(args: {
    address: string;
    candidates: readonly CallableAddressCandidate[];
  }): string {
    const baseAddress = args.address.replace(LINE_DISAMBIGUATOR_PATTERN, "");
    const countsByLine = this.countCandidatesByLine(args.candidates);
    const sharesALine = [...countsByLine.values()].some((count) => count > 1);
    const described = args.candidates.map((candidate) => {
      const { column, line } = candidate.location;
      const address = `${baseAddress}:${String(line)}`;

      return countsByLine.get(line) === 1
        ? address
        : `${address} (column ${String(column)})`;
    });
    const advice = sharesALine
      ? `Two declarations on one line cannot be told apart by ":<line>" — rename one, or name a different callable.`
      : `Add ":<line>" to the address to pick one.`;

    return `Candidates: ${[...new Set(described)].join(", ")}. ${advice}`;
  }

  /**
   * Every callable a run discovered, written as an address that resolves to it,
   * so the list is safe to pick from.
   */
  public listAddresses(
    callablesById: ReadonlyMap<string, DiscoveredCallable>,
  ): string[] {
    const counts = new Map<string, number>();

    for (const callable of callablesById.values()) {
      const key = this.toAddress(callable.node);

      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    const addresses = [...callablesById.values()].map((callable) => {
      const address = this.toAddress(callable.node);

      return counts.get(address) === 1
        ? address
        : `${address}:${String(callable.node.location.line)}`;
    });

    return addresses.toSorted((left, right) => left.localeCompare(right));
  }

  /** Resolves a callable address against every callable a run discovered. */
  public resolve(args: ResolveAddressArguments): CallableAddressResolution {
    const parsed = this.parseAddress(args);

    if (parsed === undefined) {
      return {
        kind: "invalid",
        reason: this.describeInvalidAddress(args.address),
      };
    }

    const matches = this.findMatches({
      ...parsed,
      callablesById: args.callablesById,
    });

    const [only] = matches;

    if (only === undefined) {
      return { kind: "not-found" };
    }

    if (matches.length === 1) {
      return { id: only.node.id, kind: "resolved" };
    }

    return { candidates: this.toCandidates(matches), kind: "ambiguous" };
  }
}
