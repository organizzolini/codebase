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
        n8["Ceres Focal<br/><i>crosshair · The pattern points at Ceres.</i>"]
        n9["Chiron Focal<br/><i>crosshair · The pattern points at Chiron.</i>"]
        n29["Grand Cross<br/><i>zap</i>"]
        n30["Grand Trine<br/><i>waves</i>"]
        n31["Harmonic 1<br/><i>audio-waveform · The aspects of the 1st harmonic: the conjunction, a circle undivided.</i>"]
        n32["Harmonic 10<br/><i>audio-waveform · The aspects of the 10th harmonic: the decile and tredecile, a circle in tenths.</i>"]
        n33["Harmonic 11<br/><i>audio-waveform · The aspects of the 11th harmonic: the undecile, a circle in elevenths.</i>"]
        n34["Harmonic 12<br/><i>audio-waveform · The aspects of the 12th harmonic: the semisextile and quincunx, a circle in twelfths.</i>"]
        n35["Harmonic 2<br/><i>audio-waveform · The aspects of the 2nd harmonic: the opposition, a circle in halves.</i>"]
        n36["Harmonic 3<br/><i>audio-waveform · The aspects of the 3rd harmonic: the trine, a circle in thirds.</i>"]
        n37["Harmonic 4<br/><i>audio-waveform · The aspects of the 4th harmonic: the square, a circle in quarters.</i>"]
        n38["Harmonic 5<br/><i>audio-waveform · The aspects of the 5th harmonic: the quintile family, a circle in fifths.</i>"]
        n39["Harmonic 6<br/><i>audio-waveform · The aspects of the 6th harmonic: the sextile, a circle in sixths.</i>"]
        n40["Harmonic 7<br/><i>audio-waveform · The aspects of the 7th harmonic: the septile family, a circle in sevenths.</i>"]
        n41["Harmonic 8<br/><i>audio-waveform · The aspects of the 8th harmonic: the semisquare and sesquiquadrate, a circle in eighths.</i>"]
        n42["Harmonic 9<br/><i>audio-waveform · The aspects of the 9th harmonic: the novile, a circle in ninths.</i>"]
        n43["Hexagram<br/><i>waves</i>"]
        n45["Juno Focal<br/><i>crosshair · The pattern points at Juno.</i>"]
        n46["Jupiter Focal<br/><i>crosshair · The pattern points at Jupiter.</i>"]
        n47["Kite<br/><i>waves</i>"]
        n49["Lilith Focal<br/><i>crosshair · The pattern points at Lilith.</i>"]
        n50["Lunar Apogee Focal<br/><i>crosshair · The pattern points at Lunar Apogee.</i>"]
        n51["Mars Focal<br/><i>crosshair · The pattern points at Mars.</i>"]
        n52["Mercury Focal<br/><i>crosshair · The pattern points at Mercury.</i>"]
        n53["Moon Focal<br/><i>crosshair · The pattern points at Moon.</i>"]
        n65["Neptune Focal<br/><i>crosshair · The pattern points at Neptune.</i>"]
        n67["North Lunar Node Focal<br/><i>crosshair · The pattern points at North Lunar Node.</i>"]
        n68["Pallas Focal<br/><i>crosshair · The pattern points at Pallas.</i>"]
        n69["Pluto Focal<br/><i>crosshair · The pattern points at Pluto.</i>"]
        n72["Saturn Focal<br/><i>crosshair · The pattern points at Saturn.</i>"]
        n74["Stellium<br/><i>circle</i>"]
        n76["Sun Focal<br/><i>crosshair · The pattern points at Sun.</i>"]
        n77["T Square<br/><i>zap</i>"]
        n80["Uranus Focal<br/><i>crosshair · The pattern points at Uranus.</i>"]
        n81["Venus Focal<br/><i>crosshair · The pattern points at Venus.</i>"]
        n83["Vesta Focal<br/><i>crosshair · The pattern points at Vesta.</i>"]
        n90["Yod<br/><i>circle</i>"]
        n93["Aspect<br/><i>shapes · Angles between bodies, and the patterns they form.</i>"]
        n99["Conjunct<br/><i>star · Bodies at the same longitude, 0°: their energies merge.</i>"]
        n104["Forming<br/><i>trending-up · The bodies are approaching.</i>"]
        n106["Hard<br/><i>zap · Tense aspects, such as squares.</i>"]
        n110["Major<br/><i>star · The five classical aspects.</i>"]
        n123["Semisextile<br/><i>sparkle · Bodies 30° apart: a mild, easily missed link.</i>"]
        n126["Simple<br/><i>triangle · Aspects between two bodies.</i>"]
        n135["Triple<br/><i>triangle · Patterns of three bodies.</i>"]
        n136["Undecile<br/><i>gem · Bodies about 32.7° apart: a faint, unusual link.</i>"]
        n143["Compound<br/><i>hexagon · Patterns of three or more bodies linked by aspects.</i>"]
        n144["Decile<br/><i>gem · Bodies 36° apart: a faint, creative link.</i>"]
        n149["Exact<br/><i>circle-dot · The moment the aspect is exact.</i>"]
        n155["Minor<br/><i>sparkle · Aspects of the second rank.</i>"]
        n167["Quadruple<br/><i>square · Patterns of four bodies.</i>"]
        n171["Semisquare<br/><i>sparkle · Bodies 45° apart: a small irritation.</i>"]
        n172["Sextile<br/><i>star · Bodies 60° apart: an easy opening to cooperate.</i>"]
        n175["Soft<br/><i>waves · Easy aspects, such as trines.</i>"]
        n193["Dissolving<br/><i>trending-down · The bodies are separating.</i>"]
        n203["Nature<br/><i>scale · Whether an aspect is hard, soft or neutral.</i>"]
        n204["Neutral<br/><i>circle · Aspects that are neither.</i>"]
        n205["Novile<br/><i>gem · Bodies 40° apart: a subtle link of completion.</i>"]
        n211["Sesquiquadrate<br/><i>sparkle · Bodies 135° apart: agitation that demands release.</i>"]
        n214["Specialty<br/><i>gem · Rare aspects of higher harmonics.</i>"]
        n215["Square<br/><i>star · Bodies 90° apart: friction that pushes toward action.</i>"]
        n226["Harmonic<br/><i>audio-waveform · The harmonic of an aspect: 1 for a conjunction, 2 an opposition, 3 a trine, 4 a square, and so on.</i>"]
        n236["Quincunx<br/><i>sparkle · Bodies 150° apart: awkward, needing adjustment.</i>"]
        n238["Septile<br/><i>gem · Bodies about 51.4° apart: a fated, elusive link.</i>"]
        n239["Sextuple<br/><i>hexagon · Patterns of six bodies.</i>"]
        n241["Trine<br/><i>star · Bodies 120° apart: a harmonious flow.</i>"]
        n254["Opposite<br/><i>star · Bodies 180° apart: two sides pulling against each other.</i>"]
        n257["Phase<br/><i>hourglass · Where an aspect sits in its span: forming, exact or dissolving.</i>"]
        n259["Quintile<br/><i>gem · Bodies 72° apart: a creative, talent-making link.</i>"]
        n261["Focal Body<br/><i>crosshair · The body a pattern points at.</i>"]
        n268["Tredecile<br/><i>gem · Bodies 108° apart: a gentle, talented link.</i>"]
        n273["Biquintile<br/><i>gem · Bodies 144° apart: a creative, gifted link.</i>"]
        n74 --> n0
        n74 --> n1
        n74 --> n2
        n74 --> n3
        n74 --> n4
        n261 --> n8
        n261 --> n9
        n37 --> n29
        n106 --> n29
        n167 --> n29
        n135 --> n30
        n175 --> n30
        n36 --> n30
        n226 --> n31
        n226 --> n32
        n226 --> n33
        n226 --> n34
        n226 --> n35
        n226 --> n36
        n226 --> n37
        n226 --> n38
        n226 --> n39
        n226 --> n40
        n226 --> n41
        n226 --> n42
        n175 --> n43
        n39 --> n43
        n239 --> n43
        n261 --> n45
        n261 --> n46
        n167 --> n47
        n175 --> n47
        n39 --> n47
        n261 --> n49
        n261 --> n50
        n261 --> n51
        n261 --> n52
        n261 --> n53
        n261 --> n65
        n261 --> n67
        n261 --> n68
        n261 --> n69
        n261 --> n72
        n143 --> n74
        n204 --> n74
        n31 --> n74
        n261 --> n76
        n37 --> n77
        n106 --> n77
        n135 --> n77
        n261 --> n80
        n261 --> n81
        n261 --> n83
        n135 --> n90
        n34 --> n90
        n204 --> n90
        n204 --> n99
        n110 --> n99
        n31 --> n99
        n257 --> n104
        n203 --> n106
        n126 --> n110
        n34 --> n123
        n155 --> n123
        n175 --> n123
        n93 --> n126
        n143 --> n135
        n204 --> n136
        n33 --> n136
        n214 --> n136
        n93 --> n143
        n214 --> n144
        n175 --> n144
        n32 --> n144
        n257 --> n149
        n126 --> n155
        n143 --> n167
        n106 --> n171
        n155 --> n171
        n41 --> n171
        n175 --> n172
        n110 --> n172
        n39 --> n172
        n203 --> n175
        n257 --> n193
        n93 --> n203
        n203 --> n204
        n214 --> n205
        n175 --> n205
        n42 --> n205
        n106 --> n211
        n155 --> n211
        n41 --> n211
        n126 --> n214
        n37 --> n215
        n106 --> n215
        n110 --> n215
        n93 --> n226
        n34 --> n236
        n204 --> n236
        n155 --> n236
        n204 --> n238
        n214 --> n238
        n40 --> n238
        n143 --> n239
        n175 --> n241
        n110 --> n241
        n36 --> n241
        n106 --> n254
        n110 --> n254
        n35 --> n254
        n93 --> n257
        n214 --> n259
        n38 --> n259
        n175 --> n259
        n93 --> n261
        n214 --> n268
        n175 --> n268
        n32 --> n268
        n214 --> n273
        n38 --> n273
        n175 --> n273
    end
    subgraph nb1["Solar"]
        n5["Autumnal Equinox<br/><i>leaf</i>"]
        n6["Beltane<br/><i>leaf</i>"]
        n14["Eleventh Hexadecan<br/><i>leaf</i>"]
        n26["Fifteenth Hexadecan<br/><i>leaf</i>"]
        n27["Fifth Hexadecan<br/><i>leaf</i>"]
        n28["First Hexadecan<br/><i>leaf</i>"]
        n44["Imbolc<br/><i>leaf</i>"]
        n48["Lammas<br/><i>leaf</i>"]
        n66["Ninth Hexadecan<br/><i>leaf</i>"]
        n71["Samhain<br/><i>leaf</i>"]
        n73["Seventh Hexadecan<br/><i>leaf</i>"]
        n75["Summer Solstice<br/><i>leaf</i>"]
        n78["Third Hexadecan<br/><i>leaf</i>"]
        n79["Thirteenth Hexadecan<br/><i>leaf</i>"]
        n82["Vernal Equinox<br/><i>leaf</i>"]
        n89["Winter Solstice<br/><i>leaf</i>"]
        n91["Annual Cycle<br/><i>rotate-cw · The turning points of the Sun's year.</i>"]
        n120["Post-Vernal Equinox<br/><i>ruler · From Vernal Equinox to the hexadecan after it.</i>"]
        n129["Solstice<br/><i>sun-medium · The longest and shortest days.</i>"]
        n130["Spring<br/><i>sprout · The season from the spring equinox to the summer solstice.</i>"]
        n147["Equinox<br/><i>equal · Day and night are of equal length.</i>"]
        n165["Pre-Beltane<br/><i>ruler · From the hexadecan before Beltane to it.</i>"]
        n169["Season<br/><i>leaf · The season of the year.</i>"]
        n177["Summer<br/><i>sun · The season from the summer solstice to the autumn equinox.</i>"]
        n188["Autumn<br/><i>leaf · The season from the autumn equinox to the winter solstice.</i>"]
        n190["Cross-Quarter Day<br/><i>calendar-check · Days midway between a solstice and an equinox.</i>"]
        n209["Post-Beltane<br/><i>ruler · From Beltane to the hexadecan after it.</i>"]
        n227["Hexadecan<br/><i>grid-2x2 · The sixteen divisions of the year.</i>"]
        n235["Pre-Summer Solstice<br/><i>ruler · From the hexadecan before Summer Solstice to it.</i>"]
        n245["Winter<br/><i>snowflake · The season from the winter solstice to the spring equinox.</i>"]
        n250["Interval<br/><i>ruler · The sixteen spans between the year's points, each after a named point or before the next.</i>"]
        n258["Post-Summer Solstice<br/><i>ruler · From Summer Solstice to the hexadecan after it.</i>"]
        n260["Solar<br/><i>sun · The Sun's year.</i>"]
        n266["Perihelion<br/><i>arrow-down-left · The Earth is nearest the Sun.</i>"]
        n267["Pre-Lammas<br/><i>ruler · From the hexadecan before Lammas to it.</i>"]
        n271["Aphelion<br/><i>arrow-up-right · The Earth is farthest from the Sun.</i>"]
        n278["Post-Lammas<br/><i>ruler · From Lammas to the hexadecan after it.</i>"]
        n279["Advancing<br/><i>arrow-right · The Sun's days are growing longer.</i>"]
        n283["Pre-Autumnal Equinox<br/><i>ruler · From the hexadecan before Autumnal Equinox to it.</i>"]
        n287["Post-Autumnal Equinox<br/><i>ruler · From Autumnal Equinox to the hexadecan after it.</i>"]
        n288["Retreating<br/><i>arrow-left · The Sun's days are growing shorter.</i>"]
        n293["Pre-Samhain<br/><i>ruler · From the hexadecan before Samhain to it.</i>"]
        n295["Post-Samhain<br/><i>ruler · From Samhain to the hexadecan after it.</i>"]
        n297["Pre-Winter Solstice<br/><i>ruler · From the hexadecan before Winter Solstice to it.</i>"]
        n298["Post-Winter Solstice<br/><i>ruler · From Winter Solstice to the hexadecan after it.</i>"]
        n299["Pre-Imbolc<br/><i>ruler · From the hexadecan before Imbolc to it.</i>"]
        n300["Post-Imbolc<br/><i>ruler · From Imbolc to the hexadecan after it.</i>"]
        n301["Pre-Vernal Equinox<br/><i>ruler · From the hexadecan before Vernal Equinox to it.</i>"]
        n147 --> n5
        n188 --> n5
        n190 --> n6
        n130 --> n6
        n227 --> n14
        n188 --> n14
        n245 --> n26
        n227 --> n26
        n227 --> n27
        n177 --> n27
        n227 --> n28
        n130 --> n28
        n245 --> n44
        n190 --> n44
        n190 --> n48
        n177 --> n48
        n227 --> n66
        n188 --> n66
        n190 --> n71
        n188 --> n71
        n227 --> n73
        n177 --> n73
        n177 --> n75
        n129 --> n75
        n227 --> n78
        n130 --> n78
        n245 --> n79
        n227 --> n79
        n130 --> n82
        n147 --> n82
        n245 --> n89
        n129 --> n89
        n260 --> n91
        n250 --> n120
        n91 --> n129
        n169 --> n130
        n91 --> n147
        n250 --> n165
        n260 --> n169
        n169 --> n177
        n169 --> n188
        n91 --> n190
        n250 --> n209
        n91 --> n227
        n250 --> n235
        n169 --> n245
        n91 --> n250
        n250 --> n258
        n91 --> n266
        n250 --> n267
        n91 --> n271
        n250 --> n278
        n91 --> n279
        n250 --> n283
        n250 --> n287
        n91 --> n288
        n250 --> n293
        n250 --> n295
        n250 --> n297
        n250 --> n298
        n250 --> n299
        n250 --> n300
        n250 --> n301
    end
    subgraph nb2["Planetary"]
        n7["Brightest<br/><i>milestone · The planet shines at its brightest.</i>"]
        n10["Closing<br/><i>fold-horizontal · The span the planet closes on the Sun, from greatest elongation or opposition to set.</i>"]
        n11["Eastern Brightest<br/><i>refresh-cw · The planet shines brightest in the evening sky.</i>"]
        n12["Eastern Elongation<br/><i>refresh-cw · The planet stands farthest east of the Sun.</i>"]
        n13["Eastern Elongation<br/><i>refresh-cw · The planet stands farthest east of the Sun.</i>"]
        n15["Elongation<br/><i>milestone · The planet stands farthest from the Sun.</i>"]
        n16["Evening Closing<br/><i>fold-horizontal · The span from greatest elongation, or Mars's opposition, to set, as the planet closes on the Sun.</i>"]
        n17["Evening Closing<br/><i>fold-horizontal · The span from greatest elongation, or Mars's opposition, to set, as the planet closes on the Sun.</i>"]
        n18["Evening Rise<br/><i>sunrise · The planet rises in the evening.</i>"]
        n19["Evening Rise<br/><i>sunrise · The planet rises in the evening.</i>"]
        n20["Evening Set<br/><i>sunset · The planet sets in the evening.</i>"]
        n21["Evening Set<br/><i>sunset · The planet sets in the evening.</i>"]
        n22["Evening Visibility<br/><i>refresh-cw · The span the planet is seen in the evening.</i>"]
        n23["Evening Visibility<br/><i>refresh-cw · The span the planet is seen in the evening.</i>"]
        n24["Evening Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, as the planet widens from the Sun.</i>"]
        n25["Evening Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, as the planet widens from the Sun.</i>"]
        n54["Morning Closing<br/><i>fold-horizontal · The span from greatest elongation to set, as the planet closes on the Sun.</i>"]
        n55["Morning Closing<br/><i>fold-horizontal · The span from greatest elongation to set, as the planet closes on the Sun.</i>"]
        n56["Morning Rise<br/><i>sunrise · The planet rises in the morning.</i>"]
        n57["Morning Rise<br/><i>sunrise · The planet rises in the morning.</i>"]
        n58["Morning Rise<br/><i>sunrise · The planet rises in the morning.</i>"]
        n59["Morning Set<br/><i>sunset · The planet sets in the morning.</i>"]
        n60["Morning Visibility<br/><i>refresh-cw · The span the planet is seen in the morning.</i>"]
        n61["Morning Visibility<br/><i>refresh-cw · The span the planet is seen in the morning.</i>"]
        n62["Morning Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, or Mars's opposition, as the planet widens from the Sun.</i>"]
        n63["Morning Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, or Mars's opposition, as the planet widens from the Sun.</i>"]
        n64["Morning Widening<br/><i>unfold-horizontal · The span from rise to greatest elongation, or Mars's opposition, as the planet widens from the Sun.</i>"]
        n70["Rise and set<br/><i>milestone · The planet rises or sets with the Sun's light.</i>"]
        n84["Visibility<br/><i>milestone · The span the planet is seen at one end of the day.</i>"]
        n85["Western Brightest<br/><i>refresh-cw · The planet shines brightest in the morning sky.</i>"]
        n86["Western Brightest<br/><i>refresh-cw · The planet shines brightest in the morning sky.</i>"]
        n87["Western Elongation<br/><i>refresh-cw · The planet stands farthest west of the Sun.</i>"]
        n88["Widening<br/><i>unfold-horizontal · The span the planet widens from the Sun, from rise to greatest elongation or opposition.</i>"]
        n100["Direction<br/><i>compass · A planet's apparent direction against the stars.</i>"]
        n111["Mercurian<br/><i>refresh-cw · Mercury's cycle of visibility with the Sun.</i>"]
        n131["Station Retrograde<br/><i>undo-2 · A planet stops and turns backward.</i>"]
        n163["Phase<br/><i>refresh-cw · The phases of Mercury, Venus and Mars in their cycles with the Sun.</i>"]
        n176["Station Direct<br/><i>arrow-right · A planet stops and turns forward.</i>"]
        n181["Venusian<br/><i>refresh-cw · Venus's cycle of visibility with the Sun.</i>"]
        n200["Martian<br/><i>refresh-cw · Mars's cycle of visibility with the Sun.</i>"]
        n210["Retrograde Period<br/><i>rotate-ccw · The span a planet moves backward.</i>"]
        n216["Synodic Stage<br/><i>milestone · A planet's stage in its cycle with the Sun.</i>"]
        n224["Direct Period<br/><i>rotate-cw · The span a planet moves forward.</i>"]
        n232["Planetary<br/><i>orbit · The planets' own cycles.</i>"]
        n216 --> n7
        n216 --> n10
        n181 --> n11
        n111 --> n12
        n181 --> n13
        n216 --> n15
        n111 --> n16
        n181 --> n17
        n111 --> n18
        n181 --> n19
        n111 --> n20
        n181 --> n21
        n111 --> n22
        n181 --> n23
        n111 --> n24
        n181 --> n25
        n111 --> n54
        n181 --> n55
        n200 --> n56
        n111 --> n57
        n181 --> n58
        n111 --> n59
        n111 --> n60
        n181 --> n61
        n111 --> n62
        n200 --> n63
        n181 --> n64
        n216 --> n70
        n216 --> n84
        n181 --> n85
        n111 --> n86
        n111 --> n87
        n216 --> n88
        n232 --> n100
        n163 --> n111
        n100 --> n131
        n232 --> n163
        n100 --> n176
        n163 --> n181
        n163 --> n200
        n100 --> n210
        n232 --> n216
        n100 --> n224
    end
    subgraph nb3["Zodiac"]
        n92["Aries<br/><i>star · The sign of the Ram, a cardinal fire sign.</i>"]
        n95["Before Peak<br/><i>split · The first fifteen degrees of a sign.</i>"]
        n97["Cardinal<br/><i>repeat · Signs that start a season: Aries, Cancer, Libra, Capricorn.</i>"]
        n101["Domicile<br/><i>house · The planet sits in its home sign: strong.</i>"]
        n102["Fire<br/><i>flame · Aries, Leo and Sagittarius.</i>"]
        n103["First Decan<br/><i>layers · The first ten degrees of a sign.</i>"]
        n119["Positive<br/><i>plus · Fire and air signs: outward.</i>"]
        n124["Sign<br/><i>star · The zodiac sign a body is in.</i>"]
        n125["Sign Ingress<br/><i>log-in · A body enters a new sign, an instant.</i>"]
        n138["After Peak<br/><i>split · The last fifteen degrees of a sign.</i>"]
        n145["Earth<br/><i>mountain · Taurus, Virgo and Capricorn.</i>"]
        n146["Element<br/><i>flame · The element of a sign: fire, earth, air or water.</i>"]
        n150["Exaltation<br/><i>trending-up · The planet sits in the sign where it is honored.</i>"]
        n151["Fixed<br/><i>repeat · Signs in the middle of a season: Taurus, Leo, Scorpio, Aquarius.</i>"]
        n158["Negative<br/><i>plus · Earth and water signs: receptive.</i>"]
        n170["Second Decan<br/><i>layers · The middle ten degrees of a sign.</i>"]
        n173["Sign Transit<br/><i>log-in · A body's stay in one sign, a span.</i>"]
        n178["Taurus<br/><i>star · The sign of the Bull, a fixed earth sign.</i>"]
        n186["Air<br/><i>wind · Gemini, Libra and Aquarius.</i>"]
        n191["Decan Ingress<br/><i>log-in · A body enters a new decan of a sign.</i>"]
        n192["Detriment<br/><i>trending-down · The planet sits opposite its home sign: weak.</i>"]
        n197["Gemini<br/><i>star · The sign of the Twins, a mutable air sign.</i>"]
        n201["Modality<br/><i>repeat · The modality of a sign: cardinal, fixed or mutable.</i>"]
        n202["Mutable<br/><i>repeat · Signs that end a season: Gemini, Virgo, Sagittarius, Pisces.</i>"]
        n217["Third Decan<br/><i>layers · The last ten degrees of a sign.</i>"]
        n219["Zodiac<br/><i>star · The signs and what they imply.</i>"]
        n221["Cancer<br/><i>star · The sign of the Crab, a cardinal water sign.</i>"]
        n223["Decan Transit<br/><i>log-in · A body's stay in one decan, a span.</i>"]
        n225["Fall<br/><i>arrow-down · The planet sits opposite its exaltation: lowered.</i>"]
        n234["Polarity<br/><i>plus · The polarity of a sign: positive or negative.</i>"]
        n243["Water<br/><i>droplets · Cancer, Scorpio and Pisces.</i>"]
        n248["Decan<br/><i>layers · The ten-degree third of a sign a body is in.</i>"]
        n251["Leo<br/><i>star · The sign of the Lion, a fixed fire sign.</i>"]
        n255["Peak Ingress<br/><i>log-in · A body reaches the midpoint of a sign.</i>"]
        n256["Peregrine<br/><i>compass · The planet holds no dignity or debility in the sign.</i>"]
        n264["Peak<br/><i>split · Which side of a sign's peak, at 15°, a body is on.</i>"]
        n265["Peak Transit<br/><i>log-in · A body's stay on one side of a sign's peak, a span.</i>"]
        n269["Virgo<br/><i>star · The sign of the Maiden, a mutable earth sign.</i>"]
        n275["Dignity<br/><i>crown · How strongly a planet sits in its sign.</i>"]
        n277["Libra<br/><i>star · The sign of the Scales, a cardinal air sign.</i>"]
        n281["Ingress<br/><i>log-in · A body enters a sign, or a decan of one, and its stay there.</i>"]
        n284["Scorpio<br/><i>star · The sign of the Scorpion, a fixed water sign.</i>"]
        n289["Sagittarius<br/><i>star · The sign of the Archer, a mutable fire sign.</i>"]
        n291["Capricorn<br/><i>star · The sign of the Sea-Goat, a cardinal earth sign.</i>"]
        n294["Aquarius<br/><i>star · The sign of the Water Bearer, a fixed air sign.</i>"]
        n296["Pisces<br/><i>star · The sign of the Fish, a mutable water sign.</i>"]
        n124 --> n92
        n119 --> n92
        n97 --> n92
        n102 --> n92
        n264 --> n95
        n201 --> n97
        n275 --> n101
        n146 --> n102
        n248 --> n103
        n234 --> n119
        n219 --> n124
        n281 --> n125
        n264 --> n138
        n146 --> n145
        n219 --> n146
        n275 --> n150
        n201 --> n151
        n234 --> n158
        n248 --> n170
        n281 --> n173
        n124 --> n178
        n145 --> n178
        n158 --> n178
        n151 --> n178
        n146 --> n186
        n281 --> n191
        n275 --> n192
        n124 --> n197
        n186 --> n197
        n202 --> n197
        n119 --> n197
        n219 --> n201
        n201 --> n202
        n248 --> n217
        n124 --> n221
        n97 --> n221
        n158 --> n221
        n243 --> n221
        n281 --> n223
        n275 --> n225
        n219 --> n234
        n146 --> n243
        n219 --> n248
        n124 --> n251
        n119 --> n251
        n102 --> n251
        n151 --> n251
        n281 --> n255
        n275 --> n256
        n219 --> n264
        n281 --> n265
        n124 --> n269
        n202 --> n269
        n145 --> n269
        n158 --> n269
        n219 --> n275
        n124 --> n277
        n186 --> n277
        n119 --> n277
        n97 --> n277
        n219 --> n281
        n124 --> n284
        n158 --> n284
        n243 --> n284
        n151 --> n284
        n124 --> n289
        n202 --> n289
        n119 --> n289
        n102 --> n289
        n124 --> n291
        n145 --> n291
        n97 --> n291
        n158 --> n291
        n124 --> n294
        n186 --> n294
        n119 --> n294
        n151 --> n294
        n124 --> n296
        n202 --> n296
        n158 --> n296
        n243 --> n296
    end
    subgraph nb4["Daily"]
        n94["Astronomical Dawn<br/><i>sunrise · The Sun is 18° below the horizon, rising: the sky begins to lighten.</i>"]
        n114["Morning<br/><i>sunrise · The twilight falls before the Sun rises.</i>"]
        n121["Rise<br/><i>sunrise · The Sun crosses the horizon upward.</i>"]
        n122["Rise<br/><i>sunrise · The Moon crosses the horizon upward.</i>"]
        n128["Solar Cycle<br/><i>sun · The Sun's day: rise, zenith, set and nadir.</i>"]
        n148["Evening<br/><i>sunset · The twilight falls after the Sun has set.</i>"]
        n153["Lunar Cycle<br/><i>moon · The Moon's day: rise, zenith, set and nadir.</i>"]
        n157["Nautical Dawn<br/><i>sunrise · The Sun is 12° below the horizon, rising: the horizon shows at sea.</i>"]
        n183["Zenith<br/><i>arrow-up-to-line · The Sun's highest point.</i>"]
        n184["Zenith<br/><i>arrow-up-to-line · The Moon's highest point.</i>"]
        n189["Civil Dawn<br/><i>sunrise · The Sun is 6° below the horizon, rising: light enough to see outdoors.</i>"]
        n212["Set<br/><i>sunset · The Moon crosses the horizon downward.</i>"]
        n213["Set<br/><i>sunset · The Sun crosses the horizon downward.</i>"]
        n218["Twilight<br/><i>cloud-sun · The stages between day and night.</i>"]
        n222["Daylight<br/><i>sun · The Sun is above the horizon.</i>"]
        n229["Nadir<br/><i>arrow-down-to-line · The Sun's lowest point.</i>"]
        n230["Nadir<br/><i>arrow-down-to-line · The Moon's lowest point.</i>"]
        n240["Time of Day<br/><i>clock · Whether a twilight falls in the morning or the evening.</i>"]
        n247["Civil Dusk<br/><i>sunset · The Sun is 6° below the horizon, setting: lights are needed outdoors.</i>"]
        n253["Moon Up<br/><i>moon · The Moon is above the horizon, from moonrise to moonset.</i>"]
        n263["Nautical Dusk<br/><i>sunset · The Sun is 12° below the horizon, setting: the sea horizon fades.</i>"]
        n272["Astronomical Dusk<br/><i>sunset · The Sun is 18° below the horizon, setting: the sky is fully dark.</i>"]
        n274["Daily<br/><i>clock · Events that repeat every day.</i>"]
        n282["Night<br/><i>moon · The Sun is more than 18° below the horizon.</i>"]
        n286["Astronomical Twilight<br/><i>cloud-sun · The span between 18° and 12° below the horizon.</i>"]
        n292["Nautical Twilight<br/><i>cloud-sun · The span between 12° and 6° below the horizon.</i>"]
        n218 --> n94
        n240 --> n114
        n128 --> n121
        n153 --> n122
        n274 --> n128
        n240 --> n148
        n274 --> n153
        n218 --> n157
        n128 --> n183
        n153 --> n184
        n218 --> n189
        n153 --> n212
        n128 --> n213
        n274 --> n218
        n218 --> n222
        n128 --> n229
        n153 --> n230
        n274 --> n240
        n218 --> n247
        n153 --> n253
        n218 --> n263
        n218 --> n272
        n218 --> n282
        n218 --> n286
        n218 --> n292
    end
    subgraph nb5["Eclipse"]
        n96["Beginning<br/><i>circle-play · The eclipse begins.</i>"]
        n105["Geocentric<br/><i>globe · From the Earth's center.</i>"]
        n127["Solar<br/><i>sun · The Moon covers the Sun.</i>"]
        n133["Total<br/><i>circle · The whole Moon enters the Earth's shadow.</i>"]
        n134["Total<br/><i>circle · The Moon covers the whole Sun.</i>"]
        n139["Annular<br/><i>sun · The Moon is too far to cover the Sun, leaving a ring.</i>"]
        n152["Lunar<br/><i>moon · The Earth's shadow falls on the Moon.</i>"]
        n154["Maximum<br/><i>maximize · The eclipse is at its greatest.</i>"]
        n162["Partial<br/><i>contrast · Only part of the Moon enters the Earth's shadow.</i>"]
        n179["Topocentric<br/><i>map-pin · From the observer's place.</i>"]
        n194["Ending<br/><i>circle-stop · The eclipse ends.</i>"]
        n196["Frame<br/><i>scan · What an eclipse is measured from.</i>"]
        n207["Partial<br/><i>contrast · The Moon covers only part of the Sun.</i>"]
        n231["Phase<br/><i>hourglass · Where an eclipse is: beginning, maximum or ending.</i>"]
        n280["Eclipse<br/><i>eclipse · Solar and lunar eclipses.</i>"]
        n231 --> n96
        n196 --> n105
        n280 --> n127
        n152 --> n133
        n127 --> n134
        n127 --> n139
        n280 --> n152
        n231 --> n154
        n152 --> n162
        n196 --> n179
        n231 --> n194
        n280 --> n196
        n127 --> n207
        n280 --> n231
    end
    subgraph nb6["Body"]
        n98["Ceres<br/><i>mountain · The asteroid of nurture and harvest.</i>"]
        n107["Jupiter<br/><i>users · The planet of growth and good fortune.</i>"]
        n108["Lilith<br/><i>map-pin · The Moon's far point, the black moon.</i>"]
        n109["Luminary<br/><i>sun-moon · The Sun and the Moon.</i>"]
        n112["Mercury<br/><i>user · The planet of mind and messages.</i>"]
        n118["Personal<br/><i>user · Mercury, Venus and Mars.</i>"]
        n132["Sun<br/><i>sun · The star at the center, ruling identity and vitality.</i>"]
        n137["Uranus<br/><i>telescope · The planet of change and surprise.</i>"]
        n142["Body<br/><i>globe · The bodies an event involves, grouped by class.</i>"]
        n156["Moon<br/><i>moon · The Earth's satellite, ruling mood and rhythm.</i>"]
        n159["Neptune<br/><i>telescope · The planet of dreams and dissolution.</i>"]
        n160["North Lunar Node<br/><i>map-pin · Where the Moon crosses the ecliptic heading north.</i>"]
        n161["Pallas<br/><i>mountain · The asteroid of strategy and wisdom.</i>"]
        n164["Planet<br/><i>earth · The planets, by how far they reach and by tradition's fortune.</i>"]
        n168["Saturn<br/><i>users · The planet of structure and limits.</i>"]
        n174["Social<br/><i>users · Jupiter and Saturn.</i>"]
        n180["Venus<br/><i>user · The planet of love and value.</i>"]
        n187["Asteroid<br/><i>mountain · Asteroids and Chiron.</i>"]
        n198["Juno<br/><i>mountain · The asteroid of partnership and commitment.</i>"]
        n199["Mars<br/><i>user · The planet of drive and conflict.</i>"]
        n206["Outer<br/><i>telescope · Uranus, Neptune and Pluto.</i>"]
        n208["Pluto<br/><i>telescope · The dwarf planet of transformation.</i>"]
        n220["Benefic<br/><i>smile · The bodies tradition counts as fortunate: Venus and Jupiter.</i>"]
        n228["Lunar Apogee<br/><i>map-pin · The point where the Moon is farthest from the Earth.</i>"]
        n233["Point<br/><i>map-pin · Calculated points: Lilith, the lunar nodes and apsides.</i>"]
        n242["Vesta<br/><i>mountain · The asteroid of devotion and focus.</i>"]
        n246["Chiron<br/><i>mountain · The wounded healer, between Saturn and Uranus.</i>"]
        n252["Malefic<br/><i>frown · The bodies tradition counts as difficult: Mars and Saturn.</i>"]
        n187 --> n98
        n174 --> n107
        n220 --> n107
        n233 --> n108
        n142 --> n109
        n118 --> n112
        n164 --> n118
        n109 --> n132
        n206 --> n137
        n109 --> n156
        n206 --> n159
        n233 --> n160
        n187 --> n161
        n142 --> n164
        n174 --> n168
        n252 --> n168
        n164 --> n174
        n118 --> n180
        n220 --> n180
        n142 --> n187
        n187 --> n198
        n118 --> n199
        n252 --> n199
        n164 --> n206
        n206 --> n208
        n164 --> n220
        n233 --> n228
        n142 --> n233
        n187 --> n242
        n187 --> n246
        n164 --> n252
    end
    subgraph nb7["Lunar"]
        n113["Monthly Cycle<br/><i>moon-star · The Moon's phases through the month.</i>"]
        n115["New<br/><i>circle-dot · The Moon is between the Earth and the Sun, dark.</i>"]
        n117["Perigee<br/><i>arrow-down · The Moon is nearest the Earth.</i>"]
        n140["Apogee<br/><i>arrow-up · The Moon is farthest from the Earth.</i>"]
        n141["Apsides<br/><i>orbit · The Moon's nearest and farthest points from the Earth.</i>"]
        n182["Waxing Crescent<br/><i>moon-star · A thin crescent, growing from new.</i>"]
        n185["Advancing<br/><i>arrow-right · The Moon is drawing nearer the Earth.</i>"]
        n195["First Quarter<br/><i>contrast · Half the Moon is lit, waxing.</i>"]
        n237["Retreating<br/><i>arrow-left · The Moon is drawing farther from the Earth.</i>"]
        n244["Waxing Gibbous<br/><i>moon-star · More than half lit, growing to full.</i>"]
        n249["Full<br/><i>circle · The whole face of the Moon is lit.</i>"]
        n262["Lunar<br/><i>moon · The Moon's month and orbit.</i>"]
        n270["Waning Gibbous<br/><i>moon-star · More than half lit, shrinking from full.</i>"]
        n276["Last Quarter<br/><i>moon-star · Half the Moon is lit, waning.</i>"]
        n285["Waning Crescent<br/><i>moon-star · A thin crescent, shrinking to new.</i>"]
        n262 --> n113
        n113 --> n115
        n141 --> n117
        n141 --> n140
        n262 --> n141
        n113 --> n182
        n141 --> n185
        n113 --> n195
        n141 --> n237
        n113 --> n244
        n113 --> n249
        n113 --> n270
        n113 --> n276
        n113 --> n285
    end
    subgraph nb8["Temporality"]
        n116["Perfective<br/><i>zap · An instant in time.</i>"]
        n166["Progressive<br/><i>hourglass · Progressing over a duration of time.</i>"]
        n290["Temporality<br/><i>timer · Whether an event is an instant or progresses over time.</i>"]
        n290 --> n116
        n290 --> n166
    end
    class n93 root
    class n142 root
    class n219 root
    class n232 root
    class n260 root
    class n262 root
    class n274 root
    class n280 root
    class n290 root
```
