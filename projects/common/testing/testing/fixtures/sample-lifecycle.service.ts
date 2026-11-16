import { Injectable } from "@nestjs/common";

import type { OnModuleDestroy } from "@nestjs/common";

/** A provider that counts its own shutdowns, so a test can see a module close. */
@Injectable()
export class SampleLifecycleService implements OnModuleDestroy {
  /** How many times a module holding this provider was torn down. */
  public static destroyed = 0;

  /** Records the shutdown. */
  public onModuleDestroy(): void {
    SampleLifecycleService.destroyed += 1;
  }
}
