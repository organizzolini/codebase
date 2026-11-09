// ♟️ Constants

import { partOfSpeechEnumValues } from "@codebase/lexico-db";

export const skipPOS = new Set<string>(["letter"]);
export const validPOS = new Set<string>(partOfSpeechEnumValues);
