import { createMock } from "@golevelup/ts-vitest";
import { describe, expect, it, vi } from "vitest";

import { Author } from "@codebase/lexico-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { LibraryResolver } from "./library.resolver";
import { LibraryService } from "./library.service";

import type { LibraryPageRecord } from "./library.types";

describe(LibraryResolver, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(LibraryResolver, {
      mocks: [LibraryService],
    });

    expect(instance).toBeInstanceOf(LibraryResolver);
  });

  it("validates the arguments and maps the page the service returns", async () => {
    expect.hasAssertions();

    const author = Object.assign(new Author(), {
      id: "author-1",
      name: "Vergil",
      slug: "vergil",
    });
    const page: LibraryPageRecord = {
      authors: [{ author, matches: [], textCount: 0, texts: [] }],
      pageCount: 3,
      totalCount: 5,
    };
    const service = createMock<LibraryService>({
      listLibraryPage: vi
        .fn<LibraryService["listLibraryPage"]>()
        .mockResolvedValue(page),
    });
    const { instance } = await buildTestingModule(LibraryResolver, {
      providers: [{ provide: LibraryService, useValue: service }],
    });

    const result = await instance.library({
      page: 2,
      pageSize: 10,
      search: "  vergil ",
    });

    expect(service.listLibraryPage).toHaveBeenCalledWith("vergil", 2, 10);
    expect(result.totalCount).toBe(5);
    expect(result.pageCount).toBe(3);
    expect(result.authors[0]?.author.name).toBe("Vergil");
  });

  it("rejects invalid arguments before reaching the service", async () => {
    expect.hasAssertions();

    const service = createMock<LibraryService>();
    const { instance } = await buildTestingModule(LibraryResolver, {
      providers: [{ provide: LibraryService, useValue: service }],
    });

    await expect(instance.library({ page: 0 })).rejects.toThrow("Too small");
    expect(service.listLibraryPage).not.toHaveBeenCalled();
  });
});
