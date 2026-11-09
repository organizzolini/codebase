import { Module } from "@nestjs/common";

import { InstanceGroupService } from "./instance-group.service";

/**
 * Provides the reading of an instance group's own fields.
 *
 * Kept in its own module so both the facade and instance discovery can import it without a cycle.
 */
@Module({
  controllers: [],
  exports: [InstanceGroupService],
  imports: [],
  providers: [InstanceGroupService],
})
export class InstanceGroupModule {}
