import { graphql, type GraphQLResponseResolver, type RequestHandlerOptions } from 'msw'
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
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
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
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
  lines: LineConnection;
  searchAuthors: AuthorConnection;
  /** Performs English definition and translation search with relevance ranking, returning at most the 200 best-ranked lexemes. */
  searchEnglish: LexemeSearchResultConnection;
  /** Performs tiered Latin dictionary search across exact headwords, inflected forms, prefixes, and fuzzy matches. */
  searchLatin: LexemeSearchResultConnection;
  searchLines: LineConnection;
  searchLiterature: LiteratureSearchResult;
  searchTexts: TextConnection;
  text?: Maybe<Text>;
  texts: TextConnection;
  tokens: TokenConnection;
  /** Retrieves a surface Latin word and its morphological links. */
  word?: Maybe<Word>;
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


export type QueryWordsArgs = {
  data: Array<Scalars['String']['input']>;
};

/** Classification of where and how a search match was found. */
export enum SearchMatchSource {
  Enclitic = 'ENCLITIC',
  Fuzzy = 'FUZZY',
  LemmaExact = 'LEMMA_EXACT',
  Prefix = 'PREFIX',
  TranslationFulltext = 'TRANSLATION_FULLTEXT',
  WordExact = 'WORD_EXACT'
}

export type SupineForm = Form & {
  __typename?: 'SupineForm';
  case: Scalars['String']['output'];
  id: Scalars['ID']['output'];
};

export type Text = {
  __typename?: 'Text';
  author: Author;
  childTexts: TextConnection;
  createdAt: Scalars['DateTime']['output'];
  createdBy?: Maybe<Scalars['ID']['output']>;
  deletedAt?: Maybe<Scalars['DateTime']['output']>;
  deletedBy?: Maybe<Scalars['ID']['output']>;
  id: Scalars['ID']['output'];
  lines: LineConnection;
  parentText?: Maybe<Text>;
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  updatedBy?: Maybe<Scalars['ID']['output']>;
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

export type SearchEnglishQueryVariables = Exact<{
  query: Scalars['String']['input'];
  first: Scalars['Int']['input'];
}>;


export type SearchEnglishQuery = { __typename?: 'Query', searchEnglish: { __typename?: 'LexemeSearchResultConnection', edges: Array<{ __typename?: 'LexemeSearchResultEdge', node: { __typename?: 'LexemeSearchResult', enclitic?: string | null, identifiers: Array<string>, score: number, source: SearchMatchSource, lexeme: { __typename?: 'Lexeme', id: string, etymology?: string | null, lemma: string, partOfSpeech: string, inflection?:
            | { __typename?: 'AdjectiveInflection', declension: string, degree: string }
            | { __typename?: 'AdverbInflection', adverbType: string, degree: string }
            | { __typename?: 'NounInflection', declension: string, gender: string }
            | { __typename?: 'PrepositionInflection', case: string }
            | { __typename?: 'UninflectedInflection' }
            | { __typename?: 'VerbInflection', conjugation: string, other?: string | null }
           | null, principalParts: { __typename?: 'PrincipalPartConnection', edges: Array<{ __typename?: 'PrincipalPartEdge', node: { __typename?: 'PrincipalPart', text: Array<string> } }> }, pronunciations?: { __typename?: 'PronunciationConnection', edges: Array<{ __typename?: 'PronunciationEdge', node: { __typename?: 'Pronunciation', phonetic?: string | null, variant: string } }> } | null, translations?: { __typename?: 'TranslationConnection', edges: Array<{ __typename?: 'TranslationEdge', node: { __typename?: 'Translation', data: string } }> } | null, wordForms: { __typename?: 'LexemeWordFormConnection', edges: Array<{ __typename?: 'LexemeWordFormEdge', node: { __typename?: 'LexemeWordForm', id: string, word: string, form:
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
  query: Scalars['String']['input'];
  first: Scalars['Int']['input'];
}>;


export type SearchLatinQuery = { __typename?: 'Query', searchLatin: { __typename?: 'LexemeSearchResultConnection', edges: Array<{ __typename?: 'LexemeSearchResultEdge', node: { __typename?: 'LexemeSearchResult', enclitic?: string | null, identifiers: Array<string>, score: number, source: SearchMatchSource, lexeme: { __typename?: 'Lexeme', id: string, etymology?: string | null, lemma: string, partOfSpeech: string, inflection?:
            | { __typename?: 'AdjectiveInflection', declension: string, degree: string }
            | { __typename?: 'AdverbInflection', adverbType: string, degree: string }
            | { __typename?: 'NounInflection', declension: string, gender: string }
            | { __typename?: 'PrepositionInflection', case: string }
            | { __typename?: 'UninflectedInflection' }
            | { __typename?: 'VerbInflection', conjugation: string, other?: string | null }
           | null, principalParts: { __typename?: 'PrincipalPartConnection', edges: Array<{ __typename?: 'PrincipalPartEdge', node: { __typename?: 'PrincipalPart', text: Array<string> } }> }, pronunciations?: { __typename?: 'PronunciationConnection', edges: Array<{ __typename?: 'PronunciationEdge', node: { __typename?: 'Pronunciation', phonetic?: string | null, variant: string } }> } | null, translations?: { __typename?: 'TranslationConnection', edges: Array<{ __typename?: 'TranslationEdge', node: { __typename?: 'Translation', data: string } }> } | null, wordForms: { __typename?: 'LexemeWordFormConnection', edges: Array<{ __typename?: 'LexemeWordFormEdge', node: { __typename?: 'LexemeWordForm', id: string, word: string, form:
                  | { __typename: 'AdjectivalForm', case: string, gender: string, number: string }
                  | { __typename: 'AdverbForm', degree: string }
                  | { __typename: 'FiniteVerbForm', mood: string, number: string, person: string, tense: string, voice: string }
                  | { __typename: 'GerundForm', case: string }
                  | { __typename: 'InfinitiveForm', tense: string, voice: string }
                  | { __typename: 'NominalForm', case: string, number: string }
                  | { __typename: 'ParticipleForm', tense: string, voice: string }
                  | { __typename: 'SupineForm', case: string }
                 } }> } } } }> } };


/**
 * @param resolver A function that accepts [resolver arguments](https://mswjs.io/docs/api/graphql#resolver-argument) and must always return the instruction on what to do with the intercepted request. ([see more](https://mswjs.io/docs/concepts/response-resolver#resolver-instructions))
 * @param options Options object to customize the behavior of the mock. ([see more](https://mswjs.io/docs/api/graphql#handler-options))
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockSearchEnglishQuery(
 *   ({ query, variables }) => {
 *     const { query, first } = variables;
 *     return HttpResponse.json({
 *       data: { searchEnglish }
 *     })
 *   },
 *   requestOptions
 * )
 */
export const mockSearchEnglishQuery = (resolver: GraphQLResponseResolver<SearchEnglishQuery, SearchEnglishQueryVariables>, options?: RequestHandlerOptions) =>
  graphql.query<SearchEnglishQuery, SearchEnglishQueryVariables>(
    'SearchEnglish',
    resolver,
    options
  )

/**
 * @param resolver A function that accepts [resolver arguments](https://mswjs.io/docs/api/graphql#resolver-argument) and must always return the instruction on what to do with the intercepted request. ([see more](https://mswjs.io/docs/concepts/response-resolver#resolver-instructions))
 * @param options Options object to customize the behavior of the mock. ([see more](https://mswjs.io/docs/api/graphql#handler-options))
 * @see https://mswjs.io/docs/basics/response-resolver
 * @example
 * mockSearchLatinQuery(
 *   ({ query, variables }) => {
 *     const { query, first } = variables;
 *     return HttpResponse.json({
 *       data: { searchLatin }
 *     })
 *   },
 *   requestOptions
 * )
 */
export const mockSearchLatinQuery = (resolver: GraphQLResponseResolver<SearchLatinQuery, SearchLatinQueryVariables>, options?: RequestHandlerOptions) =>
  graphql.query<SearchLatinQuery, SearchLatinQueryVariables>(
    'SearchLatin',
    resolver,
    options
  )
