// ♟️ Constants

/** The label blocking a pull request for as long as it is present. */
export const DO_NOT_MERGE_LABEL = "do-not-merge";

/** The two labels that may declare who opened a pull request, and nothing else. */
export const SOURCE_LABELS = ["source:agent", "source:human"];

/** How the two label families are recognized. */
export const SCOPE_LABEL_PREFIX = "scope:";
export const SOURCE_LABEL_PREFIX = "source:";
export const TYPE_LABEL_PREFIX = "type:";

/**
 * How a conventional title is read.
 *
 * The scope group is optional even though the convention requires a scope.
 * commitlint's `scope-empty` rule rejects a title with no scope, so in a
 * workflow run 📝 Validate Pull Request Title fails first and this check never
 * sees one. Run by hand with a pull request number it runs ahead of any title
 * check, so matching the scope as optional keeps it correct there too, and is
 * defense in depth everywhere else. The subject group is deliberately not
 * optional: a title that is only a prefix is not a title.
 */
export const CONVENTIONAL_TITLE_PATTERN =
  /^([a-z][a-z-]*)(?:\(([^()]+)\))?!?:\s+(?<subject>\S.*)$/u;

/**
 * What one title's scope group is split on.
 *
 * commitlint's `scope-enum` splits on both, so one title may name several
 * scopes and each of them is expected to have its own label.
 */
export const TITLE_SCOPE_SEPARATOR_PATTERN = /[,/]/u;
