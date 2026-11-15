import { getRepositoryToken } from "@nestjs/typeorm";
import { describe, expect, it, vi } from "vitest";

import { Author, Text } from "@codebase/lexico-db";
import { buildTestingModule } from "@codebase/testing/nestjs";

import { createRepositoryMock } from "../../../testing/mocks";

import { LibraryService } from "./library.service";

describe(LibraryService, () => {
  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(LibraryService, {
      providers: [
        {
          provide: getRepositoryToken(Author),
          useValue: createRepositoryMock<Author>(),
        },
        {
          provide: getRepositoryToken(Text),
          useValue: createRepositoryMock<Text>(),
        },
      ],
    });

    expect(instance).toBeInstanceOf(LibraryService);
  });

  it("returns an empty page without loading texts when no author is on it", async () => {
    expect.hasAssertions();

    const authors = createRepositoryMock<Author>();
    const texts = createRepositoryMock<Text>();
    const { instance } = await buildTestingModule(LibraryService, {
      providers: [
        { provide: getRepositoryToken(Author), useValue: authors },
        { provide: getRepositoryToken(Text), useValue: texts },
      ],
    });
    const builder = authors.createQueryBuilder("author");
    vi.mocked(builder.getCount).mockResolvedValue(0);

    const page = await instance.listLibraryPage(null, 1, 24);

    expect(page).toStrictEqual({ authors: [], pageCount: 0, totalCount: 0 });
    expect(texts.find).not.toHaveBeenCalled();
  });

  it("counts the pages the total fills, even when the page is past the last", async () => {
    expect.hasAssertions();

    const authors = createRepositoryMock<Author>();
    const { instance } = await buildTestingModule(LibraryService, {
      providers: [
        { provide: getRepositoryToken(Author), useValue: authors },
        {
          provide: getRepositoryToken(Text),
          useValue: createRepositoryMock<Text>(),
        },
      ],
    });
    const builder = authors.createQueryBuilder("author");
    vi.mocked(builder.getCount).mockResolvedValue(5);

    const page = await instance.listLibraryPage("vergil", 4, 2);

    expect(page).toStrictEqual({ authors: [], pageCount: 3, totalCount: 5 });
  });
});
