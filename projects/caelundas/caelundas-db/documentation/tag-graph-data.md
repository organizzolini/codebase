```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5
    subgraph nb0["Aspect"]
        n0["Aspect"]
        n1["Harmonic"]
        n2["Nature"]
        n3["Focal Body"]
        n4["Phase"]
        n5["Compound"]
        n6["Simple"]
        n44["Harmonic 4"]
        n45["Harmonic 12"]
        n46["Harmonic 11"]
        n47["Harmonic 5"]
        n48["Harmonic 9"]
        n49["Harmonic 10"]
        n50["Harmonic 6"]
        n51["Harmonic 8"]
        n52["Harmonic 1"]
        n53["Harmonic 7"]
        n54["Harmonic 2"]
        n55["Harmonic 3"]
        n56["Hard"]
        n57["Neutral"]
        n58["Soft"]
        n59["Chiron Focal"]
        n60["Venus Focal"]
        n61["Moon Focal"]
        n62["Ceres Focal"]
        n63["Juno Focal"]
        n64["Jupiter Focal"]
        n65["Saturn Focal"]
        n66["Neptune Focal"]
        n67["Uranus Focal"]
        n68["Pluto Focal"]
        n69["Lunar Apogee Focal"]
        n70["Lilith Focal"]
        n71["Pallas Focal"]
        n72["Mercury Focal"]
        n73["Mars Focal"]
        n74["Sun Focal"]
        n75["North Lunar Node Focal"]
        n76["Vesta Focal"]
        n77["Forming"]
        n78["Dissolving"]
        n79["Exact"]
        n91["Triple"]
        n92["Quadruple"]
        n93["Stellium"]
        n94["Sextuple"]
        n105["Minor"]
        n106["Specialty"]
        n107["Major"]
        n212["T Square"]
        n213["Grand Cross"]
        n214["Square"]
        n215["Sesquiquadrate"]
        n216["Semisquare"]
        n217["Opposite"]
        n218["Yod"]
        n219["Grand Trine"]
        n220["Kite"]
        n221["Quincunx"]
        n222["Semisextile"]
        n223["Undecile"]
        n224["Conjunct"]
        n225["Septile"]
        n226["Quintile"]
        n227["Novile"]
        n228["Tredecile"]
        n229["Decile"]
        n230["Biquintile"]
        n231["Sextile"]
        n232["Trine"]
        n233["Hexagram"]
        n234["4 Body"]
        n235["5 Body"]
        n236["6 Body"]
        n237["7 Body"]
        n238["3 Body"]
        n0 --> n1
        n0 --> n2
        n0 --> n3
        n0 --> n4
        n0 --> n5
        n0 --> n6
        n1 --> n44
        n1 --> n45
        n1 --> n46
        n1 --> n47
        n1 --> n48
        n1 --> n49
        n1 --> n50
        n1 --> n51
        n1 --> n52
        n1 --> n53
        n1 --> n54
        n1 --> n55
        n2 --> n56
        n2 --> n57
        n2 --> n58
        n3 --> n59
        n3 --> n60
        n3 --> n61
        n3 --> n62
        n3 --> n63
        n3 --> n64
        n3 --> n65
        n3 --> n66
        n3 --> n67
        n3 --> n68
        n3 --> n69
        n3 --> n70
        n3 --> n71
        n3 --> n72
        n3 --> n73
        n3 --> n74
        n3 --> n75
        n3 --> n76
        n4 --> n77
        n4 --> n78
        n4 --> n79
        n5 --> n91
        n5 --> n92
        n5 --> n93
        n5 --> n94
        n6 --> n105
        n6 --> n106
        n6 --> n107
        n44 --> n212
        n44 --> n213
        n44 --> n214
        n56 --> n212
        n56 --> n213
        n56 --> n214
        n56 --> n215
        n56 --> n216
        n56 --> n217
        n91 --> n212
        n91 --> n218
        n91 --> n219
        n92 --> n213
        n92 --> n220
        n45 --> n218
        n45 --> n221
        n45 --> n222
        n57 --> n93
        n57 --> n218
        n57 --> n221
        n57 --> n223
        n57 --> n224
        n57 --> n225
        n105 --> n221
        n105 --> n215
        n105 --> n216
        n105 --> n222
        n46 --> n223
        n106 --> n223
        n106 --> n226
        n106 --> n227
        n106 --> n228
        n106 --> n225
        n106 --> n229
        n106 --> n230
        n47 --> n226
        n47 --> n230
        n58 --> n226
        n58 --> n227
        n58 --> n228
        n58 --> n231
        n58 --> n222
        n58 --> n229
        n58 --> n230
        n58 --> n232
        n58 --> n219
        n58 --> n220
        n58 --> n233
        n48 --> n227
        n49 --> n228
        n49 --> n229
        n107 --> n214
        n107 --> n231
        n107 --> n224
        n107 --> n217
        n107 --> n232
        n50 --> n231
        n50 --> n220
        n50 --> n233
        n51 --> n215
        n51 --> n216
        n52 --> n93
        n52 --> n224
        n53 --> n225
        n54 --> n217
        n55 --> n232
        n55 --> n219
        n93 --> n234
        n93 --> n235
        n93 --> n236
        n93 --> n237
        n93 --> n238
        n94 --> n233
    end
    subgraph nb1["Body"]
        n7["Body"]
        n8["Asteroid"]
        n9["Luminary"]
        n10["Point"]
        n11["Planet"]
        n80["Chiron"]
        n81["Juno"]
        n82["Ceres"]
        n83["Vesta"]
        n84["Pallas"]
        n85["Moon"]
        n86["Sun"]
        n87["Outer"]
        n88["Pluto"]
        n89["Uranus"]
        n90["Neptune"]
        n95["Personal"]
        n96["Venus"]
        n97["Mars"]
        n98["Mercury"]
        n99["Social"]
        n100["Jupiter"]
        n101["Saturn"]
        n102["Lunar Apogee"]
        n103["North Lunar Node"]
        n104["Lilith"]
        n282["Malefic"]
        n283["Benefic"]
        n7 --> n8
        n7 --> n9
        n7 --> n10
        n7 --> n11
        n8 --> n80
        n8 --> n81
        n8 --> n82
        n8 --> n83
        n8 --> n84
        n9 --> n85
        n9 --> n86
        n87 --> n88
        n87 --> n89
        n87 --> n90
        n95 --> n96
        n95 --> n97
        n95 --> n98
        n99 --> n100
        n99 --> n101
        n10 --> n102
        n10 --> n103
        n10 --> n104
        n11 --> n87
        n11 --> n95
        n11 --> n99
        n11 --> n282
        n11 --> n283
        n282 --> n97
        n282 --> n101
        n283 --> n96
        n283 --> n100
    end
    subgraph nb2["Temporality"]
        n12["Temporality"]
        n13["Perfective"]
        n14["Progressive"]
        n12 --> n13
        n12 --> n14
    end
    subgraph nb3["Daily"]
        n15["Daily"]
        n16["Solar Cycle"]
        n17["Lunar Cycle"]
        n18["Twilight"]
        n19["Time of Day"]
        n108["Nadir"]
        n109["Rise"]
        n110["Zenith"]
        n111["Set"]
        n147["Set"]
        n148["Nadir"]
        n149["Rise"]
        n150["Zenith"]
        n151["Moon Up"]
        n152["Astronomical Dawn"]
        n153["Astronomical Twilight"]
        n154["Nautical Dawn"]
        n155["Nautical Twilight"]
        n156["Civil Dawn"]
        n157["Daylight"]
        n158["Civil Dusk"]
        n159["Nautical Dusk"]
        n160["Astronomical Dusk"]
        n161["Night"]
        n162["Morning"]
        n163["Evening"]
        n15 --> n16
        n15 --> n17
        n15 --> n18
        n15 --> n19
        n16 --> n108
        n16 --> n109
        n16 --> n110
        n16 --> n111
        n17 --> n147
        n17 --> n148
        n17 --> n149
        n17 --> n150
        n17 --> n151
        n18 --> n152
        n18 --> n153
        n18 --> n154
        n18 --> n155
        n18 --> n156
        n18 --> n157
        n18 --> n158
        n18 --> n159
        n18 --> n160
        n18 --> n161
        n19 --> n162
        n19 --> n163
    end
    subgraph nb4["Zodiac"]
        n20["Zodiac"]
        n21["Decan"]
        n22["Dignity"]
        n23["Element"]
        n24["Modality"]
        n25["Polarity"]
        n26["Sign"]
        n27["Ingress"]
        n28["Peak"]
        n112["Second Decan"]
        n113["Third Decan"]
        n114["First Decan"]
        n115["Peregrine"]
        n116["Domicile"]
        n117["Exaltation"]
        n118["Fall"]
        n119["Detriment"]
        n120["Air"]
        n121["Earth"]
        n122["Fire"]
        n123["Water"]
        n124["Mutable"]
        n125["Cardinal"]
        n126["Fixed"]
        n127["Positive"]
        n128["Negative"]
        n129["Gemini"]
        n130["Capricorn"]
        n131["Sagittarius"]
        n132["Cancer"]
        n133["Leo"]
        n134["Virgo"]
        n135["Libra"]
        n136["Scorpio"]
        n137["Aquarius"]
        n138["Aries"]
        n139["Pisces"]
        n140["Taurus"]
        n141["Decan Ingress"]
        n142["Peak Ingress"]
        n143["Sign Ingress"]
        n144["Sign Transit"]
        n145["Peak Transit"]
        n146["Decan Transit"]
        n284["After Peak"]
        n285["Before Peak"]
        n20 --> n21
        n20 --> n22
        n20 --> n23
        n20 --> n24
        n20 --> n25
        n20 --> n26
        n20 --> n27
        n20 --> n28
        n21 --> n112
        n21 --> n113
        n21 --> n114
        n22 --> n115
        n22 --> n116
        n22 --> n117
        n22 --> n118
        n22 --> n119
        n23 --> n120
        n23 --> n121
        n23 --> n122
        n23 --> n123
        n24 --> n124
        n24 --> n125
        n24 --> n126
        n25 --> n127
        n25 --> n128
        n26 --> n129
        n26 --> n130
        n26 --> n131
        n26 --> n132
        n26 --> n133
        n26 --> n134
        n26 --> n135
        n26 --> n136
        n26 --> n137
        n26 --> n138
        n26 --> n139
        n26 --> n140
        n27 --> n141
        n27 --> n142
        n27 --> n143
        n27 --> n144
        n27 --> n145
        n27 --> n146
        n120 --> n129
        n120 --> n135
        n120 --> n137
        n124 --> n129
        n124 --> n131
        n124 --> n134
        n124 --> n139
        n127 --> n129
        n127 --> n131
        n127 --> n133
        n127 --> n135
        n127 --> n137
        n127 --> n138
        n121 --> n130
        n121 --> n134
        n121 --> n140
        n125 --> n130
        n125 --> n132
        n125 --> n135
        n125 --> n138
        n128 --> n130
        n128 --> n132
        n128 --> n134
        n128 --> n136
        n128 --> n139
        n128 --> n140
        n122 --> n131
        n122 --> n133
        n122 --> n138
        n123 --> n132
        n123 --> n136
        n123 --> n139
        n126 --> n133
        n126 --> n136
        n126 --> n137
        n126 --> n140
        n28 --> n284
        n28 --> n285
    end
    subgraph nb5["Lunar"]
        n29["Lunar"]
        n30["Apsides"]
        n31["Monthly Cycle"]
        n164["Perigee"]
        n165["Apogee"]
        n166["Advancing"]
        n167["Retreating"]
        n172["Full"]
        n173["Waning Gibbous"]
        n174["Last Quarter"]
        n175["Waning Crescent"]
        n176["New"]
        n177["Waxing Crescent"]
        n178["First Quarter"]
        n179["Waxing Gibbous"]
        n29 --> n30
        n29 --> n31
        n30 --> n164
        n30 --> n165
        n30 --> n166
        n30 --> n167
        n31 --> n172
        n31 --> n173
        n31 --> n174
        n31 --> n175
        n31 --> n176
        n31 --> n177
        n31 --> n178
        n31 --> n179
    end
    subgraph nb6["Planetary"]
        n32["Planetary"]
        n33["Direction"]
        n34["Synodic Stage"]
        n35["Phase"]
        n168["Station Direct"]
        n169["Station Retrograde"]
        n170["Retrograde Period"]
        n171["Direct Period"]
        n189["Rise and set"]
        n190["Visibility"]
        n191["Elongation"]
        n192["Brightest"]
        n193["Widening"]
        n194["Closing"]
        n195["Mercurian"]
        n196["Venusian"]
        n197["Martian"]
        n239["Morning Set"]
        n240["Evening Rise"]
        n241["Evening Visibility"]
        n242["Eastern Elongation"]
        n243["Evening Set"]
        n244["Morning Rise"]
        n245["Morning Visibility"]
        n246["Western Elongation"]
        n247["Western Brightest"]
        n248["Morning Widening"]
        n249["Morning Closing"]
        n250["Evening Widening"]
        n251["Evening Closing"]
        n262["Evening Rise"]
        n263["Evening Visibility"]
        n264["Eastern Elongation"]
        n265["Eastern Brightest"]
        n266["Evening Set"]
        n267["Morning Rise"]
        n268["Western Brightest"]
        n269["Evening Widening"]
        n270["Evening Closing"]
        n271["Morning Visibility"]
        n272["Morning Widening"]
        n273["Morning Closing"]
        n274["Morning Rise"]
        n275["Morning Widening"]
        n32 --> n33
        n32 --> n34
        n32 --> n35
        n33 --> n168
        n33 --> n169
        n33 --> n170
        n33 --> n171
        n34 --> n189
        n34 --> n190
        n34 --> n191
        n34 --> n192
        n34 --> n193
        n34 --> n194
        n35 --> n195
        n35 --> n196
        n35 --> n197
        n195 --> n239
        n195 --> n240
        n195 --> n241
        n195 --> n242
        n195 --> n243
        n195 --> n244
        n195 --> n245
        n195 --> n246
        n195 --> n247
        n195 --> n248
        n195 --> n249
        n195 --> n250
        n195 --> n251
        n196 --> n262
        n196 --> n263
        n196 --> n264
        n196 --> n265
        n196 --> n266
        n196 --> n267
        n196 --> n268
        n196 --> n269
        n196 --> n270
        n196 --> n271
        n196 --> n272
        n196 --> n273
        n197 --> n274
        n197 --> n275
    end
    subgraph nb7["Solar"]
        n36["Solar"]
        n37["Annual Cycle"]
        n38["Season"]
        n180["Perihelion"]
        n181["Retreating"]
        n182["Hexadecan"]
        n183["Cross-Quarter Day"]
        n184["Equinox"]
        n185["Solstice"]
        n186["Aphelion"]
        n187["Advancing"]
        n188["Interval"]
        n198["Winter"]
        n199["Spring"]
        n200["Summer"]
        n201["Autumn"]
        n252["Thirteenth Hexadecan"]
        n253["Imbolc"]
        n254["Fifteenth Hexadecan"]
        n255["Winter Solstice"]
        n256["First Hexadecan"]
        n257["Third Hexadecan"]
        n258["Fifth Hexadecan"]
        n259["Seventh Hexadecan"]
        n260["Ninth Hexadecan"]
        n261["Eleventh Hexadecan"]
        n276["Beltane"]
        n277["Lammas"]
        n278["Samhain"]
        n279["Vernal Equinox"]
        n280["Autumnal Equinox"]
        n281["Summer Solstice"]
        n286["Post-Winter Solstice"]
        n287["Pre-Imbolc"]
        n288["Post-Imbolc"]
        n289["Pre-Vernal Equinox"]
        n290["Post-Vernal Equinox"]
        n291["Pre-Beltane"]
        n292["Post-Beltane"]
        n293["Pre-Summer Solstice"]
        n294["Post-Summer Solstice"]
        n295["Pre-Lammas"]
        n296["Post-Lammas"]
        n297["Pre-Autumnal Equinox"]
        n298["Post-Autumnal Equinox"]
        n299["Pre-Samhain"]
        n300["Post-Samhain"]
        n301["Pre-Winter Solstice"]
        n36 --> n37
        n36 --> n38
        n37 --> n180
        n37 --> n181
        n37 --> n182
        n37 --> n183
        n37 --> n184
        n37 --> n185
        n37 --> n186
        n37 --> n187
        n37 --> n188
        n38 --> n198
        n38 --> n199
        n38 --> n200
        n38 --> n201
        n198 --> n252
        n198 --> n253
        n198 --> n254
        n198 --> n255
        n182 --> n252
        n182 --> n254
        n182 --> n256
        n182 --> n257
        n182 --> n258
        n182 --> n259
        n182 --> n260
        n182 --> n261
        n183 --> n253
        n183 --> n276
        n183 --> n277
        n183 --> n278
        n199 --> n279
        n199 --> n256
        n199 --> n276
        n199 --> n257
        n184 --> n279
        n184 --> n280
        n200 --> n281
        n200 --> n258
        n200 --> n277
        n200 --> n259
        n185 --> n281
        n185 --> n255
        n201 --> n280
        n201 --> n260
        n201 --> n278
        n201 --> n261
        n188 --> n286
        n188 --> n287
        n188 --> n288
        n188 --> n289
        n188 --> n290
        n188 --> n291
        n188 --> n292
        n188 --> n293
        n188 --> n294
        n188 --> n295
        n188 --> n296
        n188 --> n297
        n188 --> n298
        n188 --> n299
        n188 --> n300
        n188 --> n301
    end
    subgraph nb8["Eclipse"]
        n39["Eclipse"]
        n40["Frame"]
        n41["Phase"]
        n42["Solar"]
        n43["Lunar"]
        n202["Geocentric"]
        n203["Topocentric"]
        n204["Beginning"]
        n205["Maximum"]
        n206["Ending"]
        n207["Annular"]
        n208["Total"]
        n209["Partial"]
        n210["Total"]
        n211["Partial"]
        n39 --> n40
        n39 --> n41
        n39 --> n42
        n39 --> n43
        n40 --> n202
        n40 --> n203
        n41 --> n204
        n41 --> n205
        n41 --> n206
        n42 --> n207
        n42 --> n208
        n42 --> n209
        n43 --> n210
        n43 --> n211
    end
    class n0 root
    class n7 root
    class n12 root
    class n15 root
    class n20 root
    class n29 root
    class n32 root
    class n36 root
    class n39 root
```
