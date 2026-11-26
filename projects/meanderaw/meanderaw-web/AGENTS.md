# meanderaw-web

**Purpose**: A gallery of the meanders `meanderaw-api` serves: each as a card with its drawing, shape, Code and characteristics, in a grid or a list, filtered by a nested AND/OR rule tree over any field, grouped by up to four levels with exact counts, sorted by any field, paged by cursor and virtualized. Reads the API at `VITE_MEANDERAW_API_URL` (default `http://localhost:8367/graphql`); view, sort, group, filter and rows rule live in the URL search params. GraphQL documents are in `src/graphql/operations/`; `nx run meanderaw-web:codegen` regenerates the typed documents from the API's emitted `src/schema.gql`.

## The Filter UI

Filtering works like ReUI's filters: a small **Filter** button opens a popup, and each filter then shows on the page as a pill.

- **Adding**: the popup is one step at a time. A search box lists the attributes (the shape fields first, then the catalog by category, at most 50 at once, then "refine your search"); arrow keys and Enter, or a click, pick one. Then its operator and value are set in the same popup, and Add filter puts a pill on the page. The popup is a popover at every width, closes on Escape or a click outside, and gives focus back to the button.
- **Pills**: `[attribute | operator | value | ×]`. Operator and value edit in place (a value commits on blur or Enter); × removes the rule.
- **Combinator**: new filters join the root group, which a Match all / Match any select switches (it appears once there are two). The popup only adds to the root. A link's nested groups still show, as parenthesized sub-groups of pills with their own match select and ×, and are editable in place.
- **Code**: `GalleryFilters` holds the button, the Match select and Clear; `FilterSurface` is the popup; `GalleryFilterBuilder` is its add-a-filter steps (`FilterAttributeSearch`, `FilterOperandEditor`); `FilterPillRow` and `FilterPillGroup` draw the pills.

## The Rows Rule

Every filter holds a rows rule, `rows = 4` by default, which the user can change to any numeric comparison (`=`, `≠`, `<`, `≤`, `>`, `≥`, `between`) but never remove.

- It lives in its own `rows` search parameter (`{operator, value}`, Zod-validated). A link with none, or an invalid one, is repaired to `rows = 4` in the address.
- The request is `AND{ rows rule, group(tree) }` (`toFilterInput(tree, rows)`), so the rule holds whatever the tree's own combinator. Anything that sends a filter (grouping included) must go through `toFilterInput` with the rows rule.
- The API caps a filter at depth 6 and 128 rules and groups, so the tree is capped at depth 5 and 126 (`MAXIMUM_FILTER_DEPTH`, `MAXIMUM_FILTER_ENTRIES`): the rows rule and the group holding the tree take the rest.
- The rows pill has no × and Clear resets to `rows = 4` with no tree.

## The Gallery

- **Data**: GraphQL over `fetch` in `components/meander-gallery/meanders-api.utilities.ts`; typed documents come from `nx run meanderaw-web:codegen`, which reads the API's emitted `src/schema.gql` and the documents in `src/graphql/operations/`.
- **Paging**: hand-rolled in `hooks/use-meanders/use-meanders.ts`, since the repository has no `@tanstack/react-query`. The view shows a window of consecutive pages (first to last), each read once by offset and kept; `useEndReached` appends the next page when the end of the list scrolls into view, and Next, Previous, "Go to page n" and a new size select one page alone (and scroll to the top). The Page menu in `GalleryPager` lists every page, virtualized, checking each in the window; the range reads "x to y of z".
- **Virtualization**: `@tanstack/react-virtual`'s window virtualizer in `MeanderGallery`.
- **State**: view, sort and repeats live in URL search params, validated with Zod in `use-gallery-search.constants.ts`; a sort the catalog does not know falls back to the default order, and repeats outside 1 to 24 (the API's `MAXIMUM_SVG_REPEATS`) or not a number fall back to 12, and an unknown view to the list. A change to the sort or repeats reloads from page 1.
- **Cards**: each card stacks the drawing (at the SVG's own aspect) over the Code with its repeats written `r<n>`, as the Code format spells them, and pills of its characteristics grouped by catalog category, patterns first.
- **Tests**: route integration tests mock GraphQL with MSW; `testing/meanders-api.ts` serves the fixture and `testing/viewport.ts` fakes width, resize observers and scroll.
- **Grouping**: `group` (up to four fields, repaired in the link) makes the loader read `meanderGroups` through `findGallery`, within the same `toFilterInput(tree, rows)` filter, for the headers' exact counts. The meanders are one sequence read by the same pager: `toSequenceSorts` asks `meanders` for each level ascending, then the sorts (up to the API's 8 in all), so pages cut across groups. `GroupedGallery` lays the window out as one virtual list, `buildGroupedItems` putting a header for each level wherever a card's group keys (`rows`, `columns`, or its characteristics, a missing one 0) change; `indexGroups` gives each header its exact count and where it starts, so a group running onto the window from an earlier page reads "(continued)". `parseGroups` validates the response against the levels asked.
