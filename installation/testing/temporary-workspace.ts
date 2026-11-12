import fs from "node:fs";
import path from "node:path";

/** A throwaway workspace root and home directory on the real file system. */
export interface TemporaryWorkspace {
  /** Stands in for the user's home directory. */
  home: string;
  /** Deletes the whole workspace. */
  remove: () => void;
  /** Stands in for the codebase's root directory. */
  root: string;
}

/** Inside the project: Linux children cannot resolve loaders from OS temp. */
const TEMPORARY_ROOT = path.resolve(
  import.meta.dirname,
  "../node_modules/.installation-tests",
);

/** Creates an empty workspace root and an empty home directory. */
export function createTemporaryWorkspace(): TemporaryWorkspace {
  fs.mkdirSync(TEMPORARY_ROOT, { recursive: true });

  const directory = fs.mkdtempSync(path.join(TEMPORARY_ROOT, "workspace-"));
  const home = path.join(directory, "home");
  const root = path.join(directory, "root");
  fs.mkdirSync(home);
  fs.mkdirSync(root);

  return {
    home,
    remove: (): void => {
      fs.rmSync(directory, { force: true, recursive: true });
    },
    root,
  };
}
