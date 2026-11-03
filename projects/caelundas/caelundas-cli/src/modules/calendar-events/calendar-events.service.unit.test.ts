import { getRepositoryToken } from "@nestjs/typeorm";
import { describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { CalendarEvent } from "../database/entities/calendar-event.entity";
import { TagsService } from "../tags/tags.service";

import { CalendarEventsService } from "./calendar-events.service";

describe(CalendarEventsService, () => {
  const testingModuleOptions = {
    providers: [
      TagsService,
      { provide: getRepositoryToken(CalendarEvent), useValue: {} },
    ],
  };

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(
      CalendarEventsService,
      testingModuleOptions,
    );

    expect(instance).toBeInstanceOf(CalendarEventsService);
  });
});
