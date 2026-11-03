import { beforeAll, describe, expect, it } from "vitest";

import { Form } from "@codebase/lexico-entities";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { FormsTransientWordsService } from "./forms-transient-words.service";

describe(FormsTransientWordsService, () => {
  let service: FormsTransientWordsService;

  beforeAll(async () => {
    const built = await buildTestingModule(FormsTransientWordsService);

    service = built.instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(FormsTransientWordsService);

    expect(instance).toBeInstanceOf(FormsTransientWordsService);
  });

  it("should return empty words when none were set", () => {
    const form = new Form();

    expect(service.getTransientWords(form)).toStrictEqual([]);
  });

  it("should store and retrieve transient words for a form", () => {
    const form = new Form();

    service.setTransientWords(form, ["amo", "amas"]);

    expect(service.getTransientWords(form)).toStrictEqual(["amo", "amas"]);
  });
});
