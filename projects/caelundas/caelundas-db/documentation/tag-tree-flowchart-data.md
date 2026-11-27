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
        n14["Ceres Focal<br/><i>crosshair · The pattern points at Ceres.</i>"]
        n15["Chiron Focal<br/><i>crosshair · The pattern points at Chiron.</i>"]
        n42["Grand Cross<br/><i>zap</i>"]
        n43["Grand Trine<br/><i>waves</i>"]
        n44["Harmonic 1<br/><i>audio-waveform · The aspects of the 1st harmonic: the conjunction, a circle undivided.</i>"]
        n45["Harmonic 10<br/><i>audio-waveform · The aspects of the 10th harmonic: the decile and tredecile, a circle in tenths.</i>"]
        n46["Harmonic 11<br/><i>audio-waveform · The aspects of the 11th harmonic: the undecile, a circle in elevenths.</i>"]
        n47["Harmonic 12<br/><i>audio-waveform · The aspects of the 12th harmonic: the semisextile and quincunx, a circle in twelfths.</i>"]
        n48["Harmonic 2<br/><i>audio-waveform · The aspects of the 2nd harmonic: the opposition, a circle in halves.</i>"]
        n49["Harmonic 3<br/><i>audio-waveform · The aspects of the 3rd harmonic: the trine, a circle in thirds.</i>"]
        n50["Harmonic 4<br/><i>audio-waveform · The aspects of the 4th harmonic: the square, a circle in quarters.</i>"]
        n51["Harmonic 5<br/><i>audio-waveform · The aspects of the 5th harmonic: the quintile family, a circle in fifths.</i>"]
        n52["Harmonic 6<br/><i>audio-waveform · The aspects of the 6th harmonic: the sextile, a circle in sixths.</i>"]
        n53["Harmonic 7<br/><i>audio-waveform · The aspects of the 7th harmonic: the septile family, a circle in sevenths.</i>"]
        n54["Harmonic 8<br/><i>audio-waveform · The aspects of the 8th harmonic: the semisquare and sesquiquadrate, a circle in eighths.</i>"]
        n55["Harmonic 9<br/><i>audio-waveform · The aspects of the 9th harmonic: the novile, a circle in ninths.</i>"]
        n56["Hexagram<br/><i>waves</i>"]
        n58["Juno Focal<br/><i>crosshair · The pattern points at Juno.</i>"]
        n59["Jupiter Focal<br/><i>crosshair · The pattern points at Jupiter.</i>"]
        n60["Kite<br/><i>waves</i>"]
        n64["Lilith Focal<br/><i>crosshair · The pattern points at Lilith.</i>"]
        n65["Lunar Apogee Focal<br/><i>crosshair · The pattern points at Lunar Apogee.</i>"]
        n66["Mars Focal<br/><i>crosshair · The pattern points at Mars.</i>"]
        n67["Mercury Focal<br/><i>crosshair · The pattern points at Mercury.</i>"]
        n68["Moon Focal<br/><i>crosshair · The pattern points at Moon.</i>"]
        n80["Neptune Focal<br/><i>crosshair · The pattern points at Neptune.</i>"]
        n82["North Lunar Node Focal<br/><i>crosshair · The pattern points at North Lunar Node.</i>"]
        n84["Pallas Focal<br/><i>crosshair · The pattern points at Pallas.</i>"]
        n86["Pluto Focal<br/><i>crosshair · The pattern points at Pluto.</i>"]
        n91["Saturn Focal<br/><i>crosshair · The pattern points at Saturn.</i>"]
        n95["Stellium<br/><i>circle</i>"]
        n97["Sun Focal<br/><i>crosshair · The pattern points at Sun.</i>"]
        n98["T Square<br/><i>zap</i>"]
        n101["Uranus Focal<br/><i>crosshair · The pattern points at Uranus.</i>"]
        n102["Venus Focal<br/><i>crosshair · The pattern points at Venus.</i>"]
        n104["Vesta Focal<br/><i>crosshair · The pattern points at Vesta.</i>"]
        n115["Yod<br/><i>circle</i>"]
        n117["Aspect<br/><i>shapes · Angles between bodies, and the patterns they form.</i>"]
        n123["Conjunct<br/><i>star · Bodies at the same longitude, 0°: their energies merge.</i>"]
        n128["Forming<br/><i>trending-up · The bodies are approaching.</i>"]
        n130["Hard<br/><i>zap · Tense aspects, such as squares.</i>"]
        n134["Major<br/><i>star · The five classical aspects.</i>"]
        n149["Semisextile<br/><i>sparkle · Bodies 30° apart: a mild, easily missed link.</i>"]
        n151["Simple<br/><i>triangle · Aspects between two bodies.</i>"]
        n160["Triple<br/><i>triangle · Patterns of three bodies.</i>"]
        n161["Undecile<br/><i>gem · Bodies about 32.7° apart: a faint, unusual link.</i>"]
        n168["Compound<br/><i>hexagon · Patterns of three or more bodies linked by aspects.</i>"]
        n169["Decile<br/><i>gem · Bodies 36° apart: a faint, creative link.</i>"]
        n173["Exact<br/><i>circle-dot · The moment the aspect is exact.</i>"]
        n180["Minor<br/><i>sparkle · Aspects of the second rank.</i>"]
        n192["Quadruple<br/><i>square · Patterns of four bodies.</i>"]
        n196["Semisquare<br/><i>sparkle · Bodies 45° apart: a small irritation.</i>"]
        n197["Sextile<br/><i>star · Bodies 60° apart: an easy opening to cooperate.</i>"]
        n200["Soft<br/><i>waves · Easy aspects, such as trines.</i>"]
        n220["Dissolving<br/><i>trending-down · The bodies are separating.</i>"]
        n229["Nature<br/><i>scale · Whether an aspect is hard, soft or neutral.</i>"]
        n230["Neutral<br/><i>circle · Aspects that are neither.</i>"]
        n231["Novile<br/><i>gem · Bodies 40° apart: a subtle link of completion.</i>"]
        n237["Sesquiquadrate<br/><i>sparkle · Bodies 135° apart: agitation that demands release.</i>"]
        n241["Specialty<br/><i>gem · Rare aspects of higher harmonics.</i>"]
        n242["Square<br/><i>star · Bodies 90° apart: friction that pushes toward action.</i>"]
        n251["Harmonic<br/><i>audio-waveform · The harmonic of an aspect: 1 for a conjunction, 2 an opposition, 3 a trine, 4 a square, and so on.</i>"]
        n260["Quincunx<br/><i>sparkle · Bodies 150° apart: awkward, needing adjustment.</i>"]
        n262["Septile<br/><i>gem · Bodies about 51.4° apart: a fated, elusive link.</i>"]
        n263["Sextuple<br/><i>hexagon · Patterns of six bodies.</i>"]
        n265["Trine<br/><i>star · Bodies 120° apart: a harmonious flow.</i>"]
        n278["Opposite<br/><i>star · Bodies 180° apart: two sides pulling against each other.</i>"]
        n281["Phase<br/><i>hourglass · Where an aspect sits in its span: forming, exact or dissolving.</i>"]
        n283["Quintile<br/><i>gem · Bodies 72° apart: a creative, talent-making link.</i>"]
        n285["Focal Body<br/><i>crosshair · The body a compound pattern points at.</i>"]
        n292["Tredecile<br/><i>gem · Bodies 108° apart: a gentle, talented link.</i>"]
        n297["Biquintile<br/><i>gem · Bodies 144° apart: a creative, gifted link.</i>"]
        n95 --> n0
        n95 --> n1
        n95 --> n2
        n95 --> n3
        n95 --> n4
        n285 --> n14
        n285 --> n15
        n50 --> n42
        n130 --> n42
        n192 --> n42
        n160 --> n43
        n200 --> n43
        n49 --> n43
        n251 --> n44
        n251 --> n45
        n251 --> n46
        n251 --> n47
        n251 --> n48
        n251 --> n49
        n251 --> n50
        n251 --> n51
        n251 --> n52
        n251 --> n53
        n251 --> n54
        n251 --> n55
        n200 --> n56
        n52 --> n56
        n263 --> n56
        n285 --> n58
        n285 --> n59
        n192 --> n60
        n200 --> n60
        n52 --> n60
        n285 --> n64
        n285 --> n65
        n285 --> n66
        n285 --> n67
        n285 --> n68
        n285 --> n80
        n285 --> n82
        n285 --> n84
        n285 --> n86
        n285 --> n91
        n168 --> n95
        n230 --> n95
        n44 --> n95
        n285 --> n97
        n50 --> n98
        n130 --> n98
        n160 --> n98
        n285 --> n101
        n285 --> n102
        n285 --> n104
        n160 --> n115
        n47 --> n115
        n230 --> n115
        n230 --> n123
        n134 --> n123
        n44 --> n123
        n281 --> n128
        n229 --> n130
        n151 --> n134
        n47 --> n149
        n180 --> n149
        n200 --> n149
        n117 --> n151
        n168 --> n160
        n230 --> n161
        n46 --> n161
        n241 --> n161
        n117 --> n168
        n241 --> n169
        n200 --> n169
        n45 --> n169
        n281 --> n173
        n151 --> n180
        n168 --> n192
        n130 --> n196
        n180 --> n196
        n54 --> n196
        n200 --> n197
        n134 --> n197
        n52 --> n197
        n229 --> n200
        n281 --> n220
        n117 --> n229
        n229 --> n230
        n241 --> n231
        n200 --> n231
        n55 --> n231
        n130 --> n237
        n180 --> n237
        n54 --> n237
        n151 --> n241
        n50 --> n242
        n130 --> n242
        n134 --> n242
        n117 --> n251
        n47 --> n260
        n230 --> n260
        n180 --> n260
        n230 --> n262
        n241 --> n262
        n53 --> n262
        n168 --> n263
        n200 --> n265
        n134 --> n265
        n49 --> n265
        n130 --> n278
        n134 --> n278
        n48 --> n278
        n117 --> n281
        n241 --> n283
        n51 --> n283
        n200 --> n283
        n168 --> n285
        n241 --> n292
        n200 --> n292
        n45 --> n292
        n241 --> n297
        n51 --> n297
        n200 --> n297
    end
    subgraph nb1["Sign"]
        n5["Aquarius<br/><i>plus</i>"]
        n6["Aries<br/><i>plus</i>"]
        n12["Cancer<br/><i>plus</i>"]
        n13["Capricorn<br/><i>plus</i>"]
        n41["Gemini<br/><i>plus</i>"]
        n62["Leo<br/><i>plus</i>"]
        n63["Libra<br/><i>plus</i>"]
        n85["Pisces<br/><i>plus</i>"]
        n119["Before Peak<br/><i>split · The first fifteen degrees of a sign.</i>"]
        n121["Cardinal<br/><i>repeat · Signs that start a season: Aries, Cancer, Libra, Capricorn.</i>"]
        n125["Domicile<br/><i>house · The planet sits in its home sign: strong.</i>"]
        n126["Fire<br/><i>flame · Aries, Leo and Sagittarius.</i>"]
        n127["First Decan<br/><i>layers · The first ten degrees of a sign.</i>"]
        n145["Positive<br/><i>plus · Fire and air signs: outward.</i>"]
        n150["Sign Ingress<br/><i>log-in · A body enters a new sign, an instant.</i>"]
        n163["After Peak<br/><i>split · The last fifteen degrees of a sign.</i>"]
        n170["Earth<br/><i>mountain · Taurus, Virgo and Capricorn.</i>"]
        n174["Exaltation<br/><i>trending-up · The planet sits in the sign where it is honored.</i>"]
        n175["Fixed<br/><i>repeat · Signs in the middle of a season: Taurus, Leo, Scorpio, Aquarius.</i>"]
        n183["Negative<br/><i>plus · Earth and water signs: receptive.</i>"]
        n195["Second Decan<br/><i>layers · The middle ten degrees of a sign.</i>"]
        n198["Sign Transit<br/><i>log-in · A body's stay in one sign, a span.</i>"]
        n203["Taurus<br/><i>star · The sign of the Bull, a fixed earth sign.</i>"]
        n212["Air<br/><i>wind · Gemini, Libra and Aquarius.</i>"]
        n218["Decan Ingress<br/><i>log-in · A body enters a new decan of a sign.</i>"]
        n219["Detriment<br/><i>trending-down · The planet sits opposite its home sign: weak.</i>"]
        n228["Mutable<br/><i>repeat · Signs that end a season: Gemini, Virgo, Sagittarius, Pisces.</i>"]
        n240["Sign<br/><i>star · The signs and what they imply.</i>"]
        n244["Third Decan<br/><i>layers · The last ten degrees of a sign.</i>"]
        n248["Decan Transit<br/><i>log-in · A body's stay in one decan, a span.</i>"]
        n250["Fall<br/><i>arrow-down · The planet sits opposite its exaltation: lowered.</i>"]
        n267["Water<br/><i>droplets · Cancer, Scorpio and Pisces.</i>"]
        n279["Peak Ingress<br/><i>log-in · A body reaches the midpoint of a sign.</i>"]
        n280["Peregrine<br/><i>compass · The planet holds no dignity or debility in the sign.</i>"]
        n288["Peak Transit<br/><i>log-in · A body's stay on one side of a sign's peak, a span.</i>"]
        n293["Virgo<br/><i>star · The sign of the Maiden, a mutable earth sign.</i>"]
        n307["Scorpio<br/><i>star · The sign of the Scorpion, a fixed water sign.</i>"]
        n314["Sagittarius<br/><i>star · The sign of the Archer, a mutable fire sign.</i>"]
        n320["Element<br/><i>flame · The element of a sign: fire, earth, air or water.</i>"]
        n322["Modality<br/><i>repeat · The modality of a sign: cardinal, fixed or mutable.</i>"]
        n324["Polarity<br/><i>plus · The polarity of a sign: positive or negative.</i>"]
        n326["Decan<br/><i>layers · The ten-degree third of a sign a body is in.</i>"]
        n328["Peak<br/><i>split · Which side of a sign's peak, at 15°, a body is on.</i>"]
        n329["Dignity<br/><i>crown · How strongly a planet sits in its sign.</i>"]
        n330["Ingress<br/><i>log-in · A body enters a sign, or a decan of one, and its stay there.</i>"]
        n240 --> n5
        n212 --> n5
        n145 --> n5
        n175 --> n5
        n240 --> n6
        n145 --> n6
        n121 --> n6
        n126 --> n6
        n240 --> n12
        n121 --> n12
        n183 --> n12
        n267 --> n12
        n240 --> n13
        n170 --> n13
        n121 --> n13
        n183 --> n13
        n240 --> n41
        n212 --> n41
        n228 --> n41
        n145 --> n41
        n240 --> n62
        n145 --> n62
        n126 --> n62
        n175 --> n62
        n240 --> n63
        n212 --> n63
        n145 --> n63
        n121 --> n63
        n240 --> n85
        n228 --> n85
        n183 --> n85
        n267 --> n85
        n328 --> n119
        n322 --> n121
        n329 --> n125
        n320 --> n126
        n326 --> n127
        n324 --> n145
        n330 --> n150
        n328 --> n163
        n320 --> n170
        n329 --> n174
        n322 --> n175
        n324 --> n183
        n326 --> n195
        n330 --> n198
        n240 --> n203
        n170 --> n203
        n183 --> n203
        n175 --> n203
        n320 --> n212
        n330 --> n218
        n329 --> n219
        n322 --> n228
        n326 --> n244
        n330 --> n248
        n329 --> n250
        n320 --> n267
        n330 --> n279
        n329 --> n280
        n330 --> n288
        n240 --> n293
        n228 --> n293
        n170 --> n293
        n183 --> n293
        n240 --> n307
        n183 --> n307
        n267 --> n307
        n175 --> n307
        n240 --> n314
        n228 --> n314
        n145 --> n314
        n126 --> n314
        n240 --> n320
        n240 --> n322
        n240 --> n324
        n240 --> n326
        n240 --> n328
        n240 --> n329
        n240 --> n330
    end
    subgraph nb2["Solar"]
        n7["Autumnal Equinox<br/><i>leaf</i>"]
        n8["Beltane<br/><i>leaf</i>"]
        n25["Eleventh Hexadecan<br/><i>leaf</i>"]
        n38["Fifteenth Hexadecan<br/><i>leaf</i>"]
        n39["Fifth Hexadecan<br/><i>leaf</i>"]
        n40["First Hexadecan<br/><i>leaf</i>"]
        n57["Imbolc<br/><i>leaf</i>"]
        n61["Lammas<br/><i>leaf</i>"]
        n81["Ninth Hexadecan<br/><i>leaf</i>"]
        n90["Samhain<br/><i>leaf</i>"]
        n92["Seventh Hexadecan<br/><i>leaf</i>"]
        n96["Summer Solstice<br/><i>leaf</i>"]
        n99["Third Hexadecan<br/><i>leaf</i>"]
        n100["Thirteenth Hexadecan<br/><i>leaf</i>"]
        n103["Vernal Equinox<br/><i>leaf</i>"]
        n114["Winter Solstice<br/><i>leaf</i>"]
        n116["Annual Cycle<br/><i>rotate-cw · The turning points of the Sun's year.</i>"]
        n146["Post-Vernal Equinox<br/><i>ruler · From Vernal Equinox to the hexadecan after it.</i>"]
        n154["Solstice<br/><i>sun-medium · The longest and shortest days.</i>"]
        n155["Spring<br/><i>sprout · The season from the spring equinox to the summer solstice.</i>"]
        n171["Equinox<br/><i>equal · Day and night are of equal length.</i>"]
        n190["Pre-Beltane<br/><i>ruler · From the hexadecan before Beltane to it.</i>"]
        n194["Season<br/><i>leaf · The season of the year.</i>"]
        n202["Summer<br/><i>sun · The season from the summer solstice to the autumn equinox.</i>"]
        n214["Autumn<br/><i>leaf · The season from the autumn equinox to the winter solstice.</i>"]
        n216["Cross-Quarter Day<br/><i>calendar-check · Days midway between a solstice and an equinox.</i>"]
        n235["Post-Beltane<br/><i>ruler · From Beltane to the hexadecan after it.</i>"]
        n252["Hexadecan<br/><i>grid-2x2 · The sixteen divisions of the year.</i>"]
        n259["Pre-Summer Solstice<br/><i>ruler · From the hexadecan before Summer Solstice to it.</i>"]
        n270["Winter<br/><i>snowflake · The season from the winter solstice to the spring equinox.</i>"]
        n274["Interval<br/><i>ruler · The sixteen spans between the year's points, each after a named point or before the next.</i>"]
        n282["Post-Summer Solstice<br/><i>ruler · From Summer Solstice to the hexadecan after it.</i>"]
        n284["Solar<br/><i>sun · The Sun's year.</i>"]
        n289["Perihelion<br/><i>arrow-down-left · The Earth is nearest the Sun.</i>"]
        n290["Pre-Lammas<br/><i>ruler · From the hexadecan before Lammas to it.</i>"]
        n295["Aphelion<br/><i>arrow-up-right · The Earth is farthest from the Sun.</i>"]
        n300["Post-Lammas<br/><i>ruler · From Lammas to the hexadecan after it.</i>"]
        n302["Advancing<br/><i>arrow-right · The Sun's days are growing longer.</i>"]
        n306["Pre-Autumnal Equinox<br/><i>ruler · From the hexadecan before Autumnal Equinox to it.</i>"]
        n312["Post-Autumnal Equinox<br/><i>ruler · From Autumnal Equinox to the hexadecan after it.</i>"]
        n313["Retreating<br/><i>arrow-left · The Sun's days are growing shorter.</i>"]
        n316["Pre-Samhain<br/><i>ruler · From the hexadecan before Samhain to it.</i>"]
        n318["Post-Samhain<br/><i>ruler · From Samhain to the hexadecan after it.</i>"]
        n319["Pre-Winter Solstice<br/><i>ruler · From the hexadecan before Winter Solstice to it.</i>"]
        n321["Post-Winter Solstice<br/><i>ruler · From Winter Solstice to the hexadecan after it.</i>"]
        n323["Pre-Imbolc<br/><i>ruler · From the hexadecan before Imbolc to it.</i>"]
        n325["Post-Imbolc<br/><i>ruler · From Imbolc to the hexadecan after it.</i>"]
        n327["Pre-Vernal Equinox<br/><i>ruler · From the hexadecan before Vernal Equinox to it.</i>"]
        n171 --> n7
        n214 --> n7
        n216 --> n8
        n155 --> n8
        n252 --> n25
        n214 --> n25
        n270 --> n38
        n252 --> n38
        n252 --> n39
        n202 --> n39
        n252 --> n40
        n155 --> n40
        n270 --> n57
        n216 --> n57
        n216 --> n61
        n202 --> n61
        n252 --> n81
        n214 --> n81
        n216 --> n90
        n214 --> n90
        n252 --> n92
        n202 --> n92
        n202 --> n96
        n154 --> n96
        n252 --> n99
        n155 --> n99
        n270 --> n100
        n252 --> n100
        n155 --> n103
        n171 --> n103
        n270 --> n114
        n154 --> n114
        n284 --> n116
        n274 --> n146
        n116 --> n154
        n194 --> n155
        n116 --> n171
        n274 --> n190
        n284 --> n194
        n194 --> n202
        n194 --> n214
        n116 --> n216
        n274 --> n235
        n116 --> n252
        n274 --> n259
        n194 --> n270
        n116 --> n274
        n274 --> n282
        n116 --> n289
        n274 --> n290
        n116 --> n295
        n274 --> n300
        n116 --> n302
        n274 --> n306
        n274 --> n312
        n116 --> n313
        n274 --> n316
        n274 --> n318
        n274 --> n319
        n274 --> n321
        n274 --> n323
        n274 --> n325
        n274 --> n327
    end
    subgraph nb3["Planetary"]
        n9["Brightest<br/><i>milestone · The planet shines at its brightest.</i>"]
        n10["Brightest<br/><i>milestone · The planet shines at its brightest.</i>"]
        n11["Brightest<br/><i>milestone · The planet shines at its brightest.</i>"]
        n16["Closing<br/><i>fold-horizontal · The span the planet closes on the Sun, from greatest elongation or opposition to set.</i>"]
        n17["Closing<br/><i>fold-horizontal · The span the planet closes on the Sun, from greatest elongation or opposition to set.</i>"]
        n18["Closing<br/><i>fold-horizontal · The span the planet closes on the Sun, from greatest elongation or opposition to set.</i>"]
        n19["Conjunction<br/><i>milestone · The planet lines up with the Sun.</i>"]
        n20["Conjunction<br/><i>milestone · The planet lines up with the Sun.</i>"]
        n21["Conjunction<br/><i>milestone · The planet lines up with the Sun.</i>"]
        n22["Eastern Brightest<br/><i>refresh-cw · The planet shines brightest in the evening sky.</i>"]
        n23["Eastern Elongation<br/><i>refresh-cw · The planet stands farthest east of the Sun.</i>"]
        n24["Eastern Elongation<br/><i>refresh-cw · The planet stands farthest east of the Sun.</i>"]
        n26["Elongation<br/><i>milestone · The planet stands farthest from the Sun.</i>"]
        n27["Elongation<br/><i>milestone · The planet stands farthest from the Sun.</i>"]
        n28["Evening Closing<br/><i>fold-horizontal · The span from greatest elongation, or Mars's opposition, to set, as the planet closes on the Sun.</i>"]
        n29["Evening Closing<br/><i>fold-horizontal · The span from greatest elongation, or Mars's opposition, to set, as the planet closes on the Sun.</i>"]
        n30["Evening Rise<br/><i>sunrise · The planet rises in the evening.</i>"]
        n31["Evening Rise<br/><i>sunrise · The planet rises in the evening.</i>"]
        n32["Evening Set<br/><i>sunset · The planet sets in the evening.</i>"]
        n33["Evening Set<br/><i>sunset · The planet sets in the evening.</i>"]
        n34["Evening Visibility<br/><i>refresh-cw · The span the planet is seen in the evening.</i>"]
        n35["Evening Visibility<br/><i>refresh-cw · The span the planet is seen in the evening.</i>"]
        n36["Evening Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, as the planet widens from the Sun.</i>"]
        n37["Evening Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, as the planet widens from the Sun.</i>"]
        n69["Morning Closing<br/><i>fold-horizontal · The span from greatest elongation to set, as the planet closes on the Sun.</i>"]
        n70["Morning Closing<br/><i>fold-horizontal · The span from greatest elongation to set, as the planet closes on the Sun.</i>"]
        n71["Morning Rise<br/><i>sunrise · The planet rises in the morning.</i>"]
        n72["Morning Rise<br/><i>sunrise · The planet rises in the morning.</i>"]
        n73["Morning Rise<br/><i>sunrise · The planet rises in the morning.</i>"]
        n74["Morning Set<br/><i>sunset · The planet sets in the morning.</i>"]
        n75["Morning Visibility<br/><i>refresh-cw · The span the planet is seen in the morning.</i>"]
        n76["Morning Visibility<br/><i>refresh-cw · The span the planet is seen in the morning.</i>"]
        n77["Morning Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, or Mars's opposition, as the planet widens from the Sun.</i>"]
        n78["Morning Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, or Mars's opposition, as the planet widens from the Sun.</i>"]
        n79["Morning Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, or Mars's opposition, as the planet widens from the Sun.</i>"]
        n83["Opposition<br/><i>milestone · The planet is opposite the Sun.</i>"]
        n87["Rise and set<br/><i>milestone · The planet rises or sets with the Sun's light.</i>"]
        n88["Rise and set<br/><i>milestone · The planet rises or sets with the Sun's light.</i>"]
        n89["Rise and set<br/><i>milestone · The planet rises or sets with the Sun's light.</i>"]
        n93["Station<br/><i>milestone · The planet stops against the stars.</i>"]
        n94["Station<br/><i>milestone · The planet stops against the stars.</i>"]
        n105["Visibility<br/><i>milestone · The span the planet is seen at one end of the day.</i>"]
        n106["Visibility<br/><i>milestone · The span the planet is seen at one end of the day.</i>"]
        n107["Visibility<br/><i>milestone · The span the planet is seen at one end of the day.</i>"]
        n108["Western Brightest<br/><i>refresh-cw · The planet shines brightest in the morning sky.</i>"]
        n109["Western Brightest<br/><i>refresh-cw · The planet shines brightest in the morning sky.</i>"]
        n110["Western Elongation<br/><i>refresh-cw · The planet stands farthest west of the Sun.</i>"]
        n111["Widening<br/><i>unfold-horizontal · The span the planet widens from the Sun, from rise to greatest elongation or opposition.</i>"]
        n112["Widening<br/><i>unfold-horizontal · The span the planet widens from the Sun, from rise to greatest elongation or opposition.</i>"]
        n113["Widening<br/><i>unfold-horizontal · The span the planet widens from the Sun, from rise to greatest elongation or opposition.</i>"]
        n124["Direction<br/><i>compass · A planet's apparent direction against the stars.</i>"]
        n135["Mercurian<br/><i>refresh-cw · Mercury's cycle of visibility with the Sun.</i>"]
        n137["Mercury<br/><i>milestone · Mercury's stages in its cycle with the Sun.</i>"]
        n156["Station Retrograde<br/><i>undo-2 · A planet stops and turns backward.</i>"]
        n188["Phase<br/><i>refresh-cw · The phases of Mercury, Venus and Mars in their cycles with the Sun.</i>"]
        n201["Station Direct<br/><i>arrow-right · A planet stops and turns forward.</i>"]
        n206["Venus<br/><i>milestone · Venus's stages in its cycle with the Sun.</i>"]
        n207["Venusian<br/><i>refresh-cw · Venus's cycle of visibility with the Sun.</i>"]
        n226["Mars<br/><i>milestone · Mars's stages in its cycle with the Sun.</i>"]
        n227["Martian<br/><i>refresh-cw · Mars's cycle of visibility with the Sun.</i>"]
        n236["Retrograde Period<br/><i>rotate-ccw · The span a planet moves backward.</i>"]
        n243["Synodic Stage<br/><i>milestone · A planet's stage in its cycle with the Sun.</i>"]
        n249["Direct Period<br/><i>rotate-cw · The span a planet moves forward.</i>"]
        n257["Planetary<br/><i>orbit · The planets' own cycles.</i>"]
        n137 --> n9
        n206 --> n10
        n226 --> n11
        n137 --> n16
        n206 --> n17
        n226 --> n18
        n226 --> n19
        n137 --> n20
        n206 --> n21
        n207 --> n22
        n135 --> n23
        n207 --> n24
        n137 --> n26
        n206 --> n27
        n135 --> n28
        n207 --> n29
        n135 --> n30
        n207 --> n31
        n135 --> n32
        n207 --> n33
        n135 --> n34
        n207 --> n35
        n135 --> n36
        n207 --> n37
        n135 --> n69
        n207 --> n70
        n227 --> n71
        n135 --> n72
        n207 --> n73
        n135 --> n74
        n135 --> n75
        n207 --> n76
        n135 --> n77
        n227 --> n78
        n207 --> n79
        n226 --> n83
        n226 --> n87
        n137 --> n88
        n206 --> n89
        n226 --> n93
        n206 --> n94
        n137 --> n105
        n206 --> n106
        n226 --> n107
        n207 --> n108
        n135 --> n109
        n135 --> n110
        n226 --> n111
        n137 --> n112
        n206 --> n113
        n257 --> n124
        n188 --> n135
        n243 --> n137
        n124 --> n156
        n257 --> n188
        n124 --> n201
        n243 --> n206
        n188 --> n207
        n243 --> n226
        n188 --> n227
        n124 --> n236
        n257 --> n243
        n124 --> n249
    end
    subgraph nb4["Daily"]
        n118["Astronomical Dawn<br/><i>sunrise · The Sun is 18° below the horizon, rising: the sky begins to lighten.</i>"]
        n140["Morning<br/><i>sunrise · The twilight falls before the Sun rises.</i>"]
        n147["Rise<br/><i>sunrise · The Sun crosses the horizon upward.</i>"]
        n148["Rise<br/><i>sunrise · The Moon crosses the horizon upward.</i>"]
        n153["Solar Cycle<br/><i>sun · The Sun's day: rise, zenith, set and nadir.</i>"]
        n172["Evening<br/><i>sunset · The twilight falls after the Sun has set.</i>"]
        n178["Lunar Cycle<br/><i>moon · The Moon's day: rise, zenith, set and nadir.</i>"]
        n182["Nautical Dawn<br/><i>sunrise · The Sun is 12° below the horizon, rising: the horizon shows at sea.</i>"]
        n209["Zenith<br/><i>arrow-up-to-line · The Sun's highest point.</i>"]
        n210["Zenith<br/><i>arrow-up-to-line · The Moon's highest point.</i>"]
        n215["Civil Dawn<br/><i>sunrise · The Sun is 6° below the horizon, rising: light enough to see outdoors.</i>"]
        n238["Set<br/><i>sunset · The Moon crosses the horizon downward.</i>"]
        n239["Set<br/><i>sunset · The Sun crosses the horizon downward.</i>"]
        n245["Twilight<br/><i>cloud-sun · The stages between day and night.</i>"]
        n247["Daylight<br/><i>sun · The Sun is above the horizon.</i>"]
        n254["Nadir<br/><i>arrow-down-to-line · The Sun's lowest point.</i>"]
        n255["Nadir<br/><i>arrow-down-to-line · The Moon's lowest point.</i>"]
        n264["Time of Day<br/><i>clock · Whether a twilight falls in the morning or the evening.</i>"]
        n272["Civil Dusk<br/><i>sunset · The Sun is 6° below the horizon, setting: lights are needed outdoors.</i>"]
        n277["Moon Up<br/><i>moon · The Moon is above the horizon, from moonrise to moonset.</i>"]
        n287["Nautical Dusk<br/><i>sunset · The Sun is 12° below the horizon, setting: the sea horizon fades.</i>"]
        n296["Astronomical Dusk<br/><i>sunset · The Sun is 18° below the horizon, setting: the sky is fully dark.</i>"]
        n298["Daily<br/><i>clock · Events that repeat every day.</i>"]
        n305["Night<br/><i>moon · The Sun is more than 18° below the horizon.</i>"]
        n309["Astronomical Twilight<br/><i>cloud-sun · The span between 18° and 12° below the horizon.</i>"]
        n315["Nautical Twilight<br/><i>cloud-sun · The span between 12° and 6° below the horizon.</i>"]
        n245 --> n118
        n264 --> n140
        n153 --> n147
        n178 --> n148
        n298 --> n153
        n264 --> n172
        n298 --> n178
        n245 --> n182
        n153 --> n209
        n178 --> n210
        n245 --> n215
        n178 --> n238
        n153 --> n239
        n298 --> n245
        n245 --> n247
        n153 --> n254
        n178 --> n255
        n298 --> n264
        n245 --> n272
        n178 --> n277
        n245 --> n287
        n245 --> n296
        n245 --> n305
        n245 --> n309
        n245 --> n315
    end
    subgraph nb5["Eclipse"]
        n120["Beginning<br/><i>circle-play · The eclipse begins.</i>"]
        n129["Geocentric<br/><i>globe · From the Earth's center.</i>"]
        n152["Solar<br/><i>sun · The Moon covers the Sun.</i>"]
        n158["Total<br/><i>circle · The whole Moon enters the Earth's shadow.</i>"]
        n159["Total<br/><i>circle · The Moon covers the whole Sun.</i>"]
        n164["Annular<br/><i>sun · The Moon is too far to cover the Sun, leaving a ring.</i>"]
        n177["Lunar<br/><i>moon · The Earth's shadow falls on the Moon.</i>"]
        n179["Maximum<br/><i>maximize · The eclipse is at its greatest.</i>"]
        n187["Partial<br/><i>contrast · Only part of the Moon enters the Earth's shadow.</i>"]
        n204["Topocentric<br/><i>map-pin · From the observer's place.</i>"]
        n221["Ending<br/><i>circle-stop · The eclipse ends.</i>"]
        n223["Frame<br/><i>scan · What an eclipse is measured from.</i>"]
        n233["Partial<br/><i>contrast · The Moon covers only part of the Sun.</i>"]
        n256["Phase<br/><i>hourglass · Where an eclipse is: beginning, maximum or ending.</i>"]
        n304["Eclipse<br/><i>eclipse · Solar and lunar eclipses.</i>"]
        n256 --> n120
        n223 --> n129
        n304 --> n152
        n177 --> n158
        n152 --> n159
        n152 --> n164
        n304 --> n177
        n256 --> n179
        n177 --> n187
        n223 --> n204
        n256 --> n221
        n304 --> n223
        n152 --> n233
        n304 --> n256
    end
    subgraph nb6["Body"]
        n122["Ceres<br/><i>mountain · The asteroid of nurture and harvest.</i>"]
        n131["Jupiter<br/><i>users · The planet of growth and good fortune.</i>"]
        n132["Lilith<br/><i>map-pin · The Moon's far point, the black moon.</i>"]
        n133["Luminary<br/><i>sun-moon · The Sun and the Moon.</i>"]
        n136["Mercury<br/><i>user · The planet of mind and messages.</i>"]
        n144["Personal<br/><i>user · Mercury, Venus and Mars.</i>"]
        n157["Sun<br/><i>sun · The star at the center, ruling identity and vitality.</i>"]
        n162["Uranus<br/><i>telescope · The planet of change and surprise.</i>"]
        n167["Body<br/><i>globe · The bodies an event involves, grouped by class.</i>"]
        n181["Moon<br/><i>moon · The Earth's satellite, ruling mood and rhythm.</i>"]
        n184["Neptune<br/><i>telescope · The planet of dreams and dissolution.</i>"]
        n185["North Lunar Node<br/><i>map-pin · Where the Moon crosses the ecliptic heading north.</i>"]
        n186["Pallas<br/><i>mountain · The asteroid of strategy and wisdom.</i>"]
        n189["Planet<br/><i>earth · The planets, by how far they reach and by tradition's fortune.</i>"]
        n193["Saturn<br/><i>users · The planet of structure and limits.</i>"]
        n199["Social<br/><i>users · Jupiter and Saturn.</i>"]
        n205["Venus<br/><i>user · The planet of love and value.</i>"]
        n213["Asteroid<br/><i>mountain · Asteroids and Chiron.</i>"]
        n224["Juno<br/><i>mountain · The asteroid of partnership and commitment.</i>"]
        n225["Mars<br/><i>user · The planet of drive and conflict.</i>"]
        n232["Outer<br/><i>telescope · Uranus, Neptune and Pluto.</i>"]
        n234["Pluto<br/><i>telescope · The dwarf planet of transformation.</i>"]
        n246["Benefic<br/><i>smile · The bodies tradition counts as fortunate: Venus and Jupiter.</i>"]
        n253["Lunar Apogee<br/><i>map-pin · The point where the Moon is farthest from the Earth.</i>"]
        n258["Point<br/><i>map-pin · Calculated points: Lilith, the lunar nodes and apsides.</i>"]
        n266["Vesta<br/><i>mountain · The asteroid of devotion and focus.</i>"]
        n271["Chiron<br/><i>mountain · The wounded healer, between Saturn and Uranus.</i>"]
        n275["Malefic<br/><i>frown · The bodies tradition counts as difficult: Mars and Saturn.</i>"]
        n213 --> n122
        n199 --> n131
        n246 --> n131
        n258 --> n132
        n167 --> n133
        n144 --> n136
        n189 --> n144
        n133 --> n157
        n232 --> n162
        n133 --> n181
        n232 --> n184
        n258 --> n185
        n213 --> n186
        n167 --> n189
        n199 --> n193
        n275 --> n193
        n189 --> n199
        n144 --> n205
        n246 --> n205
        n167 --> n213
        n213 --> n224
        n144 --> n225
        n275 --> n225
        n189 --> n232
        n232 --> n234
        n189 --> n246
        n258 --> n253
        n167 --> n258
        n213 --> n266
        n213 --> n271
        n189 --> n275
    end
    subgraph nb7["Duration"]
        n138["Minutes<br/><i>timer · A minute to under an hour.</i>"]
        n176["Hours<br/><i>clock · An hour to under a day.</i>"]
        n217["Days<br/><i>sun · A day to under a week.</i>"]
        n269["Weeks<br/><i>calendar-days · A week to under thirty days.</i>"]
        n276["Months<br/><i>calendar-range · Thirty days to under ninety-one.</i>"]
        n291["Quarters<br/><i>calendar-clock · Ninety-one days to under a year of 365.</i>"]
        n301["Years<br/><i>calendar · A year of 365 days to under ten years.</i>"]
        n303["Decades<br/><i>history · Ten years to under a hundred.</i>"]
        n310["Centuries<br/><i>landmark · A hundred years or more.</i>"]
        n311["Duration<br/><i>hourglass · How long an event lasts, by the largest unit it reaches; an instant has none.</i>"]
        n311 --> n138
        n311 --> n176
        n311 --> n217
        n311 --> n269
        n311 --> n276
        n311 --> n291
        n311 --> n301
        n311 --> n303
        n311 --> n310
    end
    subgraph nb8["Lunar"]
        n139["Monthly Cycle<br/><i>moon-star · The Moon's phases through the month.</i>"]
        n141["New<br/><i>circle-dot · The Moon is between the Earth and the Sun, dark.</i>"]
        n143["Perigee<br/><i>arrow-down · The Moon is nearest the Earth.</i>"]
        n165["Apogee<br/><i>arrow-up · The Moon is farthest from the Earth.</i>"]
        n166["Apsides<br/><i>orbit · The Moon's nearest and farthest points from the Earth.</i>"]
        n208["Waxing Crescent<br/><i>moon-star · A thin crescent, growing from new.</i>"]
        n211["Advancing<br/><i>arrow-right · The Moon is drawing nearer the Earth.</i>"]
        n222["First Quarter<br/><i>contrast · Half the Moon is lit, waxing.</i>"]
        n261["Retreating<br/><i>arrow-left · The Moon is drawing farther from the Earth.</i>"]
        n268["Waxing Gibbous<br/><i>moon-star · More than half lit, growing to full.</i>"]
        n273["Full<br/><i>circle · The whole face of the Moon is lit.</i>"]
        n286["Lunar<br/><i>moon · The Moon's month and orbit.</i>"]
        n294["Waning Gibbous<br/><i>moon-star · More than half lit, shrinking from full.</i>"]
        n299["Last Quarter<br/><i>moon-star · Half the Moon is lit, waning.</i>"]
        n308["Waning Crescent<br/><i>moon-star · A thin crescent, shrinking to new.</i>"]
        n286 --> n139
        n139 --> n141
        n166 --> n143
        n166 --> n165
        n286 --> n166
        n139 --> n208
        n166 --> n211
        n139 --> n222
        n166 --> n261
        n139 --> n268
        n139 --> n273
        n139 --> n294
        n139 --> n299
        n139 --> n308
    end
    subgraph nb9["Temporality"]
        n142["Perfective<br/><i>zap · An instant in time.</i>"]
        n191["Progressive<br/><i>hourglass · Progressing over a duration of time.</i>"]
        n317["Temporality<br/><i>timer · Whether an event is an instant or progresses over time.</i>"]
        n317 --> n142
        n317 --> n191
    end
    class n117 root
    class n167 root
    class n240 root
    class n257 root
    class n284 root
    class n286 root
    class n298 root
    class n304 root
    class n311 root
    class n317 root
```
