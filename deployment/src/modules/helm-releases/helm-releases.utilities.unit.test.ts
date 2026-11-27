import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { createTemporaryDirectory } from "@codebase/testing";

import { TEMPORARY_ROOT } from "../../../testing/mocks";

import { discoverReleases } from "./helm-releases.utilities";

import type { HelmRelease } from "./helm-releases.types";

/** Writes files, by path under a root, creating folders as needed. */
const write = (root: string, files: Record<string, string>): string => {
  for (const [name, content] of Object.entries(files)) {
    fs.mkdirSync(path.dirname(path.join(root, name)), { recursive: true });
    fs.writeFileSync(path.join(root, name), content);
  }

  return root;
};

/** Builds a workspace holding the given files. */
const workspaceTree = (files: Record<string, string>): string =>
  write(createTemporaryDirectory("workspace", TEMPORARY_ROOT), files);

/** Discovers the releases of charts written under `infrastructure/helm`. */
const discover = (files: Record<string, string>): HelmRelease[] => {
  const workspace = workspaceTree(
    Object.fromEntries(
      Object.entries(files).map(([name, content]) => [
        name.startsWith("projects/") ? name : `infrastructure/helm/${name}`,
        content,
      ]),
    ),
  );

  return discoverReleases(
    path.join(workspace, "infrastructure/helm"),
    workspace,
  );
};

describe(discoverReleases, () => {
  it("makes one release of a chart with only base values", () => {
    expect.hasAssertions();

    expect(
      discover({
        "app/Chart.yaml": "name: app",
        "app/values/base.yaml": "a: 1",
      }),
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

  it("adds a release for each project values file, layered over its chart's base", () => {
    expect.hasAssertions();

    const releases = discover({
      "app/Chart.yaml": "name: app",
      "app/values/base.yaml": "a: 1",
      "projects/group/one/infrastructure/helm-values.yaml": "chart: app\na: 2",
      "projects/group/two/infrastructure/helm-values.yaml": "chart: app\na: 3",
    });

    expect(
      releases.map(({ release, values }) => [release, values]),
    ).toStrictEqual([
      ["app", ["values/base.yaml"]],
      [
        "app-one",
        [
          "values/base.yaml",
          "../../../projects/group/one/infrastructure/helm-values.yaml",
        ],
      ],
      [
        "app-two",
        [
          "values/base.yaml",
          "../../../projects/group/two/infrastructure/helm-values.yaml",
        ],
      ],
    ]);
  });

  it("rejects a project values file that names no chart", () => {
    expect.hasAssertions();

    expect(() =>
      discover({
        "app/Chart.yaml": "name: app",
        "projects/group/one/infrastructure/helm-values.yaml": "a: 2",
      }),
    ).toThrow("chart");
  });

  it("ignores folders without a Chart.yaml and finds every chart", () => {
    expect.hasAssertions();

    const releases = discover({
      "a/Chart.yaml": "name: a",
      "a/values/base.yaml": "a: 1",
      "b/Chart.yaml": "name: b",
      "notes/readme.md": "not a chart",
    });

    expect(releases.map(({ release }) => release)).toStrictEqual(["a", "b"]);
  });

  it("takes the namespace from the Application that installs the release", () => {
    expect.hasAssertions();

    const releases = discover({
      "app/Chart.yaml": "name: app",
      "app/values/base.yaml": "a: 1",
      "argocd-applications/Chart.yaml": "name: argocd-applications",
      "argocd-applications/values/base.yaml": [
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
        "    valueFiles:",
        "      - values/base.yaml",
        "      - $values/projects/group/web/infrastructure/helm-values.yaml",
      ].join("\n"),
      "projects/group/web/infrastructure/helm-values.yaml": "chart: app",
    });

    expect(
      releases.map(({ namespace, release }) => [release, namespace]),
    ).toStrictEqual([
      ["app", "one"],
      ["argocd-applications", "default"],
      ["app-web", "two"],
    ]);
  });

  it("passes a placeholder tag where the values leave image.tag empty", () => {
    expect.hasAssertions();

    const releases = discover({
      "app/Chart.yaml": "name: app",
      "app/values/base.yaml": 'image:\n  tag: ""',
      "projects/group/pinned/infrastructure/helm-values.yaml":
        "chart: app\nimage:\n  tag: 1.2.3",
      "projects/group/unset/infrastructure/helm-values.yaml": "chart: app",
    });

    expect(releases.map(({ strings }) => strings)).toStrictEqual([
      { "image.tag": "0.0.0" },
      {},
      { "image.tag": "0.0.0" },
    ]);
  });

  it("reads a chart's release.yaml over what it derives", () => {
    expect.hasAssertions();

    const [release] = discover({
      "app/Chart.yaml": "name: app",
      "app/release.yaml": "namespace: custom\nstrings:\n  key: value",
      "app/values/base.yaml": 'image:\n  tag: ""',
    });

    expect(release).toMatchObject({
      namespace: "custom",
      strings: { "image.tag": "0.0.0", key: "value" },
    });
  });

  it("rejects a release.yaml with an unknown key", () => {
    expect.hasAssertions();

    expect(() =>
      discover({
        "app/Chart.yaml": "name: app",
        "app/release.yaml": "unknown: typo",
        "app/values/base.yaml": "a: 1",
      }),
    ).toThrow("unknown");
  });
});
