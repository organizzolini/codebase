import { ConfigurationService } from "@callidescope/configuration";
import { Injectable } from "@nestjs/common";

import type { CallidescopeConfiguration } from "@callidescope/configuration";

/**
 * The same injected hop as `injected-dependency`, across a package boundary.
 *
 * `ConfigurationService` lives in `@callidescope/configuration`, a workspace dependency. Without it in the run's closure, `readDepthLimit` is the last frame.
 */
@Injectable()
export class DependencyClosureService {
  // 🏗 Dependency Injection

  constructor(private readonly configurationService: ConfigurationService) {}

  // 🔏 Private Methods

  /** Reads the depth limit the dependency's own defaulting settles on. */
  private readDepthLimit(configuration: CallidescopeConfiguration): number {
    return this.configurationService.resolveConfiguration(configuration).limits
      .maximumDepth;
  }

  // 🌎 Public Methods

  /** Whether a configuration allows a stack as deep as the one asked about. */
  public allowsDepth(args: {
    configuration: CallidescopeConfiguration;
    depth: number;
  }): boolean {
    return args.depth <= this.readDepthLimit(args.configuration);
  }
}
