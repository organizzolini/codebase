# Component Exceptions

Lexico uses the shadcn neutral theme and the shadcn and ReUI component defaults.
Layout classes on our own wrapper elements, and the author cards, the reader
history panel, and the reader's candidate list, take no override of a shadcn
component. These are the deliberate exceptions.

- `src/components/library/library-text-tree/library-text-node.tsx`: the unstyled collapsible trigger takes layout classes, so a long title wraps beside its chevron.
- `src/components/library/library-toolbar/library-toolbar.tsx`: the Filter strip squares and clears the left border and corners of each ReUI filter chip's first segment, because a chip is a button group of its own and would otherwise show its rounded border apart from the Filter button.
- `src/components/library/library-toolbar/library-toolbar.constants.ts`: `LIBRARY_STRIP_CHIPS` squares and overlaps the borders of a strip's sortable chips so they join the Group or Sort button as one button group, because each chip wraps its own button and would otherwise show rounded corners and a doubled border.
- `src/components/library-strip/library-chip/library-chip.constants.ts`: `LIBRARY_CHIP_REVEAL` is the opacity transition that shows a chip's drag handle and cross on hover and keyboard focus, and `LIBRARY_CHIP_ICON_FADE` fades the chip's icon while the handle covers it.
- `src/components/library/library-toolbar/library-option-menu.tsx`: the popover takes `w-80 p-0`, wide enough for every label on one line and flush so the command list supplies its own padding, as the shadcn combobox example does; each label takes `whitespace-nowrap`.
- `src/components/library/library-grid/library-grid.tsx`: a group heading takes `col-span-full`, to span the whole row of cards.
- `src/components/library/library-grid/library-group-heading.tsx`: the heading takes `text-xl font-semibold`, to read as a section title.
- `src/components/forms/forms-table/forms-table.tsx`: cells take `relative h-14` and `border-l`, so the corner abbreviations have room and the columns divide.
- `src/routes/texts.$slug.tsx`: the reader surface takes `bg-amber-50 dark:bg-background`, a warm paper tone in light mode over the dark theme's near-black.
- `projects/common/presentation/src/components/reui/filters/filters.tsx`: the advanced builder is removed and opt-in through `FiltersAdvanced` children, so basic consumers do not bundle it.
- `projects/common/presentation/src/components/ui/command.tsx`: the item matches `data-[selected=true]` rather than `data-selected`, because cmdk writes `data-selected="false"` on every other row and the bare variant highlights them all.
- `projects/common/presentation/src/lib/utils.ts`: `cn` re-exports the shared `cn` package instead of defining it.
- `projects/common/presentation/src/styles/globals.css`: the shadcn neutral tokens, plus the `--radius-md` token the shared Button needs.
