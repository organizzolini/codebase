<!-- callidescope:start -->

## 🔭 Callidescope

Call stacks traced through `projects/ic-suite/coinagerie/coinagerie-output`, deepest first. Each frame shows what it takes, what it returns, and what its documentation says.

| Measure | Value |
| --- | --- |
| Callables | 53 |
| Files | 24 |
| Calls traced | 69 |
| Call stacks | 0 |
| Deepest stack | 0 |
| Stacks through recursion | 0 |
| Unfollowable calls | 0 |

### Limits

What this project is judged against, as declared in its own `callidescope.config.ts`.

| Limit | Value |
| --- | --- |
| `maximumDepth` | 10 |
| `maximumBreadth` | 4 |

### Call stacks (depth)

None.

### Breadth

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `JsonService.parse` | 4 | `JsonService.parseJson`, `JsonService.isObject`, `JsonService.fail`, `JsonService.refuseDuplicates` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/json/json.service.ts:161` |
| `DeliveryService.contentFor` | 4 | `JsonService.write`, `MarkdownService.write`, `DeliveryService.handlerFor`, `ComparisonService.reconcile` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/delivery/delivery.service.ts:50` |
| `MarkdownService.readDescription` | 3 | `MarkdownService.findAnchors`, `MarkdownService.findIndex(…)`, `MarkdownService.filter(…)` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:149` |

<details>
<summary>30 more callables</summary>

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `MarkdownService.parse` | 3 | `MarkdownService.findAnchors`, `MarkdownService.forEach(…)`, `MarkdownService.flush` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:201` |
| `MarkdownService.write` | 3 | `MarkdownService.splice`, `MarkdownService.render`, `MarkdownService.readDescription` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:283` |
| `DeliveryService.map(…)` | 3 | `JsonService.read`, `MarkdownService.read`, `DeliveryService.handlerFor` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/delivery/delivery.service.ts:79` |
| `ComparisonService.compare` | 2 | `ComparisonService.filter(…)`, `ComparisonService.filter(…)` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/comparison/comparison.service.ts:26` |
| `JsonService.endOfToken` | 2 | `JsonService.endOfString`, `JsonService.isBoundary` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/json/json.service.ts:45` |
| `JsonService.refuseDuplicates` | 2 | `JsonService.tokenize`, `JsonService.fail` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/json/json.service.ts:103` |
| `JsonService.render` | 2 | `JsonService.map(…)`, `JsonService.toSorted(…)` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/json/json.service.ts:196` |
| `MarkdownService.findAnchors` | 2 | `MarkdownService.indexesOf`, `MarkdownService.fail` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:57` |
| `MarkdownService.readBullet` | 2 | `MarkdownService.fail`, `MarkdownService.flush` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:103` |
| `MarkdownService.readContinuation` | 2 | `MarkdownService.fail`, `MarkdownService.from(…)` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:129` |
| `MarkdownService.readLine` | 2 | `MarkdownService.readBullet`, `MarkdownService.readContinuation` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:166` |
| `MarkdownService.render` | 2 | `MarkdownService.map(…)`, `MarkdownService.toSorted(…)` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:234` |
| `DeliveryService.check` | 2 | `DeliveryService.map(…)`, `DeliveryService.readAll` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/delivery/delivery.service.ts:97` |
| `DeliveryService.write` | 2 | `DeliveryService.map(…)`, `DeliveryService.readAll` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/delivery/delivery.service.ts:106` |
| `DeliveryService.map(…)` | 2 | `DeliveryService.contentFor`, `DeliveryService.differenceOf` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/delivery/delivery.service.ts:107` |
| `ComparisonService.reconcile` | 1 | `ComparisonService.map(…)` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/comparison/comparison.service.ts:40` |
| `JsonService.fail` | 1 | `MalformedGlossaryError.constructor` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/json/json.service.ts:66` |
| `JsonService.parseJson` | 1 | `JsonService.fail` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/json/json.service.ts:89` |
| `JsonService.tokenize` | 1 | `JsonService.endOfToken` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/json/json.service.ts:138` |
| `JsonService.read` | 1 | `JsonService.parse` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/json/json.service.ts:187` |
| `JsonService.write` | 1 | `JsonService.render` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/json/json.service.ts:208` |
| `MarkdownService.fail` | 1 | `MalformedGlossaryError.constructor` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:46` |
| `MarkdownService.indexesOf` | 1 | `MarkdownService.flatMap(…)` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:61` |
| `MarkdownService.forEach(…)` | 1 | `MarkdownService.readLine` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:217` |
| `MarkdownService.read` | 1 | `MarkdownService.parse` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:226` |
| `MarkdownService.map(…)` | 1 | `MarkdownService.renderBullet` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:242` |
| `MarkdownService.splice` | 1 | `MarkdownService.findAnchors` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/markdown/markdown.service.ts:256` |
| `DeliveryService.differenceOf` | 1 | `ComparisonService.compare` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/delivery/delivery.service.ts:59` |
| `DeliveryService.readAll` | 1 | `DeliveryService.map(…)` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/delivery/delivery.service.ts:78` |
| `DeliveryService.map(…)` | 1 | `DeliveryService.differenceOf` | `projects/ic-suite/coinagerie/coinagerie-output/src/modules/delivery/delivery.service.ts:98` |

</details>
<!-- callidescope:end -->
