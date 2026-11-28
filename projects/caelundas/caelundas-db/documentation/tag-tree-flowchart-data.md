[Aspect](#aspect) · [Yearly](#yearly) · [Planetary](#planetary) · [Sign](#sign) · [Daily](#daily-eclipse) · [Eclipse](#daily-eclipse) · [Body](#body) · [Temporality](#temporality-lunar) · [Lunar](#temporality-lunar)

## Aspect

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef shared fill:#fff4e5,stroke:#e8710a,stroke-width:2px
    n271["Stellium<br/><i>sparkles · Bodies bunched together, counted by how many.</i>"] --> n0["3 Body<br/><i>circle</i>"] & n1["4 Body<br/><i>circle</i>"] & n2["5 Body<br/><i>circle</i>"] & n3["6 Body<br/><i>circle</i>"] & n4["7 Body<br/><i>circle</i>"]
    n274["Focal Body<br/><i>crosshair · The body a compound pattern points at.</i>"] --> n10["Ceres Focal<br/><i>crosshair · The pattern points at Ceres.</i>"] & n11["Chiron Focal<br/><i>crosshair · The pattern points at Chiron.</i>"] & n53["Juno Focal<br/><i>crosshair · The pattern points at Juno.</i>"] & n54["Jupiter Focal<br/><i>crosshair · The pattern points at Jupiter.</i>"] & n57["Lilith Focal<br/><i>crosshair · The pattern points at Lilith.</i>"] & n58["Lunar Apogee Focal<br/><i>crosshair · The pattern points at Lunar Apogee.</i>"] & n59["Mars Focal<br/><i>crosshair · The pattern points at Mars.</i>"] & n60["Mercury Focal<br/><i>crosshair · The pattern points at Mercury.</i>"] & n61["Moon Focal<br/><i>crosshair · The pattern points at Moon.</i>"] & n73["Neptune Focal<br/><i>crosshair · The pattern points at Neptune.</i>"] & n75["North Lunar Node Focal<br/><i>crosshair · The pattern points at North Lunar Node.</i>"] & n77["Pallas Focal<br/><i>crosshair · The pattern points at Pallas.</i>"] & n78["Pluto Focal<br/><i>crosshair · The pattern points at Pluto.</i>"] & n83["Saturn Focal<br/><i>crosshair · The pattern points at Saturn.</i>"] & n86["Sun Focal<br/><i>crosshair · The pattern points at Sun.</i>"] & n90["Uranus Focal<br/><i>crosshair · The pattern points at Uranus.</i>"] & n91["Venus Focal<br/><i>crosshair · The pattern points at Venus.</i>"] & n93["Vesta Focal<br/><i>crosshair · The pattern points at Vesta.</i>"]
    n45["Harmonic 4<br/><i>audio-waveform · The aspects of the 4th harmonic: the square, a circle in quarters.</i>"] --> n37["Grand Cross<br/><i>square · Four bodies in squares and oppositions: a tense cross.</i>"] & n87["T Square<br/><i>triangle · Two bodies in opposition, both square a third.</i>"] & n230["Square<br/><i>star · Bodies 90° apart: friction that pushes toward action.</i>"]
    n121["Hard<br/><i>zap · Tense aspects, such as squares.</i>"] --> n37 & n87 & n187["Semisquare<br/><i>sparkle · Bodies 45° apart: a small irritation.</i>"] & n226["Sesquiquadrate<br/><i>sparkle · Bodies 135° apart: agitation that demands release.</i>"] & n230 & n265["Opposite<br/><i>star · Bodies 180° apart: two sides pulling against each other.</i>"]
    n183["Quadruple<br/><i>square · Patterns of four bodies.</i>"] --> n37 & n55["Kite<br/><i>square · A grand trine with a fourth body opposite one of its points.</i>"]
    n150["Triple<br/><i>triangle · Patterns of three bodies.</i>"] --> n38["Grand Trine<br/><i>triangle · Three bodies 120° apart: a closed triangle of ease.</i>"] & n87 & n104["Yod<br/><i>triangle · Two bodies in sextile, both quincunx a third.</i>"]
    n190["Soft<br/><i>waves · Easy aspects, such as trines.</i>"] --> n38 & n51["Hexagram<br/><i>hexagon · Six bodies in two interlocking grand trines, the Star of David.</i>"] & n55 & n141["Semisextile<br/><i>sparkle · Bodies 30° apart: a mild, easily missed link.</i>"] & n161["Decile<br/><i>gem · Bodies 36° apart: a faint, creative link.</i>"] & n188["Sextile<br/><i>star · Bodies 60° apart: an easy opening to cooperate.</i>"] & n222["Novile<br/><i>gem · Bodies 40° apart: a subtle link of completion.</i>"] & n251["Trine<br/><i>star · Bodies 120° apart: a harmonious flow.</i>"] & n270["Quintile<br/><i>gem · Bodies 72° apart: a creative, talent-making link.</i>"] & n280["Tredecile<br/><i>gem · Bodies 108° apart: a gentle, talented link.</i>"] & n285["Biquintile<br/><i>gem · Bodies 144° apart: a creative, gifted link.</i>"]
    n44["Harmonic 3<br/><i>audio-waveform · The aspects of the 3rd harmonic: the trine, a circle in thirds.</i>"] --> n38 & n251
    n237["Harmonic<br/><i>audio-waveform · The harmonic of an aspect: 1 for a conjunction, 2 an opposition, 3 a trine, 4 a square, and so on.</i>"] --> n39["Harmonic 1<br/><i>audio-waveform · The aspects of the 1st harmonic: the conjunction, a circle undivided.</i>"] & n40["Harmonic 10<br/><i>audio-waveform · The aspects of the 10th harmonic: the decile and tredecile, a circle in tenths.</i>"] & n41["Harmonic 11<br/><i>audio-waveform · The aspects of the 11th harmonic: the undecile, a circle in elevenths.</i>"] & n42["Harmonic 12<br/><i>audio-waveform · The aspects of the 12th harmonic: the semisextile and quincunx, a circle in twelfths.</i>"] & n43["Harmonic 2<br/><i>audio-waveform · The aspects of the 2nd harmonic: the opposition, a circle in halves.</i>"] & n44 & n45 & n46["Harmonic 5<br/><i>audio-waveform · The aspects of the 5th harmonic: the quintile family, a circle in fifths.</i>"] & n47["Harmonic 6<br/><i>audio-waveform · The aspects of the 6th harmonic: the sextile, a circle in sixths.</i>"] & n48["Harmonic 7<br/><i>audio-waveform · The aspects of the 7th harmonic: the septile family, a circle in sevenths.</i>"] & n49["Harmonic 8<br/><i>audio-waveform · The aspects of the 8th harmonic: the semisquare and sesquiquadrate, a circle in eighths.</i>"] & n50["Harmonic 9<br/><i>audio-waveform · The aspects of the 9th harmonic: the novile, a circle in ninths.</i>"]
    n47 --> n51 & n55 & n188
    n250["Sextuple<br/><i>hexagon · Patterns of six bodies.</i>"] --> n51
    n42 --> n104 & n141 & n247["Quincunx<br/><i>sparkle · Bodies 150° apart: awkward, needing adjustment.</i>"]
    n221["Neutral<br/><i>circle · Aspects that are neither.</i>"] --> n104 & n112["Conjunct<br/><i>star · Bodies at the same longitude, 0°: their energies merge.</i>"] & n151["Undecile<br/><i>gem · Bodies about 32.7° apart: a faint, unusual link.</i>"] & n247 & n249["Septile<br/><i>gem · Bodies about 51.4° apart: a fated, elusive link.</i>"] & n271
    n126["Major<br/><i>star · The five classical aspects.</i>"] --> n112 & n188 & n230 & n251 & n265
    n39 --> n112 & n271
    n267["Phase<br/><i>hourglass · Whether an aspect is the moment it is exact.</i>"] --> n116["Exact<br/><i>circle-dot · The moment the aspect is exact.</i>"]
    n220["Nature<br/><i>scale · Whether an aspect is hard, soft or neutral.</i>"] --> n121 & n190 & n221
    n143["Simple<br/><i>triangle · Aspects between two bodies.</i>"] --> n126 & n170["Minor<br/><i>sparkle · Aspects of the second rank.</i>"] & n229["Specialty<br/><i>gem · Rare aspects of higher harmonics.</i>"]
    n170 --> n141 & n187 & n226 & n247
    n202["Aspect<br/><i>shapes · Angles between bodies, and the patterns they form.</i>"] --> n143 & n158["Compound<br/><i>hexagon · Patterns of three or more bodies linked by aspects.</i>"] & n220 & n237 & n267
    n158 --> n150 & n183 & n250 & n271 & n274
    n41 --> n151
    n229 --> n151 & n161 & n222 & n249 & n270 & n280 & n285
    n40 --> n161 & n280
    n49 --> n187 & n226
    n50 --> n222
    n48 --> n249
    n43 --> n265
    n46 --> n270 & n285
    class n202 root
    class n37,n38,n51,n55,n87,n104,n112,n141,n151,n161,n187,n188,n222,n226,n230,n247,n249,n251,n265,n270,n271,n280,n285 shared
```

## Yearly

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef shared fill:#fff4e5,stroke:#e8710a,stroke-width:2px
    n164["Equinox<br/><i>equal · Day and night are of equal length.</i>"] --> n5["Autumnal Equinox<br/><i>equal · Day and night are equal, as the year turns toward winter.</i>"] & n92["Vernal Equinox<br/><i>equal · Day and night are equal, as the year turns toward summer.</i>"]
    n204["Autumn<br/><i>leaf · The season from the autumn equinox to the winter solstice.</i>"] --> n5 & n21["Eleventh Hexadecan<br/><i>grid-2x2 · The point 11/16 of the way round the year.</i>"] & n74["Ninth Hexadecan<br/><i>grid-2x2 · The point 9/16 of the way round the year.</i>"] & n82["Samhain<br/><i>calendar-check · Midway from the autumn equinox to the winter solstice.</i>"]
    n207["Cross-Quarter Day<br/><i>calendar-check · Days midway between a solstice and an equinox.</i>"] --> n6["Beltane<br/><i>calendar-check · Midway from the spring equinox to the summer solstice.</i>"] & n52["Imbolc<br/><i>calendar-check · Midway from the winter solstice to the spring equinox.</i>"] & n56["Lammas<br/><i>calendar-check · Midway from the summer solstice to the autumn equinox.</i>"] & n82
    n146["Spring<br/><i>sprout · The season from the spring equinox to the summer solstice.</i>"] --> n6 & n36["First Hexadecan<br/><i>grid-2x2 · The point 1/16 of the way round the year.</i>"] & n88["Third Hexadecan<br/><i>grid-2x2 · The point 3/16 of the way round the year.</i>"] & n92
    n238["Hexadecan<br/><i>grid-2x2 · The sixteen divisions of the year.</i>"] --> n21 & n34["Fifteenth Hexadecan<br/><i>grid-2x2 · The point 15/16 of the way round the year.</i>"] & n35["Fifth Hexadecan<br/><i>grid-2x2 · The point 5/16 of the way round the year.</i>"] & n36 & n74 & n84["Seventh Hexadecan<br/><i>grid-2x2 · The point 7/16 of the way round the year.</i>"] & n88 & n89["Thirteenth Hexadecan<br/><i>grid-2x2 · The point 13/16 of the way round the year.</i>"]
    n256["Winter<br/><i>snowflake · The season from the winter solstice to the spring equinox.</i>"] --> n34 & n52 & n89 & n103["Winter Solstice<br/><i>sun-medium · The shortest day of the year.</i>"]
    n191["Summer<br/><i>sun · The season from the summer solstice to the autumn equinox.</i>"] --> n35 & n56 & n84 & n85["Summer Solstice<br/><i>sun-medium · The longest day of the year.</i>"]
    n145["Solstice<br/><i>sun-medium · The longest and shortest days.</i>"] --> n85 & n103
    n289["Yearly<br/><i>sun · The Sun's year.</i>"] --> n105["Annual Cycle<br/><i>rotate-cw · The turning points of the Sun's year.</i>"] & n185["Season<br/><i>leaf · The season of the year.</i>"]
    n260["Interval<br/><i>ruler · The sixteen spans between the year's points, each after a named point or before the next.</i>"] --> n137["Post-Vernal Equinox<br/><i>ruler · From Vernal Equinox to the hexadecan after it.</i>"] & n181["Pre-Beltane<br/><i>ruler · From the hexadecan before Beltane to it.</i>"] & n225["Post-Beltane<br/><i>ruler · From Beltane to the hexadecan after it.</i>"] & n246["Pre-Summer Solstice<br/><i>ruler · From the hexadecan before Summer Solstice to it.</i>"] & n269["Post-Summer Solstice<br/><i>ruler · From Summer Solstice to the hexadecan after it.</i>"] & n278["Pre-Lammas<br/><i>ruler · From the hexadecan before Lammas to it.</i>"] & n288["Post-Lammas<br/><i>ruler · From Lammas to the hexadecan after it.</i>"] & n295["Pre-Autumnal Equinox<br/><i>ruler · From the hexadecan before Autumnal Equinox to it.</i>"] & n299["Post-Autumnal Equinox<br/><i>ruler · From Autumnal Equinox to the hexadecan after it.</i>"] & n304["Pre-Samhain<br/><i>ruler · From the hexadecan before Samhain to it.</i>"] & n306["Post-Samhain<br/><i>ruler · From Samhain to the hexadecan after it.</i>"] & n308["Pre-Winter Solstice<br/><i>ruler · From the hexadecan before Winter Solstice to it.</i>"] & n310["Post-Winter Solstice<br/><i>ruler · From Winter Solstice to the hexadecan after it.</i>"] & n312["Pre-Imbolc<br/><i>ruler · From the hexadecan before Imbolc to it.</i>"] & n314["Post-Imbolc<br/><i>ruler · From Imbolc to the hexadecan after it.</i>"] & n316["Pre-Vernal Equinox<br/><i>ruler · From the hexadecan before Vernal Equinox to it.</i>"]
    n105 --> n145 & n164 & n207 & n238 & n260 & n277["Perihelion<br/><i>arrow-down-left · The Earth is nearest the Sun.</i>"] & n283["Aphelion<br/><i>arrow-up-right · The Earth is farthest from the Sun.</i>"] & n291["Advancing<br/><i>arrow-right · The Sun's days are growing longer.</i>"] & n300["Retreating<br/><i>arrow-left · The Sun's days are growing shorter.</i>"]
    n185 --> n146 & n191 & n204 & n256
    class n289 root
    class n5,n6,n21,n34,n35,n36,n52,n56,n74,n82,n84,n85,n88,n89,n92,n103 shared
```

## Planetary

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    n129["Mercury<br/><i>milestone · Mercury's stages in its cycle with the Sun.</i>"] --> n7["Brightest<br/><i>milestone · The planet shines at its brightest.</i>"] & n12["Closing<br/><i>fold-horizontal · The span the planet closes on the Sun, from greatest elongation or opposition to set.</i>"] & n16["Conjunction<br/><i>milestone · The planet lines up with the Sun.</i>"] & n22["Elongation<br/><i>milestone · The planet stands farthest from the Sun.</i>"] & n80["Rise and set<br/><i>milestone · The planet rises or sets with the Sun's light.</i>"] & n94["Visibility<br/><i>milestone · The span the planet is seen at one end of the day.</i>"] & n101["Widening<br/><i>unfold-horizontal · The span the planet widens from the Sun, from rise to greatest elongation or opposition.</i>"]
    n195["Venus<br/><i>milestone · Venus's stages in its cycle with the Sun.</i>"] --> n8["Brightest<br/><i>milestone · The planet shines at its brightest.</i>"] & n13["Closing<br/><i>fold-horizontal · The span the planet closes on the Sun, from greatest elongation or opposition to set.</i>"] & n17["Conjunction<br/><i>milestone · The planet lines up with the Sun.</i>"] & n23["Elongation<br/><i>milestone · The planet stands farthest from the Sun.</i>"] & n81["Rise and set<br/><i>milestone · The planet rises or sets with the Sun's light.</i>"] & n95["Visibility<br/><i>milestone · The span the planet is seen at one end of the day.</i>"] & n102["Widening<br/><i>unfold-horizontal · The span the planet widens from the Sun, from rise to greatest elongation or opposition.</i>"]
    n217["Mars<br/><i>milestone · Mars's stages in its cycle with the Sun.</i>"] --> n9["Brightest<br/><i>milestone · The planet shines at its brightest.</i>"] & n14["Closing<br/><i>fold-horizontal · The span the planet closes on the Sun, from greatest elongation or opposition to set.</i>"] & n15["Conjunction<br/><i>milestone · The planet lines up with the Sun.</i>"] & n76["Opposition<br/><i>milestone · The planet is opposite the Sun.</i>"] & n79["Rise and set<br/><i>milestone · The planet rises or sets with the Sun's light.</i>"] & n96["Visibility<br/><i>milestone · The span the planet is seen at one end of the day.</i>"] & n100["Widening<br/><i>unfold-horizontal · The span the planet widens from the Sun, from rise to greatest elongation or opposition.</i>"]
    n196["Venusian<br/><i>refresh-cw · Venus's cycle of visibility with the Sun.</i>"] --> n18["Eastern Brightest<br/><i>refresh-cw · The planet shines brightest in the evening sky.</i>"] & n20["Eastern Elongation<br/><i>refresh-cw · The planet stands farthest east of the Sun.</i>"] & n25["Evening Closing<br/><i>fold-horizontal · The span from greatest elongation, or Mars's opposition, to set, as the planet closes on the Sun.</i>"] & n27["Evening Rise<br/><i>sunrise · The planet rises in the evening.</i>"] & n29["Evening Set<br/><i>sunset · The planet sets in the evening.</i>"] & n31["Evening Visibility<br/><i>refresh-cw · The span the planet is seen in the evening.</i>"] & n33["Evening Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, as the planet widens from the Sun.</i>"] & n63["Morning Closing<br/><i>fold-horizontal · The span from greatest elongation to set, as the planet closes on the Sun.</i>"] & n66["Morning Rise<br/><i>sunrise · The planet rises in the morning.</i>"] & n69["Morning Visibility<br/><i>refresh-cw · The span the planet is seen in the morning.</i>"] & n72["Morning Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, or Mars's opposition, as the planet widens from the Sun.</i>"] & n97["Western Brightest<br/><i>refresh-cw · The planet shines brightest in the morning sky.</i>"]
    n127["Mercurian<br/><i>refresh-cw · Mercury's cycle of visibility with the Sun.</i>"] --> n19["Eastern Elongation<br/><i>refresh-cw · The planet stands farthest east of the Sun.</i>"] & n24["Evening Closing<br/><i>fold-horizontal · The span from greatest elongation, or Mars's opposition, to set, as the planet closes on the Sun.</i>"] & n26["Evening Rise<br/><i>sunrise · The planet rises in the evening.</i>"] & n28["Evening Set<br/><i>sunset · The planet sets in the evening.</i>"] & n30["Evening Visibility<br/><i>refresh-cw · The span the planet is seen in the evening.</i>"] & n32["Evening Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, as the planet widens from the Sun.</i>"] & n62["Morning Closing<br/><i>fold-horizontal · The span from greatest elongation to set, as the planet closes on the Sun.</i>"] & n65["Morning Rise<br/><i>sunrise · The planet rises in the morning.</i>"] & n67["Morning Set<br/><i>sunset · The planet sets in the morning.</i>"] & n68["Morning Visibility<br/><i>refresh-cw · The span the planet is seen in the morning.</i>"] & n70["Morning Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, or Mars's opposition, as the planet widens from the Sun.</i>"] & n98["Western Brightest<br/><i>refresh-cw · The planet shines brightest in the morning sky.</i>"] & n99["Western Elongation<br/><i>refresh-cw · The planet stands farthest west of the Sun.</i>"]
    n218["Martian<br/><i>refresh-cw · Mars's cycle of visibility with the Sun.</i>"] --> n64["Morning Rise<br/><i>sunrise · The planet rises in the morning.</i>"] & n71["Morning Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, or Mars's opposition, as the planet widens from the Sun.</i>"]
    n268["Planetary<br/><i>orbit · The planets' own cycles.</i>"] --> n114["Direction<br/><i>compass · A planet's apparent direction against the stars.</i>"] & n179["Phase<br/><i>refresh-cw · The phases of Mercury, Venus and Mars in their cycles with the Sun.</i>"] & n231["Synodic Stage<br/><i>milestone · A planet's stage in its cycle with the Sun.</i>"]
    n179 --> n127 & n196 & n218
    n231 --> n129 & n195 & n217
    n114 --> n138["Retrograde Period<br/><i>rotate-ccw · The span a planet moves backward.</i>"] & n162["Direct Period<br/><i>rotate-cw · The span a planet moves forward.</i>"]
    class n268 root
```

## Sign

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef shared fill:#fff4e5,stroke:#e8710a,stroke-width:2px
    n142["Sign<br/><i>star · The signs and what they imply.</i>"] --> n106["Aries<br/><i>star · The sign of the Ram, a cardinal fire sign.</i>"] & n192["Taurus<br/><i>star · The sign of the Bull, a fixed earth sign.</i>"] & n213["Gemini<br/><i>star · The sign of the Twins, a mutable air sign.</i>"] & n234["Cancer<br/><i>star · The sign of the Crab, a cardinal water sign.</i>"] & n261["Leo<br/><i>star · The sign of the Lion, a fixed fire sign.</i>"] & n281["Virgo<br/><i>star · The sign of the Maiden, a mutable earth sign.</i>"] & n287["Libra<br/><i>star · The sign of the Scales, a cardinal air sign.</i>"] & n296["Scorpio<br/><i>star · The sign of the Scorpion, a fixed water sign.</i>"] & n301["Sagittarius<br/><i>star · The sign of the Archer, a mutable fire sign.</i>"] & n303["Capricorn<br/><i>star · The sign of the Sea-Goat, a cardinal earth sign.</i>"] & n305["Aquarius<br/><i>star · The sign of the Water Bearer, a fixed air sign.</i>"] & n307["Pisces<br/><i>star · The sign of the Fish, a mutable water sign.</i>"] & n309["Element<br/><i>flame · The element of a sign: fire, earth, air or water.</i>"] & n311["Modality<br/><i>repeat · The modality of a sign: cardinal, fixed or mutable.</i>"] & n313["Polarity<br/><i>plus · The polarity of a sign: positive or negative.</i>"] & n315["Decan<br/><i>layers · The ten-degree third of a sign a body is in.</i>"] & n317["Peak<br/><i>split · Which side of a sign's peak, at 15°, a body is on.</i>"] & n318["Dignity<br/><i>crown · How strongly a planet sits in its sign.</i>"] & n319["Stay<br/><i>log-in · How long a body stays: the whole sign, a decan, or half a sign.</i>"]
    n136["Positive<br/><i>plus · Fire and air signs: outward.</i>"] --> n106 & n213 & n261 & n287 & n301 & n305
    n110["Cardinal<br/><i>repeat · Signs that start a season: Aries, Cancer, Libra, Capricorn.</i>"] --> n106 & n234 & n287 & n303
    n117["Fire<br/><i>flame · Aries, Leo and Sagittarius.</i>"] --> n106 & n261 & n301
    n317 --> n108["Before Peak<br/><i>split · The first fifteen degrees of a sign.</i>"] & n153["After Peak<br/><i>split · The last fifteen degrees of a sign.</i>"]
    n311 --> n110 & n166["Fixed<br/><i>repeat · Signs in the middle of a season: Taurus, Leo, Scorpio, Aquarius.</i>"] & n219["Mutable<br/><i>repeat · Signs that end a season: Gemini, Virgo, Sagittarius, Pisces.</i>"]
    n318 --> n115["Domicile<br/><i>house · The planet sits in its home sign: strong.</i>"] & n165["Exaltation<br/><i>trending-up · The planet sits in the sign where it is honored.</i>"] & n209["Detriment<br/><i>trending-down · The planet sits opposite its home sign: weak.</i>"] & n236["Fall<br/><i>arrow-down · The planet sits opposite its exaltation: lowered.</i>"] & n266["Peregrine<br/><i>compass · The planet holds no dignity or debility in the sign.</i>"]
    n309 --> n117 & n163["Earth<br/><i>mountain · Taurus, Virgo and Capricorn.</i>"] & n201["Air<br/><i>wind · Gemini, Libra and Aquarius.</i>"] & n253["Water<br/><i>droplets · Cancer, Scorpio and Pisces.</i>"]
    n315 --> n118["First Decan<br/><i>layers · The first ten degrees of a sign.</i>"] & n186["Second Decan<br/><i>layers · The middle ten degrees of a sign.</i>"] & n232["Third Decan<br/><i>layers · The last ten degrees of a sign.</i>"]
    n319 --> n119["Full Sign<br/><i>log-in · A body's whole stay in one sign, a span.</i>"] & n160["Decan Stay<br/><i>log-in · A body's stay in one decan of a sign, a span.</i>"] & n214["Half Stay<br/><i>log-in · A body's stay on one side of a sign's peak, a span.</i>"]
    n313 --> n136 & n173["Negative<br/><i>plus · Earth and water signs: receptive.</i>"]
    n163 --> n192 & n281 & n303
    n173 --> n192 & n234 & n281 & n296 & n303 & n307
    n166 --> n192 & n261 & n296 & n305
    n201 --> n213 & n287 & n305
    n219 --> n213 & n281 & n301 & n307
    n253 --> n234 & n296 & n307
    class n142 root
    class n106,n192,n213,n234,n261,n281,n287,n296,n301,n303,n305,n307 shared
```

## Daily, Eclipse

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    subgraph nb4["Daily"]
        direction LR
        n233["Twilight<br/><i>cloud-sun · The stages between day and night.</i>"] --> n107["Astronomical Dawn<br/><i>sunrise · The Sun is 18° below the horizon, rising: the sky begins to lighten.</i>"] & n172["Nautical Dawn<br/><i>sunrise · The Sun is 12° below the horizon, rising: the horizon shows at sea.</i>"] & n206["Civil Dawn<br/><i>sunrise · The Sun is 6° below the horizon, rising: light enough to see outdoors.</i>"] & n235["Civil Dusk<br/><i>sunset · The Sun is 6° below the horizon, setting: lights are needed outdoors.</i>"] & n264["Nautical Dusk<br/><i>sunset · The Sun is 12° below the horizon, setting: the sea horizon fades.</i>"] & n272["Astronomical Dusk<br/><i>sunset · The Sun is 18° below the horizon, setting: the sky is fully dark.</i>"] & n284["Astronomical Twilight<br/><i>cloud-sun · The span between 18° and 12° below the horizon.</i>"] & n294["Nautical Twilight<br/><i>cloud-sun · The span between 12° and 6° below the horizon.</i>"]
        n273["Daily<br/><i>clock · Events that repeat every day.</i>"] --> n113["Daily Solar<br/><i>sun · The Sun's day: rise, zenith, set and nadir.</i>"] & n159["Daily Lunar<br/><i>moon · The Moon's day: rise, zenith, set and nadir.</i>"] & n233
        n113 --> n139["Rise<br/><i>sunrise · The Sun crosses the horizon upward.</i>"] & n198["Zenith<br/><i>arrow-up-to-line · The Sun's highest point.</i>"] & n228["Set<br/><i>sunset · The Sun crosses the horizon downward.</i>"] & n242["Nadir<br/><i>arrow-down-to-line · The Sun's lowest point.</i>"] & n258["Daylight<br/><i>sun · The Sun is above the horizon.</i>"] & n276["Night<br/><i>moon · The Sun is more than 18° below the horizon.</i>"]
        n159 --> n140["Rise<br/><i>sunrise · The Moon crosses the horizon upward.</i>"] & n199["Zenith<br/><i>arrow-up-to-line · The Moon's highest point.</i>"] & n227["Set<br/><i>sunset · The Moon crosses the horizon downward.</i>"] & n243["Nadir<br/><i>arrow-down-to-line · The Moon's lowest point.</i>"] & n263["Moon Up<br/><i>moon · The Moon is above the horizon, from moonrise to moonset.</i>"] & n275["Moon Down<br/><i>moon · The Moon is below the horizon, from moonset to moonrise.</i>"]
    end
    subgraph nb5["Eclipse"]
        direction LR
        n244["Phase<br/><i>hourglass · Where an eclipse is: beginning, maximum or ending.</i>"] --> n109["Beginning<br/><i>circle-play · The eclipse begins.</i>"] & n169["Maximum<br/><i>maximize · The eclipse is at its greatest.</i>"] & n210["Ending<br/><i>circle-stop · The eclipse ends.</i>"]
        n212["Frame<br/><i>scan · What an eclipse is measured from.</i>"] --> n120["Geocentric<br/><i>globe · From the Earth's center.</i>"] & n193["Topocentric<br/><i>map-pin · From the observer's place.</i>"]
        n293["Eclipse<br/><i>eclipse · Solar and lunar eclipses.</i>"] --> n144["Solar<br/><i>sun · The Moon covers the Sun.</i>"] & n168["Lunar<br/><i>moon · The Earth's shadow falls on the Moon.</i>"] & n212 & n244
        n168 --> n148["Total<br/><i>circle · The whole Moon enters the Earth's shadow.</i>"] & n178["Partial<br/><i>contrast · Only part of the Moon enters the Earth's shadow.</i>"]
        n144 --> n149["Total<br/><i>circle · The Moon covers the whole Sun.</i>"] & n154["Annular<br/><i>sun · The Moon is too far to cover the Sun, leaving a ring.</i>"] & n223["Partial<br/><i>contrast · The Moon covers only part of the Sun.</i>"]
    end
    nb4 ~~~ nb5
    class n273,n293 root
```

## Body

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef shared fill:#fff4e5,stroke:#e8710a,stroke-width:2px
    n203["Asteroid<br/><i>mountain · Asteroids and Chiron.</i>"] --> n111["Ceres<br/><i>mountain · The asteroid of nurture and harvest.</i>"] & n177["Pallas<br/><i>mountain · The asteroid of strategy and wisdom.</i>"] & n215["Juno<br/><i>mountain · The asteroid of partnership and commitment.</i>"] & n252["Vesta<br/><i>mountain · The asteroid of devotion and focus.</i>"] & n257["Chiron<br/><i>mountain · The wounded healer, between Saturn and Uranus.</i>"]
    n180["Planet<br/><i>earth · The planets, by how far they reach and by tradition's fortune.</i>"] --> n122["Inner<br/><i>orbit · The inner planets: the personal and social ones, Mercury to Saturn.</i>"] & n123["Jupiter<br/><i>users · The planet of growth and good fortune.</i>"] & n128["Mercury<br/><i>user · The planet of mind and messages.</i>"] & n152["Uranus<br/><i>telescope · The planet of change and surprise.</i>"] & n174["Neptune<br/><i>telescope · The planet of dreams and dissolution.</i>"] & n176["Outer<br/><i>telescope · Uranus, Neptune and Pluto.</i>"] & n184["Saturn<br/><i>users · The planet of structure and limits.</i>"] & n194["Venus<br/><i>user · The planet of love and value.</i>"] & n205["Benefic<br/><i>smile · The bodies tradition counts as fortunate: Venus and Jupiter.</i>"] & n216["Mars<br/><i>user · The planet of drive and conflict.</i>"] & n224["Pluto<br/><i>telescope · The dwarf planet of transformation.</i>"] & n241["Malefic<br/><i>frown · The bodies tradition counts as difficult: Mars and Saturn.</i>"]
    n189["Social<br/><i>users · Jupiter and Saturn.</i>"] --> n123 & n184
    n205 --> n123 & n194
    n245["Point<br/><i>map-pin · Calculated points: Lilith, the lunar nodes and apsides.</i>"] --> n124["Lilith<br/><i>map-pin · The Moon's far point, the black moon.</i>"] & n175["North Lunar Node<br/><i>map-pin · Where the Moon crosses the ecliptic heading north.</i>"] & n240["Lunar Apogee<br/><i>map-pin · The point where the Moon is farthest from the Earth.</i>"]
    n157["Body<br/><i>globe · The bodies an event involves, grouped by class.</i>"] --> n125["Luminary<br/><i>sun-moon · The Sun and the Moon.</i>"] & n180 & n203 & n245
    n135["Personal<br/><i>user · Mercury, Venus and Mars.</i>"] --> n128 & n194 & n216
    n122 --> n135 & n189
    n125 --> n147["Sun<br/><i>sun · The star at the center, ruling identity and vitality.</i>"] & n171["Moon<br/><i>moon · The Earth's satellite, ruling mood and rhythm.</i>"]
    n176 --> n152 & n174 & n224
    n241 --> n184 & n216
    class n157 root
    class n123,n128,n152,n174,n184,n194,n216,n224 shared
```

## Temporality, Lunar

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    subgraph nb7["Temporality"]
        direction LR
        n182["Progressive<br/><i>hourglass · Progressing over a duration of time; its tags say how long, by the largest unit it reaches.</i>"] --> n130["Minutes<br/><i>timer · A minute to under an hour.</i>"] & n167["Hours<br/><i>clock · An hour to under a day.</i>"] & n208["Days<br/><i>sun · A day to under a week.</i>"] & n255["Weeks<br/><i>calendar-days · A week to under thirty days.</i>"] & n262["Months<br/><i>calendar-range · Thirty days to under ninety-one.</i>"] & n279["Quarters<br/><i>calendar-clock · Ninety-one days to under a year of 365.</i>"] & n290["Years<br/><i>calendar · A year of 365 days to under ten years.</i>"] & n292["Decades<br/><i>history · Ten years to under a hundred.</i>"] & n298["Centuries<br/><i>landmark · A hundred years or more.</i>"]
        n302["Temporality<br/><i>timer · Whether an event is an instant or progresses over time.</i>"] --> n133["Perfective<br/><i>zap · An instant in time.</i>"] & n182
    end
    subgraph nb8["Lunar"]
        direction LR
        n239["Lunar<br/><i>moon · The Moon's month and orbit.</i>"] --> n131["Monthly Cycle<br/><i>moon-star · The Moon's phases through the month.</i>"] & n156["Apsides<br/><i>orbit · The Moon's nearest and farthest points from the Earth.</i>"]
        n131 --> n132["New<br/><i>circle-dot · The Moon is between the Earth and the Sun, dark.</i>"] & n197["Waxing Crescent<br/><i>moon-star · A thin crescent, growing from new.</i>"] & n211["First Quarter<br/><i>contrast · Half the Moon is lit, waxing.</i>"] & n254["Waxing Gibbous<br/><i>moon-star · More than half lit, growing to full.</i>"] & n259["Full<br/><i>circle · The whole face of the Moon is lit.</i>"] & n282["Waning Gibbous<br/><i>moon-star · More than half lit, shrinking from full.</i>"] & n286["Last Quarter<br/><i>moon-star · Half the Moon is lit, waning.</i>"] & n297["Waning Crescent<br/><i>moon-star · A thin crescent, shrinking to new.</i>"]
        n156 --> n134["Perigee<br/><i>arrow-down · The Moon is nearest the Earth.</i>"] & n155["Apogee<br/><i>arrow-up · The Moon is farthest from the Earth.</i>"] & n200["Advancing<br/><i>arrow-right · The Moon is drawing nearer the Earth.</i>"] & n248["Retreating<br/><i>arrow-left · The Moon is drawing farther from the Earth.</i>"]
    end
    nb7 ~~~ nb8
    class n302,n239 root
```
