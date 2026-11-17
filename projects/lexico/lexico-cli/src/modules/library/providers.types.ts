// 🏷️ Types

// `obj` is the field name the EDCS API returns, not an abbreviation this code chose.
// cspell:ignore obj

/** Raw EDCS record; `inschriften[0]` holds the HTML-tagged text. */
export interface EpigraphikDatenbankClaussSlabyRecord {
  obj: {
    "edcs-id"?: string;
    edcsId?: string;
    inschriften: [string, unknown, string[], string[]][];
    provinz: null | string;
  };
}

/**
 * Markdown file contents generated from one Perseus XML segment.
 */
export interface PerseusMarkdownFile {
  content: string;
  relativePath: string;
  title: string;
}
