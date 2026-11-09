import { Injectable } from "@nestjs/common";

import type { ConformetryInstanceGroup } from "./instance-group.types.js";

/**
 * Reads an instance group's own fields, for every host that resolves one.
 *
 * Both hosts must agree on which groups are project-scoped, so the reading lives here.
 */
@Injectable()
export class InstanceGroupService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  // 🌎 Public Methods

  /**
   * Whether a group locates its instances inside the hosts its tags select.
   *
   * Empty `tags` selects nothing, so it reads as the workspace form.
   */
  public isProjectScoped(group: ConformetryInstanceGroup): boolean {
    return group.tags !== undefined && group.tags.length > 0;
  }
}
