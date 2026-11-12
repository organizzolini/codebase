import fs from "node:fs";
import path from "node:path";

import { execa } from "execa";

/** What a fixture tarball's package declares. */
export interface FixtureTarballOptions {
  /** Name of a command the package installs, printing its name and arguments. */
  readonly bin?: string;
  readonly dependencies?: Readonly<Record<string, string>>;
  readonly name: string;
  readonly version: string;
}

/** Packs a tiny package into `<directory>/<flat-name>-<version>.tgz` and returns that path. */
export async function createFixtureTarball(
  directory: string,
  options: FixtureTarballOptions,
): Promise<string> {
  const { bin, dependencies = {}, name, version } = options;
  const flatName = name.replace(/^@/u, "").replace("/", "-");
  const staging = fs.mkdtempSync(path.join(directory, "stage-"));
  const packageDirectory = path.join(staging, "package");
  fs.mkdirSync(packageDirectory);

  const manifest = {
    ...(bin === undefined ? {} : { bin: { [bin]: "bin.js" } }),
    dependencies,
    name,
    version,
  };
  fs.writeFileSync(
    path.join(packageDirectory, "package.json"),
    JSON.stringify(manifest),
  );
  fs.writeFileSync(
    path.join(packageDirectory, "bin.js"),
    `#!/usr/bin/env node\nprocess.stdout.write(["${bin ?? name}", ...process.argv.slice(2)].join(" "));\n`,
    { mode: 0o755 },
  );

  const tarball = path.join(directory, `${flatName}-${version}.tgz`);
  await execa("tar", ["-czf", tarball, "-C", staging, "package"]);
  fs.rmSync(staging, { force: true, recursive: true });

  return tarball;
}
