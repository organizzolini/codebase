// 🏷️ Types

/** How a release is packaged: `binary` is the bare executable. */
export type ReleaseArchiveFormat = "binary" | "tar.gz" | "zip";

/** A Linux release: `{version}` is the pin, `{architecture}` the processor name. */
export interface ReleaseArchiveTool {
  /** What this tool calls each processor architecture Node reports. */
  architectures: Readonly<Record<string, string>>;
  /** The file name the release is published under. */
  archiveName: string;
  /** Where the checksums are published. Each line is `hash name`; a line of only a hash covers the archive. */
  checksumUrl: string;
  /** Where the archive is downloaded from. */
  downloadUrl: string;
  /** How the release is packaged. */
  format: ReleaseArchiveFormat;
  /** Where each executable is inside the archive; installed under its file name. */
  members: string[];
  /** The command the tool installs, which is also what tells it is already there. */
  name: string;
  /** The release to install, without a leading `v`. */
  version: string;
}

/** A release with its archive name, architecture, and download path settled. */
export interface ReleaseDownload {
  /** What the tool calls this machine's processor. */
  architecture: string;
  /** The file name the archive is saved under, inside `directory`. */
  archive: string;
  /** The scratch directory everything is downloaded and unpacked in. */
  directory: string;
}
