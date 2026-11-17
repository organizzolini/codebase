/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Schema from './operations';

import type { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: string; output: string; }
};

export type AdjectivalForm = Form & {
  __typename?: 'AdjectivalForm';
  case: Scalars['String']['output'];
  gender: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  number: Scalars['String']['output'];
};

export type AdjectiveInflection = Inflection & {
  __typename?: 'AdjectiveInflection';
  declension: Scalars['String']['output'];
  degree: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type AdverbForm = Form & {
  __typename?: 'AdverbForm';
  degree: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type AdverbInflection = Inflection & {
  __typename?: 'AdverbInflection';
  adverbType: Scalars['String']['output'];
  degree: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type Author = {
  __typename?: 'Author';
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<Scalars['ID']['output']>;
  /** The year the author died, negative for BCE. */
  endYear?: Maybe<Scalars['Int']['output']>;
  /** The period the author belongs to. */
  era?: Maybe<AuthorEra>;
  fullName?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  /** The year the author was born, negative for BCE. */
  startYear?: Maybe<Scalars['Int']['output']>;
  texts: TextConnection;
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
};


export type AuthorTextsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type AuthorConnection = {
  __typename?: 'AuthorConnection';
  /** A list of edges. */
  edges: Array<AuthorEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int']['output'];
};

export type AuthorEdge = {
  __typename?: 'AuthorEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Author;
};

/** The period an author belongs to. */
export enum AuthorEra {
  Archaic = 'ARCHAIC',
  Classical = 'CLASSICAL',
  Imperial = 'IMPERIAL',
  Late = 'LATE',
  Medieval = 'MEDIEVAL',
  NeoLatin = 'NEO_LATIN'
}

export type AuthorLookupInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type FiniteVerbForm = Form & {
  __typename?: 'FiniteVerbForm';
  id: Scalars['ID']['output'];
  mood: Scalars['String']['output'];
  number: Scalars['String']['output'];
  person: Scalars['String']['output'];
  tense: Scalars['String']['output'];
  voice: Scalars['String']['output'];
};

export type Form = {
  id: Scalars['ID']['output'];
};

export type FormConnection = {
  __typename?: 'FormConnection';
  /** A list of edges. */
  edges: Array<FormEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int']['output'];
};

export type FormEdge = {
  __typename?: 'FormEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Form;
};

export type GerundForm = Form & {
  __typename?: 'GerundForm';
  case: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type InfinitiveForm = Form & {
  __typename?: 'InfinitiveForm';
  id: Scalars['ID']['output'];
  tense: Scalars['String']['output'];
  voice: Scalars['String']['output'];
};

export type Inflection = {
  id: Scalars['ID']['output'];
};

export type Lexeme = {
  __typename?: 'Lexeme';
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<Scalars['ID']['output']>;
  disambiguator: Scalars['Float']['output'];
  etymology?: Maybe<Scalars['String']['output']>;
  forms: FormConnection;
  id: Scalars['ID']['output'];
  inflection?: Maybe<Inflection>;
  lemma: Scalars['String']['output'];
  partOfSpeech: Scalars['String']['output'];
  principalParts: PrincipalPartConnection;
  pronunciations?: Maybe<PronunciationConnection>;
  translations?: Maybe<TranslationConnection>;
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  /** Every written word that surfaces as one of this lexeme's forms, such as the genitive singular of rosa written rosae. */
  wordForms: LexemeWordFormConnection;
};

export type LexemeSearchResult = {
  __typename?: 'LexemeSearchResult';
  /** Edit distance of a fuzzy match from the search term */
  distance?: Maybe<Scalars['Int']['output']>;
  /** Enclitic suffix separated from search token (e.g. que, ve, ne) */
  enclitic?: Maybe<Scalars['String']['output']>;
  /** Morphological and grammatical tags identifying matched form */
  identifiers: Array<Scalars['String']['output']>;
  /** Matched dictionary lexeme entry */
  lexeme: Lexeme;
  /** Computed search relevance score */
  score: Scalars['Float']['output'];
  /** Source and confidence tier of match */
  source: SearchMatchSource;
};

export type LexemeSearchResultConnection = {
  __typename?: 'LexemeSearchResultConnection';
  /** A list of edges. */
  edges: Array<LexemeSearchResultEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int']['output'];
};

export type LexemeSearchResultEdge = {
  __typename?: 'LexemeSearchResultEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: LexemeSearchResult;
};

export type LexemeWordForm = {
  __typename?: 'LexemeWordForm';
  form: Form;
  id: Scalars['ID']['output'];
  word: Scalars['String']['output'];
};

export type LexemeWordFormConnection = {
  __typename?: 'LexemeWordFormConnection';
  /** A list of edges. */
  edges: Array<LexemeWordFormEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int']['output'];
};

export type LexemeWordFormEdge = {
  __typename?: 'LexemeWordFormEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: LexemeWordForm;
};

export type LibraryAuthor = {
  __typename?: 'LibraryAuthor';
  author: Author;
  matches: Array<LibraryMatch>;
  /** Every top-level work in scope, even when works omits some. */
  workCount: Scalars['Int']['output'];
  /** The card's top-level works in scope, at most 50. A work whose child matches is in scope. */
  works: Array<LibraryText>;
};

export type LibraryFacetValue = {
  __typename?: 'LibraryFacetValue';
  /** How many Texts carry this value. */
  count: Scalars['Int']['output'];
  /** The stored value. */
  value: Scalars['String']['output'];
};

export type LibraryFacets = {
  __typename?: 'LibraryFacets';
  /** Distinct inscription types, sorted by value. */
  inscriptionTypes: Array<LibraryFacetValue>;
  /** Distinct inscription materials, sorted by value. */
  materials: Array<LibraryFacetValue>;
  /** Distinct inscription provinces, sorted by value. */
  provinces: Array<LibraryFacetValue>;
};

export type LibraryFilters = {
  /** Authors whose years overlap this range. Authors missing a start or end year are left out, even when the range has one bound. */
  authorYears?: InputMaybe<LibraryRange>;
  /** Authors in any of these eras. */
  eras?: InputMaybe<Array<AuthorEra>>;
  /** Inscriptions of any of these EDCS types. */
  inscriptionTypes?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Inscriptions whose dating overlaps this range. Texts missing a start or end year are left out, even when the range has one bound. */
  inscriptionYears?: InputMaybe<LibraryRange>;
  /** Texts with a line count in this range. */
  lineCount?: InputMaybe<LibraryRange>;
  /** Inscriptions made of any of these materials. */
  materials?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Texts whose edition was printed in this range. */
  printYears?: InputMaybe<LibraryRange>;
  /** Inscriptions found in any of these provinces. */
  provinces?: InputMaybe<Array<Scalars['String']['input']>>;
  /** Texts with a word count in this range. */
  wordCount?: InputMaybe<LibraryRange>;
};

export type LibraryMatch = {
  __typename?: 'LibraryMatch';
  /** Offset just past the match. */
  end: Scalars['Int']['output'];
  /** The field the match is in, such as `name`. */
  field: Scalars['String']['output'];
  /** Offset of the first character matched. */
  start: Scalars['Int']['output'];
};

export type LibraryPage = {
  __typename?: 'LibraryPage';
  authors: Array<LibraryAuthor>;
  pageCount: Scalars['Int']['output'];
  totalCount: Scalars['Int']['output'];
};

export type LibraryRange = {
  /** The highest value kept, inclusive. */
  max?: InputMaybe<Scalars['Int']['input']>;
  /** The lowest value kept, inclusive. */
  min?: InputMaybe<Scalars['Int']['input']>;
};

export type LibrarySort = {
  /** The direction to order in. Defaults to ascending. */
  direction?: InputMaybe<LibrarySortDirection>;
  /** The attribute to order by. */
  field: LibrarySortField;
};

/** The direction a library page is ordered in. */
export enum LibrarySortDirection {
  Asc = 'ASC',
  Desc = 'DESC'
}

/** An attribute the library can be ordered by. */
export enum LibrarySortField {
  AuthorEndYear = 'AUTHOR_END_YEAR',
  AuthorEra = 'AUTHOR_ERA',
  AuthorFullName = 'AUTHOR_FULL_NAME',
  AuthorName = 'AUTHOR_NAME',
  AuthorStartYear = 'AUTHOR_START_YEAR',
  TextCollection = 'TEXT_COLLECTION',
  TextEdition = 'TEXT_EDITION',
  TextEndYear = 'TEXT_END_YEAR',
  TextLineCount = 'TEXT_LINE_COUNT',
  TextPrintYear = 'TEXT_PRINT_YEAR',
  TextRecognisedWordCount = 'TEXT_RECOGNISED_WORD_COUNT',
  TextStartYear = 'TEXT_START_YEAR',
  TextTitle = 'TEXT_TITLE',
  TextWordCount = 'TEXT_WORD_COUNT'
}

export type LibraryText = {
  __typename?: 'LibraryText';
  /** The Texts directly under this one, whatever the search. */
  childCount: Scalars['Int']['output'];
  matches: Array<LibraryMatch>;
  /** The Text. Its parentText is the book it belongs to, if any. */
  text: Text;
};

export type LibraryTextsPage = {
  __typename?: 'LibraryTextsPage';
  pageCount: Scalars['Int']['output'];
  texts: Array<LibraryText>;
  totalCount: Scalars['Int']['output'];
};

export type Line = {
  __typename?: 'Line';
  author: Author;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  data: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  index: Scalars['Float']['output'];
  label: Scalars['String']['output'];
  text: Text;
  tokens: TokenConnection;
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
};


export type LineTokensArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

export type LineConnection = {
  __typename?: 'LineConnection';
  /** A list of edges. */
  edges: Array<LineEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int']['output'];
};

export type LineEdge = {
  __typename?: 'LineEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Line;
};

export type LinesRangeInput = {
  endIndex?: InputMaybe<Scalars['Int']['input']>;
  startIndex?: InputMaybe<Scalars['Int']['input']>;
};

export type LiteratureSearchResult = {
  __typename?: 'LiteratureSearchResult';
  authors: AuthorConnection;
  lines: LineConnection;
  texts: TextConnection;
};

export type NominalForm = Form & {
  __typename?: 'NominalForm';
  case: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  number: Scalars['String']['output'];
};

export type NounInflection = Inflection & {
  __typename?: 'NounInflection';
  declension: Scalars['String']['output'];
  gender: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

/** Information about pagination in a connection. */
export type PageInfo = {
  __typename?: 'PageInfo';
  /** When paginating forwards, the cursor to continue. */
  endCursor?: Maybe<Scalars['String']['output']>;
  /** When paginating forwards, are there more items? */
  hasNextPage: Scalars['Boolean']['output'];
  /** When paginating backwards, are there more items? */
  hasPreviousPage: Scalars['Boolean']['output'];
  /** When paginating backwards, the cursor to continue. */
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type ParticipleForm = Form & {
  __typename?: 'ParticipleForm';
  id: Scalars['ID']['output'];
  tense: Scalars['String']['output'];
  voice: Scalars['String']['output'];
};

export type PrepositionInflection = Inflection & {
  __typename?: 'PrepositionInflection';
  case: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  other?: Maybe<Scalars['String']['output']>;
};

export type PrincipalPart = {
  __typename?: 'PrincipalPart';
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  text: Array<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
};

export type PrincipalPartConnection = {
  __typename?: 'PrincipalPartConnection';
  /** A list of edges. */
  edges: Array<PrincipalPartEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int']['output'];
};

export type PrincipalPartEdge = {
  __typename?: 'PrincipalPartEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: PrincipalPart;
};

export type Pronunciation = {
  __typename?: 'Pronunciation';
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  phonemes?: Maybe<Scalars['String']['output']>;
  phonemic?: Maybe<Scalars['String']['output']>;
  phonetic?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  variant: Scalars['String']['output'];
};

export type PronunciationConnection = {
  __typename?: 'PronunciationConnection';
  /** A list of edges. */
  edges: Array<PronunciationEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int']['output'];
};

export type PronunciationEdge = {
  __typename?: 'PronunciationEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Pronunciation;
};

export type Query = {
  __typename?: 'Query';
  author?: Maybe<Author>;
  authors: AuthorConnection;
  /** Returns true if the GraphQL API service is running and healthy. */
  health: Scalars['Boolean']['output'];
  /** Retrieves a single dictionary lexeme by ID. */
  lexeme?: Maybe<Lexeme>;
  /** Retrieves multiple dictionary lexemes by ID. */
  lexemes: Array<Lexeme>;
  library: LibraryPage;
  libraryChildren: LibraryTextsPage;
  libraryFacets: LibraryFacets;
  libraryWorks: LibraryTextsPage;
  lines: LineConnection;
  searchAuthors: AuthorConnection;
  /** Performs English definition and translation search with relevance ranking, returning at most the 200 best-ranked lexemes. */
  searchEnglish: LexemeSearchResultConnection;
  /** Performs tiered Latin dictionary search across exact lemmas, inflected forms, prefixes, and fuzzy matches. */
  searchLatin: LexemeSearchResultConnection;
  searchLines: LineConnection;
  searchLiterature: LiteratureSearchResult;
  searchTexts: TextConnection;
  text?: Maybe<Text>;
  texts: TextConnection;
  tokens: TokenConnection;
  /** Retrieves a surface Latin word and its morphological links. */
  word?: Maybe<Word>;
  /** Lists the lexeme and form candidates a token's word can be, for a word card. */
  wordCandidates: Array<WordCandidate>;
  /** Retrieves multiple surface Latin words and their links. */
  words: Array<Word>;
};


export type QueryAuthorArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  lookup?: InputMaybe<AuthorLookupInput>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryAuthorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryLexemeArgs = {
  id: Scalars['ID']['input'];
};


export type QueryLexemesArgs = {
  ids: Array<Scalars['ID']['input']>;
};


export type QueryLibraryArgs = {
  filters?: InputMaybe<LibraryFilters>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<LibrarySort>;
};


export type QueryLibraryChildrenArgs = {
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  parentTextId: Scalars['ID']['input'];
  search?: InputMaybe<Scalars['String']['input']>;
};


export type QueryLibraryWorksArgs = {
  authorId: Scalars['ID']['input'];
  filters?: InputMaybe<LibraryFilters>;
  page?: InputMaybe<Scalars['Int']['input']>;
  pageSize?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<LibrarySort>;
};


export type QueryLinesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  range?: InputMaybe<LinesRangeInput>;
  textId?: InputMaybe<Scalars['ID']['input']>;
};


export type QuerySearchAuthorsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type QuerySearchEnglishArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type QuerySearchLatinArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type QuerySearchLinesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
  textId?: InputMaybe<Scalars['ID']['input']>;
};


export type QuerySearchLiteratureArgs = {
  authorId?: InputMaybe<Scalars['ID']['input']>;
  query: Scalars['String']['input'];
};


export type QuerySearchTextsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  authorId?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  query: Scalars['String']['input'];
};


export type QueryTextArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  lookup?: InputMaybe<TextLookupInput>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTextsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  authorId?: InputMaybe<Scalars['ID']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  parentTextId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryTokensArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  lineId: Scalars['ID']['input'];
};


export type QueryWordArgs = {
  data: Scalars['String']['input'];
};


export type QueryWordCandidatesArgs = {
  tokenId: Scalars['ID']['input'];
};


export type QueryWordsArgs = {
  data: Array<Scalars['String']['input']>;
};

/** Classification of where and how a search match was found. */
export enum SearchMatchSource {
  Enclitic = 'ENCLITIC',
  Fuzzy = 'FUZZY',
  LemmaExact = 'LEMMA_EXACT',
  Prefix = 'PREFIX',
  TranslationExact = 'TRANSLATION_EXACT',
  TranslationFulltext = 'TRANSLATION_FULLTEXT',
  TranslationPrefix = 'TRANSLATION_PREFIX',
  WordExact = 'WORD_EXACT'
}

export type SupineForm = Form & {
  __typename?: 'SupineForm';
  case: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type Text = {
  __typename?: 'Text';
  ancestors: Array<Text>;
  author: Author;
  childTexts: TextConnection;
  collection?: Maybe<TextCollection>;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<Scalars['ID']['output']>;
  edition?: Maybe<Scalars['String']['output']>;
  editors?: Maybe<Scalars['String']['output']>;
  /** The year an inscription is dated to, negative for BCE. */
  endYear?: Maybe<Scalars['Int']['output']>;
  /** The find-spot of an inscription. */
  findSpot?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  /** The EDCS type of an inscription. */
  inscriptionType?: Maybe<Scalars['String']['output']>;
  lineCount?: Maybe<Scalars['Int']['output']>;
  lines: LineConnection;
  /** The material of an inscription. */
  material?: Maybe<Scalars['String']['output']>;
  nextText?: Maybe<Text>;
  parentText?: Maybe<Text>;
  previousText?: Maybe<Text>;
  printYear?: Maybe<Scalars['Int']['output']>;
  /** The province an inscription was found in. */
  province?: Maybe<Scalars['String']['output']>;
  publisher?: Maybe<Scalars['String']['output']>;
  /** The number of Tokens linked to a dictionary Word. */
  recognisedWordCount?: Maybe<Scalars['Int']['output']>;
  slug: Scalars['String']['output'];
  /** The year an inscription is dated from, negative for BCE. */
  startYear?: Maybe<Scalars['Int']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  /** The number of word Tokens in the text. */
  wordCount?: Maybe<Scalars['Int']['output']>;
  workIdentifier?: Maybe<Scalars['String']['output']>;
};


export type TextChildTextsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type TextLinesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};

/** The source a text was ingested from. */
export enum TextCollection {
  Csel = 'CSEL',
  Edcs = 'EDCS',
  Perseus = 'PERSEUS',
  TheLatinLibrary = 'THE_LATIN_LIBRARY'
}

export type TextConnection = {
  __typename?: 'TextConnection';
  /** A list of edges. */
  edges: Array<TextEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int']['output'];
};

export type TextEdge = {
  __typename?: 'TextEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Text;
};

export type TextLookupInput = {
  id?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type Token = {
  __typename?: 'Token';
  author: Author;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  data: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  index: Scalars['Float']['output'];
  isPunctuation: Scalars['Boolean']['output'];
  line: Line;
  text: Text;
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  word?: Maybe<Word>;
};

export type TokenConnection = {
  __typename?: 'TokenConnection';
  /** A list of edges. */
  edges: Array<TokenEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int']['output'];
};

export type TokenEdge = {
  __typename?: 'TokenEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Token;
};

export type Translation = {
  __typename?: 'Translation';
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  data: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
};

export type TranslationConnection = {
  __typename?: 'TranslationConnection';
  /** A list of edges. */
  edges: Array<TranslationEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int']['output'];
};

export type TranslationEdge = {
  __typename?: 'TranslationEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: Translation;
};

export type UninflectedInflection = Inflection & {
  __typename?: 'UninflectedInflection';
  id: Scalars['ID']['output'];
};

export type VerbInflection = Inflection & {
  __typename?: 'VerbInflection';
  conjugation: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  other?: Maybe<Scalars['String']['output']>;
};

export type Word = {
  __typename?: 'Word';
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  data: Scalars['String']['output'];
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  wordForms: WordFormConnection;
  wordLexemes: WordLexemeConnection;
};

export type WordCandidate = {
  __typename?: 'WordCandidate';
  definition?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  lemma: Scalars['String']['output'];
  lexemeId: Scalars['ID']['output'];
  partOfSpeech: Scalars['String']['output'];
  translations: Array<Scalars['String']['output']>;
};

export type WordForm = {
  __typename?: 'WordForm';
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<Scalars['ID']['output']>;
  form: Form;
  id: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  word: Word;
};

export type WordFormConnection = {
  __typename?: 'WordFormConnection';
  /** A list of edges. */
  edges: Array<WordFormEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int']['output'];
};

export type WordFormEdge = {
  __typename?: 'WordFormEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: WordForm;
};

export type WordLexeme = {
  __typename?: 'WordLexeme';
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  lexeme: Lexeme;
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
  word: Word;
};

export type WordLexemeConnection = {
  __typename?: 'WordLexemeConnection';
  /** A list of edges. */
  edges: Array<WordLexemeEdge>;
  /** Information to aid in pagination. */
  pageInfo: PageInfo;
  /** Identifies the total count of items in the connection. */
  totalCount: Scalars['Int']['output'];
};

export type WordLexemeEdge = {
  __typename?: 'WordLexemeEdge';
  /** A cursor for use in pagination. */
  cursor: Scalars['String']['output'];
  /** The item at the end of the edge. */
  node: WordLexeme;
};

export type LexemeCardQueryVariables = Exact<{
  id: string;
}>;


export type LexemeCardQuery = { lexeme: { id: string, etymology: string | null, lemma: string, partOfSpeech: string, inflection:
      | { declension: string, degree: string }
      | { adverbType: string, degree: string }
      | { declension: string, gender: string }
      | { case: string }
      | { conjugation: string, other: string | null }
      | Record<PropertyKey, never>
     | null, principalParts: { edges: Array<{ node: { text: Array<string> } }> }, pronunciations: { edges: Array<{ node: { phonetic: string | null, variant: string } }> } | null, translations: { edges: Array<{ node: { data: string } }> } | null, wordForms: { edges: Array<{ node: { id: string, word: string, form:
            | { __typename: 'AdjectivalForm', case: string, gender: string, number: string }
            | { __typename: 'AdverbForm', degree: string }
            | { __typename: 'FiniteVerbForm', mood: string, number: string, person: string, tense: string, voice: string }
            | { __typename: 'GerundForm', case: string }
            | { __typename: 'InfinitiveForm', tense: string, voice: string }
            | { __typename: 'NominalForm', case: string, number: string }
            | { __typename: 'ParticipleForm', tense: string, voice: string }
            | { __typename: 'SupineForm', case: string }
           } }> } } | null };

export type LibraryChildrenQueryVariables = Exact<{
  parentTextId: string;
  search?: string | null | undefined;
  page?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type LibraryChildrenQuery = { libraryChildren: { totalCount: number, pageCount: number, texts: Array<{ childCount: number, matches: Array<{ field: string, start: number, end: number }>, text: { id: string, slug: string, title: string, type: string, collection: Schema.TextCollection | null, edition: string | null, editors: string | null, findSpot: string | null, inscriptionType: string | null, material: string | null, province: string | null, lineCount: number | null, wordCount: number | null } }> } };

export type LibraryFacetsQueryVariables = Exact<{ [key: string]: never; }>;


export type LibraryFacetsQuery = { libraryFacets: { provinces: Array<{ value: string, count: number }>, inscriptionTypes: Array<{ value: string, count: number }>, materials: Array<{ value: string, count: number }> } };

export type LibraryWorksQueryVariables = Exact<{
  authorId: string;
  search?: string | null | undefined;
  filters?: Schema.LibraryFilters | null | undefined;
  sort?: Schema.LibrarySort | null | undefined;
  page?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type LibraryWorksQuery = { libraryWorks: { totalCount: number, pageCount: number, texts: Array<{ childCount: number, matches: Array<{ field: string, start: number, end: number }>, text: { id: string, slug: string, title: string, type: string, collection: Schema.TextCollection | null, edition: string | null, editors: string | null, findSpot: string | null, inscriptionType: string | null, material: string | null, province: string | null, lineCount: number | null, wordCount: number | null } }> } };

export type LibraryTextRowFragment = { childCount: number, matches: Array<{ field: string, start: number, end: number }>, text: { id: string, slug: string, title: string, type: string, collection: Schema.TextCollection | null, edition: string | null, editors: string | null, findSpot: string | null, inscriptionType: string | null, material: string | null, province: string | null, lineCount: number | null, wordCount: number | null } };

export type LibraryQueryVariables = Exact<{
  search?: string | null | undefined;
  filters?: Schema.LibraryFilters | null | undefined;
  sort?: Schema.LibrarySort | null | undefined;
  page?: number | null | undefined;
  pageSize?: number | null | undefined;
}>;


export type LibraryQuery = { library: { totalCount: number, pageCount: number, authors: Array<{ workCount: number, author: { id: string, slug: string, name: string, fullName: string | null, era: Schema.AuthorEra | null, startYear: number | null, endYear: number | null }, matches: Array<{ field: string, start: number, end: number }>, works: Array<{ childCount: number, matches: Array<{ field: string, start: number, end: number }>, text: { id: string, slug: string, title: string, type: string, collection: Schema.TextCollection | null, edition: string | null, editors: string | null, findSpot: string | null, inscriptionType: string | null, material: string | null, province: string | null, lineCount: number | null, wordCount: number | null } }> }> } };

export type SearchEnglishQueryVariables = Exact<{
  query: string;
  first: number;
}>;


export type SearchEnglishQuery = { searchEnglish: { edges: Array<{ node: { distance: number | null, enclitic: string | null, identifiers: Array<string>, score: number, source: Schema.SearchMatchSource, lexeme: { id: string, etymology: string | null, lemma: string, partOfSpeech: string, inflection:
            | { declension: string, degree: string }
            | { adverbType: string, degree: string }
            | { declension: string, gender: string }
            | { case: string }
            | { conjugation: string, other: string | null }
            | Record<PropertyKey, never>
           | null, principalParts: { edges: Array<{ node: { text: Array<string> } }> }, pronunciations: { edges: Array<{ node: { phonetic: string | null, variant: string } }> } | null, translations: { edges: Array<{ node: { data: string } }> } | null, wordForms: { edges: Array<{ node: { id: string, word: string, form:
                  | { __typename: 'AdjectivalForm', case: string, gender: string, number: string }
                  | { __typename: 'AdverbForm', degree: string }
                  | { __typename: 'FiniteVerbForm', mood: string, number: string, person: string, tense: string, voice: string }
                  | { __typename: 'GerundForm', case: string }
                  | { __typename: 'InfinitiveForm', tense: string, voice: string }
                  | { __typename: 'NominalForm', case: string, number: string }
                  | { __typename: 'ParticipleForm', tense: string, voice: string }
                  | { __typename: 'SupineForm', case: string }
                 } }> } } } }> } };

export type SearchLatinQueryVariables = Exact<{
  query: string;
  first: number;
}>;


export type SearchLatinQuery = { searchLatin: { edges: Array<{ node: { distance: number | null, enclitic: string | null, identifiers: Array<string>, score: number, source: Schema.SearchMatchSource, lexeme: { id: string, etymology: string | null, lemma: string, partOfSpeech: string, inflection:
            | { declension: string, degree: string }
            | { adverbType: string, degree: string }
            | { declension: string, gender: string }
            | { case: string }
            | { conjugation: string, other: string | null }
            | Record<PropertyKey, never>
           | null, principalParts: { edges: Array<{ node: { text: Array<string> } }> }, pronunciations: { edges: Array<{ node: { phonetic: string | null, variant: string } }> } | null, translations: { edges: Array<{ node: { data: string } }> } | null, wordForms: { edges: Array<{ node: { id: string, word: string, form:
                  | { __typename: 'AdjectivalForm', case: string, gender: string, number: string }
                  | { __typename: 'AdverbForm', degree: string }
                  | { __typename: 'FiniteVerbForm', mood: string, number: string, person: string, tense: string, voice: string }
                  | { __typename: 'GerundForm', case: string }
                  | { __typename: 'InfinitiveForm', tense: string, voice: string }
                  | { __typename: 'NominalForm', case: string, number: string }
                  | { __typename: 'ParticipleForm', tense: string, voice: string }
                  | { __typename: 'SupineForm', case: string }
                 } }> } } } }> } };

export type TextReaderQueryVariables = Exact<{
  slug: string;
  first: number;
  after?: string | null | undefined;
}>;


export type TextReaderQuery = { text: { id: string, slug: string, title: string, type: string, collection: Schema.TextCollection | null, edition: string | null, editors: string | null, endYear: number | null, findSpot: string | null, inscriptionType: string | null, lineCount: number | null, material: string | null, printYear: number | null, province: string | null, publisher: string | null, startYear: number | null, wordCount: number | null, author: { endYear: number | null, era: Schema.AuthorEra | null, name: string, slug: string, startYear: number | null }, nextText: { slug: string, title: string } | null, parentText: { slug: string, title: string } | null, previousText: { slug: string, title: string } | null, lines: { edges: Array<{ node: { id: string, index: number, label: string, tokens: { edges: Array<{ node: { id: string, index: number, data: string, isPunctuation: boolean } }> } } }>, pageInfo: { endCursor: string | null, hasNextPage: boolean } } } | null };

export type WordCandidatesQueryVariables = Exact<{
  tokenId: string;
}>;


export type WordCandidatesQuery = { wordCandidates: Array<{ definition: string | null, description: string, lemma: string, lexemeId: string, partOfSpeech: string, translations: Array<string> }> };

export const LibraryTextRowFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LibraryTextRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LibraryText"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"childCount"}},{"kind":"Field","name":{"kind":"Name","value":"matches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}},{"kind":"Field","name":{"kind":"Name","value":"text"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"edition"}},{"kind":"Field","name":{"kind":"Name","value":"editors"}},{"kind":"Field","name":{"kind":"Name","value":"findSpot"}},{"kind":"Field","name":{"kind":"Name","value":"inscriptionType"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"lineCount"}},{"kind":"Field","name":{"kind":"Name","value":"wordCount"}}]}}]}}]} as unknown as DocumentNode<LibraryTextRowFragment, unknown>;
export const LexemeCardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LexemeCard"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"lexeme"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"etymology"}},{"kind":"Field","name":{"kind":"Name","value":"lemma"}},{"kind":"Field","name":{"kind":"Name","value":"partOfSpeech"}},{"kind":"Field","name":{"kind":"Name","value":"inflection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdjectiveInflection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"declension"}},{"kind":"Field","name":{"kind":"Name","value":"degree"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdverbInflection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adverbType"}},{"kind":"Field","name":{"kind":"Name","value":"degree"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NounInflection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"declension"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrepositionInflection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"case"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VerbInflection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"conjugation"}},{"kind":"Field","name":{"kind":"Name","value":"other"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"principalParts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pronunciations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phonetic"}},{"kind":"Field","name":{"kind":"Name","value":"variant"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"translations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"wordForms"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"word"}},{"kind":"Field","name":{"kind":"Name","value":"form"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdjectivalForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"case"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"number"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdverbForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"degree"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"FiniteVerbForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mood"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"person"}},{"kind":"Field","name":{"kind":"Name","value":"tense"}},{"kind":"Field","name":{"kind":"Name","value":"voice"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GerundForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"case"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InfinitiveForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tense"}},{"kind":"Field","name":{"kind":"Name","value":"voice"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NominalForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"case"}},{"kind":"Field","name":{"kind":"Name","value":"number"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ParticipleForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tense"}},{"kind":"Field","name":{"kind":"Name","value":"voice"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SupineForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"case"}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<LexemeCardQuery, LexemeCardQueryVariables>;
export const LibraryChildrenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LibraryChildren"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"parentTextId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"libraryChildren"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"parentTextId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"parentTextId"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}},{"kind":"Field","name":{"kind":"Name","value":"texts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LibraryTextRow"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LibraryTextRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LibraryText"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"childCount"}},{"kind":"Field","name":{"kind":"Name","value":"matches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}},{"kind":"Field","name":{"kind":"Name","value":"text"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"edition"}},{"kind":"Field","name":{"kind":"Name","value":"editors"}},{"kind":"Field","name":{"kind":"Name","value":"findSpot"}},{"kind":"Field","name":{"kind":"Name","value":"inscriptionType"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"lineCount"}},{"kind":"Field","name":{"kind":"Name","value":"wordCount"}}]}}]}}]} as unknown as DocumentNode<LibraryChildrenQuery, LibraryChildrenQueryVariables>;
export const LibraryFacetsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LibraryFacets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"libraryFacets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"provinces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"inscriptionTypes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"materials"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}}]}}]}}]} as unknown as DocumentNode<LibraryFacetsQuery, LibraryFacetsQueryVariables>;
export const LibraryWorksDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"LibraryWorks"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"authorId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LibraryFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LibrarySort"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"libraryWorks"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"authorId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"authorId"}}},{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}},{"kind":"Field","name":{"kind":"Name","value":"texts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LibraryTextRow"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LibraryTextRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LibraryText"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"childCount"}},{"kind":"Field","name":{"kind":"Name","value":"matches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}},{"kind":"Field","name":{"kind":"Name","value":"text"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"edition"}},{"kind":"Field","name":{"kind":"Name","value":"editors"}},{"kind":"Field","name":{"kind":"Name","value":"findSpot"}},{"kind":"Field","name":{"kind":"Name","value":"inscriptionType"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"lineCount"}},{"kind":"Field","name":{"kind":"Name","value":"wordCount"}}]}}]}}]} as unknown as DocumentNode<LibraryWorksQuery, LibraryWorksQueryVariables>;
export const LibraryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Library"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"search"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filters"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LibraryFilters"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"LibrarySort"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"library"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"search"},"value":{"kind":"Variable","name":{"kind":"Name","value":"search"}}},{"kind":"Argument","name":{"kind":"Name","value":"filters"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filters"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"pageSize"},"value":{"kind":"Variable","name":{"kind":"Name","value":"pageSize"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"totalCount"}},{"kind":"Field","name":{"kind":"Name","value":"pageCount"}},{"kind":"Field","name":{"kind":"Name","value":"authors"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"fullName"}},{"kind":"Field","name":{"kind":"Name","value":"era"}},{"kind":"Field","name":{"kind":"Name","value":"startYear"}},{"kind":"Field","name":{"kind":"Name","value":"endYear"}}]}},{"kind":"Field","name":{"kind":"Name","value":"matches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}},{"kind":"Field","name":{"kind":"Name","value":"workCount"}},{"kind":"Field","name":{"kind":"Name","value":"works"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"LibraryTextRow"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"LibraryTextRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"LibraryText"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"childCount"}},{"kind":"Field","name":{"kind":"Name","value":"matches"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"field"}},{"kind":"Field","name":{"kind":"Name","value":"start"}},{"kind":"Field","name":{"kind":"Name","value":"end"}}]}},{"kind":"Field","name":{"kind":"Name","value":"text"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"edition"}},{"kind":"Field","name":{"kind":"Name","value":"editors"}},{"kind":"Field","name":{"kind":"Name","value":"findSpot"}},{"kind":"Field","name":{"kind":"Name","value":"inscriptionType"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"lineCount"}},{"kind":"Field","name":{"kind":"Name","value":"wordCount"}}]}}]}}]} as unknown as DocumentNode<LibraryQuery, LibraryQueryVariables>;
export const SearchEnglishDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchEnglish"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchEnglish"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"enclitic"}},{"kind":"Field","name":{"kind":"Name","value":"identifiers"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"lexeme"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"etymology"}},{"kind":"Field","name":{"kind":"Name","value":"lemma"}},{"kind":"Field","name":{"kind":"Name","value":"partOfSpeech"}},{"kind":"Field","name":{"kind":"Name","value":"inflection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdjectiveInflection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"declension"}},{"kind":"Field","name":{"kind":"Name","value":"degree"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdverbInflection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adverbType"}},{"kind":"Field","name":{"kind":"Name","value":"degree"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NounInflection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"declension"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrepositionInflection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"case"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VerbInflection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"conjugation"}},{"kind":"Field","name":{"kind":"Name","value":"other"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"principalParts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pronunciations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phonetic"}},{"kind":"Field","name":{"kind":"Name","value":"variant"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"translations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"wordForms"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"word"}},{"kind":"Field","name":{"kind":"Name","value":"form"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdjectivalForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"case"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"number"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdverbForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"degree"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"FiniteVerbForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mood"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"person"}},{"kind":"Field","name":{"kind":"Name","value":"tense"}},{"kind":"Field","name":{"kind":"Name","value":"voice"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GerundForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"case"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InfinitiveForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tense"}},{"kind":"Field","name":{"kind":"Name","value":"voice"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NominalForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"case"}},{"kind":"Field","name":{"kind":"Name","value":"number"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ParticipleForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tense"}},{"kind":"Field","name":{"kind":"Name","value":"voice"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SupineForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"case"}}]}}]}}]}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SearchEnglishQuery, SearchEnglishQueryVariables>;
export const SearchLatinDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SearchLatin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"query"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"searchLatin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"query"},"value":{"kind":"Variable","name":{"kind":"Name","value":"query"}}},{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"distance"}},{"kind":"Field","name":{"kind":"Name","value":"enclitic"}},{"kind":"Field","name":{"kind":"Name","value":"identifiers"}},{"kind":"Field","name":{"kind":"Name","value":"score"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"lexeme"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"etymology"}},{"kind":"Field","name":{"kind":"Name","value":"lemma"}},{"kind":"Field","name":{"kind":"Name","value":"partOfSpeech"}},{"kind":"Field","name":{"kind":"Name","value":"inflection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdjectiveInflection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"declension"}},{"kind":"Field","name":{"kind":"Name","value":"degree"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdverbInflection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adverbType"}},{"kind":"Field","name":{"kind":"Name","value":"degree"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NounInflection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"declension"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PrepositionInflection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"case"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"VerbInflection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"conjugation"}},{"kind":"Field","name":{"kind":"Name","value":"other"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"principalParts"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pronunciations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"phonetic"}},{"kind":"Field","name":{"kind":"Name","value":"variant"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"translations"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"data"}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"wordForms"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"word"}},{"kind":"Field","name":{"kind":"Name","value":"form"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"__typename"}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdjectivalForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"case"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"number"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdverbForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"degree"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"FiniteVerbForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"mood"}},{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"person"}},{"kind":"Field","name":{"kind":"Name","value":"tense"}},{"kind":"Field","name":{"kind":"Name","value":"voice"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"GerundForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"case"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"InfinitiveForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tense"}},{"kind":"Field","name":{"kind":"Name","value":"voice"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"NominalForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"case"}},{"kind":"Field","name":{"kind":"Name","value":"number"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ParticipleForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"tense"}},{"kind":"Field","name":{"kind":"Name","value":"voice"}}]}},{"kind":"InlineFragment","typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SupineForm"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"case"}}]}}]}}]}}]}}]}}]}}]}}]}}]}}]}}]} as unknown as DocumentNode<SearchLatinQuery, SearchLatinQueryVariables>;
export const TextReaderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TextReader"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"text"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"collection"}},{"kind":"Field","name":{"kind":"Name","value":"edition"}},{"kind":"Field","name":{"kind":"Name","value":"editors"}},{"kind":"Field","name":{"kind":"Name","value":"endYear"}},{"kind":"Field","name":{"kind":"Name","value":"findSpot"}},{"kind":"Field","name":{"kind":"Name","value":"inscriptionType"}},{"kind":"Field","name":{"kind":"Name","value":"lineCount"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"printYear"}},{"kind":"Field","name":{"kind":"Name","value":"province"}},{"kind":"Field","name":{"kind":"Name","value":"publisher"}},{"kind":"Field","name":{"kind":"Name","value":"startYear"}},{"kind":"Field","name":{"kind":"Name","value":"wordCount"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endYear"}},{"kind":"Field","name":{"kind":"Name","value":"era"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"startYear"}}]}},{"kind":"Field","name":{"kind":"Name","value":"nextText"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"parentText"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"previousText"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}},{"kind":"Field","name":{"kind":"Name","value":"lines"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"tokens"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"IntValue","value":"1000"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"index"}},{"kind":"Field","name":{"kind":"Name","value":"data"}},{"kind":"Field","name":{"kind":"Name","value":"isPunctuation"}}]}}]}}]}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"endCursor"}},{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}}]}}]}}]}}]}}]} as unknown as DocumentNode<TextReaderQuery, TextReaderQueryVariables>;
export const WordCandidatesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WordCandidates"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tokenId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wordCandidates"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"tokenId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tokenId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"definition"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"lemma"}},{"kind":"Field","name":{"kind":"Name","value":"lexemeId"}},{"kind":"Field","name":{"kind":"Name","value":"partOfSpeech"}},{"kind":"Field","name":{"kind":"Name","value":"translations"}}]}}]}}]} as unknown as DocumentNode<WordCandidatesQuery, WordCandidatesQueryVariables>;