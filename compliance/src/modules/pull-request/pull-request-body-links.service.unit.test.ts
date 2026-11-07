import { Test } from "@nestjs/testing";
import { beforeAll, describe, expect, it } from "vitest";

import { PullRequestBodyLinksService } from "./pull-request-body-links.service";

describe(PullRequestBodyLinksService, () => {
  let service: PullRequestBodyLinksService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [PullRequestBodyLinksService],
    }).compile();

    service = await module.resolve(PullRequestBodyLinksService);
  });

  it("is defined", () => {
    expect(service).toBeDefined();
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
});
