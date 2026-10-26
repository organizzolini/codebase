import fs from "node:fs";

import { Injectable } from "@nestjs/common";

import { PackageManifestService } from "../package-manifest/package-manifest.service";

import {
  NODE_INDEX_URL,
  NODE_VERSION_FILE,
  releasesSchema,
  VERSION_PATTERN,
} from "./upgrade-node.constants";

/**
 * Moves the Node version the workspace runs to the newest release of the major
 * it is on, in `.nvmrc` and in the `engines.node` it requires.
 *
 * A new major is a decision, so this never crosses one, and it never goes back
 * to an older release than the one in use.
 */
@Injectable()
export class UpgradeNodeService {
  // 🏗 Dependency Injection

  constructor(private readonly packageManifest: PackageManifestService) {}

  // 🔐 Private Fields

  /** Orders versions by their numbers, so that 24.9.0 comes before 24.16.0. */
  private readonly collator = new Intl.Collator("en", { numeric: true });

  // 🔑 Public Fields

  // 🔏 Private Methods

  /** Every release Node.js has published, as `v` and three numbers. */
  private async fetchReleases(): Promise<string[]> {
    const response = await fetch(NODE_INDEX_URL);

    if (!response.ok) {
      throw new Error(`${NODE_INDEX_URL} answered HTTP ${response.status}`);
    }

    const releases = releasesSchema.parse(await response.json());

    return releases.map((release) => release.version);
  }

  // 🌎 Public Methods

  /**
   * Writes the newest release of the current major, when it is newer than the
   * one in use.
   *
   * @returns The version now in use, as a summary line.
   * @throws When `.nvmrc` is not a version, or Node.js lists no release of its
   *   major.
   */
  public async upgrade(): Promise<string> {
    const current = fs.readFileSync(NODE_VERSION_FILE, "utf8").trim();
    const major = VERSION_PATTERN.exec(current)?.groups?.["major"];

    if (major === undefined) {
      throw new Error(`${NODE_VERSION_FILE} holds "${current}", not a version`);
    }

    const releases = await this.fetchReleases();
    const latest = releases
      .filter(
        (version) => VERSION_PATTERN.exec(version)?.groups?.["major"] === major,
      )
      .toSorted((a, b) => this.collator.compare(a, b))
      .at(-1);

    if (latest === undefined) {
      throw new Error(`Node.js lists no release of ${major}.x`);
    }

    if (this.collator.compare(latest, current) <= 0) {
      return `node ${current} (already the newest ${major}.x)`;
    }

    fs.writeFileSync(NODE_VERSION_FILE, `${latest}\n`);
    this.packageManifest.replace("engines.node", `>=${latest.slice(1)}`);

    return `node ${latest}`;
  }
}
