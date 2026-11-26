import fs from "node:fs";
import path from "node:path";

import { parse } from "yaml";

import {
  APPLICATIONS_CHART,
  applicationsSchema,
  BASE_VALUES,
  DEFAULT_NAMESPACE,
  OVERRIDE_FILE,
  overrideSchema,
  PLACEHOLDER_IMAGE_TAG,
  valuesSchema,
} from "./helm-releases.constants";

import type { HelmRelease } from "./helm-releases.types";

/**
 * Finds each chart's release with base values, plus `<chart>-<name>` for every
 * other values file layered over base.
 */
export function discoverReleases(root: string): HelmRelease[] {
  const namespaces = applicationNamespaces(root);
  const releases: HelmRelease[] = [];

  for (const chart of chartNames(root)) {
    releases.push(...chartReleases(root, chart, namespaces));
  }

  return releases;
}

/** Maps each Application's chart and values files, joined, to its namespace. */
function applicationNamespaces(root: string): Map<string, string> {
  const file = path.join(root, APPLICATIONS_CHART, "values", BASE_VALUES);
  const parsed = applicationsSchema.safeParse(readYaml(file));
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

/** The folders under a charts folder that hold a `Chart.yaml`, sorted. */
function chartNames(root: string): string[] {
  return fs
    .readdirSync(root, { withFileTypes: true })
    .filter(
      (entry) =>
        entry.isDirectory() &&
        fs.existsSync(path.join(root, entry.name, "Chart.yaml")),
    )
    .map((entry) => entry.name)
    .toSorted();
}

/** The releases of one chart: base alone, then base with each other values file. */
function chartReleases(
  root: string,
  chart: string,
  namespaces: Map<string, string>,
): HelmRelease[] {
  const chartDirectory = path.join(root, chart);
  const override = overrideSchema.parse(
    readYaml(path.join(chartDirectory, OVERRIDE_FILE)) ?? {},
  );
  const base = `values/${BASE_VALUES}`;

  const releases: HelmRelease[] = [];

  for (const variant of [undefined, ...valuesFiles(chartDirectory)]) {
    const values = variant === undefined ? [base] : [base, `values/${variant}`];

    releases.push({
      chart,
      namespace:
        override.namespace ??
        namespaces.get([chart, ...values].join(" ")) ??
        DEFAULT_NAMESPACE,
      release:
        variant === undefined
          ? chart
          : `${chart}-${path.basename(variant, ".yaml")}`,
      strings: {
        ...(hasEmptyImageTag(chartDirectory, values)
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
function hasEmptyImageTag(chartDirectory: string, values: string[]): boolean {
  let last: string | undefined;

  for (const file of values) {
    const parsed = valuesSchema.safeParse(
      readYaml(path.join(chartDirectory, file)),
    );

    last = (parsed.success ? parsed.data.image?.tag : undefined) ?? last;
  }

  return last === "";
}

/** Reads a YAML file, or `undefined` when it does not exist. */
function readYaml(file: string): unknown {
  return fs.existsSync(file) ? parse(fs.readFileSync(file, "utf8")) : undefined;
}

/** Lists the values files of a chart other than `base.yaml`, sorted. */
function valuesFiles(chartDirectory: string): string[] {
  const directory = path.join(chartDirectory, "values");
  const names = fs.existsSync(directory)
    ? fs.readdirSync(directory).filter((name) => name.endsWith(".yaml"))
    : [];

  return names.toSorted().filter((name) => name !== BASE_VALUES);
}
