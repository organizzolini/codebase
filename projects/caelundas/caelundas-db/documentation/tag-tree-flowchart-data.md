```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5
    subgraph nb0["Aspect"]
        n0["4 Body<br/><i>sparkles · 4 bodies bunched together in one place.</i>"]
        n1["5 Body<br/><i>sparkles · 5 bodies bunched together in one place.</i>"]
        n2["6 Body<br/><i>sparkles · 6 bodies bunched together in one place.</i>"]
        n3["7 Body<br/><i>sparkles · 7 bodies bunched together in one place.</i>"]
        n7["Ceres Focal<br/><i>crosshair · The pattern points at Ceres.</i>"]
        n8["Chiron Focal<br/><i>crosshair · The pattern points at Chiron.</i>"]
        n23["Grand Cross<br/><i>square · Four bodies in squares and oppositions: a tense cross.</i>"]
        n24["Grand Trine<br/><i>triangle · Three bodies 120° apart: a closed triangle of ease.</i>"]
        n25["Harmonic 1<br/><i>audio-waveform · The aspects of the 1st harmonic: the conjunction, a circle undivided.</i>"]
        n26["Harmonic 10<br/><i>audio-waveform · The aspects of the 10th harmonic: the decile and tredecile, a circle in tenths.</i>"]
        n27["Harmonic 11<br/><i>audio-waveform · The aspects of the 11th harmonic: the undecile, a circle in elevenths.</i>"]
        n28["Harmonic 12<br/><i>audio-waveform · The aspects of the 12th harmonic: the semisextile and quincunx, a circle in twelfths.</i>"]
        n29["Harmonic 2<br/><i>audio-waveform · The aspects of the 2nd harmonic: the opposition, a circle in halves.</i>"]
        n30["Harmonic 3<br/><i>audio-waveform · The aspects of the 3rd harmonic: the trine, a circle in thirds.</i>"]
        n31["Harmonic 4<br/><i>audio-waveform · The aspects of the 4th harmonic: the square, a circle in quarters.</i>"]
        n32["Harmonic 5<br/><i>audio-waveform · The aspects of the 5th harmonic: the quintile family, a circle in fifths.</i>"]
        n33["Harmonic 6<br/><i>audio-waveform · The aspects of the 6th harmonic: the sextile, a circle in sixths.</i>"]
        n34["Harmonic 7<br/><i>audio-waveform · The aspects of the 7th harmonic: the septile family, a circle in sevenths.</i>"]
        n35["Harmonic 8<br/><i>audio-waveform · The aspects of the 8th harmonic: the semisquare and sesquiquadrate, a circle in eighths.</i>"]
        n36["Harmonic 9<br/><i>audio-waveform · The aspects of the 9th harmonic: the novile, a circle in ninths.</i>"]
        n37["Hexagram<br/><i>hexagon · Six bodies in two interlocking grand trines, the Star of David.</i>"]
        n39["Juno Focal<br/><i>crosshair · The pattern points at Juno.</i>"]
        n40["Jupiter Focal<br/><i>crosshair · The pattern points at Jupiter.</i>"]
        n41["Kite<br/><i>square · A grand trine with a fourth body opposite one of its points.</i>"]
        n43["Lilith Focal<br/><i>crosshair · The pattern points at Lilith.</i>"]
        n44["Lunar Apogee Focal<br/><i>crosshair · The pattern points at Lunar Apogee.</i>"]
        n45["Mars Focal<br/><i>crosshair · The pattern points at Mars.</i>"]
        n46["Mercury Focal<br/><i>crosshair · The pattern points at Mercury.</i>"]
        n47["Moon Focal<br/><i>crosshair · The pattern points at Moon.</i>"]
        n53["Neptune Focal<br/><i>crosshair · The pattern points at Neptune.</i>"]
        n55["North Lunar Node Focal<br/><i>crosshair · The pattern points at North Lunar Node.</i>"]
        n56["Pallas Focal<br/><i>crosshair · The pattern points at Pallas.</i>"]
        n57["Pluto Focal<br/><i>crosshair · The pattern points at Pluto.</i>"]
        n60["Saturn Focal<br/><i>crosshair · The pattern points at Saturn.</i>"]
        n63["Sun Focal<br/><i>crosshair · The pattern points at Sun.</i>"]
        n64["T Square<br/><i>triangle · Two bodies in opposition, both square a third.</i>"]
        n67["Uranus Focal<br/><i>crosshair · The pattern points at Uranus.</i>"]
        n68["Venus Focal<br/><i>crosshair · The pattern points at Venus.</i>"]
        n70["Vesta Focal<br/><i>crosshair · The pattern points at Vesta.</i>"]
        n76["Yod<br/><i>triangle · Two bodies in sextile, both quincunx a third.</i>"]
        n79["Aspect<br/><i>shapes · Angles between bodies, and the patterns they form.</i>"]
        n84["Conjunct<br/><i>star · Bodies at the same longitude, 0°: their energies merge.</i>"]
        n89["Forming<br/><i>trending-up · The bodies are approaching.</i>"]
        n91["Hard<br/><i>zap · Tense aspects, such as squares.</i>"]
        n95["Major<br/><i>star · The five classical aspects.</i>"]
        n107["Semisextile<br/><i>sparkle · Bodies 30° apart: a mild, easily missed link.</i>"]
        n110["Simple<br/><i>triangle · Aspects between two bodies.</i>"]
        n119["Triple<br/><i>triangle · Patterns of three bodies.</i>"]
        n120["Undecile<br/><i>gem · Bodies about 32.7° apart: a faint, unusual link.</i>"]
        n126["Compound<br/><i>hexagon · Patterns of three or more bodies linked by aspects.</i>"]
        n127["Decile<br/><i>gem · Bodies 36° apart: a faint, creative link.</i>"]
        n132["Exact<br/><i>circle-dot · The moment the aspect is exact.</i>"]
        n138["Minor<br/><i>sparkle · Aspects of the second rank.</i>"]
        n149["Quadruple<br/><i>square · Patterns of four bodies.</i>"]
        n153["Semisquare<br/><i>sparkle · Bodies 45° apart: a small irritation.</i>"]
        n154["Sextile<br/><i>star · Bodies 60° apart: an easy opening to cooperate.</i>"]
        n157["Soft<br/><i>waves · Easy aspects, such as trines.</i>"]
        n174["Dissolving<br/><i>trending-down · The bodies are separating.</i>"]
        n184["Nature<br/><i>scale · Whether an aspect is hard, soft or neutral.</i>"]
        n185["Neutral<br/><i>circle · Aspects that are neither.</i>"]
        n186["Novile<br/><i>gem · Bodies 40° apart: a subtle link of completion.</i>"]
        n191["Sesquiquadrate<br/><i>sparkle · Bodies 135° apart: agitation that demands release.</i>"]
        n194["Specialty<br/><i>gem · Rare aspects of higher harmonics.</i>"]
        n195["Square<br/><i>star · Bodies 90° apart: friction that pushes toward action.</i>"]
        n203["Harmonic<br/><i>audio-waveform · The harmonic of an aspect: 1 for a conjunction, 2 an opposition, 3 a trine, 4 a square, and so on.</i>"]
        n213["Quincunx<br/><i>sparkle · Bodies 150° apart: awkward, needing adjustment.</i>"]
        n214["Septile<br/><i>gem · Bodies about 51.4° apart: a fated, elusive link.</i>"]
        n215["Sextuple<br/><i>hexagon · Patterns of six bodies.</i>"]
        n217["Trine<br/><i>star · Bodies 120° apart: a harmonious flow.</i>"]
        n227["Opposite<br/><i>star · Bodies 180° apart: two sides pulling against each other.</i>"]
        n230["Phase<br/><i>hourglass · Where an aspect sits in its span: forming, exact or dissolving.</i>"]
        n231["Quintile<br/><i>gem · Bodies 72° apart: a creative, talent-making link.</i>"]
        n233["Stellium<br/><i>sparkles · Bodies bunched together, counted by how many.</i>"]
        n236["Focal Body<br/><i>crosshair · The body a pattern points at.</i>"]
        n239["Tredecile<br/><i>gem · Bodies 108° apart: a gentle, talented link.</i>"]
        n243["Biquintile<br/><i>gem · Bodies 144° apart: a creative, gifted link.</i>"]
        n233 --> n0
        n233 --> n1
        n233 --> n2
        n233 --> n3
        n236 --> n7
        n236 --> n8
        n149 --> n23
        n119 --> n24
        n203 --> n25
        n203 --> n26
        n203 --> n27
        n203 --> n28
        n203 --> n29
        n203 --> n30
        n203 --> n31
        n203 --> n32
        n203 --> n33
        n203 --> n34
        n203 --> n35
        n203 --> n36
        n215 --> n37
        n236 --> n39
        n236 --> n40
        n149 --> n41
        n236 --> n43
        n236 --> n44
        n236 --> n45
        n236 --> n46
        n236 --> n47
        n236 --> n53
        n236 --> n55
        n236 --> n56
        n236 --> n57
        n236 --> n60
        n236 --> n63
        n119 --> n64
        n236 --> n67
        n236 --> n68
        n236 --> n70
        n119 --> n76
        n95 --> n84
        n230 --> n89
        n184 --> n91
        n110 --> n95
        n138 --> n107
        n79 --> n110
        n126 --> n119
        n194 --> n120
        n79 --> n126
        n194 --> n127
        n230 --> n132
        n110 --> n138
        n126 --> n149
        n138 --> n153
        n95 --> n154
        n184 --> n157
        n230 --> n174
        n79 --> n184
        n184 --> n185
        n194 --> n186
        n138 --> n191
        n110 --> n194
        n95 --> n195
        n79 --> n203
        n138 --> n213
        n194 --> n214
        n126 --> n215
        n95 --> n217
        n95 --> n227
        n79 --> n230
        n194 --> n231
        n126 --> n233
        n79 --> n236
        n194 --> n239
        n194 --> n243
    end
    subgraph nb1["Solar"]
        n4["Autumnal Equinox<br/><i>equal · Day and night are equal, as the year turns toward winter.</i>"]
        n5["Beltane<br/><i>calendar-check · Midway from the spring equinox to the summer solstice.</i>"]
        n12["Eleventh Hexadecan<br/><i>grid-2x2 · The point 11/16 of the way round the year.</i>"]
        n20["Fifteenth Hexadecan<br/><i>grid-2x2 · The point 15/16 of the way round the year.</i>"]
        n21["Fifth Hexadecan<br/><i>grid-2x2 · The point 5/16 of the way round the year.</i>"]
        n22["First Hexadecan<br/><i>grid-2x2 · The point 1/16 of the way round the year.</i>"]
        n38["Imbolc<br/><i>calendar-check · Midway from the winter solstice to the spring equinox.</i>"]
        n42["Lammas<br/><i>calendar-check · Midway from the summer solstice to the autumn equinox.</i>"]
        n54["Ninth Hexadecan<br/><i>grid-2x2 · The point 9/16 of the way round the year.</i>"]
        n59["Samhain<br/><i>calendar-check · Midway from the autumn equinox to the winter solstice.</i>"]
        n61["Seventh Hexadecan<br/><i>grid-2x2 · The point 7/16 of the way round the year.</i>"]
        n62["Summer Solstice<br/><i>sun-medium · The longest day of the year.</i>"]
        n65["Third Hexadecan<br/><i>grid-2x2 · The point 3/16 of the way round the year.</i>"]
        n66["Thirteenth Hexadecan<br/><i>grid-2x2 · The point 13/16 of the way round the year.</i>"]
        n69["Vernal Equinox<br/><i>equal · Day and night are equal, as the year turns toward summer.</i>"]
        n75["Winter Solstice<br/><i>sun-medium · The shortest day of the year.</i>"]
        n77["Annual Cycle<br/><i>rotate-cw · The turning points of the Sun's year.</i>"]
        n113["Solstice<br/><i>sun-medium · The longest and shortest days.</i>"]
        n114["Spring<br/><i>sprout · The season from the spring equinox to the summer solstice.</i>"]
        n130["Equinox<br/><i>equal · Day and night are of equal length.</i>"]
        n151["Season<br/><i>leaf · The season of the year.</i>"]
        n159["Summer<br/><i>sun · The season from the summer solstice to the autumn equinox.</i>"]
        n169["Autumn<br/><i>leaf · The season from the autumn equinox to the winter solstice.</i>"]
        n171["Cross-Quarter Day<br/><i>calendar-check · Days midway between a solstice and an equinox.</i>"]
        n204["Hexadecan<br/><i>grid-2x2 · The sixteen divisions of the year.</i>"]
        n221["Winter<br/><i>snowflake · The season from the winter solstice to the spring equinox.</i>"]
        n229["Perihelion<br/><i>arrow-down-left · The Earth is nearest the Sun.</i>"]
        n232["Solar<br/><i>sun · The Sun's year.</i>"]
        n234["Aphelion<br/><i>arrow-up-right · The Earth is farthest from the Sun.</i>"]
        n250["Retreating<br/><i>arrow-left · The Sun's days are growing shorter.</i>"]
        n130 --> n4
        n171 --> n5
        n204 --> n12
        n204 --> n20
        n204 --> n21
        n204 --> n22
        n171 --> n38
        n171 --> n42
        n204 --> n54
        n171 --> n59
        n204 --> n61
        n113 --> n62
        n204 --> n65
        n204 --> n66
        n130 --> n69
        n113 --> n75
        n232 --> n77
        n77 --> n113
        n151 --> n114
        n77 --> n130
        n232 --> n151
        n151 --> n159
        n151 --> n169
        n77 --> n171
        n77 --> n204
        n151 --> n221
        n77 --> n229
        n77 --> n234
        n77 --> n250
    end
    subgraph nb2["Planetary"]
        n6["Brightest<br/><i>milestone · The planet shines at its brightest.</i>"]
        n9["Eastern Brightest<br/><i>refresh-cw · The planet shines brightest in the evening sky.</i>"]
        n10["Eastern Elongation<br/><i>refresh-cw · The planet stands farthest east of the Sun.</i>"]
        n11["Eastern Elongation<br/><i>refresh-cw · The planet stands farthest east of the Sun.</i>"]
        n13["Elongation<br/><i>milestone · The planet stands farthest from the Sun.</i>"]
        n14["Evening Rise<br/><i>sunrise · The planet rises in the evening.</i>"]
        n15["Evening Rise<br/><i>sunrise · The planet rises in the evening.</i>"]
        n16["Evening Set<br/><i>sunset · The planet sets in the evening.</i>"]
        n17["Evening Set<br/><i>sunset · The planet sets in the evening.</i>"]
        n18["Evening Visibility<br/><i>refresh-cw · The span the planet is seen in the evening.</i>"]
        n19["Evening Visibility<br/><i>refresh-cw · The span the planet is seen in the evening.</i>"]
        n48["Morning Rise<br/><i>sunrise · The planet rises in the morning.</i>"]
        n49["Morning Rise<br/><i>sunrise · The planet rises in the morning.</i>"]
        n50["Morning Rise<br/><i>sunrise · The planet rises in the morning.</i>"]
        n51["Morning Set<br/><i>sunset · The planet sets in the morning.</i>"]
        n52["Morning Visibility<br/><i>refresh-cw · The span the planet is seen in the morning.</i>"]
        n58["Rise and set<br/><i>milestone · The planet rises or sets with the Sun's light.</i>"]
        n71["Visibility<br/><i>milestone · The span the planet is seen at one end of the day.</i>"]
        n72["Western Brightest<br/><i>refresh-cw · The planet shines brightest in the morning sky.</i>"]
        n73["Western Brightest<br/><i>refresh-cw · The planet shines brightest in the morning sky.</i>"]
        n74["Western Elongation<br/><i>refresh-cw · The planet stands farthest west of the Sun.</i>"]
        n85["Direction<br/><i>compass · A planet's apparent direction against the stars.</i>"]
        n96["Mercurian<br/><i>refresh-cw · Mercury's cycle of visibility with the Sun.</i>"]
        n115["Station Retrograde<br/><i>undo-2 · A planet stops and turns backward.</i>"]
        n146["Phase<br/><i>refresh-cw · The phases of Mercury, Venus and Mars in their cycles with the Sun.</i>"]
        n158["Station Direct<br/><i>arrow-right · A planet stops and turns forward.</i>"]
        n163["Venusian<br/><i>refresh-cw · Venus's cycle of visibility with the Sun.</i>"]
        n181["Martian<br/><i>refresh-cw · Mars's cycle of visibility with the Sun.</i>"]
        n190["Retrograde Period<br/><i>rotate-ccw · The span a planet moves backward.</i>"]
        n196["Synodic Stage<br/><i>milestone · A planet's stage in its cycle with the Sun.</i>"]
        n210["Planetary<br/><i>orbit · The planets' own cycles.</i>"]
        n196 --> n6
        n163 --> n9
        n96 --> n10
        n163 --> n11
        n196 --> n13
        n96 --> n14
        n163 --> n15
        n96 --> n16
        n163 --> n17
        n96 --> n18
        n163 --> n19
        n181 --> n48
        n96 --> n49
        n163 --> n50
        n96 --> n51
        n96 --> n52
        n196 --> n58
        n196 --> n71
        n163 --> n72
        n96 --> n73
        n96 --> n74
        n210 --> n85
        n146 --> n96
        n85 --> n115
        n210 --> n146
        n85 --> n158
        n146 --> n163
        n146 --> n181
        n85 --> n190
        n210 --> n196
    end
    subgraph nb3["Zodiac"]
        n78["Aries<br/><i>star · The sign of the Ram, a cardinal fire sign.</i>"]
        n82["Cardinal<br/><i>repeat · Signs that start a season: Aries, Cancer, Libra, Capricorn.</i>"]
        n86["Domicile<br/><i>house · The planet sits in its home sign: strong.</i>"]
        n87["Fire<br/><i>flame · Aries, Leo and Sagittarius.</i>"]
        n88["First Decan<br/><i>layers · The first ten degrees of a sign.</i>"]
        n104["Positive<br/><i>plus · Fire and air signs: outward.</i>"]
        n108["Sign<br/><i>star · The zodiac sign a body is in.</i>"]
        n109["Sign Ingress<br/><i>log-in · A body enters a new sign, an instant.</i>"]
        n128["Earth<br/><i>mountain · Taurus, Virgo and Capricorn.</i>"]
        n129["Element<br/><i>flame · The element of a sign: fire, earth, air or water.</i>"]
        n133["Exaltation<br/><i>trending-up · The planet sits in the sign where it is honored.</i>"]
        n134["Fixed<br/><i>repeat · Signs in the middle of a season: Taurus, Leo, Scorpio, Aquarius.</i>"]
        n141["Negative<br/><i>plus · Earth and water signs: receptive.</i>"]
        n152["Second Decan<br/><i>layers · The middle ten degrees of a sign.</i>"]
        n155["Sign Transit<br/><i>log-in · A body's stay in one sign, a span.</i>"]
        n160["Taurus<br/><i>star · The sign of the Bull, a fixed earth sign.</i>"]
        n167["Air<br/><i>wind · Gemini, Libra and Aquarius.</i>"]
        n172["Decan Ingress<br/><i>log-in · A body enters a new decan of a sign.</i>"]
        n173["Detriment<br/><i>trending-down · The planet sits opposite its home sign: weak.</i>"]
        n178["Gemini<br/><i>star · The sign of the Twins, a mutable air sign.</i>"]
        n182["Modality<br/><i>repeat · The modality of a sign: cardinal, fixed or mutable.</i>"]
        n183["Mutable<br/><i>repeat · Signs that end a season: Gemini, Virgo, Sagittarius, Pisces.</i>"]
        n197["Third Decan<br/><i>layers · The last ten degrees of a sign.</i>"]
        n199["Zodiac<br/><i>star · The signs and what they imply.</i>"]
        n200["Cancer<br/><i>star · The sign of the Crab, a cardinal water sign.</i>"]
        n202["Fall<br/><i>arrow-down · The planet sits opposite its exaltation: lowered.</i>"]
        n208["Peak Ingress<br/><i>log-in · A body reaches the midpoint of a sign.</i>"]
        n212["Polarity<br/><i>plus · The polarity of a sign: positive or negative.</i>"]
        n219["Water<br/><i>droplets · Cancer, Scorpio and Pisces.</i>"]
        n224["Decan<br/><i>layers · The ten-degree third of a sign a body is in.</i>"]
        n226["Leo<br/><i>star · The sign of the Lion, a fixed fire sign.</i>"]
        n228["Peregrine<br/><i>compass · The planet holds no dignity or debility in the sign.</i>"]
        n235["Dignity<br/><i>crown · How strongly a planet sits in its sign.</i>"]
        n240["Virgo<br/><i>star · The sign of the Maiden, a mutable earth sign.</i>"]
        n245["Ingress<br/><i>log-in · A body enters a sign, or a decan of one.</i>"]
        n247["Libra<br/><i>star · The sign of the Scales, a cardinal air sign.</i>"]
        n251["Scorpio<br/><i>star · The sign of the Scorpion, a fixed water sign.</i>"]
        n254["Sagittarius<br/><i>star · The sign of the Archer, a mutable fire sign.</i>"]
        n256["Capricorn<br/><i>star · The sign of the Sea-Goat, a cardinal earth sign.</i>"]
        n258["Aquarius<br/><i>star · The sign of the Water Bearer, a fixed air sign.</i>"]
        n259["Pisces<br/><i>star · The sign of the Fish, a mutable water sign.</i>"]
        n108 --> n78
        n182 --> n82
        n235 --> n86
        n129 --> n87
        n224 --> n88
        n212 --> n104
        n199 --> n108
        n245 --> n109
        n129 --> n128
        n199 --> n129
        n235 --> n133
        n182 --> n134
        n212 --> n141
        n224 --> n152
        n245 --> n155
        n108 --> n160
        n129 --> n167
        n245 --> n172
        n235 --> n173
        n108 --> n178
        n199 --> n182
        n182 --> n183
        n224 --> n197
        n108 --> n200
        n235 --> n202
        n245 --> n208
        n199 --> n212
        n129 --> n219
        n199 --> n224
        n108 --> n226
        n235 --> n228
        n199 --> n235
        n108 --> n240
        n199 --> n245
        n108 --> n247
        n108 --> n251
        n108 --> n254
        n108 --> n256
        n108 --> n258
        n108 --> n259
    end
    subgraph nb4["Daily"]
        n80["Astronomical Dawn<br/><i>sunrise · The Sun is 18° below the horizon, rising: the sky begins to lighten.</i>"]
        n99["Morning<br/><i>sunrise · The twilight falls before the Sun rises.</i>"]
        n105["Rise<br/><i>sunrise · The Sun crosses the horizon upward.</i>"]
        n106["Rise<br/><i>sunrise · The Moon crosses the horizon upward.</i>"]
        n112["Solar Cycle<br/><i>sun · The Sun's day: rise, zenith, set and nadir.</i>"]
        n131["Evening<br/><i>sunset · The twilight falls after the Sun has set.</i>"]
        n136["Lunar Cycle<br/><i>moon · The Moon's day: rise, zenith, set and nadir.</i>"]
        n140["Nautical Dawn<br/><i>sunrise · The Sun is 12° below the horizon, rising: the horizon shows at sea.</i>"]
        n165["Zenith<br/><i>arrow-up-to-line · The Sun's highest point.</i>"]
        n166["Zenith<br/><i>arrow-up-to-line · The Moon's highest point.</i>"]
        n170["Civil Dawn<br/><i>sunrise · The Sun is 6° below the horizon, rising: light enough to see outdoors.</i>"]
        n192["Set<br/><i>sunset · The Moon crosses the horizon downward.</i>"]
        n193["Set<br/><i>sunset · The Sun crosses the horizon downward.</i>"]
        n198["Twilight<br/><i>cloud-sun · The stages between day and night.</i>"]
        n201["Daylight<br/><i>sun · The Sun is above the horizon.</i>"]
        n206["Nadir<br/><i>arrow-down-to-line · The Sun's lowest point.</i>"]
        n207["Nadir<br/><i>arrow-down-to-line · The Moon's lowest point.</i>"]
        n216["Time of Day<br/><i>clock · Whether a twilight falls in the morning or the evening.</i>"]
        n223["Civil Dusk<br/><i>sunset · The Sun is 6° below the horizon, setting: lights are needed outdoors.</i>"]
        n238["Nautical Dusk<br/><i>sunset · The Sun is 12° below the horizon, setting: the sea horizon fades.</i>"]
        n242["Astronomical Dusk<br/><i>sunset · The Sun is 18° below the horizon, setting: the sky is fully dark.</i>"]
        n244["Daily<br/><i>clock · Events that repeat every day.</i>"]
        n249["Night<br/><i>moon · The Sun is more than 18° below the horizon.</i>"]
        n253["Astronomical Twilight<br/><i>cloud-sun · The span between 18° and 12° below the horizon.</i>"]
        n257["Nautical Twilight<br/><i>cloud-sun · The span between 12° and 6° below the horizon.</i>"]
        n198 --> n80
        n216 --> n99
        n112 --> n105
        n136 --> n106
        n244 --> n112
        n216 --> n131
        n244 --> n136
        n198 --> n140
        n112 --> n165
        n136 --> n166
        n198 --> n170
        n136 --> n192
        n112 --> n193
        n244 --> n198
        n198 --> n201
        n112 --> n206
        n136 --> n207
        n244 --> n216
        n198 --> n223
        n198 --> n238
        n198 --> n242
        n198 --> n249
        n198 --> n253
        n198 --> n257
    end
    subgraph nb5["Eclipse"]
        n81["Beginning<br/><i>circle-play · The eclipse begins.</i>"]
        n90["Geocentric<br/><i>globe · From the Earth's center.</i>"]
        n111["Solar<br/><i>sun · The Moon covers the Sun.</i>"]
        n117["Total<br/><i>circle · The whole Moon enters the Earth's shadow.</i>"]
        n118["Total<br/><i>circle · The Moon covers the whole Sun.</i>"]
        n122["Annular<br/><i>sun · The Moon is too far to cover the Sun, leaving a ring.</i>"]
        n135["Lunar<br/><i>moon · The Earth's shadow falls on the Moon.</i>"]
        n137["Maximum<br/><i>maximize · The eclipse is at its greatest.</i>"]
        n145["Partial<br/><i>contrast · Only part of the Moon enters the Earth's shadow.</i>"]
        n161["Topocentric<br/><i>map-pin · From the observer's place.</i>"]
        n175["Ending<br/><i>circle-stop · The eclipse ends.</i>"]
        n177["Frame<br/><i>scan · What an eclipse is measured from.</i>"]
        n188["Partial<br/><i>contrast · The Moon covers only part of the Sun.</i>"]
        n209["Phase<br/><i>hourglass · Where an eclipse is: beginning, maximum or ending.</i>"]
        n248["Eclipse<br/><i>eclipse · Solar and lunar eclipses.</i>"]
        n209 --> n81
        n177 --> n90
        n248 --> n111
        n135 --> n117
        n111 --> n118
        n111 --> n122
        n248 --> n135
        n209 --> n137
        n135 --> n145
        n177 --> n161
        n209 --> n175
        n248 --> n177
        n111 --> n188
        n248 --> n209
    end
    subgraph nb6["Body"]
        n83["Ceres<br/><i>mountain · The asteroid of nurture and harvest.</i>"]
        n92["Jupiter<br/><i>users · The planet of growth and good fortune.</i>"]
        n93["Lilith<br/><i>map-pin · The Moon's far point, the black moon.</i>"]
        n94["Luminary<br/><i>sun-moon · The Sun and the Moon.</i>"]
        n97["Mercury<br/><i>user · The planet of mind and messages.</i>"]
        n103["Personal<br/><i>user · Mercury, Venus and Mars.</i>"]
        n116["Sun<br/><i>sun · The star at the center, ruling identity and vitality.</i>"]
        n121["Uranus<br/><i>telescope · The planet of change and surprise.</i>"]
        n125["Body<br/><i>globe · The bodies an event involves, grouped by class.</i>"]
        n139["Moon<br/><i>moon · The Earth's satellite, ruling mood and rhythm.</i>"]
        n142["Neptune<br/><i>telescope · The planet of dreams and dissolution.</i>"]
        n143["North Lunar Node<br/><i>map-pin · Where the Moon crosses the ecliptic heading north.</i>"]
        n144["Pallas<br/><i>mountain · The asteroid of strategy and wisdom.</i>"]
        n147["Planet<br/><i>earth · The planets, by how far they reach.</i>"]
        n150["Saturn<br/><i>users · The planet of structure and limits.</i>"]
        n156["Social<br/><i>users · Jupiter and Saturn.</i>"]
        n162["Venus<br/><i>user · The planet of love and value.</i>"]
        n168["Asteroid<br/><i>mountain · Asteroids and Chiron.</i>"]
        n179["Juno<br/><i>mountain · The asteroid of partnership and commitment.</i>"]
        n180["Mars<br/><i>user · The planet of drive and conflict.</i>"]
        n187["Outer<br/><i>telescope · Uranus, Neptune and Pluto.</i>"]
        n189["Pluto<br/><i>telescope · The dwarf planet of transformation.</i>"]
        n205["Lunar Apogee<br/><i>map-pin · The point where the Moon is farthest from the Earth.</i>"]
        n211["Point<br/><i>map-pin · Calculated points: Lilith, the lunar nodes and apsides.</i>"]
        n218["Vesta<br/><i>mountain · The asteroid of devotion and focus.</i>"]
        n222["Chiron<br/><i>mountain · The wounded healer, between Saturn and Uranus.</i>"]
        n168 --> n83
        n156 --> n92
        n211 --> n93
        n125 --> n94
        n103 --> n97
        n147 --> n103
        n94 --> n116
        n187 --> n121
        n94 --> n139
        n187 --> n142
        n211 --> n143
        n168 --> n144
        n125 --> n147
        n156 --> n150
        n147 --> n156
        n103 --> n162
        n125 --> n168
        n168 --> n179
        n103 --> n180
        n147 --> n187
        n187 --> n189
        n211 --> n205
        n125 --> n211
        n168 --> n218
        n168 --> n222
    end
    subgraph nb7["Lunar"]
        n98["Monthly Cycle<br/><i>moon-star · The Moon's phases through the month.</i>"]
        n100["New<br/><i>circle-dot · The Moon is between the Earth and the Sun, dark.</i>"]
        n102["Perigee<br/><i>arrow-down · The Moon is nearest the Earth.</i>"]
        n123["Apogee<br/><i>arrow-up · The Moon is farthest from the Earth.</i>"]
        n124["Apsides<br/><i>orbit · The Moon's nearest and farthest points from the Earth.</i>"]
        n164["Waxing Crescent<br/><i>moon-star · A thin crescent, growing from new.</i>"]
        n176["First Quarter<br/><i>contrast · Half the Moon is lit, waxing.</i>"]
        n220["Waxing Gibbous<br/><i>moon-star · More than half lit, growing to full.</i>"]
        n225["Full<br/><i>circle · The whole face of the Moon is lit.</i>"]
        n237["Lunar<br/><i>moon · The Moon's month and orbit.</i>"]
        n241["Waning Gibbous<br/><i>moon-star · More than half lit, shrinking from full.</i>"]
        n246["Last Quarter<br/><i>moon-star · Half the Moon is lit, waning.</i>"]
        n252["Waning Crescent<br/><i>moon-star · A thin crescent, shrinking to new.</i>"]
        n237 --> n98
        n98 --> n100
        n124 --> n102
        n124 --> n123
        n237 --> n124
        n98 --> n164
        n98 --> n176
        n98 --> n220
        n98 --> n225
        n98 --> n241
        n98 --> n246
        n98 --> n252
    end
    subgraph nb8["Temporality"]
        n101["Perfective<br/><i>zap · An instant in time.</i>"]
        n148["Progressive<br/><i>hourglass · Progressing over a duration of time.</i>"]
        n255["Temporality<br/><i>timer · Whether an event is an instant or progresses over time.</i>"]
        n255 --> n101
        n255 --> n148
    end
    class n79 root
    class n125 root
    class n199 root
    class n210 root
    class n232 root
    class n237 root
    class n244 root
    class n248 root
    class n255 root
```
