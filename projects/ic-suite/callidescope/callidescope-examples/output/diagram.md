<!-- callidescope:start -->

# 🔭 Callidescope

| Measure | Value |
| --- | --- |
| Callables | 431 |
| Files | 238 |
| Calls traced | 365 |
| Call stacks | 144 |
| Deepest stack | 9 |
| Stacks through recursion | 1 |
| Unfollowable calls | 30 |

## Projects

| Project | Deepest | Limit | Headroom | Widest |
| --- | --- | --- | --- | --- |
| `projects/ic-suite/callidescope/callidescope-examples` | 8 | 5 | -3 | 2 |
| `projects/common/observability` | 6 | 4 | -2 | 2 |
| `projects/ic-suite/callidescope/callidescope-examples/examples/gated-leaf` | 4 | 3 | -1 | 3 |
| `projects/ic-suite/codependix/codependix-configuration` | 7 | 7 | 0 | 4 |
| `projects/ic-suite/codometer/codometer-configuration` | 9 | 9 | 0 | 4 |
| `projects/ic-suite/coinagerie/coinagerie-configuration` | 3 | 3 | 0 | 3 |
| `projects/ic-suite/callidescope/callidescope-configuration` | 7 | 8 | 1 | 7 |
| `projects/ic-suite/codependix/codependix-core` | 0 | 1 | 1 | 0 |
| `projects/ic-suite/codometer/codometer-core` | 0 | 1 | 1 | 0 |
| `projects/ic-suite/coinagerie/coinagerie-core` | 0 | 1 | 1 | 0 |
| `projects/ic-suite/coinagerie/coinagerie-languages` | 4 | 6 | 2 | 3 |
| `projects/ic-suite/callidescope/callidescope-core` | 0 | 17 | 17 | 0 |

## Depth headroom

| Headroom | Projects |
| --- | --- |
| over limit | 3 |
| 0 — at limit | 3 |
| 1 | 1 |
| 2–3 | 1 |
| 4+ | 0 |
| no stacks | 4 |

## Call stacks over the depth limit (11)

```mermaid
flowchart LR
  n0(["ComputedMemberService.dispatch"])
  n1["ComputedMemberService.read"]
  n2["ComputedMemberService.normalize"]
  n3["ComputedMemberService.route"]
  n4["ComputedMemberService.select"]
  n5["ComputedMemberService.prepare"]
  n6["ComputedMemberService.choose"]
  n7["ComputedMemberService.apply"]
  n8(["DeepStackService.quote"])
  n9["DeepStackService.validate"]
  n10["DeepStackService.removeDiscount"]
  n11["DeepStackService.resolveTier"]
  n12["DeepStackService.loadRate"]
  n13["DeepStackService.applyTax"]
  n14["DeepStackService.convertCurrency"]
  n15["roundToCents"]
  n16(["ForwardingStackService.handle"])
  n17["ForwardingStackService.process"]
  n18["ForwardingStackService.execute"]
  n19["ForwardingStackService.forward"]
  n20["ForwardingStackService.perform"]
  n21["ForwardingStackService.relay"]
  n22["ForwardingStackService.finish"]
  n23(["FrameAnnotationsService.trace"])
  n24["FrameAnnotationsService.render"]
  n25["FrameAnnotationsService.summarize"]
  n26["FrameAnnotationsService.describe"]
  n27["FrameAnnotationsService.compose"]
  n28["FrameAnnotationsService.collapseThisSignatureBecauseItRunsLong"]
  n29["FrameAnnotationsService.finish"]
  n30(["LoggerService.log"])
  n31["LoggerService.info"]
  n32["LoggerService.buildBindings"]
  n33["LoggerService.assertConventionalMessage"]
  n34["LoggerService.getConventionalMessageViolation"]
  n35["LoggerService.isConventionalVerb"]
  n36(["ProjectDepthLimitService.judge"])
  n37["ProjectDepthLimitService.resolveConfiguration"]
  n38["ProjectDepthLimitService.readLimit"]
  n39["ProjectDepthLimitService.applyLimit"]
  n40["ProjectDepthLimitService.reportVerdict"]
  n41["ProjectDepthLimitService.readDeclaringFile"]
  n42(["LoggerService.debug"])
  n43(["LoggerService.error"])
  n44(["LoggerService.verbose"])
  n45(["LoggerService.warn"])
  n46(["GatedLeafService.read"])
  n47["GatedLeafService.parse"]
  n48["GatedLeafService.normalize"]
  n49["GatedLeafService.finish"]
  n0 --> n1
  n1 --> n2
  n2 --> n3
  n3 --> n4
  n4 --> n5
  n5 --> n6
  n6 --> n7
  n8 --> n9
  n9 --> n10
  n10 --> n11
  n11 --> n12
  n12 --> n13
  n13 --> n14
  n14 --> n15
  n16 --> n17
  n17 --> n18
  n18 --> n19
  n19 --> n20
  n20 --> n21
  n21 --> n22
  n22 --> n15
  n23 --> n24
  n24 --> n25
  n25 --> n26
  n26 --> n27
  n27 --> n28
  n28 --> n29
  n30 --> n31
  n31 --> n32
  n32 --> n33
  n33 --> n34
  n34 --> n35
  n36 --> n37
  n37 --> n38
  n38 --> n39
  n39 --> n40
  n40 --> n41
  n42 --> n32
  n43 --> n32
  n44 --> n32
  n45 --> n32
  n46 --> n47
  n47 --> n48
  n48 --> n49
```

## Callables over the breadth limit (1)

| Callable | Breadth | Calls directly | Location |
| --- | --- | --- | --- |
| `GatedLeafService.read` | 3 | `GatedLeafService.parse`, `GatedLeafService.normalize`, `GatedLeafService.finish` | `projects/ic-suite/callidescope/callidescope-examples/examples/gated-leaf/gated-leaf.ts:33` |

<!-- callidescope:end -->
