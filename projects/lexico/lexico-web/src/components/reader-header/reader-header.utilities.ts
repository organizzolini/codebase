import { ERA_LABELS } from "../library-author-card/library-author-card.constants";
import { formatYears } from "../library-author-card/library-author-card.utilities";

import type { ReaderText } from "../reader-lines/reader-lines.types";
import type { ReaderFact } from "./reader-header.types";

// 🔏 Private Functions

// 🌎 Public Functions

/**
 * The characteristics a reader can filter the library by, such as the author's
 * era and the text's dates, each left out when the text has no value.
 */
export function describeFacts(text: Readonly<ReaderText>): ReaderFact[] {
  const { author, printYear } = text;
  const facts: [string, null | string | undefined][] = [
    ["Era", author.era === null ? null : ERA_LABELS[author.era]],
    ["Lived", formatYears(author.startYear, author.endYear)],
    ["Printed", printYear === null ? null : String(printYear)],
    ["Dated", formatYears(text.startYear, text.endYear)],
    ["Province", text.province],
    ["Find spot", text.findSpot],
    ["Material", text.material],
    ["Inscription", text.inscriptionType],
    ["Lines", text.lineCount === null ? null : String(text.lineCount)],
    ["Words", text.wordCount === null ? null : String(text.wordCount)],
  ];

  return facts.flatMap(([label, value]) =>
    value === null || value === undefined || value === ""
      ? []
      : [{ label, value }],
  );
}
