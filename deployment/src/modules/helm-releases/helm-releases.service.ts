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
  valuesSchema,
  WORKSPACE_ROOT,
} from "./helm-releases.constants";

import type { HelmRelease } from "./helm-releases.types";

/**
 * Finds every Helm release under the charts folder, so each tool judges
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

  /** The releases of one chart: base alone, then base with each other values file. */
  private chartReleases(
    root: string,
    directory: string,
    namespaces: Map<string, string>,
  ): HelmRelease[] {
    const chart = path.basename(directory);
    const chartDirectory = path.join(root, directory);
    const override = overrideSchema.parse(
      this.readYaml(path.join(chartDirectory, OVERRIDE_FILE)) ?? {},
    );
    const base = `values/${BASE_VALUES}`;

    const releases: HelmRelease[] = [];

    for (const variant of [undefined, ...this.valuesFiles(chartDirectory)]) {
      const values =
        variant === undefined ? [base] : [base, `values/${variant}`];

      releases.push({
        chart,
        directory,
        namespace:
          override.namespace ??
          namespaces.get([chart, ...values].join(" ")) ??
          DEFAULT_NAMESPACE,
        release:
          variant === undefined
            ? chart
            : `${chart}-${path.basename(variant, ".yaml")}`,
        strings: {
          ...(this.hasEmptyImageTag(chartDirectory, values)
            ? { "image.tag": PLACEHOLDER_IMAGE_TAG }
            : {}),
          ...override.strings,
        },
        values,
      });
    }

    return releases;
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

  /** Reads a YAML file, or `undefined` when it does not exist. */
  private readYaml(file: string): unknown {
    return fs.existsSync(file)
      ? parse(fs.readFileSync(file, "utf8"))
      : undefined;
  }

  /** Lists the values files of a chart other than `base.yaml`, sorted. */
  private valuesFiles(chartDirectory: string): string[] {
    const directory = path.join(chartDirectory, "values");
    const names: string[] = [];

    for (const name of fs.existsSync(directory)
      ? fs.readdirSync(directory)
      : []) {
      if (name.endsWith(".yaml") && name !== BASE_VALUES) {
        names.push(name);
      }
    }

    return names.toSorted();
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
   * Finds each chart's release with base values, plus `<chart>-<name>` for every
   * other values file layered over base.
   */
  public discover(root = WORKSPACE_ROOT): HelmRelease[] {
    const namespaces = this.applicationNamespaces(root);

    const releases: HelmRelease[] = [];

    for (const directory of this.chartDirectories(root)) {
      releases.push(...this.chartReleases(root, directory, namespaces));
    }

    return releases;
  }
}
