```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5
    subgraph nb0["Aspect"]
        n0["4 Body"]
        n1["5 Body"]
        n2["6 Body"]
        n3["7 Body"]
        n7["Ceres Focal"]
        n8["Chiron Focal"]
        n23["Grand Cross"]
        n24["Grand Trine"]
        n25["Harmonic 1"]
        n26["Harmonic 10"]
        n27["Harmonic 11"]
        n28["Harmonic 12"]
        n29["Harmonic 2"]
        n30["Harmonic 3"]
        n31["Harmonic 4"]
        n32["Harmonic 5"]
        n33["Harmonic 6"]
        n34["Harmonic 7"]
        n35["Harmonic 8"]
        n36["Harmonic 9"]
        n37["Hexagram"]
        n39["Juno Focal"]
        n40["Jupiter Focal"]
        n41["Kite"]
        n43["Lilith Focal"]
        n44["Lunar Apogee Focal"]
        n45["Mars Focal"]
        n46["Mercury Focal"]
        n47["Moon Focal"]
        n53["Neptune Focal"]
        n55["North Lunar Node Focal"]
        n56["Pallas Focal"]
        n57["Pluto Focal"]
        n60["Saturn Focal"]
        n63["Sun Focal"]
        n64["T Square"]
        n67["Uranus Focal"]
        n68["Venus Focal"]
        n70["Vesta Focal"]
        n76["Yod"]
        n79["Aspect<br/><i>shapes · Angles between bodies, and the patterns they form.</i>"]
        n84["Conjunct"]
        n89["Forming<br/><i>trending-up · The bodies are approaching.</i>"]
        n91["Hard<br/><i>zap · Tense aspects, such as squares.</i>"]
        n95["Major<br/><i>star · The five classical aspects.</i>"]
        n107["Semisextile"]
        n110["Simple<br/><i>triangle · Aspects between two bodies.</i>"]
        n119["Triple<br/><i>triangle · Patterns of three bodies.</i>"]
        n120["Undecile"]
        n126["Compound<br/><i>hexagon · Patterns of three or more bodies linked by aspects.</i>"]
        n127["Decile"]
        n132["Exact<br/><i>circle-dot · The moment the aspect is exact.</i>"]
        n139["Minor<br/><i>sparkle · Aspects of the second rank.</i>"]
        n149["Quadruple<br/><i>square · Patterns of four bodies.</i>"]
        n153["Semisquare"]
        n154["Sextile"]
        n156["Soft<br/><i>waves · Easy aspects, such as trines.</i>"]
        n172["Dissolving<br/><i>trending-down · The bodies are separating.</i>"]
        n182["Nature<br/><i>scale · Whether an aspect is hard, soft or neutral.</i>"]
        n183["Neutral<br/><i>circle · Aspects that are neither.</i>"]
        n184["Novile"]
        n188["Sesquiquadrate"]
        n192["Specialty<br/><i>gem · Rare aspects of higher harmonics.</i>"]
        n193["Square"]
        n201["Harmonic<br/><i>audio-waveform · The harmonic of an aspect: 1 for a conjunction, 2 an opposition, 3 a trine, 4 a square, and so on.</i>"]
        n210["Quincunx"]
        n211["Septile"]
        n212["Sextuple<br/><i>hexagon · Patterns of six bodies.</i>"]
        n214["Trine"]
        n225["Opposite"]
        n228["Phase<br/><i>hourglass · Where an aspect sits in its span: forming, exact or dissolving.</i>"]
        n229["Quintile"]
        n231["Stellium<br/><i>sparkles · Bodies bunched together, counted by how many.</i>"]
        n234["Focal Body<br/><i>crosshair · The body a pattern points at.</i>"]
        n238["Tredecile"]
        n242["Biquintile"]
        n231 --> n0
        n231 --> n1
        n231 --> n2
        n231 --> n3
        n234 --> n7
        n234 --> n8
        n149 --> n23
        n119 --> n24
        n201 --> n25
        n201 --> n26
        n201 --> n27
        n201 --> n28
        n201 --> n29
        n201 --> n30
        n201 --> n31
        n201 --> n32
        n201 --> n33
        n201 --> n34
        n201 --> n35
        n201 --> n36
        n212 --> n37
        n234 --> n39
        n234 --> n40
        n149 --> n41
        n234 --> n43
        n234 --> n44
        n234 --> n45
        n234 --> n46
        n234 --> n47
        n234 --> n53
        n234 --> n55
        n234 --> n56
        n234 --> n57
        n234 --> n60
        n234 --> n63
        n119 --> n64
        n234 --> n67
        n234 --> n68
        n234 --> n70
        n119 --> n76
        n95 --> n84
        n228 --> n89
        n182 --> n91
        n110 --> n95
        n139 --> n107
        n79 --> n110
        n126 --> n119
        n192 --> n120
        n79 --> n126
        n192 --> n127
        n228 --> n132
        n110 --> n139
        n126 --> n149
        n139 --> n153
        n95 --> n154
        n182 --> n156
        n228 --> n172
        n79 --> n182
        n182 --> n183
        n192 --> n184
        n139 --> n188
        n110 --> n192
        n95 --> n193
        n79 --> n201
        n139 --> n210
        n192 --> n211
        n126 --> n212
        n95 --> n214
        n95 --> n225
        n79 --> n228
        n192 --> n229
        n126 --> n231
        n79 --> n234
        n192 --> n238
        n192 --> n242
    end
    subgraph nb1["Solar"]
        n4["Autumnal Equinox"]
        n5["Beltane"]
        n12["Eleventh Hexadecan"]
        n20["Fifteenth Hexadecan"]
        n21["Fifth Hexadecan"]
        n22["First Hexadecan"]
        n38["Imbolc"]
        n42["Lammas"]
        n54["Ninth Hexadecan"]
        n59["Samhain"]
        n61["Seventh Hexadecan"]
        n62["Summer Solstice"]
        n65["Third Hexadecan"]
        n66["Thirteenth Hexadecan"]
        n69["Vernal Equinox"]
        n75["Winter Solstice"]
        n77["Annual Cycle<br/><i>rotate-cw · The turning points of the Sun's year.</i>"]
        n113["Solstice<br/><i>sun-medium · The longest and shortest days.</i>"]
        n114["Spring"]
        n130["Equinox<br/><i>equal · Day and night are of equal length.</i>"]
        n151["Season<br/><i>leaf · The season of the year.</i>"]
        n158["Summer"]
        n167["Autumn"]
        n169["Cross-Quarter Day<br/><i>calendar-check · Days midway between a solstice and an equinox.</i>"]
        n202["Hexadecan<br/><i>grid-2x2 · The sixteen divisions of the year.</i>"]
        n218["Winter"]
        n227["Perihelion"]
        n230["Solar<br/><i>sun · The Sun's year.</i>"]
        n232["Aphelion"]
        n250["Retreating"]
        n130 --> n4
        n169 --> n5
        n202 --> n12
        n202 --> n20
        n202 --> n21
        n202 --> n22
        n169 --> n38
        n169 --> n42
        n202 --> n54
        n169 --> n59
        n202 --> n61
        n113 --> n62
        n202 --> n65
        n202 --> n66
        n130 --> n69
        n113 --> n75
        n230 --> n77
        n77 --> n113
        n151 --> n114
        n77 --> n130
        n230 --> n151
        n151 --> n158
        n151 --> n167
        n77 --> n169
        n77 --> n202
        n151 --> n218
        n77 --> n227
        n77 --> n232
        n77 --> n250
    end
    subgraph nb2["Planetary"]
        n6["Brightest"]
        n9["Eastern Brightest"]
        n10["Eastern Elongation"]
        n11["Eastern Elongation"]
        n13["Elongation"]
        n14["Evening Rise"]
        n15["Evening Rise"]
        n16["Evening Set"]
        n17["Evening Set"]
        n18["Evening Visibility"]
        n19["Evening Visibility"]
        n48["Morning Rise"]
        n49["Morning Rise"]
        n50["Morning Rise"]
        n51["Morning Set"]
        n52["Morning Visibility"]
        n58["Rise and set"]
        n71["Visibility"]
        n72["Western Brightest"]
        n73["Western Brightest"]
        n74["Western Elongation"]
        n85["Direction<br/><i>compass · A planet's apparent direction against the stars.</i>"]
        n96["Mercurian"]
        n115["Station Retrograde<br/><i>undo-2 · A planet stops and turns backward.</i>"]
        n147["Phase<br/><i>refresh-cw · The phases of Mercury, Venus and Mars in their cycles with the Sun.</i>"]
        n157["Station Direct<br/><i>arrow-right · A planet stops and turns forward.</i>"]
        n162["Venusian"]
        n179["Martian"]
        n187["Retrograde Period<br/><i>rotate-ccw · The span a planet moves backward.</i>"]
        n194["Synodic Stage<br/><i>milestone · A planet's stage in its cycle with the Sun.</i>"]
        n208["Planetary<br/><i>orbit · The planets' own cycles.</i>"]
        n194 --> n6
        n162 --> n9
        n96 --> n10
        n162 --> n11
        n194 --> n13
        n96 --> n14
        n162 --> n15
        n96 --> n16
        n162 --> n17
        n96 --> n18
        n162 --> n19
        n179 --> n48
        n96 --> n49
        n162 --> n50
        n96 --> n51
        n96 --> n52
        n194 --> n58
        n194 --> n71
        n162 --> n72
        n96 --> n73
        n96 --> n74
        n208 --> n85
        n147 --> n96
        n85 --> n115
        n208 --> n147
        n85 --> n157
        n147 --> n162
        n147 --> n179
        n85 --> n187
        n208 --> n194
    end
    subgraph nb3["Zodiac"]
        n78["Aries"]
        n82["Cardinal"]
        n86["Domicile"]
        n87["Fire<br/><i>flame · Aries, Leo and Sagittarius.</i>"]
        n88["First Decan"]
        n104["Positive"]
        n108["Sign<br/><i>star · The zodiac sign a body is in.</i>"]
        n109["Sign Ingress"]
        n128["Earth<br/><i>mountain · Taurus, Virgo and Capricorn.</i>"]
        n129["Element<br/><i>flame · The element of a sign: fire, earth, air or water.</i>"]
        n133["Exaltation"]
        n134["Fixed"]
        n142["Negative"]
        n152["Second Decan"]
        n155["Sign Transit"]
        n159["Taurus"]
        n166["Air<br/><i>wind · Gemini, Libra and Aquarius.</i>"]
        n170["Decan Ingress"]
        n171["Detriment"]
        n176["Gemini"]
        n180["Modality<br/><i>repeat · The modality of a sign: cardinal, fixed or mutable.</i>"]
        n181["Mutable"]
        n195["Third Decan"]
        n197["Zodiac<br/><i>star · The signs and what they imply.</i>"]
        n198["Cancer"]
        n200["Fall"]
        n206["Peak Ingress"]
        n209["Polarity<br/><i>plus · The polarity of a sign: positive or negative.</i>"]
        n216["Water<br/><i>droplets · Cancer, Scorpio and Pisces.</i>"]
        n222["Decan<br/><i>layers · The ten-degree third of a sign a body is in.</i>"]
        n224["Leo"]
        n226["Peregrine"]
        n233["Dignity<br/><i>crown · How strongly a planet sits in its sign.</i>"]
        n239["Virgo"]
        n244["Ingress<br/><i>log-in · A body enters a sign, or a decan of one.</i>"]
        n246["Libra"]
        n251["Scorpio"]
        n254["Sagittarius"]
        n256["Capricorn"]
        n258["Aquarius"]
        n259["Pisces"]
        n108 --> n78
        n180 --> n82
        n233 --> n86
        n129 --> n87
        n222 --> n88
        n209 --> n104
        n197 --> n108
        n244 --> n109
        n129 --> n128
        n197 --> n129
        n233 --> n133
        n180 --> n134
        n209 --> n142
        n222 --> n152
        n244 --> n155
        n108 --> n159
        n129 --> n166
        n244 --> n170
        n233 --> n171
        n108 --> n176
        n197 --> n180
        n180 --> n181
        n222 --> n195
        n108 --> n198
        n233 --> n200
        n244 --> n206
        n197 --> n209
        n129 --> n216
        n197 --> n222
        n108 --> n224
        n233 --> n226
        n197 --> n233
        n108 --> n239
        n197 --> n244
        n108 --> n246
        n108 --> n251
        n108 --> n254
        n108 --> n256
        n108 --> n258
        n108 --> n259
    end
    subgraph nb4["Daily"]
        n80["Astronomical Dawn"]
        n99["Morning"]
        n105["Rise<br/><i>sunrise · The Sun crosses the horizon upward.</i>"]
        n106["Rise<br/><i>sunrise · The Moon crosses the horizon upward.</i>"]
        n112["Solar Cycle<br/><i>sun · The Sun's day: rise, zenith, set and nadir.</i>"]
        n131["Evening"]
        n137["Lunar Cycle<br/><i>moon · The Moon's day: rise, zenith, set and nadir.</i>"]
        n141["Nautical Dawn"]
        n164["Zenith<br/><i>arrow-up-to-line · The Sun's highest point.</i>"]
        n165["Zenith<br/><i>arrow-up-to-line · The Moon's highest point.</i>"]
        n168["Civil Dawn"]
        n189["Set<br/><i>sunset · The Moon crosses the horizon downward.</i>"]
        n190["Set<br/><i>sunset · The Sun crosses the horizon downward.</i>"]
        n196["Twilight<br/><i>cloud-sun · The stages between day and night.</i>"]
        n199["Daylight"]
        n203["Nadir<br/><i>arrow-down-to-line · The Sun's lowest point.</i>"]
        n204["Nadir<br/><i>arrow-down-to-line · The Moon's lowest point.</i>"]
        n213["Time of Day<br/><i>clock · Whether a twilight falls in the morning or the evening.</i>"]
        n221["Civil Dusk"]
        n236["Nautical Dusk"]
        n241["Astronomical Dusk"]
        n243["Daily<br/><i>clock · Events that repeat every day.</i>"]
        n249["Night"]
        n253["Astronomical Twilight"]
        n257["Nautical Twilight"]
        n196 --> n80
        n213 --> n99
        n112 --> n105
        n137 --> n106
        n243 --> n112
        n213 --> n131
        n243 --> n137
        n196 --> n141
        n112 --> n164
        n137 --> n165
        n196 --> n168
        n137 --> n189
        n112 --> n190
        n243 --> n196
        n196 --> n199
        n112 --> n203
        n137 --> n204
        n243 --> n213
        n196 --> n221
        n196 --> n236
        n196 --> n241
        n196 --> n249
        n196 --> n253
        n196 --> n257
    end
    subgraph nb5["Eclipse"]
        n81["Beginning"]
        n90["Geocentric<br/><i>globe · From the Earth's center.</i>"]
        n111["Solar<br/><i>sun · The Moon covers the Sun.</i>"]
        n117["Total"]
        n118["Total"]
        n122["Annular"]
        n135["Lunar<br/><i>moon · The Earth's shadow falls on the Moon.</i>"]
        n138["Maximum"]
        n145["Partial"]
        n160["Topocentric<br/><i>map-pin · From the observer's place.</i>"]
        n173["Ending"]
        n175["Frame<br/><i>scan · What an eclipse is measured from.</i>"]
        n185["Partial"]
        n207["Phase<br/><i>hourglass · Where an eclipse is: beginning, maximum or ending.</i>"]
        n248["Eclipse<br/><i>eclipse · Solar and lunar eclipses.</i>"]
        n207 --> n81
        n175 --> n90
        n248 --> n111
        n135 --> n117
        n111 --> n118
        n111 --> n122
        n248 --> n135
        n207 --> n138
        n135 --> n145
        n175 --> n160
        n207 --> n173
        n248 --> n175
        n111 --> n185
        n248 --> n207
    end
    subgraph nb6["Body"]
        n83["Ceres"]
        n92["Jupiter"]
        n93["Lilith"]
        n94["Luminary<br/><i>sun-moon · The Sun and the Moon.</i>"]
        n97["Mercury"]
        n101["North Lunar Node"]
        n116["Sun"]
        n121["Uranus"]
        n125["Body<br/><i>globe · The bodies an event involves, grouped by class.</i>"]
        n136["Lunar Apogee"]
        n140["Moon"]
        n143["Neptune"]
        n144["Pallas"]
        n146["Personal<br/><i>user · Mercury, Venus and Mars.</i>"]
        n150["Saturn"]
        n161["Venus"]
        n177["Juno"]
        n178["Mars"]
        n186["Pluto"]
        n191["Social<br/><i>users · Jupiter and Saturn.</i>"]
        n205["Outer<br/><i>telescope · Uranus, Neptune and Pluto.</i>"]
        n215["Vesta"]
        n219["Asteroid<br/><i>mountain · Asteroids and Chiron.</i>"]
        n220["Chiron"]
        n237["Node<br/><i>waypoints · The lunar nodes, where the Moon crosses the ecliptic.</i>"]
        n247["Point<br/><i>map-pin · Calculated points: Lilith and the lunar apsides.</i>"]
        n219 --> n83
        n191 --> n92
        n247 --> n93
        n125 --> n94
        n146 --> n97
        n237 --> n101
        n94 --> n116
        n205 --> n121
        n247 --> n136
        n94 --> n140
        n205 --> n143
        n219 --> n144
        n125 --> n146
        n191 --> n150
        n146 --> n161
        n219 --> n177
        n146 --> n178
        n205 --> n186
        n125 --> n191
        n125 --> n205
        n219 --> n215
        n125 --> n219
        n219 --> n220
        n125 --> n237
        n125 --> n247
    end
    subgraph nb7["Lunar"]
        n98["Monthly Cycle<br/><i>moon-star · The Moon's phases through the month.</i>"]
        n100["New"]
        n103["Perigee<br/><i>arrow-down · The Moon is nearest the Earth.</i>"]
        n123["Apogee<br/><i>arrow-up · The Moon is farthest from the Earth.</i>"]
        n124["Apsides<br/><i>orbit · The Moon's nearest and farthest points from the Earth.</i>"]
        n163["Waxing Crescent"]
        n174["First Quarter"]
        n217["Waxing Gibbous"]
        n223["Full"]
        n235["Lunar<br/><i>moon · The Moon's month and orbit.</i>"]
        n240["Waning Gibbous"]
        n245["Last Quarter"]
        n252["Waning Crescent"]
        n235 --> n98
        n98 --> n100
        n124 --> n103
        n124 --> n123
        n235 --> n124
        n98 --> n163
        n98 --> n174
        n98 --> n217
        n98 --> n223
        n98 --> n240
        n98 --> n245
        n98 --> n252
    end
    subgraph nb8["Temporality"]
        n102["Perfective<br/><i>zap · An instant in time.</i>"]
        n148["Progressive<br/><i>hourglass · Progressing over a duration of time.</i>"]
        n255["Temporality<br/><i>timer · Whether an event is an instant or progresses over time.</i>"]
        n255 --> n102
        n255 --> n148
    end
    class n79 root
    class n125 root
    class n197 root
    class n208 root
    class n230 root
    class n235 root
    class n243 root
    class n248 root
    class n255 root
```
