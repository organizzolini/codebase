import fs from "node:fs";
import path from "node:path";

import { Injectable } from "@nestjs/common";
import { parse } from "yaml";

import {
  APPLICATIONS_CHART,
  applicationsSchema,
  BASE_VALUES,
  CHART_PATTERNS,
  DEFAULT_NAMESPACE,
  HELM_ROOT,
  IGNORED_FOLDERS,
  OVERRIDE_FILE,
  overrideSchema,
  PLACEHOLDER_IMAGE_TAG,
  PROJECT_VALUES_GLOB,
  projectValuesSchema,
  REFERENCE_PREFIX,
  valuesSchema,
  WORKSPACE_ROOT,
} from "./helm-releases.constants";

import type { HelmRelease } from "./helm-releases.types";

/**
 * Finds every Helm release, charts and project values, so each tool judges
 * exactly what Argo CD or a workflow installs.
 */
@Injectable()
export class HelmReleasesService {
  // 🏗 Dependency Injection

  constructor() {}

  // 🔐 Private Fields

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Maps each Application's chart and values files, joined, to its namespace. */
  private applicationNamespaces(root: string): Map<string, string> {
    const file = path.join(
      root,
      HELM_ROOT,
      APPLICATIONS_CHART,
      "values",
      BASE_VALUES,
    );
    const parsed = applicationsSchema.safeParse(this.readYaml(file));
    const namespaces = new Map<string, string>();

    for (const application of parsed.success ? parsed.data.applications : []) {
      if (application.path !== undefined) {
        namespaces.set(
          [
            path.basename(application.path),
            ...(application.valueFiles ?? []),
          ].join(" "),
          application.namespace,
        );
      }
    }

    return namespaces;
  }

  /** The folders that hold a `Chart.yaml`, central or in a project, by chart name. */
  private chartDirectories(root: string): string[] {
    const directories = fs
      .globSync(CHART_PATTERNS, {
        cwd: root,
        exclude: IGNORED_FOLDERS,
      })
      .map((file) => path.dirname(file));
    const names = new Set(
      directories.map((directory) => path.basename(directory)),
    );

    if (names.size !== directories.length) {
      throw new Error(`Two charts share a name: ${directories.join(", ")}`);
    }

    return directories.toSorted((first, second) =>
      path.basename(first).localeCompare(path.basename(second)),
    );
  }

  /** The release of one chart with its base values alone. */
  private chartRelease(
    root: string,
    directory: string,
    namespaces: Map<string, string>,
  ): HelmRelease {
    const chart = path.basename(directory);
    const chartDirectory = path.join(root, directory);
    const override = overrideSchema.parse(
      this.readYaml(path.join(chartDirectory, OVERRIDE_FILE)) ?? {},
    );
    const values = [`values/${BASE_VALUES}`];

    return {
      chart,
      directory,
      namespace:
        override.namespace ??
        namespaces.get([chart, ...values].join(" ")) ??
        DEFAULT_NAMESPACE,
      release: chart,
      strings: {
        ...(this.hasEmptyImageTag(chartDirectory, values)
          ? { "image.tag": PLACEHOLDER_IMAGE_TAG }
          : {}),
        ...override.strings,
      },
      values,
    };
  }

  /** Whether the last values file to set `image.tag` leaves it empty. */
  private hasEmptyImageTag(chartDirectory: string, values: string[]): boolean {
    let last: string | undefined;

    for (const file of values) {
      const parsed = valuesSchema.safeParse(
        this.readYaml(path.join(chartDirectory, file)),
      );

      last = (parsed.success ? parsed.data.image?.tag : undefined) ?? last;
    }

    return last === "";
  }

  /** The release of a project's values file, over the base values of the chart it names. */
  private projectRelease(
    root: string,
    file: string,
    directories: ReadonlyMap<string, string>,
    namespaces: Map<string, string>,
  ): HelmRelease {
    const absolute = path.resolve(root, file);
    const { chart } = projectValuesSchema.parse(this.readYaml(absolute));
    const directory = directories.get(chart);

    if (directory === undefined) {
      throw new Error(`${file} names the chart ${chart}, which does not exist`);
    }

    const base = `values/${BASE_VALUES}`;
    const chartDirectory = path.resolve(root, directory);
    const values = [base, path.relative(chartDirectory, absolute)];

    return {
      chart,
      directory,
      namespace:
        namespaces.get([chart, base, `${REFERENCE_PREFIX}${file}`].join(" ")) ??
        DEFAULT_NAMESPACE,
      release: `${chart}-${path.basename(path.dirname(path.dirname(file)))}`,
      strings: this.hasEmptyImageTag(chartDirectory, values)
        ? { "image.tag": PLACEHOLDER_IMAGE_TAG }
        : {},
      values,
    };
  }

  /** Reads a YAML file, or `undefined` when it does not exist. */
  private readYaml(file: string): unknown {
    return fs.existsSync(file)
      ? parse(fs.readFileSync(file, "utf8"))
      : undefined;
  }

  // 🌎 Public Methods

  /** The chart, namespace, values, and string arguments both helm commands take. */
  public chartArguments(root: string, release: HelmRelease): string[] {
    const chart = path.resolve(root, release.directory);

    return [
      chart,
      "--namespace",
      release.namespace,
      ...release.values.flatMap((file) => ["--values", path.join(chart, file)]),
      ...Object.entries(release.strings).flatMap(([key, value]) => [
        "--set-string",
        `${key}=${value}`,
      ]),
    ];
  }

  /**
   * Finds each chart's release with base values, plus `<chart>-<project>` for
   * every project that owns a `helm-values.yaml` naming the chart it layers over.
   */
  public discover(root = WORKSPACE_ROOT): HelmRelease[] {
    const namespaces = this.applicationNamespaces(root);
    const directories = this.chartDirectories(root);
    const charts = new Map(
      directories.map((directory) => [path.basename(directory), directory]),
    );

    const releases: HelmRelease[] = [];

    for (const directory of directories) {
      releases.push(this.chartRelease(root, directory, namespaces));
    }

    for (const file of fs
      .globSync(PROJECT_VALUES_GLOB, { cwd: root, exclude: IGNORED_FOLDERS })
      .toSorted()) {
      releases.push(this.projectRelease(root, file, charts, namespaces));
    }

    return releases;
  }
}
