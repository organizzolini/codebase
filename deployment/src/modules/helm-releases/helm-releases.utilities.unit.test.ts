import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";

import { TEMPORARY_ROOT } from "../../../testing/mocks";

import { discoverReleases } from "./helm-releases.utilities";

/** Writes files, by path under a root, creating folders as needed. */
const write = (root: string, files: Record<string, string>): string => {
  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), content);
  }

  return root;
};

/** Builds a charts folder holding the given files. */
const tree = (files: Record<string, string>): string =>
  write(createTemporaryDirectory("charts", TEMPORARY_ROOT), files);

describe(discoverReleases, () => {
  it("makes one release of a chart with only base values", () => {
    expect.hasAssertions();

    expect(
      discoverReleases(
        tree({
          "app/Chart.yaml": "name: app",
          "app/values/base.yaml": "a: 1",
        }),
      ),
    ).toStrictEqual([
      {
        chart: "app",
        namespace: "default",
        release: "app",
        strings: {},
        values: ["values/base.yaml"],
      },
    ]);
  });

  it("adds a release for each further values file, layered over base", () => {
    expect.hasAssertions();

    const releases = discoverReleases(
      tree({
        "app/Chart.yaml": "name: app",
        "app/values/base.yaml": "a: 1",
        "app/values/one.yaml": "a: 2",
        "app/values/two.yaml": "a: 3",
      }),
    );

    expect(
      releases.map(({ release, values }) => [release, values]),
    ).toStrictEqual([
      ["app", ["values/base.yaml"]],
      ["app-one", ["values/base.yaml", "values/one.yaml"]],
      ["app-two", ["values/base.yaml", "values/two.yaml"]],
    ]);
  });

  it("ignores folders without a Chart.yaml and finds every chart", () => {
    expect.hasAssertions();

    const releases = discoverReleases(
      tree({
        "a/Chart.yaml": "name: a",
        "a/values/base.yaml": "a: 1",
        "b/Chart.yaml": "name: b",
        "notes/readme.md": "not a chart",
      }),
    );

    expect(releases.map(({ release }) => release)).toStrictEqual(["a", "b"]);
  });

  it("takes the namespace from the Application that installs the release", () => {
    expect.hasAssertions();

    const releases = discoverReleases(
      tree({
        "app/Chart.yaml": "name: app",
        "app/values/base.yaml": "a: 1",
        "app/values/web.yaml": "a: 2",
        "argocd/Chart.yaml": "name: argocd",
        "argocd/values/base.yaml": [
          "applications:",
          "  - name: external",
          "    namespace: elsewhere",
          "    chart: {name: x}",
          "  - name: app",
          "    namespace: one",
          "    path: infrastructure/helm/app",
          "    valueFiles: [values/base.yaml]",
          "  - name: app-web",
          "    namespace: two",
          "    path: infrastructure/helm/app",
          "    valueFiles: [values/base.yaml, values/web.yaml]",
        ].join("\n"),
      }),
    );

    expect(
      releases.map(({ namespace, release }) => [release, namespace]),
    ).toStrictEqual([
      ["app", "one"],
      ["app-web", "two"],
      ["argocd", "default"],
    ]);
  });

  it("passes a placeholder tag where the values leave image.tag empty", () => {
    expect.hasAssertions();

    const releases = discoverReleases(
      tree({
        "app/Chart.yaml": "name: app",
        "app/values/base.yaml": 'image:\n  tag: ""',
        "app/values/pinned.yaml": "image:\n  tag: 1.2.3",
      }),
    );

    expect(releases.map(({ strings }) => strings)).toStrictEqual([
      { "image.tag": "0.0.0" },
      {},
    ]);
  });

  it("reads a chart's release.yaml over what it derives", () => {
    expect.hasAssertions();

    const [release] = discoverReleases(
      tree({
        "app/Chart.yaml": "name: app",
        "app/release.yaml": "namespace: custom\nstrings:\n  key: value",
        "app/values/base.yaml": 'image:\n  tag: ""',
      }),
    );

    expect(release).toMatchObject({
      namespace: "custom",
      strings: { "image.tag": "0.0.0", key: "value" },
    });
  });

  it("rejects a release.yaml with an unknown key", () => {
    expect.hasAssertions();

    expect(() =>
      discoverReleases(
        tree({
          "app/Chart.yaml": "name: app",
          "app/release.yaml": "unknown: typo",
          "app/values/base.yaml": "a: 1",
        }),
      ),
    ).toThrow("unknown");
  });
});
