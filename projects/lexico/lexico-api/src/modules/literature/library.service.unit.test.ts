import { getRepositoryToken } from "@nestjs/typeorm";
import { describe, expect, it } from "vitest";

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
});
