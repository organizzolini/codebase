# Component Exceptions

Lexico uses the shadcn neutral theme and the shadcn and ReUI component defaults.
Layout classes on our own wrapper elements, and the author cards, the reader
history panel, and the reader's candidate list, take no override of a shadcn
component. These are the deliberate exceptions.

- `src/components/library/library-text-tree/library-text-node.tsx`: the unstyled collapsible trigger takes layout classes, so a long title wraps beside its chevron.
- `src/components/forms/forms-table/forms-table.tsx`: cells take `relative h-14` and `border-l`, so the corner abbreviations have room and the columns divide.
- `src/routes/texts.$slug.tsx`: the reader surface takes `bg-amber-50 dark:bg-background`, a warm paper tone in light mode over the dark theme's near-black.
- `projects/common/presentation/src/components/reui/filters/filters.tsx`: the advanced builder is removed and opt-in through `FiltersAdvanced` children, so basic consumers do not bundle it.
- `projects/common/presentation/src/lib/utils.ts`: `cn` re-exports the shared `cn` package instead of defining it.
- `projects/common/presentation/src/styles/globals.css`: the shadcn neutral tokens, plus the `--radius-md` token the shared Button needs.
