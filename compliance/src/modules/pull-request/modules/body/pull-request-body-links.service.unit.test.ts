import { beforeAll, describe, expect, it } from "vitest";

import { buildTestingModule } from "@codebase/testing/nestjs";

import { PullRequestBodyLinksService } from "./pull-request-body-links.service";

describe(PullRequestBodyLinksService, () => {
  let service: PullRequestBodyLinksService;

  beforeAll(async () => {
    const built = await buildTestingModule(PullRequestBodyLinksService);

    service = built.instance;
  });

  it("resolves with its dependencies", async () => {
    const { instance } = await buildTestingModule(PullRequestBodyLinksService);

    expect(instance).toBeInstanceOf(PullRequestBodyLinksService);
  });

  it("adds missing ancestor references to the Related list", () => {
    const body = [
      "## 🌰 Summary",
      "",
      "Implements the child issue.",
      "",
      "## 📝 Details",
      "",
      "- Change the child.",
      "",
      "## 🧪 Testing",
      "",
      "1. Run the tests.",
      "",
      "## 🔗 Related",
      "",
      "- Closes #42",
      "",
    ].join("\n");

    expect(service.addRelatedIssueReferences(body, [42, 7, 3])).toBe(
      [
        "## 🌰 Summary",
        "",
        "Implements the child issue.",
        "",
        "## 📝 Details",
        "",
        "- Change the child.",
        "",
        "## 🧪 Testing",
        "",
        "1. Run the tests.",
        "",
        "## 🔗 Related",
        "",
        "- Closes #42",
        "- Related to #7",
        "- Related to #3",
        "",
      ].join("\n"),
    );
  });

  it("does not duplicate existing references or change a body with no ancestors", () => {
    const body = [
      "## 🌰 Summary",
      "",
      "Implements the child issue.",
      "",
      "## 📝 Details",
      "",
      "- Change the child.",
      "",
      "## 🧪 Testing",
      "",
      "1. Run the tests.",
      "",
      "## 🔗 Related",
      "",
      "- Related to #7",
      "",
    ].join("\n");

    expect(service.addRelatedIssueReferences(body, [7, 7])).toBe(body);
    expect(service.addRelatedIssueReferences(body, [])).toBe(body);
    expect(service.addRelatedIssueReferences(body, [7, 3])).toBe(
      `${body.trimEnd()}\n- Related to #3\n`,
    );
  });

  it("returns a body without a Related section unchanged when there are no ancestors", () => {
    expect(service.addRelatedIssueReferences("A body", [])).toBe("A body");
  });

  it("leads each reference with the given closing keyword", () => {
    expect(
      service.addRelatedIssueReferences(
        "## 🔗 Related\n\n- Closes #1\n",
        [7],
        "Closes",
      ),
    ).toBe("## 🔗 Related\n\n- Closes #1\n- Closes #7\n");
  });

  it("keeps references inside the Related section when a heading follows it", () => {
    expect(
      service.addRelatedIssueReferences(
        "## 🔗 Related\n\n- Closes #1\n\n## Notes\n\ntext\n",
        [7],
      ),
    ).toBe(
      "## 🔗 Related\n\n- Closes #1\n- Related to #7\n\n## Notes\n\ntext\n",
    );
  });

  it("adds references to an empty Related section", () => {
    expect(service.addRelatedIssueReferences("## 🔗 Related\n", [7])).toBe(
      "## 🔗 Related\n- Related to #7\n",
    );
  });

  it("preserves CRLF line endings", () => {
    expect(
      service.addRelatedIssueReferences(
        "## 🔗 Related\r\n- Closes #42\r\n",
        [7],
      ),
    ).toBe("## 🔗 Related\r\n- Closes #42\r\n- Related to #7\r\n");
  });

  it("requires the body to have a Related section when an ancestor exists", () => {
    expect(() => service.addRelatedIssueReferences("A body", [7])).toThrow(
      "Pull request body is missing ## 🔗 Related",
    );
  });

  describe("extractClosingIssueNumbers", () => {
    it("reads the issues a description closes with a keyword", () => {
      expect.hasAssertions();
      expect(
        service.extractClosingIssueNumbers(
          "## 🔗 Related\n\n- Closes #12\n- Fixes #7\n- resolved #3",
        ),
      ).toStrictEqual([12, 7, 3]);
    });

    it("accepts every form of the keyword and an optional colon", () => {
      expect.hasAssertions();
      expect(
        service.extractClosingIssueNumbers(
          "close #1 closes #2 closed #3 fix #4 fixes #5 fixed #6 resolve #7 resolves #8 resolved #9 Closes: #10",
        ),
      ).toStrictEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("names each issue once, in the order written", () => {
      expect.hasAssertions();
      expect(
        service.extractClosingIssueNumbers("Closes #5\nFixes #3\nCloses #5"),
      ).toStrictEqual([5, 3]);
    });

    it("ignores an issue mentioned without a closing keyword", () => {
      expect.hasAssertions();
      expect(
        service.extractClosingIssueNumbers(
          "- Related to #4\n- See #9\n- Disclosed #6",
        ),
      ).toStrictEqual([]);
    });

    it("reads nothing from an empty description", () => {
      expect.hasAssertions();
      expect(service.extractClosingIssueNumbers("")).toStrictEqual([]);
    });
  });
});
