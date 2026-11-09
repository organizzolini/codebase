import path from "node:path";

import { ConfigurationService } from "@conformetry/configuration";
import { Injectable } from "@nestjs/common";

import { ScopeService } from "../scope/scope.service";

import type { FindProjectInstancesArguments } from "./instances.types";
import type {
  ConformetryInstanceGroup,
  Instance,
} from "@conformetry/configuration";

/**
 * Turns Nx project knowledge into the instances conformetry validates.
 *
 * This is the whole reason the plugin exists: the generic packages take a list
 * of paths, and deciding which paths belong to which project — and which
 * projects a configured instance group applies to — is Nx-shaped knowledge
 * that would otherwise have to live inside them.
 */
@Injectable()
export class InstancesService {
  // 🏗 Dependency Injection

  constructor(
    private readonly configurationService: ConfigurationService,
    private readonly scopeService: ScopeService,
  ) {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /**
   * Expands one group's globs, reusing an earlier expansion of the same request.
   *
   * Caching saves a full workspace walk per untagged group.
   */
  private discoverGroup(args: {
    cache: Map<string, Instance[]> | undefined;
    group: ConformetryInstanceGroup;
    workspaceRoot: string;
  }): Instance[] {
    const { group } = args;
    const request = {
      ...(group.exclude === undefined ? {} : { exclude: group.exclude }),
      patterns: group.patterns ?? [],
      ...(group.substitutions === undefined
        ? {}
        : { substitutions: group.substitutions }),
      ...(group.threshold === undefined ? {} : { threshold: group.threshold }),
      workingDirectory: args.workspaceRoot,
    };
    const key = JSON.stringify(request);
    const cached = args.cache?.get(key);

    if (cached !== undefined) {
      return cached;
    }

    const instances = this.configurationService.findInstances(request);

    args.cache?.set(key, instances);

    return instances;
  }

  /**
   * Returns whether an instance belongs to a project.
   *
   * Tests the joined path, since the bare path holds every project.
   */
  private isInsideProject(args: {
    instance: Instance;
    projectRootPath: string;
  }): boolean {
    const relativePath = path.relative(
      args.projectRootPath,
      path.join(args.instance.path, args.instance.nameStem),
    );

    return (
      relativePath !== ".." &&
      !relativePath.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relativePath)
    );
  }

  // 🌎 Public Methods

  /**
   * Expands the instance groups that apply to a project.
   *
   * Globs stay workspace-relative, since rewriting them per project would change what they mean.
   */
  public async findProjectInstances(
    args: FindProjectInstancesArguments,
  ): Promise<Instance[]> {
    const configuration =
      await this.configurationService.loadConformetryConfiguration(
        args.configurationPath,
      );
    const projectRootPath = path.resolve(args.workspaceRoot, args.project.root);

    const instances = configuration
      .flatMap((generator) => generator.instances)
      .flatMap((group) => {
        // A tagged group is read inside the project; an untagged one is the
        // workspace glob any host resolves. Both come back as globs.
        return this.scopeService.resolveGroup({ group, project: args.project });
      })
      .flatMap((group) => {
        return this.discoverGroup({
          cache: args.discoveryCache,
          group,
          workspaceRoot: args.workspaceRoot,
        });
      })
      .filter((instance) => {
        return this.isInsideProject({ instance, projectRootPath });
      });

    // First-match-wins: an instance two generators both locate is kept once.
    // The file scope is part of the identity, because a service and a resolver
    // share a name stem yet are different instances of different templates —
    // keyed by name alone, whichever generator came first hid the other.
    const seenInstances = new Set<string>();
    return instances.filter((instance) => {
      const key = [
        instance.path,
        instance.nameStem,
        (instance.fileScope ?? []).join(","),
      ].join(":");
      if (seenInstances.has(key)) {
        return false;
      }
      seenInstances.add(key);
      return true;
    });
  }
}
