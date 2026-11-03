import {
  GraphQLSchemaBuilderModule,
  GraphQLSchemaFactory,
} from "@nestjs/graphql";
import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { HealthResolver } from "./health.resolver";
import { HealthService } from "./health.service";

describe(HealthResolver, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(HealthResolver, {
      providers: [HealthService],
    });

    expect(instance).toBeInstanceOf(HealthResolver);
  });

  it("builds health resolver schema definition", async () => {
    expect.hasAssertions();

    const { module } = await buildTestingModule(HealthResolver, {
      imports: [GraphQLSchemaBuilderModule],
      providers: [HealthService],
    });

    const schemaFactory = module.get(GraphQLSchemaFactory);
    const schema = await schemaFactory.create([HealthResolver]);

    expect(schema).toBeDefined();
  });

  it("returns health check status from service", () => {
    expect.hasAssertions();

    const service = new HealthService();
    const resolver = new HealthResolver(service);

    expect(resolver.health()).toBe(true);
  });
});
