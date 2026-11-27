```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef truncation fill:#f5f5f5,stroke:#9e9e9e,stroke-dasharray:5 5
    subgraph nb0["Aspect"]
        n0["Aspect"]
        n1["Harmonic"]
        n2["Nature"]
        n3["Phase"]
        n4["Compound"]
        n5["Simple"]
        n54["Harmonic 4"]
        n55["Harmonic 12"]
        n56["Harmonic 11"]
        n57["Harmonic 5"]
        n58["Harmonic 9"]
        n59["Harmonic 10"]
        n60["Harmonic 6"]
        n61["Harmonic 8"]
        n62["Harmonic 1"]
        n63["Harmonic 7"]
        n64["Harmonic 2"]
        n65["Harmonic 3"]
        n66["Hard"]
        n67["Neutral"]
        n68["Soft"]
        n69["Focal Body"]
        n70["Chiron Focal"]
        n71["Venus Focal"]
        n72["Moon Focal"]
        n73["Ceres Focal"]
        n74["Juno Focal"]
        n75["Jupiter Focal"]
        n76["Saturn Focal"]
        n77["Neptune Focal"]
        n78["Uranus Focal"]
        n79["Pluto Focal"]
        n80["Lunar Apogee Focal"]
        n81["Lilith Focal"]
        n82["Pallas Focal"]
        n83["Mercury Focal"]
        n84["Mars Focal"]
        n85["Sun Focal"]
        n86["North Lunar Node Focal"]
        n87["Vesta Focal"]
        n88["Forming"]
        n89["Dissolving"]
        n90["Exact"]
        n102["Triple"]
        n103["Quadruple"]
        n104["Stellium"]
        n105["Sextuple"]
        n116["Minor"]
        n117["Specialty"]
        n118["Major"]
        n208["T Square"]
        n209["Grand Cross"]
        n210["Square"]
        n211["Sesquiquadrate"]
        n212["Semisquare"]
        n213["Opposite"]
        n214["Yod"]
        n215["Grand Trine"]
        n216["Kite"]
        n217["Quincunx"]
        n218["Semisextile"]
        n219["Undecile"]
        n220["Conjunct"]
        n221["Septile"]
        n222["Quintile"]
        n223["Novile"]
        n224["Tredecile"]
        n225["Decile"]
        n226["Biquintile"]
        n227["Sextile"]
        n228["Trine"]
        n229["Hexagram"]
        n230["4 Body"]
        n231["5 Body"]
        n232["6 Body"]
        n233["7 Body"]
        n234["3 Body"]
        n0 --> n1
        n0 --> n2
        n0 --> n3
        n0 --> n4
        n0 --> n5
        n1 --> n54
        n1 --> n55
        n1 --> n56
        n1 --> n57
        n1 --> n58
        n1 --> n59
        n1 --> n60
        n1 --> n61
        n1 --> n62
        n1 --> n63
        n1 --> n64
        n1 --> n65
        n2 --> n66
        n2 --> n67
        n2 --> n68
        n69 --> n70
        n69 --> n71
        n69 --> n72
        n69 --> n73
        n69 --> n74
        n69 --> n75
        n69 --> n76
        n69 --> n77
        n69 --> n78
        n69 --> n79
        n69 --> n80
        n69 --> n81
        n69 --> n82
        n69 --> n83
        n69 --> n84
        n69 --> n85
        n69 --> n86
        n69 --> n87
        n3 --> n88
        n3 --> n89
        n3 --> n90
        n4 --> n69
        n4 --> n102
        n4 --> n103
        n4 --> n104
        n4 --> n105
        n5 --> n116
        n5 --> n117
        n5 --> n118
        n54 --> n208
        n54 --> n209
        n54 --> n210
        n66 --> n208
        n66 --> n209
        n66 --> n210
        n66 --> n211
        n66 --> n212
        n66 --> n213
        n102 --> n208
        n102 --> n214
        n102 --> n215
        n103 --> n209
        n103 --> n216
        n55 --> n214
        n55 --> n217
        n55 --> n218
        n67 --> n104
        n67 --> n214
        n67 --> n217
        n67 --> n219
        n67 --> n220
        n67 --> n221
        n116 --> n217
        n116 --> n211
        n116 --> n212
        n116 --> n218
        n56 --> n219
        n117 --> n219
        n117 --> n222
        n117 --> n223
        n117 --> n224
        n117 --> n221
        n117 --> n225
        n117 --> n226
        n57 --> n222
        n57 --> n226
        n68 --> n222
        n68 --> n223
        n68 --> n224
        n68 --> n227
        n68 --> n218
        n68 --> n225
        n68 --> n226
        n68 --> n228
        n68 --> n215
        n68 --> n216
        n68 --> n229
        n58 --> n223
        n59 --> n224
        n59 --> n225
        n118 --> n210
        n118 --> n227
        n118 --> n220
        n118 --> n213
        n118 --> n228
        n60 --> n227
        n60 --> n216
        n60 --> n229
        n61 --> n211
        n61 --> n212
        n62 --> n104
        n62 --> n220
        n63 --> n221
        n64 --> n213
        n65 --> n228
        n65 --> n215
        n104 --> n230
        n104 --> n231
        n104 --> n232
        n104 --> n233
        n104 --> n234
        n105 --> n229
    end
    subgraph nb1["Body"]
        n6["Body"]
        n7["Asteroid"]
        n8["Luminary"]
        n9["Point"]
        n10["Planet"]
        n91["Chiron"]
        n92["Juno"]
        n93["Ceres"]
        n94["Vesta"]
        n95["Pallas"]
        n96["Moon"]
        n97["Sun"]
        n98["Outer"]
        n99["Pluto"]
        n100["Uranus"]
        n101["Neptune"]
        n106["Personal"]
        n107["Venus"]
        n108["Mars"]
        n109["Mercury"]
        n110["Social"]
        n111["Jupiter"]
        n112["Saturn"]
        n113["Lunar Apogee"]
        n114["North Lunar Node"]
        n115["Lilith"]
        n278["Malefic"]
        n279["Benefic"]
        n6 --> n7
        n6 --> n8
        n6 --> n9
        n6 --> n10
        n7 --> n91
        n7 --> n92
        n7 --> n93
        n7 --> n94
        n7 --> n95
        n8 --> n96
        n8 --> n97
        n98 --> n99
        n98 --> n100
        n98 --> n101
        n106 --> n107
        n106 --> n108
        n106 --> n109
        n110 --> n111
        n110 --> n112
        n9 --> n113
        n9 --> n114
        n9 --> n115
        n10 --> n98
        n10 --> n106
        n10 --> n110
        n10 --> n278
        n10 --> n279
        n278 --> n108
        n278 --> n112
        n279 --> n107
        n279 --> n111
    end
    subgraph nb2["Temporality"]
        n11["Temporality"]
        n12["Perfective"]
        n13["Progressive"]
        n11 --> n12
        n11 --> n13
    end
    subgraph nb3["Daily"]
        n14["Daily"]
        n15["Solar Cycle"]
        n16["Lunar Cycle"]
        n17["Twilight"]
        n18["Time of Day"]
        n119["Nadir"]
        n120["Rise"]
        n121["Zenith"]
        n122["Set"]
        n146["Set"]
        n147["Nadir"]
        n148["Rise"]
        n149["Zenith"]
        n150["Moon Up"]
        n151["Astronomical Dawn"]
        n152["Astronomical Twilight"]
        n153["Nautical Dawn"]
        n154["Nautical Twilight"]
        n155["Civil Dawn"]
        n156["Daylight"]
        n157["Civil Dusk"]
        n158["Nautical Dusk"]
        n159["Astronomical Dusk"]
        n160["Night"]
        n161["Morning"]
        n162["Evening"]
        n14 --> n15
        n14 --> n16
        n14 --> n17
        n14 --> n18
        n15 --> n119
        n15 --> n120
        n15 --> n121
        n15 --> n122
        n16 --> n146
        n16 --> n147
        n16 --> n148
        n16 --> n149
        n16 --> n150
        n17 --> n151
        n17 --> n152
        n17 --> n153
        n17 --> n154
        n17 --> n155
        n17 --> n156
        n17 --> n157
        n17 --> n158
        n17 --> n159
        n17 --> n160
        n18 --> n161
        n18 --> n162
    end
    subgraph nb4["Sign"]
        n19["Sign"]
        n20["Decan"]
        n21["Dignity"]
        n22["Element"]
        n23["Modality"]
        n24["Polarity"]
        n25["Ingress"]
        n26["Gemini"]
        n27["Capricorn"]
        n28["Sagittarius"]
        n29["Cancer"]
        n30["Leo"]
        n31["Virgo"]
        n32["Libra"]
        n33["Scorpio"]
        n34["Aquarius"]
        n35["Aries"]
        n36["Pisces"]
        n37["Taurus"]
        n38["Peak"]
        n123["Second Decan"]
        n124["Third Decan"]
        n125["First Decan"]
        n126["Peregrine"]
        n127["Domicile"]
        n128["Exaltation"]
        n129["Fall"]
        n130["Detriment"]
        n131["Air"]
        n132["Earth"]
        n133["Fire"]
        n134["Water"]
        n135["Mutable"]
        n136["Cardinal"]
        n137["Fixed"]
        n138["Positive"]
        n139["Negative"]
        n140["Decan Ingress"]
        n141["Peak Ingress"]
        n142["Sign Ingress"]
        n143["Sign Transit"]
        n144["Peak Transit"]
        n145["Decan Transit"]
        n280["After Peak"]
        n281["Before Peak"]
        n19 --> n20
        n19 --> n21
        n19 --> n22
        n19 --> n23
        n19 --> n24
        n19 --> n25
        n19 --> n26
        n19 --> n27
        n19 --> n28
        n19 --> n29
        n19 --> n30
        n19 --> n31
        n19 --> n32
        n19 --> n33
        n19 --> n34
        n19 --> n35
        n19 --> n36
        n19 --> n37
        n19 --> n38
        n20 --> n123
        n20 --> n124
        n20 --> n125
        n21 --> n126
        n21 --> n127
        n21 --> n128
        n21 --> n129
        n21 --> n130
        n22 --> n131
        n22 --> n132
        n22 --> n133
        n22 --> n134
        n23 --> n135
        n23 --> n136
        n23 --> n137
        n24 --> n138
        n24 --> n139
        n25 --> n140
        n25 --> n141
        n25 --> n142
        n25 --> n143
        n25 --> n144
        n25 --> n145
        n131 --> n26
        n131 --> n32
        n131 --> n34
        n135 --> n26
        n135 --> n28
        n135 --> n31
        n135 --> n36
        n138 --> n26
        n138 --> n28
        n138 --> n30
        n138 --> n32
        n138 --> n34
        n138 --> n35
        n132 --> n27
        n132 --> n31
        n132 --> n37
        n136 --> n27
        n136 --> n29
        n136 --> n32
        n136 --> n35
        n139 --> n27
        n139 --> n29
        n139 --> n31
        n139 --> n33
        n139 --> n36
        n139 --> n37
        n133 --> n28
        n133 --> n30
        n133 --> n35
        n134 --> n29
        n134 --> n33
        n134 --> n36
        n137 --> n30
        n137 --> n33
        n137 --> n34
        n137 --> n37
        n38 --> n280
        n38 --> n281
    end
    subgraph nb5["Lunar"]
        n39["Lunar"]
        n40["Apsides"]
        n41["Monthly Cycle"]
        n163["Perigee"]
        n164["Apogee"]
        n165["Advancing"]
        n166["Retreating"]
        n171["Full"]
        n172["Waning Gibbous"]
        n173["Last Quarter"]
        n174["Waning Crescent"]
        n175["New"]
        n176["Waxing Crescent"]
        n177["First Quarter"]
        n178["Waxing Gibbous"]
        n39 --> n40
        n39 --> n41
        n40 --> n163
        n40 --> n164
        n40 --> n165
        n40 --> n166
        n41 --> n171
        n41 --> n172
        n41 --> n173
        n41 --> n174
        n41 --> n175
        n41 --> n176
        n41 --> n177
        n41 --> n178
    end
    subgraph nb6["Planetary"]
        n42["Planetary"]
        n43["Direction"]
        n44["Synodic Stage"]
        n45["Phase"]
        n167["Station Direct"]
        n168["Station Retrograde"]
        n169["Retrograde Period"]
        n170["Direct Period"]
        n188["Mars"]
        n189["Mercury"]
        n190["Venus"]
        n191["Mercurian"]
        n192["Venusian"]
        n193["Martian"]
        n235["Morning Set"]
        n236["Evening Rise"]
        n237["Evening Visibility"]
        n238["Eastern Elongation"]
        n239["Evening Set"]
        n240["Morning Rise"]
        n241["Morning Visibility"]
        n242["Western Elongation"]
        n243["Western Brightest"]
        n244["Morning Widening"]
        n245["Morning Closing"]
        n246["Evening Widening"]
        n247["Evening Closing"]
        n258["Evening Rise"]
        n259["Evening Visibility"]
        n260["Eastern Elongation"]
        n261["Eastern Brightest"]
        n262["Evening Set"]
        n263["Morning Rise"]
        n264["Western Brightest"]
        n265["Evening Widening"]
        n266["Evening Closing"]
        n267["Morning Visibility"]
        n268["Morning Widening"]
        n269["Morning Closing"]
        n270["Morning Rise"]
        n271["Morning Widening"]
        n298["Rise and set"]
        n299["Widening"]
        n300["Conjunction"]
        n301["Visibility"]
        n302["Station"]
        n303["Opposition"]
        n304["Brightest"]
        n305["Closing"]
        n306["Visibility"]
        n307["Elongation"]
        n308["Brightest"]
        n309["Closing"]
        n310["Widening"]
        n311["Conjunction"]
        n312["Rise and set"]
        n313["Brightest"]
        n314["Closing"]
        n315["Visibility"]
        n316["Widening"]
        n317["Conjunction"]
        n318["Rise and set"]
        n319["Station"]
        n320["Elongation"]
        n42 --> n43
        n42 --> n44
        n42 --> n45
        n43 --> n167
        n43 --> n168
        n43 --> n169
        n43 --> n170
        n44 --> n188
        n44 --> n189
        n44 --> n190
        n45 --> n191
        n45 --> n192
        n45 --> n193
        n191 --> n235
        n191 --> n236
        n191 --> n237
        n191 --> n238
        n191 --> n239
        n191 --> n240
        n191 --> n241
        n191 --> n242
        n191 --> n243
        n191 --> n244
        n191 --> n245
        n191 --> n246
        n191 --> n247
        n192 --> n258
        n192 --> n259
        n192 --> n260
        n192 --> n261
        n192 --> n262
        n192 --> n263
        n192 --> n264
        n192 --> n265
        n192 --> n266
        n192 --> n267
        n192 --> n268
        n192 --> n269
        n193 --> n270
        n193 --> n271
        n188 --> n298
        n188 --> n299
        n188 --> n300
        n188 --> n301
        n188 --> n302
        n188 --> n303
        n188 --> n304
        n188 --> n305
        n189 --> n306
        n189 --> n307
        n189 --> n308
        n189 --> n309
        n189 --> n310
        n189 --> n311
        n189 --> n312
        n190 --> n313
        n190 --> n314
        n190 --> n315
        n190 --> n316
        n190 --> n317
        n190 --> n318
        n190 --> n319
        n190 --> n320
    end
    subgraph nb7["Solar"]
        n46["Solar"]
        n47["Annual Cycle"]
        n48["Season"]
        n179["Perihelion"]
        n180["Retreating"]
        n181["Hexadecan"]
        n182["Cross-Quarter Day"]
        n183["Equinox"]
        n184["Solstice"]
        n185["Aphelion"]
        n186["Advancing"]
        n187["Interval"]
        n194["Winter"]
        n195["Spring"]
        n196["Summer"]
        n197["Autumn"]
        n248["Thirteenth Hexadecan"]
        n249["Imbolc"]
        n250["Fifteenth Hexadecan"]
        n251["Winter Solstice"]
        n252["First Hexadecan"]
        n253["Third Hexadecan"]
        n254["Fifth Hexadecan"]
        n255["Seventh Hexadecan"]
        n256["Ninth Hexadecan"]
        n257["Eleventh Hexadecan"]
        n272["Beltane"]
        n273["Lammas"]
        n274["Samhain"]
        n275["Vernal Equinox"]
        n276["Autumnal Equinox"]
        n277["Summer Solstice"]
        n282["Post-Winter Solstice"]
        n283["Pre-Imbolc"]
        n284["Post-Imbolc"]
        n285["Pre-Vernal Equinox"]
        n286["Post-Vernal Equinox"]
        n287["Pre-Beltane"]
        n288["Post-Beltane"]
        n289["Pre-Summer Solstice"]
        n290["Post-Summer Solstice"]
        n291["Pre-Lammas"]
        n292["Post-Lammas"]
        n293["Pre-Autumnal Equinox"]
        n294["Post-Autumnal Equinox"]
        n295["Pre-Samhain"]
        n296["Post-Samhain"]
        n297["Pre-Winter Solstice"]
        n46 --> n47
        n46 --> n48
        n47 --> n179
        n47 --> n180
        n47 --> n181
        n47 --> n182
        n47 --> n183
        n47 --> n184
        n47 --> n185
        n47 --> n186
        n47 --> n187
        n48 --> n194
        n48 --> n195
        n48 --> n196
        n48 --> n197
        n194 --> n248
        n194 --> n249
        n194 --> n250
        n194 --> n251
        n181 --> n248
        n181 --> n250
        n181 --> n252
        n181 --> n253
        n181 --> n254
        n181 --> n255
        n181 --> n256
        n181 --> n257
        n182 --> n249
        n182 --> n272
        n182 --> n273
        n182 --> n274
        n195 --> n275
        n195 --> n252
        n195 --> n272
        n195 --> n253
        n183 --> n275
        n183 --> n276
        n196 --> n277
        n196 --> n254
        n196 --> n273
        n196 --> n255
        n184 --> n277
        n184 --> n251
        n197 --> n276
        n197 --> n256
        n197 --> n274
        n197 --> n257
        n187 --> n282
        n187 --> n283
        n187 --> n284
        n187 --> n285
        n187 --> n286
        n187 --> n287
        n187 --> n288
        n187 --> n289
        n187 --> n290
        n187 --> n291
        n187 --> n292
        n187 --> n293
        n187 --> n294
        n187 --> n295
        n187 --> n296
        n187 --> n297
    end
    subgraph nb8["Eclipse"]
        n49["Eclipse"]
        n50["Frame"]
        n51["Phase"]
        n52["Solar"]
        n53["Lunar"]
        n198["Geocentric"]
        n199["Topocentric"]
        n200["Beginning"]
        n201["Maximum"]
        n202["Ending"]
        n203["Annular"]
        n204["Total"]
        n205["Partial"]
        n206["Total"]
        n207["Partial"]
        n49 --> n50
        n49 --> n51
        n49 --> n52
        n49 --> n53
        n50 --> n198
        n50 --> n199
        n51 --> n200
        n51 --> n201
        n51 --> n202
        n52 --> n203
        n52 --> n204
        n52 --> n205
        n53 --> n206
        n53 --> n207
    end
    subgraph nb9["Duration"]
        n321["Duration"]
        n322["Minutes"]
        n323["Hours"]
        n324["Days"]
        n325["Weeks"]
        n326["Months"]
        n327["Quarters"]
        n328["Years"]
        n329["Decades"]
        n330["Centuries"]
        n321 --> n322
        n321 --> n323
        n321 --> n324
        n321 --> n325
        n321 --> n326
        n321 --> n327
        n321 --> n328
        n321 --> n329
        n321 --> n330
    end
    class n0 root
    class n6 root
    class n11 root
    class n14 root
    class n19 root
    class n39 root
    class n42 root
    class n46 root
    class n49 root
    class n321 root
```
