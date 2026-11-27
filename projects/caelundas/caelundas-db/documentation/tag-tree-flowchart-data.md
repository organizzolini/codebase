```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5
    subgraph nb0["Aspect"]
        n0["3 Body<br/><i>circle</i>"]
        n1["4 Body<br/><i>circle</i>"]
        n2["5 Body<br/><i>circle</i>"]
        n3["6 Body<br/><i>circle</i>"]
        n4["7 Body<br/><i>circle</i>"]
        n10["Ceres Focal<br/><i>crosshair · The pattern points at Ceres.</i>"]
        n11["Chiron Focal<br/><i>crosshair · The pattern points at Chiron.</i>"]
        n37["Grand Cross<br/><i>zap</i>"]
        n38["Grand Trine<br/><i>waves</i>"]
        n39["Harmonic 1<br/><i>audio-waveform · The aspects of the 1st harmonic: the conjunction, a circle undivided.</i>"]
        n40["Harmonic 10<br/><i>audio-waveform · The aspects of the 10th harmonic: the decile and tredecile, a circle in tenths.</i>"]
        n41["Harmonic 11<br/><i>audio-waveform · The aspects of the 11th harmonic: the undecile, a circle in elevenths.</i>"]
        n42["Harmonic 12<br/><i>audio-waveform · The aspects of the 12th harmonic: the semisextile and quincunx, a circle in twelfths.</i>"]
        n43["Harmonic 2<br/><i>audio-waveform · The aspects of the 2nd harmonic: the opposition, a circle in halves.</i>"]
        n44["Harmonic 3<br/><i>audio-waveform · The aspects of the 3rd harmonic: the trine, a circle in thirds.</i>"]
        n45["Harmonic 4<br/><i>audio-waveform · The aspects of the 4th harmonic: the square, a circle in quarters.</i>"]
        n46["Harmonic 5<br/><i>audio-waveform · The aspects of the 5th harmonic: the quintile family, a circle in fifths.</i>"]
        n47["Harmonic 6<br/><i>audio-waveform · The aspects of the 6th harmonic: the sextile, a circle in sixths.</i>"]
        n48["Harmonic 7<br/><i>audio-waveform · The aspects of the 7th harmonic: the septile family, a circle in sevenths.</i>"]
        n49["Harmonic 8<br/><i>audio-waveform · The aspects of the 8th harmonic: the semisquare and sesquiquadrate, a circle in eighths.</i>"]
        n50["Harmonic 9<br/><i>audio-waveform · The aspects of the 9th harmonic: the novile, a circle in ninths.</i>"]
        n51["Hexagram<br/><i>waves</i>"]
        n53["Juno Focal<br/><i>crosshair · The pattern points at Juno.</i>"]
        n54["Jupiter Focal<br/><i>crosshair · The pattern points at Jupiter.</i>"]
        n55["Kite<br/><i>waves</i>"]
        n57["Lilith Focal<br/><i>crosshair · The pattern points at Lilith.</i>"]
        n58["Lunar Apogee Focal<br/><i>crosshair · The pattern points at Lunar Apogee.</i>"]
        n59["Mars Focal<br/><i>crosshair · The pattern points at Mars.</i>"]
        n60["Mercury Focal<br/><i>crosshair · The pattern points at Mercury.</i>"]
        n61["Moon Focal<br/><i>crosshair · The pattern points at Moon.</i>"]
        n73["Neptune Focal<br/><i>crosshair · The pattern points at Neptune.</i>"]
        n75["North Lunar Node Focal<br/><i>crosshair · The pattern points at North Lunar Node.</i>"]
        n77["Pallas Focal<br/><i>crosshair · The pattern points at Pallas.</i>"]
        n78["Pluto Focal<br/><i>crosshair · The pattern points at Pluto.</i>"]
        n83["Saturn Focal<br/><i>crosshair · The pattern points at Saturn.</i>"]
        n87["Stellium<br/><i>circle</i>"]
        n89["Sun Focal<br/><i>crosshair · The pattern points at Sun.</i>"]
        n90["T Square<br/><i>zap</i>"]
        n93["Uranus Focal<br/><i>crosshair · The pattern points at Uranus.</i>"]
        n94["Venus Focal<br/><i>crosshair · The pattern points at Venus.</i>"]
        n96["Vesta Focal<br/><i>crosshair · The pattern points at Vesta.</i>"]
        n107["Yod<br/><i>circle</i>"]
        n110["Aspect<br/><i>shapes · Angles between bodies, and the patterns they form.</i>"]
        n116["Conjunct<br/><i>star · Bodies at the same longitude, 0°: their energies merge.</i>"]
        n121["Forming<br/><i>trending-up · The bodies are approaching.</i>"]
        n123["Hard<br/><i>zap · Tense aspects, such as squares.</i>"]
        n127["Major<br/><i>star · The five classical aspects.</i>"]
        n141["Semisextile<br/><i>sparkle · Bodies 30° apart: a mild, easily missed link.</i>"]
        n144["Simple<br/><i>triangle · Aspects between two bodies.</i>"]
        n153["Triple<br/><i>triangle · Patterns of three bodies.</i>"]
        n154["Undecile<br/><i>gem · Bodies about 32.7° apart: a faint, unusual link.</i>"]
        n161["Compound<br/><i>hexagon · Patterns of three or more bodies linked by aspects.</i>"]
        n162["Decile<br/><i>gem · Bodies 36° apart: a faint, creative link.</i>"]
        n167["Exact<br/><i>circle-dot · The moment the aspect is exact.</i>"]
        n173["Minor<br/><i>sparkle · Aspects of the second rank.</i>"]
        n185["Quadruple<br/><i>square · Patterns of four bodies.</i>"]
        n189["Semisquare<br/><i>sparkle · Bodies 45° apart: a small irritation.</i>"]
        n190["Sextile<br/><i>star · Bodies 60° apart: an easy opening to cooperate.</i>"]
        n193["Soft<br/><i>waves · Easy aspects, such as trines.</i>"]
        n212["Dissolving<br/><i>trending-down · The bodies are separating.</i>"]
        n223["Nature<br/><i>scale · Whether an aspect is hard, soft or neutral.</i>"]
        n224["Neutral<br/><i>circle · Aspects that are neither.</i>"]
        n225["Novile<br/><i>gem · Bodies 40° apart: a subtle link of completion.</i>"]
        n231["Sesquiquadrate<br/><i>sparkle · Bodies 135° apart: agitation that demands release.</i>"]
        n235["Specialty<br/><i>gem · Rare aspects of higher harmonics.</i>"]
        n236["Square<br/><i>star · Bodies 90° apart: friction that pushes toward action.</i>"]
        n246["Harmonic<br/><i>audio-waveform · The harmonic of an aspect: 1 for a conjunction, 2 an opposition, 3 a trine, 4 a square, and so on.</i>"]
        n256["Quincunx<br/><i>sparkle · Bodies 150° apart: awkward, needing adjustment.</i>"]
        n258["Septile<br/><i>gem · Bodies about 51.4° apart: a fated, elusive link.</i>"]
        n259["Sextuple<br/><i>hexagon · Patterns of six bodies.</i>"]
        n261["Trine<br/><i>star · Bodies 120° apart: a harmonious flow.</i>"]
        n274["Opposite<br/><i>star · Bodies 180° apart: two sides pulling against each other.</i>"]
        n277["Phase<br/><i>hourglass · Where an aspect sits in its span: forming, exact or dissolving.</i>"]
        n279["Quintile<br/><i>gem · Bodies 72° apart: a creative, talent-making link.</i>"]
        n281["Focal Body<br/><i>crosshair · The body a compound pattern points at.</i>"]
        n288["Tredecile<br/><i>gem · Bodies 108° apart: a gentle, talented link.</i>"]
        n293["Biquintile<br/><i>gem · Bodies 144° apart: a creative, gifted link.</i>"]
        n87 --> n0
        n87 --> n1
        n87 --> n2
        n87 --> n3
        n87 --> n4
        n281 --> n10
        n281 --> n11
        n45 --> n37
        n123 --> n37
        n185 --> n37
        n153 --> n38
        n193 --> n38
        n44 --> n38
        n246 --> n39
        n246 --> n40
        n246 --> n41
        n246 --> n42
        n246 --> n43
        n246 --> n44
        n246 --> n45
        n246 --> n46
        n246 --> n47
        n246 --> n48
        n246 --> n49
        n246 --> n50
        n193 --> n51
        n47 --> n51
        n259 --> n51
        n281 --> n53
        n281 --> n54
        n185 --> n55
        n193 --> n55
        n47 --> n55
        n281 --> n57
        n281 --> n58
        n281 --> n59
        n281 --> n60
        n281 --> n61
        n281 --> n73
        n281 --> n75
        n281 --> n77
        n281 --> n78
        n281 --> n83
        n161 --> n87
        n224 --> n87
        n39 --> n87
        n281 --> n89
        n45 --> n90
        n123 --> n90
        n153 --> n90
        n281 --> n93
        n281 --> n94
        n281 --> n96
        n153 --> n107
        n42 --> n107
        n224 --> n107
        n224 --> n116
        n127 --> n116
        n39 --> n116
        n277 --> n121
        n223 --> n123
        n144 --> n127
        n42 --> n141
        n173 --> n141
        n193 --> n141
        n110 --> n144
        n161 --> n153
        n224 --> n154
        n41 --> n154
        n235 --> n154
        n110 --> n161
        n235 --> n162
        n193 --> n162
        n40 --> n162
        n277 --> n167
        n144 --> n173
        n161 --> n185
        n123 --> n189
        n173 --> n189
        n49 --> n189
        n193 --> n190
        n127 --> n190
        n47 --> n190
        n223 --> n193
        n277 --> n212
        n110 --> n223
        n223 --> n224
        n235 --> n225
        n193 --> n225
        n50 --> n225
        n123 --> n231
        n173 --> n231
        n49 --> n231
        n144 --> n235
        n45 --> n236
        n123 --> n236
        n127 --> n236
        n110 --> n246
        n42 --> n256
        n224 --> n256
        n173 --> n256
        n224 --> n258
        n235 --> n258
        n48 --> n258
        n161 --> n259
        n193 --> n261
        n127 --> n261
        n44 --> n261
        n123 --> n274
        n127 --> n274
        n43 --> n274
        n110 --> n277
        n235 --> n279
        n46 --> n279
        n193 --> n279
        n161 --> n281
        n235 --> n288
        n193 --> n288
        n40 --> n288
        n235 --> n293
        n46 --> n293
        n193 --> n293
    end
    subgraph nb1["Solar"]
        n5["Autumnal Equinox<br/><i>leaf</i>"]
        n6["Beltane<br/><i>leaf</i>"]
        n21["Eleventh Hexadecan<br/><i>leaf</i>"]
        n34["Fifteenth Hexadecan<br/><i>leaf</i>"]
        n35["Fifth Hexadecan<br/><i>leaf</i>"]
        n36["First Hexadecan<br/><i>leaf</i>"]
        n52["Imbolc<br/><i>leaf</i>"]
        n56["Lammas<br/><i>leaf</i>"]
        n74["Ninth Hexadecan<br/><i>leaf</i>"]
        n82["Samhain<br/><i>leaf</i>"]
        n84["Seventh Hexadecan<br/><i>leaf</i>"]
        n88["Summer Solstice<br/><i>leaf</i>"]
        n91["Third Hexadecan<br/><i>leaf</i>"]
        n92["Thirteenth Hexadecan<br/><i>leaf</i>"]
        n95["Vernal Equinox<br/><i>leaf</i>"]
        n106["Winter Solstice<br/><i>leaf</i>"]
        n108["Annual Cycle<br/><i>rotate-cw · The turning points of the Sun's year.</i>"]
        n138["Post-Vernal Equinox<br/><i>ruler · From Vernal Equinox to the hexadecan after it.</i>"]
        n147["Solstice<br/><i>sun-medium · The longest and shortest days.</i>"]
        n148["Spring<br/><i>sprout · The season from the spring equinox to the summer solstice.</i>"]
        n165["Equinox<br/><i>equal · Day and night are of equal length.</i>"]
        n183["Pre-Beltane<br/><i>ruler · From the hexadecan before Beltane to it.</i>"]
        n187["Season<br/><i>leaf · The season of the year.</i>"]
        n195["Summer<br/><i>sun · The season from the summer solstice to the autumn equinox.</i>"]
        n207["Autumn<br/><i>leaf · The season from the autumn equinox to the winter solstice.</i>"]
        n209["Cross-Quarter Day<br/><i>calendar-check · Days midway between a solstice and an equinox.</i>"]
        n229["Post-Beltane<br/><i>ruler · From Beltane to the hexadecan after it.</i>"]
        n247["Hexadecan<br/><i>grid-2x2 · The sixteen divisions of the year.</i>"]
        n255["Pre-Summer Solstice<br/><i>ruler · From the hexadecan before Summer Solstice to it.</i>"]
        n265["Winter<br/><i>snowflake · The season from the winter solstice to the spring equinox.</i>"]
        n270["Interval<br/><i>ruler · The sixteen spans between the year's points, each after a named point or before the next.</i>"]
        n278["Post-Summer Solstice<br/><i>ruler · From Summer Solstice to the hexadecan after it.</i>"]
        n280["Solar<br/><i>sun · The Sun's year.</i>"]
        n286["Perihelion<br/><i>arrow-down-left · The Earth is nearest the Sun.</i>"]
        n287["Pre-Lammas<br/><i>ruler · From the hexadecan before Lammas to it.</i>"]
        n291["Aphelion<br/><i>arrow-up-right · The Earth is farthest from the Sun.</i>"]
        n298["Post-Lammas<br/><i>ruler · From Lammas to the hexadecan after it.</i>"]
        n299["Advancing<br/><i>arrow-right · The Sun's days are growing longer.</i>"]
        n303["Pre-Autumnal Equinox<br/><i>ruler · From the hexadecan before Autumnal Equinox to it.</i>"]
        n307["Post-Autumnal Equinox<br/><i>ruler · From Autumnal Equinox to the hexadecan after it.</i>"]
        n308["Retreating<br/><i>arrow-left · The Sun's days are growing shorter.</i>"]
        n313["Pre-Samhain<br/><i>ruler · From the hexadecan before Samhain to it.</i>"]
        n315["Post-Samhain<br/><i>ruler · From Samhain to the hexadecan after it.</i>"]
        n317["Pre-Winter Solstice<br/><i>ruler · From the hexadecan before Winter Solstice to it.</i>"]
        n318["Post-Winter Solstice<br/><i>ruler · From Winter Solstice to the hexadecan after it.</i>"]
        n319["Pre-Imbolc<br/><i>ruler · From the hexadecan before Imbolc to it.</i>"]
        n320["Post-Imbolc<br/><i>ruler · From Imbolc to the hexadecan after it.</i>"]
        n321["Pre-Vernal Equinox<br/><i>ruler · From the hexadecan before Vernal Equinox to it.</i>"]
        n165 --> n5
        n207 --> n5
        n209 --> n6
        n148 --> n6
        n247 --> n21
        n207 --> n21
        n265 --> n34
        n247 --> n34
        n247 --> n35
        n195 --> n35
        n247 --> n36
        n148 --> n36
        n265 --> n52
        n209 --> n52
        n209 --> n56
        n195 --> n56
        n247 --> n74
        n207 --> n74
        n209 --> n82
        n207 --> n82
        n247 --> n84
        n195 --> n84
        n195 --> n88
        n147 --> n88
        n247 --> n91
        n148 --> n91
        n265 --> n92
        n247 --> n92
        n148 --> n95
        n165 --> n95
        n265 --> n106
        n147 --> n106
        n280 --> n108
        n270 --> n138
        n108 --> n147
        n187 --> n148
        n108 --> n165
        n270 --> n183
        n280 --> n187
        n187 --> n195
        n187 --> n207
        n108 --> n209
        n270 --> n229
        n108 --> n247
        n270 --> n255
        n187 --> n265
        n108 --> n270
        n270 --> n278
        n108 --> n286
        n270 --> n287
        n108 --> n291
        n270 --> n298
        n108 --> n299
        n270 --> n303
        n270 --> n307
        n108 --> n308
        n270 --> n313
        n270 --> n315
        n270 --> n317
        n270 --> n318
        n270 --> n319
        n270 --> n320
        n270 --> n321
    end
    subgraph nb2["Planetary"]
        n7["Brightest<br/><i>milestone · The planet shines at its brightest.</i>"]
        n8["Brightest<br/><i>milestone · The planet shines at its brightest.</i>"]
        n9["Brightest<br/><i>milestone · The planet shines at its brightest.</i>"]
        n12["Closing<br/><i>fold-horizontal · The span the planet closes on the Sun, from greatest elongation or opposition to set.</i>"]
        n13["Closing<br/><i>fold-horizontal · The span the planet closes on the Sun, from greatest elongation or opposition to set.</i>"]
        n14["Closing<br/><i>fold-horizontal · The span the planet closes on the Sun, from greatest elongation or opposition to set.</i>"]
        n15["Conjunction<br/><i>milestone · The planet lines up with the Sun.</i>"]
        n16["Conjunction<br/><i>milestone · The planet lines up with the Sun.</i>"]
        n17["Conjunction<br/><i>milestone · The planet lines up with the Sun.</i>"]
        n18["Eastern Brightest<br/><i>refresh-cw · The planet shines brightest in the evening sky.</i>"]
        n19["Eastern Elongation<br/><i>refresh-cw · The planet stands farthest east of the Sun.</i>"]
        n20["Eastern Elongation<br/><i>refresh-cw · The planet stands farthest east of the Sun.</i>"]
        n22["Elongation<br/><i>milestone · The planet stands farthest from the Sun.</i>"]
        n23["Elongation<br/><i>milestone · The planet stands farthest from the Sun.</i>"]
        n24["Evening Closing<br/><i>fold-horizontal · The span from greatest elongation, or Mars's opposition, to set, as the planet closes on the Sun.</i>"]
        n25["Evening Closing<br/><i>fold-horizontal · The span from greatest elongation, or Mars's opposition, to set, as the planet closes on the Sun.</i>"]
        n26["Evening Rise<br/><i>sunrise · The planet rises in the evening.</i>"]
        n27["Evening Rise<br/><i>sunrise · The planet rises in the evening.</i>"]
        n28["Evening Set<br/><i>sunset · The planet sets in the evening.</i>"]
        n29["Evening Set<br/><i>sunset · The planet sets in the evening.</i>"]
        n30["Evening Visibility<br/><i>refresh-cw · The span the planet is seen in the evening.</i>"]
        n31["Evening Visibility<br/><i>refresh-cw · The span the planet is seen in the evening.</i>"]
        n32["Evening Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, as the planet widens from the Sun.</i>"]
        n33["Evening Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, as the planet widens from the Sun.</i>"]
        n62["Morning Closing<br/><i>fold-horizontal · The span from greatest elongation to set, as the planet closes on the Sun.</i>"]
        n63["Morning Closing<br/><i>fold-horizontal · The span from greatest elongation to set, as the planet closes on the Sun.</i>"]
        n64["Morning Rise<br/><i>sunrise · The planet rises in the morning.</i>"]
        n65["Morning Rise<br/><i>sunrise · The planet rises in the morning.</i>"]
        n66["Morning Rise<br/><i>sunrise · The planet rises in the morning.</i>"]
        n67["Morning Set<br/><i>sunset · The planet sets in the morning.</i>"]
        n68["Morning Visibility<br/><i>refresh-cw · The span the planet is seen in the morning.</i>"]
        n69["Morning Visibility<br/><i>refresh-cw · The span the planet is seen in the morning.</i>"]
        n70["Morning Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, or Mars's opposition, as the planet widens from the Sun.</i>"]
        n71["Morning Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, or Mars's opposition, as the planet widens from the Sun.</i>"]
        n72["Morning Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, or Mars's opposition, as the planet widens from the Sun.</i>"]
        n76["Opposition<br/><i>milestone · The planet is opposite the Sun.</i>"]
        n79["Rise and set<br/><i>milestone · The planet rises or sets with the Sun's light.</i>"]
        n80["Rise and set<br/><i>milestone · The planet rises or sets with the Sun's light.</i>"]
        n81["Rise and set<br/><i>milestone · The planet rises or sets with the Sun's light.</i>"]
        n85["Station<br/><i>milestone · The planet stops against the stars.</i>"]
        n86["Station<br/><i>milestone · The planet stops against the stars.</i>"]
        n97["Visibility<br/><i>milestone · The span the planet is seen at one end of the day.</i>"]
        n98["Visibility<br/><i>milestone · The span the planet is seen at one end of the day.</i>"]
        n99["Visibility<br/><i>milestone · The span the planet is seen at one end of the day.</i>"]
        n100["Western Brightest<br/><i>refresh-cw · The planet shines brightest in the morning sky.</i>"]
        n101["Western Brightest<br/><i>refresh-cw · The planet shines brightest in the morning sky.</i>"]
        n102["Western Elongation<br/><i>refresh-cw · The planet stands farthest west of the Sun.</i>"]
        n103["Widening<br/><i>unfold-horizontal · The span the planet widens from the Sun, from rise to greatest elongation or opposition.</i>"]
        n104["Widening<br/><i>unfold-horizontal · The span the planet widens from the Sun, from rise to greatest elongation or opposition.</i>"]
        n105["Widening<br/><i>unfold-horizontal · The span the planet widens from the Sun, from rise to greatest elongation or opposition.</i>"]
        n117["Direction<br/><i>compass · A planet's apparent direction against the stars.</i>"]
        n128["Mercurian<br/><i>refresh-cw · Mercury's cycle of visibility with the Sun.</i>"]
        n130["Mercury<br/><i>milestone · Mercury's stages in its cycle with the Sun.</i>"]
        n149["Station Retrograde<br/><i>undo-2 · A planet stops and turns backward.</i>"]
        n181["Phase<br/><i>refresh-cw · The phases of Mercury, Venus and Mars in their cycles with the Sun.</i>"]
        n194["Station Direct<br/><i>arrow-right · A planet stops and turns forward.</i>"]
        n199["Venus<br/><i>milestone · Venus's stages in its cycle with the Sun.</i>"]
        n200["Venusian<br/><i>refresh-cw · Venus's cycle of visibility with the Sun.</i>"]
        n219["Mars<br/><i>milestone · Mars's stages in its cycle with the Sun.</i>"]
        n220["Martian<br/><i>refresh-cw · Mars's cycle of visibility with the Sun.</i>"]
        n230["Retrograde Period<br/><i>rotate-ccw · The span a planet moves backward.</i>"]
        n237["Synodic Stage<br/><i>milestone · A planet's stage in its cycle with the Sun.</i>"]
        n244["Direct Period<br/><i>rotate-cw · The span a planet moves forward.</i>"]
        n252["Planetary<br/><i>orbit · The planets' own cycles.</i>"]
        n130 --> n7
        n199 --> n8
        n219 --> n9
        n130 --> n12
        n199 --> n13
        n219 --> n14
        n219 --> n15
        n130 --> n16
        n199 --> n17
        n200 --> n18
        n128 --> n19
        n200 --> n20
        n130 --> n22
        n199 --> n23
        n128 --> n24
        n200 --> n25
        n128 --> n26
        n200 --> n27
        n128 --> n28
        n200 --> n29
        n128 --> n30
        n200 --> n31
        n128 --> n32
        n200 --> n33
        n128 --> n62
        n200 --> n63
        n220 --> n64
        n128 --> n65
        n200 --> n66
        n128 --> n67
        n128 --> n68
        n200 --> n69
        n128 --> n70
        n220 --> n71
        n200 --> n72
        n219 --> n76
        n219 --> n79
        n130 --> n80
        n199 --> n81
        n219 --> n85
        n199 --> n86
        n130 --> n97
        n199 --> n98
        n219 --> n99
        n200 --> n100
        n128 --> n101
        n128 --> n102
        n219 --> n103
        n130 --> n104
        n199 --> n105
        n252 --> n117
        n181 --> n128
        n237 --> n130
        n117 --> n149
        n252 --> n181
        n117 --> n194
        n237 --> n199
        n181 --> n200
        n237 --> n219
        n181 --> n220
        n117 --> n230
        n252 --> n237
        n117 --> n244
    end
    subgraph nb3["Sign"]
        n109["Aries<br/><i>star · The sign of the Ram, a cardinal fire sign.</i>"]
        n112["Before Peak<br/><i>split · The first fifteen degrees of a sign.</i>"]
        n114["Cardinal<br/><i>repeat · Signs that start a season: Aries, Cancer, Libra, Capricorn.</i>"]
        n118["Domicile<br/><i>house · The planet sits in its home sign: strong.</i>"]
        n119["Fire<br/><i>flame · Aries, Leo and Sagittarius.</i>"]
        n120["First Decan<br/><i>layers · The first ten degrees of a sign.</i>"]
        n137["Positive<br/><i>plus · Fire and air signs: outward.</i>"]
        n142["Sign<br/><i>star · The zodiac sign a body is in.</i>"]
        n143["Sign Ingress<br/><i>log-in · A body enters a new sign, an instant.</i>"]
        n156["After Peak<br/><i>split · The last fifteen degrees of a sign.</i>"]
        n163["Earth<br/><i>mountain · Taurus, Virgo and Capricorn.</i>"]
        n164["Element<br/><i>flame · The element of a sign: fire, earth, air or water.</i>"]
        n168["Exaltation<br/><i>trending-up · The planet sits in the sign where it is honored.</i>"]
        n169["Fixed<br/><i>repeat · Signs in the middle of a season: Taurus, Leo, Scorpio, Aquarius.</i>"]
        n176["Negative<br/><i>plus · Earth and water signs: receptive.</i>"]
        n188["Second Decan<br/><i>layers · The middle ten degrees of a sign.</i>"]
        n191["Sign Transit<br/><i>log-in · A body's stay in one sign, a span.</i>"]
        n196["Taurus<br/><i>star · The sign of the Bull, a fixed earth sign.</i>"]
        n205["Air<br/><i>wind · Gemini, Libra and Aquarius.</i>"]
        n210["Decan Ingress<br/><i>log-in · A body enters a new decan of a sign.</i>"]
        n211["Detriment<br/><i>trending-down · The planet sits opposite its home sign: weak.</i>"]
        n216["Gemini<br/><i>star · The sign of the Twins, a mutable air sign.</i>"]
        n221["Modality<br/><i>repeat · The modality of a sign: cardinal, fixed or mutable.</i>"]
        n222["Mutable<br/><i>repeat · Signs that end a season: Gemini, Virgo, Sagittarius, Pisces.</i>"]
        n234["Sign<br/><i>star · The signs and what they imply.</i>"]
        n238["Third Decan<br/><i>layers · The last ten degrees of a sign.</i>"]
        n241["Cancer<br/><i>star · The sign of the Crab, a cardinal water sign.</i>"]
        n243["Decan Transit<br/><i>log-in · A body's stay in one decan, a span.</i>"]
        n245["Fall<br/><i>arrow-down · The planet sits opposite its exaltation: lowered.</i>"]
        n254["Polarity<br/><i>plus · The polarity of a sign: positive or negative.</i>"]
        n263["Water<br/><i>droplets · Cancer, Scorpio and Pisces.</i>"]
        n268["Decan<br/><i>layers · The ten-degree third of a sign a body is in.</i>"]
        n271["Leo<br/><i>star · The sign of the Lion, a fixed fire sign.</i>"]
        n275["Peak Ingress<br/><i>log-in · A body reaches the midpoint of a sign.</i>"]
        n276["Peregrine<br/><i>compass · The planet holds no dignity or debility in the sign.</i>"]
        n284["Peak<br/><i>split · Which side of a sign's peak, at 15°, a body is on.</i>"]
        n285["Peak Transit<br/><i>log-in · A body's stay on one side of a sign's peak, a span.</i>"]
        n289["Virgo<br/><i>star · The sign of the Maiden, a mutable earth sign.</i>"]
        n295["Dignity<br/><i>crown · How strongly a planet sits in its sign.</i>"]
        n297["Libra<br/><i>star · The sign of the Scales, a cardinal air sign.</i>"]
        n301["Ingress<br/><i>log-in · A body enters a sign, or a decan of one, and its stay there.</i>"]
        n304["Scorpio<br/><i>star · The sign of the Scorpion, a fixed water sign.</i>"]
        n309["Sagittarius<br/><i>star · The sign of the Archer, a mutable fire sign.</i>"]
        n311["Capricorn<br/><i>star · The sign of the Sea-Goat, a cardinal earth sign.</i>"]
        n314["Aquarius<br/><i>star · The sign of the Water Bearer, a fixed air sign.</i>"]
        n316["Pisces<br/><i>star · The sign of the Fish, a mutable water sign.</i>"]
        n142 --> n109
        n137 --> n109
        n114 --> n109
        n119 --> n109
        n284 --> n112
        n221 --> n114
        n295 --> n118
        n164 --> n119
        n268 --> n120
        n254 --> n137
        n234 --> n142
        n301 --> n143
        n284 --> n156
        n164 --> n163
        n234 --> n164
        n295 --> n168
        n221 --> n169
        n254 --> n176
        n268 --> n188
        n301 --> n191
        n142 --> n196
        n163 --> n196
        n176 --> n196
        n169 --> n196
        n164 --> n205
        n301 --> n210
        n295 --> n211
        n142 --> n216
        n205 --> n216
        n222 --> n216
        n137 --> n216
        n234 --> n221
        n221 --> n222
        n268 --> n238
        n142 --> n241
        n114 --> n241
        n176 --> n241
        n263 --> n241
        n301 --> n243
        n295 --> n245
        n234 --> n254
        n164 --> n263
        n234 --> n268
        n142 --> n271
        n137 --> n271
        n119 --> n271
        n169 --> n271
        n301 --> n275
        n295 --> n276
        n234 --> n284
        n301 --> n285
        n142 --> n289
        n222 --> n289
        n163 --> n289
        n176 --> n289
        n234 --> n295
        n142 --> n297
        n205 --> n297
        n137 --> n297
        n114 --> n297
        n234 --> n301
        n142 --> n304
        n176 --> n304
        n263 --> n304
        n169 --> n304
        n142 --> n309
        n222 --> n309
        n137 --> n309
        n119 --> n309
        n142 --> n311
        n163 --> n311
        n114 --> n311
        n176 --> n311
        n142 --> n314
        n205 --> n314
        n137 --> n314
        n169 --> n314
        n142 --> n316
        n222 --> n316
        n176 --> n316
        n263 --> n316
    end
    subgraph nb4["Daily"]
        n111["Astronomical Dawn<br/><i>sunrise · The Sun is 18° below the horizon, rising: the sky begins to lighten.</i>"]
        n132["Morning<br/><i>sunrise · The twilight falls before the Sun rises.</i>"]
        n139["Rise<br/><i>sunrise · The Sun crosses the horizon upward.</i>"]
        n140["Rise<br/><i>sunrise · The Moon crosses the horizon upward.</i>"]
        n146["Solar Cycle<br/><i>sun · The Sun's day: rise, zenith, set and nadir.</i>"]
        n166["Evening<br/><i>sunset · The twilight falls after the Sun has set.</i>"]
        n171["Lunar Cycle<br/><i>moon · The Moon's day: rise, zenith, set and nadir.</i>"]
        n175["Nautical Dawn<br/><i>sunrise · The Sun is 12° below the horizon, rising: the horizon shows at sea.</i>"]
        n202["Zenith<br/><i>arrow-up-to-line · The Sun's highest point.</i>"]
        n203["Zenith<br/><i>arrow-up-to-line · The Moon's highest point.</i>"]
        n208["Civil Dawn<br/><i>sunrise · The Sun is 6° below the horizon, rising: light enough to see outdoors.</i>"]
        n232["Set<br/><i>sunset · The Moon crosses the horizon downward.</i>"]
        n233["Set<br/><i>sunset · The Sun crosses the horizon downward.</i>"]
        n239["Twilight<br/><i>cloud-sun · The stages between day and night.</i>"]
        n242["Daylight<br/><i>sun · The Sun is above the horizon.</i>"]
        n249["Nadir<br/><i>arrow-down-to-line · The Sun's lowest point.</i>"]
        n250["Nadir<br/><i>arrow-down-to-line · The Moon's lowest point.</i>"]
        n260["Time of Day<br/><i>clock · Whether a twilight falls in the morning or the evening.</i>"]
        n267["Civil Dusk<br/><i>sunset · The Sun is 6° below the horizon, setting: lights are needed outdoors.</i>"]
        n273["Moon Up<br/><i>moon · The Moon is above the horizon, from moonrise to moonset.</i>"]
        n283["Nautical Dusk<br/><i>sunset · The Sun is 12° below the horizon, setting: the sea horizon fades.</i>"]
        n292["Astronomical Dusk<br/><i>sunset · The Sun is 18° below the horizon, setting: the sky is fully dark.</i>"]
        n294["Daily<br/><i>clock · Events that repeat every day.</i>"]
        n302["Night<br/><i>moon · The Sun is more than 18° below the horizon.</i>"]
        n306["Astronomical Twilight<br/><i>cloud-sun · The span between 18° and 12° below the horizon.</i>"]
        n312["Nautical Twilight<br/><i>cloud-sun · The span between 12° and 6° below the horizon.</i>"]
        n239 --> n111
        n260 --> n132
        n146 --> n139
        n171 --> n140
        n294 --> n146
        n260 --> n166
        n294 --> n171
        n239 --> n175
        n146 --> n202
        n171 --> n203
        n239 --> n208
        n171 --> n232
        n146 --> n233
        n294 --> n239
        n239 --> n242
        n146 --> n249
        n171 --> n250
        n294 --> n260
        n239 --> n267
        n171 --> n273
        n239 --> n283
        n239 --> n292
        n239 --> n302
        n239 --> n306
        n239 --> n312
    end
    subgraph nb5["Eclipse"]
        n113["Beginning<br/><i>circle-play · The eclipse begins.</i>"]
        n122["Geocentric<br/><i>globe · From the Earth's center.</i>"]
        n145["Solar<br/><i>sun · The Moon covers the Sun.</i>"]
        n151["Total<br/><i>circle · The whole Moon enters the Earth's shadow.</i>"]
        n152["Total<br/><i>circle · The Moon covers the whole Sun.</i>"]
        n157["Annular<br/><i>sun · The Moon is too far to cover the Sun, leaving a ring.</i>"]
        n170["Lunar<br/><i>moon · The Earth's shadow falls on the Moon.</i>"]
        n172["Maximum<br/><i>maximize · The eclipse is at its greatest.</i>"]
        n180["Partial<br/><i>contrast · Only part of the Moon enters the Earth's shadow.</i>"]
        n197["Topocentric<br/><i>map-pin · From the observer's place.</i>"]
        n213["Ending<br/><i>circle-stop · The eclipse ends.</i>"]
        n215["Frame<br/><i>scan · What an eclipse is measured from.</i>"]
        n227["Partial<br/><i>contrast · The Moon covers only part of the Sun.</i>"]
        n251["Phase<br/><i>hourglass · Where an eclipse is: beginning, maximum or ending.</i>"]
        n300["Eclipse<br/><i>eclipse · Solar and lunar eclipses.</i>"]
        n251 --> n113
        n215 --> n122
        n300 --> n145
        n170 --> n151
        n145 --> n152
        n145 --> n157
        n300 --> n170
        n251 --> n172
        n170 --> n180
        n215 --> n197
        n251 --> n213
        n300 --> n215
        n145 --> n227
        n300 --> n251
    end
    subgraph nb6["Body"]
        n115["Ceres<br/><i>mountain · The asteroid of nurture and harvest.</i>"]
        n124["Jupiter<br/><i>users · The planet of growth and good fortune.</i>"]
        n125["Lilith<br/><i>map-pin · The Moon's far point, the black moon.</i>"]
        n126["Luminary<br/><i>sun-moon · The Sun and the Moon.</i>"]
        n129["Mercury<br/><i>user · The planet of mind and messages.</i>"]
        n136["Personal<br/><i>user · Mercury, Venus and Mars.</i>"]
        n150["Sun<br/><i>sun · The star at the center, ruling identity and vitality.</i>"]
        n155["Uranus<br/><i>telescope · The planet of change and surprise.</i>"]
        n160["Body<br/><i>globe · The bodies an event involves, grouped by class.</i>"]
        n174["Moon<br/><i>moon · The Earth's satellite, ruling mood and rhythm.</i>"]
        n177["Neptune<br/><i>telescope · The planet of dreams and dissolution.</i>"]
        n178["North Lunar Node<br/><i>map-pin · Where the Moon crosses the ecliptic heading north.</i>"]
        n179["Pallas<br/><i>mountain · The asteroid of strategy and wisdom.</i>"]
        n182["Planet<br/><i>earth · The planets, by how far they reach and by tradition's fortune.</i>"]
        n186["Saturn<br/><i>users · The planet of structure and limits.</i>"]
        n192["Social<br/><i>users · Jupiter and Saturn.</i>"]
        n198["Venus<br/><i>user · The planet of love and value.</i>"]
        n206["Asteroid<br/><i>mountain · Asteroids and Chiron.</i>"]
        n217["Juno<br/><i>mountain · The asteroid of partnership and commitment.</i>"]
        n218["Mars<br/><i>user · The planet of drive and conflict.</i>"]
        n226["Outer<br/><i>telescope · Uranus, Neptune and Pluto.</i>"]
        n228["Pluto<br/><i>telescope · The dwarf planet of transformation.</i>"]
        n240["Benefic<br/><i>smile · The bodies tradition counts as fortunate: Venus and Jupiter.</i>"]
        n248["Lunar Apogee<br/><i>map-pin · The point where the Moon is farthest from the Earth.</i>"]
        n253["Point<br/><i>map-pin · Calculated points: Lilith, the lunar nodes and apsides.</i>"]
        n262["Vesta<br/><i>mountain · The asteroid of devotion and focus.</i>"]
        n266["Chiron<br/><i>mountain · The wounded healer, between Saturn and Uranus.</i>"]
        n272["Malefic<br/><i>frown · The bodies tradition counts as difficult: Mars and Saturn.</i>"]
        n206 --> n115
        n192 --> n124
        n240 --> n124
        n253 --> n125
        n160 --> n126
        n136 --> n129
        n182 --> n136
        n126 --> n150
        n226 --> n155
        n126 --> n174
        n226 --> n177
        n253 --> n178
        n206 --> n179
        n160 --> n182
        n192 --> n186
        n272 --> n186
        n182 --> n192
        n136 --> n198
        n240 --> n198
        n160 --> n206
        n206 --> n217
        n136 --> n218
        n272 --> n218
        n182 --> n226
        n226 --> n228
        n182 --> n240
        n253 --> n248
        n160 --> n253
        n206 --> n262
        n206 --> n266
        n182 --> n272
    end
    subgraph nb7["Lunar"]
        n131["Monthly Cycle<br/><i>moon-star · The Moon's phases through the month.</i>"]
        n133["New<br/><i>circle-dot · The Moon is between the Earth and the Sun, dark.</i>"]
        n135["Perigee<br/><i>arrow-down · The Moon is nearest the Earth.</i>"]
        n158["Apogee<br/><i>arrow-up · The Moon is farthest from the Earth.</i>"]
        n159["Apsides<br/><i>orbit · The Moon's nearest and farthest points from the Earth.</i>"]
        n201["Waxing Crescent<br/><i>moon-star · A thin crescent, growing from new.</i>"]
        n204["Advancing<br/><i>arrow-right · The Moon is drawing nearer the Earth.</i>"]
        n214["First Quarter<br/><i>contrast · Half the Moon is lit, waxing.</i>"]
        n257["Retreating<br/><i>arrow-left · The Moon is drawing farther from the Earth.</i>"]
        n264["Waxing Gibbous<br/><i>moon-star · More than half lit, growing to full.</i>"]
        n269["Full<br/><i>circle · The whole face of the Moon is lit.</i>"]
        n282["Lunar<br/><i>moon · The Moon's month and orbit.</i>"]
        n290["Waning Gibbous<br/><i>moon-star · More than half lit, shrinking from full.</i>"]
        n296["Last Quarter<br/><i>moon-star · Half the Moon is lit, waning.</i>"]
        n305["Waning Crescent<br/><i>moon-star · A thin crescent, shrinking to new.</i>"]
        n282 --> n131
        n131 --> n133
        n159 --> n135
        n159 --> n158
        n282 --> n159
        n131 --> n201
        n159 --> n204
        n131 --> n214
        n159 --> n257
        n131 --> n264
        n131 --> n269
        n131 --> n290
        n131 --> n296
        n131 --> n305
    end
    subgraph nb8["Temporality"]
        n134["Perfective<br/><i>zap · An instant in time.</i>"]
        n184["Progressive<br/><i>hourglass · Progressing over a duration of time.</i>"]
        n310["Temporality<br/><i>timer · Whether an event is an instant or progresses over time.</i>"]
        n310 --> n134
        n310 --> n184
    end
    class n110 root
    class n160 root
    class n234 root
    class n252 root
    class n280 root
    class n282 root
    class n294 root
    class n300 root
    class n310 root
```
