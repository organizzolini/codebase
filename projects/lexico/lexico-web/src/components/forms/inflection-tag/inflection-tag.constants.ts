import type { TagCategory } from "./inflection-tag.types";
import type { PillBadgeProps } from "@codebase/presentation";

// ♟️ Constants

/**
 * One badge color per grammatical category, from the standard ReUI badge
 * variants, so a case or a tense reads the same everywhere it appears.
 */
export const CATEGORY_VARIANTS: Readonly<
  Record<TagCategory, PillBadgeProps["variant"]>
> = {
  case: "success-light",
  degree: "secondary",
  gender: "primary-light",
  mood: "info-light",
  number: "outline",
  person: "secondary",
  tense: "warning-light",
  verbal: "focus-light",
  voice: "invert-light",
};

/** The solid badge variant of each category, for a selected tag. */
export const SOLID_VARIANTS: Readonly<
  Record<TagCategory, PillBadgeProps["variant"]>
> = {
  case: "success",
  degree: "default",
  gender: "default",
  mood: "info",
  number: "default",
  person: "default",
  tense: "warning",
  verbal: "focus",
  voice: "invert",
};

/** Grammar-book short form and category of each grammatical value. */
export const TAGS: Readonly<
  Record<string, { category: TagCategory; label: string }>
> = {
  ablative: { category: "case", label: "ABL" },
  accusative: { category: "case", label: "ACC" },
  active: { category: "voice", label: "ACT" },
  comparative: { category: "degree", label: "COMP" },
  dative: { category: "case", label: "DAT" },
  feminine: { category: "gender", label: "FEM" },
  first: { category: "person", label: "1ST" },
  future: { category: "tense", label: "FUT" },
  futurePerfect: { category: "tense", label: "FUTP" },
  genitive: { category: "case", label: "GEN" },
  gerund: { category: "verbal", label: "GER" },
  imperative: { category: "mood", label: "IMP" },
  imperfect: { category: "tense", label: "IMPF" },
  indicative: { category: "mood", label: "IND" },
  locative: { category: "case", label: "LOC" },
  masculine: { category: "gender", label: "MASC" },
  neuter: { category: "gender", label: "NEUT" },
  nominative: { category: "case", label: "NOM" },
  "non-finite": { category: "voice", label: "NONF" },
  passive: { category: "voice", label: "PASS" },
  perfect: { category: "tense", label: "PERF" },
  pluperfect: { category: "tense", label: "PLUP" },
  plural: { category: "number", label: "PL" },
  positive: { category: "degree", label: "POS" },
  present: { category: "tense", label: "PRES" },
  second: { category: "person", label: "2ND" },
  singular: { category: "number", label: "SG" },
  subjunctive: { category: "mood", label: "SUBJ" },
  superlative: { category: "degree", label: "SUPER" },
  supine: { category: "verbal", label: "SUP" },
  third: { category: "person", label: "3RD" },
  vocative: { category: "case", label: "VOC" },
};
