import { Module } from "@nestjs/common";
import { describe, expect, it } from "vitest";

import { SampleGreeterService } from "../../../testing/fixtures/sample-greeter.service";
import { SampleLifecycleModule } from "../../../testing/fixtures/sample-lifecycle.module";
import { SampleLifecycleService } from "../../../testing/fixtures/sample-lifecycle.service";

import { bootModule } from "./boot-module.utilities";

// 🧪 Tests

describe(bootModule, () => {
  it("boots the module with its real providers", async () => {
    SampleLifecycleService.destroyed = 0;

    const booted = await bootModule(SampleLifecycleModule);

    expect(booted.get(SampleLifecycleModule)).toBeInstanceOf(
      SampleLifecycleModule,
    );
    expect(booted.get(SampleLifecycleService)).toBeInstanceOf(
      SampleLifecycleService,
    );
    expect(SampleLifecycleService.destroyed).toBe(0);
  });

  it("closes the module once its test finished", () => {
    expect(SampleLifecycleService.destroyed).toBe(1);
  });

  it("rejects when a provider's dependency is missing", async () => {
    @Module({ providers: [SampleGreeterService] })
    class BrokenModule {}

    await expect(bootModule(BrokenModule)).rejects.toThrow(
      /SampleClockService/u,
    );
  });
});
