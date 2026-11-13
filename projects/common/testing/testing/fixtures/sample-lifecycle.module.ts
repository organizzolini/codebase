import { Module } from "@nestjs/common";

import { SampleLifecycleService } from "./sample-lifecycle.service";

/** A root module with one provider that notes when it is destroyed. */
@Module({ providers: [SampleLifecycleService] })
export class SampleLifecycleModule {}
