// 🌎 Utilities

/** The `major.minor` an application's `requires-python` starts at. */
export function currentVersion(pyproject: string): string {
  const version = /^requires-python = ">=(?<version>\d+\.\d+),/mu.exec(
    pyproject,
  )?.groups?.["version"];

  if (version === undefined) {
    throw new Error(
      "the pyproject has no requires-python of the form >=3.x,<3.y",
    );
  }

  return version;
}

/** The minor version after the one given: 3.14 is followed by 3.15. */
export function nextVersion(version: string): string {
  const [major, minor] = version.split(".");

  return `${String(major)}.${String(Number(minor) + 1)}`;
}

/** The pyproject with `requires-python` allowing exactly the given minor. */
export function withRequiredVersion(
  pyproject: string,
  version: string,
): string {
  return pyproject.replace(
    /^requires-python = .*$/mu,
    `requires-python = ">=${version},<${nextVersion(version)}"`,
  );
}

/** The tool configuration with ruff and pyright aimed at the given minor. */
export function withToolVersions(pyproject: string, version: string): string {
  return pyproject
    .replace(
      /^target-version = "py\d+/mu,
      `target-version = "py${version.replace(".", "")}`,
    )
    .replace(/^pythonVersion = "3\.\d+/mu, `pythonVersion = "${version}`);
}
