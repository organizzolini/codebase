// 🏷️ Types

/** A Caelundas image, and every field that names its tag. */
export interface ImageTarget {
  fields: readonly TagField[];
  /** The Nx project whose `docker-build` and `docker-push` make the image. */
  project: string;
}

/** A field in a values file that holds an image tag. */
export interface TagField {
  /** The values file, relative to the workspace root. */
  file: string;
  /** The keys leading to the field. */
  path: readonly string[];
}
