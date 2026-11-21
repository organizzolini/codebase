# Component Exceptions

Lexico uses the shadcn neutral theme and the shadcn and ReUI component defaults.
These are the deliberate exceptions.

- `src/routes/texts.$slug.tsx`: the reader page re-scopes the `dark` theme, so it keeps the near-black canvas in light mode, because reading is easier on it.
- `src/components/library/library-toolbar/library-toolbar.tsx`: the search field takes `min-w-64 flex-1`, so it grows to fill the toolbar row.
- `src/components/library/library-grid/library-grid.tsx`: each author card takes `mb-4 break-inside-avoid`, so the card masonry columns do not split a card.
- `src/components/library/library-text-tree/library-text-node.tsx`: the collapsible trigger Button takes `h-auto whitespace-normal`, so a long title wraps instead of overflowing.
- `src/components/reader/word-card/word-card.tsx`: a reading Button takes `h-auto whitespace-normal`, so a long definition wraps.
- `src/components/reader/reader-history/reader-history.tsx`: the history Card takes `h-full w-96 max-w-[calc(100vw-2rem)]`, so it is a full-height side panel that fits a phone.
- `src/components/forms/forms-table/forms-table.tsx`: cells take `relative h-14` and `border-l`, so the corner abbreviations have room and the columns divide.
- `src/components/layout/logo/logo.tsx`: an inline `style` sizes the logo box, because its height and width are props.
- `projects/common/presentation/src/components/reui/filters/filters.tsx`: the advanced builder is removed and opt-in through `FiltersAdvanced` children, so basic consumers do not bundle it.
- `projects/common/presentation/src/lib/utils.ts`: `cn` re-exports the shared `cn` package instead of defining it.
- `projects/common/presentation/src/styles/globals.css`: the shadcn neutral tokens, plus the `--radius-md` token the shared Button needs.
