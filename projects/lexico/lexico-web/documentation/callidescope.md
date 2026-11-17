<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/lexico/lexico-web`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 137 |
| Files | 90 |
| Calls traced | 83 |
| Call stacks | 21 |
| Deepest stack | 6 |
| Stacks through recursion | 0 |
| Unfollowable calls | 15 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 9 |
| `maximumBreadth` | 9 |

### Call stacks (depth)

**1. `handler(…)`** — depth 6 · orphan-root

```text
🚀 handler(…)(…): Promise<LexemeResult[]> [projects/lexico/lexico-web/src/components/search/search-results/search.constants.ts:18]
  └─> searchDictionary(query: string): Promise<LexemeResult[]> [projects/lexico/lexico-web/src/components/search/search-results/search.utilities.ts:53]
     ↳ Searches Latin and English at once, since a query is not labeled with its language, and merges both results, best match…
    └─> map(…)(node: ResultNode): LexemeResult [projects/lexico/lexico-web/src/components/search/search-results/search.utilities.ts:69]
      └─> toLexemeResult(node: ResultNode, query: string): LexemeResult [projects/lexico/lexico-web/src/components/search/search-results/search.utilities.ts:117]
         ↳ One result as the page shows it, from one as the API returns it.
        └─> toLexemeForms(lexeme: ResultNode["lexeme"]): LexemeFormRow[] [projects/lexico/lexico-web/src/components/search/search-results/search.utilities.ts:196]
           ↳ A lexeme's forms with the grammar of each beside its kind.
          └─> map(…)(…): { id: string; kind: string; word: string; number?: string; case?: string; degree?: string; gender?: string; mood?: string; person?: string; tense?: string; voice?: string; } [projects/lexico/lexico-web/src/components/search/search-results/search.utilities.ts:198]
```

**2. `FormsTable`** — depth ≥ 4 · orphan-root

```text
🚀 FormsTable(properties: Readonly<FormsTableProperties>): ReactNode [projects/lexico/lexico-web/src/components/forms/forms-table/forms-table.tsx:32]
   ↳ A grid of a lexeme's forms: cases or persons down the side, numbers across the top, each cell holding its word.
  └─> map(…)(row: FormsTableAxis, rowIndex: number): JSX.Element [projects/lexico/lexico-web/src/components/forms/forms-table/forms-table.tsx:56]
    └─> map(…)(column: FormsTableAxis, columnIndex: number): JSX.Element [projects/lexico/lexico-web/src/components/forms/forms-table/forms-table.tsx:61]
      └─> map(…)(word: string): JSX.Element [projects/lexico/lexico-web/src/components/forms/forms-table/forms-table.tsx:95]
```

**3. `VerbForms`** — depth 4 · orphan-root

```text
🚀 VerbForms(properties: Readonly<VerbFormsProperties>): ReactNode [projects/lexico/lexico-web/src/components/forms/verb-forms/verb-forms.tsx:32]
   ↳ Verb conjugation: tabs for voice, mood, and tense over a table of words by person and number, plus a tab for non-person…
  └─> narrow(rows: VerbFormRow[], selection: Selection): Conjugation [projects/lexico/lexico-web/src/components/forms/verb-forms/verb-forms.utilities.ts:18]
     ↳ Narrows a conjugation by the chosen voice, mood, and tense, falling back to the first option the rows still offer.
    └─> filter(…)(voice: string): boolean [projects/lexico/lexico-web/src/components/forms/verb-forms/verb-forms.utilities.ts:22]
      └─> some(…)(row: VerbFormRow): boolean [projects/lexico/lexico-web/src/components/forms/verb-forms/verb-forms.utilities.ts:22]
```

<details>
<summary>18 more call stacks</summary>

**4. `AdjectiveForms`** — depth 3 · orphan-root

```text
🚀 AdjectiveForms(properties: Readonly<AdjectiveFormsProperties>): ReactNode [projects/lexico/lexico-web/src/components/forms/adjective-forms/adjective-forms.tsx:28]
   ↳ An adjective's declension: a table of its words by case and number for each gender, switched with tabs.
  └─> filter(…)(gender: string): boolean [projects/lexico/lexico-web/src/components/forms/adjective-forms/adjective-forms.tsx:37]
    └─> some(…)(row: AdjectiveFormRow): boolean [projects/lexico/lexico-web/src/components/forms/adjective-forms/adjective-forms.tsx:38]
```

**5. `NounForms`** — depth 3 · orphan-root

```text
🚀 NounForms(properties: Readonly<NounFormsProperties>): ReactNode [projects/lexico/lexico-web/src/components/forms/noun-forms/noun-forms.tsx:24]
   ↳ A noun's declension: its words by case and number. Cases the noun has no form for are left out.
  └─> filter(…)(case_: string): boolean [projects/lexico/lexico-web/src/components/forms/noun-forms/noun-forms.tsx:32]
    └─> some(…)(row: NounFormRow): boolean [projects/lexico/lexico-web/src/components/forms/noun-forms/noun-forms.tsx:32]
```

**6. `handleOpenChange`** — depth ≥ 3 · orphan-root

```text
🚀 handleOpenChange(open: boolean): void [projects/lexico/lexico-web/src/components/lexeme/lexeme-forms/lexeme-forms.tsx:69]
   ↳ Opens or closes the table, loading the forms on the way open.
  └─> load(): void [projects/lexico/lexico-web/src/components/lexeme/lexeme-forms/lexeme-forms.tsx:51]
     ↳ Asks for the forms, unless they are already loaded or on their way.
    └─> catch(…)(): void [projects/lexico/lexico-web/src/components/lexeme/lexeme-forms/lexeme-forms.tsx:61]
```

**7. `LexemeHeader`** — depth 3 · orphan-root

```text
🚀 LexemeHeader(properties: Readonly<LexemeHeaderProperties>): ReactNode [projects/lexico/lexico-web/src/components/lexeme/lexeme-header/lexeme-header.tsx:26]
   ↳ A lexeme card's top: its principal parts, or lemma when none were ingested, over its part of speech and inflection.
  └─> describeInflection(…): string[] [projects/lexico/lexico-web/src/components/lexeme/lexeme-header/lexeme-header.utilities.ts:37]
     ↳ What an inflection says about a lexeme, as the fields its part of speech fills, with the empty ones left out.
    └─> findDescriber(…): (inflection: LexemeInflection) => (string | null | undefined)[] [projects/lexico/lexico-web/src/components/lexeme/lexeme-header/lexeme-header.utilities.ts:102]
       ↳ How to describe the inflection of a part of speech, or its plain details when it has no inflection of its own.
```

**8. `LexemeIdentifiers`** — depth 3 · orphan-root

```text
🚀 LexemeIdentifiers(properties: Readonly<LexemeIdentifiersProperties>): ReactNode [projects/lexico/lexico-web/src/components/lexeme/lexeme-identifiers/lexeme-identifiers.tsx:25]
   ↳ The searched word as a form of this lexeme, such as "1ST SG PRES ACT IND", when a search matched an inflected form.
  └─> map(…)(identifier: string): JSX.Element [projects/lexico/lexico-web/src/components/lexeme/lexeme-identifiers/lexeme-identifiers.tsx:50]
    └─> flatMap(…)(this: undefined, word: string): string | never[] [projects/lexico/lexico-web/src/components/lexeme/lexeme-identifiers/lexeme-identifiers.tsx:59]
```

**9. `SearchResults`** — depth ≥ 3 · orphan-root

```text
🚀 SearchResults(properties: Readonly<SearchResultsProperties>): ReactNode [projects/lexico/lexico-web/src/components/search/search-results/search-results.tsx:29]
   ↳ The lexemes a query matched, in a masonry of cards. Best matches are dealt round-robin, so top results sit side by side.
  └─> from(…)(_: unknown, column: number): LexemeResult[] [projects/lexico/lexico-web/src/components/search/search-results/search-results.tsx:43]
    └─> filter(…)(_result: LexemeResult, index: number): boolean [projects/lexico/lexico-web/src/components/search/search-results/search-results.tsx:44]
```

**10. `SearchPage`** — depth 3 · orphan-root

```text
🚀 SearchPage(): ReactNode [projects/lexico/lexico-web/src/routes/search.tsx:85]
   ↳ The search page: a search bar over either the landing logo or the results.
  └─> useMemo(…)(): Map<string, LexemeFormRow[]> [projects/lexico/lexico-web/src/routes/search.tsx:94]
    └─> map(…)(result: LexemeResult): readonly [string, LexemeFormRow[]] [projects/lexico/lexico-web/src/routes/search.tsx:96]
```

**11. `ApplicationSidebar`** — depth 2 · orphan-root

```text
🚀 ApplicationSidebar(properties: Readonly<ApplicationSidebarProperties>): ReactNode [projects/lexico/lexico-web/src/components/layout/application-sidebar/application-sidebar.tsx:36]
   ↳ Collapsible rail with the brand in its header, labelled navigation, and a collapse toggle in its footer.
  └─> map(…)(item: NavigationItem): JSX.Element [projects/lexico/lexico-web/src/components/layout/application-sidebar/application-sidebar.tsx:93]
```

**12. `SearchBar`** — depth 2 · orphan-root

```text
🚀 SearchBar(properties: Readonly<SearchBarProperties>): ReactNode [projects/lexico/lexico-web/src/components/search/search-bar/search-bar.tsx:36]
   ↳ The search field. It searches as you type, once typing pauses, and at once when the form is submitted.
  └─> useMemo(…)(): lodash.DebouncedFunc<(query: string) => void> [projects/lexico/lexico-web/src/components/search/search-bar/search-bar.tsx:51]
```

**13. `anonymous`** — depth 2 · orphan-root

```text
🚀 anonymous(case_: string, number: string): string[] [projects/lexico/lexico-web/src/components/forms/adjective-forms/adjective-forms.tsx:81]
  └─> map(…)(row: AdjectiveFormRow): string [projects/lexico/lexico-web/src/components/forms/adjective-forms/adjective-forms.tsx:84]
```

**14. `anonymous`** — depth 2 · orphan-root

```text
🚀 anonymous(case_: string, number: string): string[] [projects/lexico/lexico-web/src/components/forms/noun-forms/noun-forms.tsx:48]
  └─> map(…)(row: NounFormRow): string [projects/lexico/lexico-web/src/components/forms/noun-forms/noun-forms.tsx:51]
```

**15. `AxisTabs`** — depth 2 · orphan-root

```text
🚀 AxisTabs(properties: Readonly<AxisTabsProperties>): ReactNode [projects/lexico/lexico-web/src/components/forms/verb-forms/axis-tabs.tsx:24]
   ↳ One row of tabs for a conjugation axis, such as moods, each tab abbreviated and carrying its full name for hover.
  └─> map(…)(option: string): JSX.Element [projects/lexico/lexico-web/src/components/forms/verb-forms/axis-tabs.tsx:54]
```

**16. `NonFiniteForms`** — depth 2 · orphan-root

```text
🚀 NonFiniteForms(properties: Readonly<NonFiniteFormsProperties>): ReactNode [projects/lexico/lexico-web/src/components/forms/verb-forms/non-finite-forms.tsx:20]
   ↳ The forms that have no person, such as infinitives, participles, gerunds and supines, each named for its kind and what…
  └─> filter(…)(row: VerbFormRow): boolean [projects/lexico/lexico-web/src/components/forms/verb-forms/non-finite-forms.tsx:28]
```

**17. `anonymous`** — depth 2 · orphan-root

```text
🚀 anonymous(person: string, number: string): string[] [projects/lexico/lexico-web/src/components/forms/verb-forms/verb-forms.tsx:90]
  └─> map(…)(row: VerbFormRow): string [projects/lexico/lexico-web/src/components/forms/verb-forms/verb-forms.tsx:95]
```

**18. `FormsOfKind`** — depth 2 · orphan-root

```text
🚀 FormsOfKind(properties: Readonly<FormsOfKindProperties>): ReactNode [projects/lexico/lexico-web/src/components/lexeme/lexeme-forms/forms-of-kind.tsx:25]
   ↳ The table for the kind of forms a lexeme turned out to have, or a note that it has none.
  └─> filter(…)(row: LexemeFormRow): boolean [projects/lexico/lexico-web/src/components/lexeme/lexeme-forms/forms-of-kind.tsx:33]
```

**19. `LexemeMatch`** — depth 2 · orphan-root

```text
🚀 LexemeMatch(properties: Readonly<LexemeMatchProperties>): ReactNode [projects/lexico/lexico-web/src/components/lexeme/lexeme-match/lexeme-match.tsx:29]
   ↳ Two icons showing how a search matched: via Latin or English, and whether exact, a prefix, or partial.
  └─> describeExtent(match: LexemeMatchInfo): string [projects/lexico/lexico-web/src/components/lexeme/lexeme-match/lexeme-match.utilities.ts:13]
     ↳ Says how far a match is from the query: its edit distance when fuzzy, or the letters a lemma has beyond it.
```

**20. `LexemePronunciations`** — depth 2 · orphan-root

```text
🚀 LexemePronunciations(properties: Readonly<LexemePronunciationsProperties>): ReactNode [projects/lexico/lexico-web/src/components/lexeme/lexeme-pronunciations/lexeme-pronunciations.tsx:31]
   ↳ How a lexeme is pronounced in each variant of Latin that has a transcription, such as classical and ecclesiastical,…
  └─> map(…)({ phonetic, variant }: LexemePronunciation): JSX.Element [projects/lexico/lexico-web/src/components/lexeme/lexeme-pronunciations/lexeme-pronunciations.tsx:71]
```

**21. `LexemeTranslations`** — depth 2 · orphan-root

```text
🚀 LexemeTranslations(properties: Readonly<LexemeTranslationsProperties>): ReactNode [projects/lexico/lexico-web/src/components/lexeme/lexeme-translations/lexeme-translations.tsx:31]
   ↳ A lexeme's English translations as a bulleted list under a heading. Folded, it shows the first two; opened, all of them.
  └─> map(…)(translation: string): JSX.Element [projects/lexico/lexico-web/src/components/lexeme/lexeme-translations/lexeme-translations.tsx:77]
```

</details>

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `narrow` | 8 | `filter(…)`, `filter(…)`, `pick`, `filter(…)`, `filter(…)`, `filter(…)`, `filter(…)`, `filter(…)` | `projects/lexico/lexico-web/src/components/forms/verb-forms/verb-forms.utilities.ts:18` |
| `AdjectiveForms` | 6 | `filter(…)`, `filter(…)`, `filter(…)`, `map(…)`, `map(…)`, `map(…)` | `projects/lexico/lexico-web/src/components/forms/adjective-forms/adjective-forms.tsx:28` |
| `toLexemeResult` | 6 | `toLexemeForms`, `toLexemeInflection`, `describeMatch`, `flatMap(…)`, `toPronunciations`, `map(…)` | `projects/lexico/lexico-web/src/components/search/search-results/search.utilities.ts:117` |

<details>
<summary>41 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `NounForms` | 3 | `filter(…)`, `map(…)`, `map(…)` | `projects/lexico/lexico-web/src/components/forms/noun-forms/noun-forms.tsx:24` |
| `SearchResults` | 3 | `from(…)`, `useEffect(…)`, `map(…)` | `projects/lexico/lexico-web/src/components/search/search-results/search-results.tsx:29` |
| `searchDictionary` | 3 | `searchLatin`, `searchEnglish`, `map(…)` | `projects/lexico/lexico-web/src/components/search/search-results/search.utilities.ts:53` |
| `SearchPage` | 3 | `useMemo(…)`, `useCallback(…)`, `useCallback(…)` | `projects/lexico/lexico-web/src/routes/search.tsx:85` |
| `SearchBar` | 2 | `useMemo(…)`, `useEffect(…)` | `projects/lexico/lexico-web/src/components/search/search-bar/search-bar.tsx:36` |
| `anonymous` | 2 | `map(…)`, `filter(…)` | `projects/lexico/lexico-web/src/components/forms/adjective-forms/adjective-forms.tsx:81` |
| `anonymous` | 2 | `map(…)`, `filter(…)` | `projects/lexico/lexico-web/src/components/forms/noun-forms/noun-forms.tsx:48` |
| `NonFiniteForms` | 2 | `filter(…)`, `map(…)` | `projects/lexico/lexico-web/src/components/forms/verb-forms/non-finite-forms.tsx:20` |
| `anonymous` | 2 | `map(…)`, `filter(…)` | `projects/lexico/lexico-web/src/components/forms/verb-forms/verb-forms.tsx:90` |
| `FormsOfKind` | 2 | `filter(…)`, `filter(…)` | `projects/lexico/lexico-web/src/components/lexeme/lexeme-forms/forms-of-kind.tsx:25` |
| `load` | 2 | `catch(…)`, `then(…)` | `projects/lexico/lexico-web/src/components/lexeme/lexeme-forms/lexeme-forms.tsx:51` |
| `describeInflection` | 2 | `findDescriber`, `filter(…)` | `projects/lexico/lexico-web/src/components/lexeme/lexeme-header/lexeme-header.utilities.ts:37` |
| `LexemeTranslations` | 2 | `map(…)`, `map(…)` | `projects/lexico/lexico-web/src/components/lexeme/lexeme-translations/lexeme-translations.tsx:31` |
| `map(…)` | 2 | `map(…)`, `map(…)` | `projects/lexico/lexico-web/src/components/search/search-results/search-results.tsx:79` |
| `searchEnglish` | 2 | `queryApi`, `searchLanguage` | `projects/lexico/lexico-web/src/components/search/search-results/search.utilities.ts:75` |
| `searchLatin` | 2 | `queryApi`, `searchLanguage` | `projects/lexico/lexico-web/src/components/search/search-results/search.utilities.ts:90` |
| `ApplicationSidebar` | 1 | `map(…)` | `projects/lexico/lexico-web/src/components/layout/application-sidebar/application-sidebar.tsx:36` |
| `FormsTable` | 1 | `map(…)` | `projects/lexico/lexico-web/src/components/forms/forms-table/forms-table.tsx:32` |
| `map(…)` | 1 | `map(…)` | `projects/lexico/lexico-web/src/components/forms/forms-table/forms-table.tsx:56` |
| `map(…)` | 1 | `map(…)` | `projects/lexico/lexico-web/src/components/forms/forms-table/forms-table.tsx:61` |
| `filter(…)` | 1 | `some(…)` | `projects/lexico/lexico-web/src/components/forms/adjective-forms/adjective-forms.tsx:37` |
| `filter(…)` | 1 | `some(…)` | `projects/lexico/lexico-web/src/components/forms/adjective-forms/adjective-forms.tsx:44` |
| `filter(…)` | 1 | `some(…)` | `projects/lexico/lexico-web/src/components/forms/noun-forms/noun-forms.tsx:32` |
| `AxisTabs` | 1 | `map(…)` | `projects/lexico/lexico-web/src/components/forms/verb-forms/axis-tabs.tsx:24` |
| `filter(…)` | 1 | `some(…)` | `projects/lexico/lexico-web/src/components/forms/verb-forms/verb-forms.utilities.ts:22` |
| `filter(…)` | 1 | `some(…)` | `projects/lexico/lexico-web/src/components/forms/verb-forms/verb-forms.utilities.ts:27` |
| `filter(…)` | 1 | `some(…)` | `projects/lexico/lexico-web/src/components/forms/verb-forms/verb-forms.utilities.ts:32` |
| `VerbForms` | 1 | `narrow` | `projects/lexico/lexico-web/src/components/forms/verb-forms/verb-forms.tsx:32` |
| `handleOpenChange` | 1 | `load` | `projects/lexico/lexico-web/src/components/lexeme/lexeme-forms/lexeme-forms.tsx:69` |
| `LexemeHeader` | 1 | `describeInflection` | `projects/lexico/lexico-web/src/components/lexeme/lexeme-header/lexeme-header.tsx:26` |
| `LexemeIdentifiers` | 1 | `map(…)` | `projects/lexico/lexico-web/src/components/lexeme/lexeme-identifiers/lexeme-identifiers.tsx:25` |
| `map(…)` | 1 | `flatMap(…)` | `projects/lexico/lexico-web/src/components/lexeme/lexeme-identifiers/lexeme-identifiers.tsx:50` |
| `LexemeMatch` | 1 | `describeExtent` | `projects/lexico/lexico-web/src/components/lexeme/lexeme-match/lexeme-match.tsx:29` |
| `LexemePronunciations` | 1 | `map(…)` | `projects/lexico/lexico-web/src/components/lexeme/lexeme-pronunciations/lexeme-pronunciations.tsx:31` |
| `from(…)` | 1 | `filter(…)` | `projects/lexico/lexico-web/src/components/search/search-results/search-results.tsx:43` |
| `map(…)` | 1 | `toLexemeResult` | `projects/lexico/lexico-web/src/components/search/search-results/search.utilities.ts:69` |
| `searchLanguage` | 1 | `map(…)` | `projects/lexico/lexico-web/src/components/search/search-results/search.utilities.ts:174` |
| `toLexemeForms` | 1 | `map(…)` | `projects/lexico/lexico-web/src/components/search/search-results/search.utilities.ts:196` |
| `toPronunciations` | 1 | `flatMap(…)` | `projects/lexico/lexico-web/src/components/search/search-results/search.utilities.ts:211` |
| `handler(…)` | 1 | `searchDictionary` | `projects/lexico/lexico-web/src/components/search/search-results/search.constants.ts:18` |
| `useMemo(…)` | 1 | `map(…)` | `projects/lexico/lexico-web/src/routes/search.tsx:94` |

</details>
<!-- callidescope:end -->
