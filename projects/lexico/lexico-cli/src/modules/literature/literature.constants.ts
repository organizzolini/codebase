import { z } from "zod";

import { authorEra, textCollections } from "@codebase/lexico-db";

import type { AuthorEra, TextCollection } from "@codebase/lexico-db";

// ♟️ Constants

export const DEFAULT_TEXT_CHUNK_SIZE = 5;

export const authorIdToName: Record<string, string> = {
  ammianus: "ammianus marcellinus",
  apuleius: "lucius apuleius madaurensis",
  augustus: "caesar divi filius augustus",
  "aurelius-victor": "sextus aurelius victor",
  caesar: "gaius iulius caesar",
  cato: "marcus porcius cato censor",
  catullus: "gaius valerius catullus",
  cicero: "marcus tullius cicero",
  claudian: "claudius claudianus",
  "curtius-rufus": "quintus curtius rufus",
  ennius: "quintus ennius",
  eutropius: "eutropius",
  florus: "florus",
  frontinus: "sextus iulius frontinus",
  gellius: "aulus gellius",
  "historia-augusta": "scriptores historiae augustae",
  horace: "quintus horacius flaccus",
  justin: "marcus iunianus iustinus",
  juvenal: "decimus iunius iuvenalis",
  livy: "titus livius",
  lucan: "marcus annaeus lucanus",
  lucretius: "titus lucretius carus",
  martial: "marcus valerius martialis",
  nepos: "cornelius nepos",
  ovid: "publius ovidius naso",
  persius: "aulus persius flaccus",
  petronius: "gaius petronius",
  phaedrus: "phaedrus",
  plautus: "titus maccius plautus",
  "pliny-maior": "gaius plinius secundus",
  "pliny-minor": "gaius plinius caecilius secundus",
  propertius: "sextus propertius",
  quintilian: "marcus fabius quiintilianus",
  "roman-law": "ius romanum",
  sallust: "gaius sallustius crispus",
  "seneca-maior": "lucius annaeus seneca maior",
  "seneca-minor": "lucius annaeus seneca",
  "silius-italicus": "silius italicus",
  statius: "publius papinius statius",
  suetonius: "gaius suetonius tranquillus",
  sulpicia: "sulpicia",
  tacitus: "publius cornelius tacitus",
  terence: "publius terentius afer",
  tibullus: "albius tibullus",
  "valerius-flaccus": "gaius valereius flaccus",
  "valerius-maximus": "valerius maximus",
  varro: "marcus terentius varro",
  vellius: "gaius velleius patereculus",
  virgil: "publius vergilius maro",
  vitruvius: "marcus vitruvius pollio",
  "vulgate-bible-new-testament": "biblia sacra vulgata testamentum novum",
  "vulgate-bible-old-testament": "biblia sacra vulgata testamentum vetum",
};

export const DEFAULT_LINE_CHUNK_SIZE = 1000;

export const DEFAULT_TOKEN_CHUNK_SIZE = 2000;

export const LABEL_PATTERN = /^([IVXLCDM]+|[0-9]+[a-zA-Z]*)\.?\s*(.*)$/i;

export const ROMAN_NUMERAL_PATTERN = /^[IVXLCDM]+$/i;

export const LEADING_WHITESPACE_PATTERN = /^\s+/;

export const CAPITAL_LETTER_PATTERN = /[A-Z]/g;

export const TOKEN_SEGMENT_PATTERN = /[\p{L}]+|[^\p{L}\s]+/gu;

export const WORD_TOKEN_PATTERN = /^[\p{L}]+$/u;

export const COMBINING_MARKS_PATTERN = /[\u0300-\u036F]/gu;

/** Name of the EDCS library provider. */
export const EDCS_PROVIDER = "epigraphik-datenbank-clauss-slaby";

const knownCollections: readonly unknown[] = textCollections;

/** Source fields a provider writes into a text's frontmatter. */
export const textFrontmatterSchema = z.object({
  collection: z
    .custom<TextCollection>((value) => knownCollections.includes(value))
    .optional(),
  edition: z.string().optional(),
  editors: z.string().optional(),
  end_year: z.number().int().optional(),
  find_spot: z.string().optional(),
  inscription_type: z.string().optional(),
  material: z.string().optional(),
  print_year: z.number().int().optional(),
  province: z.string().optional(),
  publisher: z.string().optional(),
  start_year: z.number().int().optional(),
  work_identifier: z.string().optional(),
});

/** Dates and full name an author's frontmatter carries. */
export const authorMetadataSchema = z.object({
  birth_year: z.number().int().optional(),
  death_year: z.number().int().optional(),
  full_name: z.string().optional(),
});

/** Where each era starts, by the midpoint of an author's years (negative for BCE). */
export const ERA_BOUNDARIES: readonly { era: AuthorEra; from: number }[] = [
  { era: authorEra.archaic, from: Number.NEGATIVE_INFINITY },
  { era: authorEra.classical, from: -100 },
  { era: authorEra.imperial, from: 14 },
  { era: authorEra.late, from: 200 },
  { era: authorEra.medieval, from: 600 },
  { era: authorEra.neoLatin, from: 1300 },
];

export const WIKIDATA_QUERY_URL = "https://query.wikidata.org/sparql";

/** A generic client identifier; Wikidata asks automated clients to send one. */
export const WIKIDATA_USER_AGENT = "lexico-ingestion";

export const WIKIDATA_REQUEST_DELAY_MILLISECONDS = 1000;

export const WIKIDATA_TIMEOUT_MILLISECONDS = 15_000;

/** The catalogue folder in a source URL, such as `phi0959` or `stoa0054`. */
export const CATALOGUE_IDENTIFIER_PATTERN = /\/data\/((?:phi|stoa|tlg)\d+[a-z]?)\//;

/** One row of a Wikidata response; each field is absent when the match lacks it. */
export const wikidataResponseSchema = z.object({
  results: z.object({
    bindings: z.array(
      z.object({
        birth: z.object({ value: z.string() }).optional(),
        death: z.object({ value: z.string() }).optional(),
        floruit: z.object({ value: z.string() }).optional(),
      }),
    ),
  }),
});

/**
 * Years for authors Wikidata cannot match: it indexes only PHI Latin author
 * numbers, so authors catalogued under Stoa numbers need these. Keyed by author
 * slug; BCE negative. Authors not listed stay undated and are reported.
 */
export const FALLBACK_AUTHOR_YEARS: Record<string, [number, number]> = {
  adamnan: [624, 704],
  ambrose: [339, 397],
  "ammianus-marcellinus": [330, 395],
  augustine: [354, 430],
  "augustine-saint": [354, 430],
  "ausonius-decimus-magnus": [310, 394],
  "bede-the-venerable": [673, 735],
  boethius: [480, 524],
  "cato-marcus-porcius": [-234, -149],
  claudian: [370, 404],
  "claudianus-mamertus": [425, 474],
  "cyprian-saint": [210, 258],
  "eucherius-of-lyon": [380, 449],
  eugippius: [460, 535],
  "hilary-saint-bishop-of-poitiers": [310, 367],
  "jerome-saint": [347, 420],
  "john-cassian": [360, 435],
  "orosius-paulus": [375, 420],
  "paulinus-of-nola": [354, 431],
  "paulinus-of-pella": [376, 459],
  priscillian: [340, 385],
  prudentius: [348, 413],
  "remigius-of-auxerre": [841, 908],
  "rufinus-of-aquileia": [344, 411],
  "salvian-of-marseilles": [400, 480],
  "severus-sulpicius": [363, 425],
  "sidonius-apollinaris": [430, 489],
  tertullian: [155, 220],
};
