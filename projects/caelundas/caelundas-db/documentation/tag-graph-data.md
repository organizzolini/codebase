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
        n43["Harmonic 4"]
        n44["Harmonic 12"]
        n45["Harmonic 11"]
        n46["Harmonic 5"]
        n47["Harmonic 9"]
        n48["Harmonic 10"]
        n49["Harmonic 6"]
        n50["Harmonic 8"]
        n51["Harmonic 1"]
        n52["Harmonic 7"]
        n53["Harmonic 2"]
        n54["Harmonic 3"]
        n55["Hard"]
        n56["Neutral"]
        n57["Soft"]
        n58["Focal Body"]
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
        n209["T Square"]
        n210["Grand Cross"]
        n211["Square"]
        n212["Sesquiquadrate"]
        n213["Semisquare"]
        n214["Opposite"]
        n215["Yod"]
        n216["Grand Trine"]
        n217["Kite"]
        n218["Quincunx"]
        n219["Semisextile"]
        n220["Undecile"]
        n221["Conjunct"]
        n222["Septile"]
        n223["Quintile"]
        n224["Novile"]
        n225["Tredecile"]
        n226["Decile"]
        n227["Biquintile"]
        n228["Sextile"]
        n229["Trine"]
        n230["Hexagram"]
        n231["4 Body"]
        n232["5 Body"]
        n233["6 Body"]
        n234["7 Body"]
        n235["3 Body"]
        n0 --> n1
        n0 --> n2
        n0 --> n3
        n0 --> n4
        n0 --> n5
        n1 --> n43
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
        n2 --> n55
        n2 --> n56
        n2 --> n57
        n58 --> n59
        n58 --> n60
        n58 --> n61
        n58 --> n62
        n58 --> n63
        n58 --> n64
        n58 --> n65
        n58 --> n66
        n58 --> n67
        n58 --> n68
        n58 --> n69
        n58 --> n70
        n58 --> n71
        n58 --> n72
        n58 --> n73
        n58 --> n74
        n58 --> n75
        n58 --> n76
        n3 --> n77
        n3 --> n78
        n3 --> n79
        n4 --> n58
        n4 --> n91
        n4 --> n92
        n4 --> n93
        n4 --> n94
        n5 --> n105
        n5 --> n106
        n5 --> n107
        n43 --> n209
        n43 --> n210
        n43 --> n211
        n55 --> n209
        n55 --> n210
        n55 --> n211
        n55 --> n212
        n55 --> n213
        n55 --> n214
        n91 --> n209
        n91 --> n215
        n91 --> n216
        n92 --> n210
        n92 --> n217
        n44 --> n215
        n44 --> n218
        n44 --> n219
        n56 --> n93
        n56 --> n215
        n56 --> n218
        n56 --> n220
        n56 --> n221
        n56 --> n222
        n105 --> n218
        n105 --> n212
        n105 --> n213
        n105 --> n219
        n45 --> n220
        n106 --> n220
        n106 --> n223
        n106 --> n224
        n106 --> n225
        n106 --> n222
        n106 --> n226
        n106 --> n227
        n46 --> n223
        n46 --> n227
        n57 --> n223
        n57 --> n224
        n57 --> n225
        n57 --> n228
        n57 --> n219
        n57 --> n226
        n57 --> n227
        n57 --> n229
        n57 --> n216
        n57 --> n217
        n57 --> n230
        n47 --> n224
        n48 --> n225
        n48 --> n226
        n107 --> n211
        n107 --> n228
        n107 --> n221
        n107 --> n214
        n107 --> n229
        n49 --> n228
        n49 --> n217
        n49 --> n230
        n50 --> n212
        n50 --> n213
        n51 --> n93
        n51 --> n221
        n52 --> n222
        n53 --> n214
        n54 --> n229
        n54 --> n216
        n93 --> n231
        n93 --> n232
        n93 --> n233
        n93 --> n234
        n93 --> n235
        n94 --> n230
    end
    subgraph nb1["Body"]
        n6["Body"]
        n7["Asteroid"]
        n8["Luminary"]
        n9["Point"]
        n10["Planet"]
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
        n279["Malefic"]
        n280["Benefic"]
        n6 --> n7
        n6 --> n8
        n6 --> n9
        n6 --> n10
        n7 --> n80
        n7 --> n81
        n7 --> n82
        n7 --> n83
        n7 --> n84
        n8 --> n85
        n8 --> n86
        n87 --> n88
        n87 --> n89
        n87 --> n90
        n95 --> n96
        n95 --> n97
        n95 --> n98
        n99 --> n100
        n99 --> n101
        n9 --> n102
        n9 --> n103
        n9 --> n104
        n10 --> n87
        n10 --> n95
        n10 --> n99
        n10 --> n279
        n10 --> n280
        n279 --> n97
        n279 --> n101
        n280 --> n96
        n280 --> n100
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
        n14 --> n15
        n14 --> n16
        n14 --> n17
        n14 --> n18
        n15 --> n108
        n15 --> n109
        n15 --> n110
        n15 --> n111
        n16 --> n147
        n16 --> n148
        n16 --> n149
        n16 --> n150
        n16 --> n151
        n17 --> n152
        n17 --> n153
        n17 --> n154
        n17 --> n155
        n17 --> n156
        n17 --> n157
        n17 --> n158
        n17 --> n159
        n17 --> n160
        n17 --> n161
        n18 --> n162
        n18 --> n163
    end
    subgraph nb4["Sign"]
        n19["Sign"]
        n20["Decan"]
        n21["Dignity"]
        n22["Element"]
        n23["Modality"]
        n24["Polarity"]
        n25["Sign"]
        n26["Ingress"]
        n27["Peak"]
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
        n281["After Peak"]
        n282["Before Peak"]
        n19 --> n20
        n19 --> n21
        n19 --> n22
        n19 --> n23
        n19 --> n24
        n19 --> n25
        n19 --> n26
        n19 --> n27
        n20 --> n112
        n20 --> n113
        n20 --> n114
        n21 --> n115
        n21 --> n116
        n21 --> n117
        n21 --> n118
        n21 --> n119
        n22 --> n120
        n22 --> n121
        n22 --> n122
        n22 --> n123
        n23 --> n124
        n23 --> n125
        n23 --> n126
        n24 --> n127
        n24 --> n128
        n25 --> n129
        n25 --> n130
        n25 --> n131
        n25 --> n132
        n25 --> n133
        n25 --> n134
        n25 --> n135
        n25 --> n136
        n25 --> n137
        n25 --> n138
        n25 --> n139
        n25 --> n140
        n26 --> n141
        n26 --> n142
        n26 --> n143
        n26 --> n144
        n26 --> n145
        n26 --> n146
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
        n27 --> n281
        n27 --> n282
    end
    subgraph nb5["Lunar"]
        n28["Lunar"]
        n29["Apsides"]
        n30["Monthly Cycle"]
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
        n28 --> n29
        n28 --> n30
        n29 --> n164
        n29 --> n165
        n29 --> n166
        n29 --> n167
        n30 --> n172
        n30 --> n173
        n30 --> n174
        n30 --> n175
        n30 --> n176
        n30 --> n177
        n30 --> n178
        n30 --> n179
    end
    subgraph nb6["Planetary"]
        n31["Planetary"]
        n32["Direction"]
        n33["Synodic Stage"]
        n34["Phase"]
        n168["Station Direct"]
        n169["Station Retrograde"]
        n170["Retrograde Period"]
        n171["Direct Period"]
        n189["Mars"]
        n190["Mercury"]
        n191["Venus"]
        n192["Mercurian"]
        n193["Venusian"]
        n194["Martian"]
        n236["Morning Set"]
        n237["Evening Rise"]
        n238["Evening Visibility"]
        n239["Eastern Elongation"]
        n240["Evening Set"]
        n241["Morning Rise"]
        n242["Morning Visibility"]
        n243["Western Elongation"]
        n244["Western Brightest"]
        n245["Morning Widening"]
        n246["Morning Closing"]
        n247["Evening Widening"]
        n248["Evening Closing"]
        n259["Evening Rise"]
        n260["Evening Visibility"]
        n261["Eastern Elongation"]
        n262["Eastern Brightest"]
        n263["Evening Set"]
        n264["Morning Rise"]
        n265["Western Brightest"]
        n266["Evening Widening"]
        n267["Evening Closing"]
        n268["Morning Visibility"]
        n269["Morning Widening"]
        n270["Morning Closing"]
        n271["Morning Rise"]
        n272["Morning Widening"]
        n299["Rise and set"]
        n300["Widening"]
        n301["Conjunction"]
        n302["Visibility"]
        n303["Station"]
        n304["Opposition"]
        n305["Brightest"]
        n306["Closing"]
        n307["Visibility"]
        n308["Elongation"]
        n309["Brightest"]
        n310["Closing"]
        n311["Widening"]
        n312["Conjunction"]
        n313["Rise and set"]
        n314["Brightest"]
        n315["Closing"]
        n316["Visibility"]
        n317["Widening"]
        n318["Conjunction"]
        n319["Rise and set"]
        n320["Station"]
        n321["Elongation"]
        n31 --> n32
        n31 --> n33
        n31 --> n34
        n32 --> n168
        n32 --> n169
        n32 --> n170
        n32 --> n171
        n33 --> n189
        n33 --> n190
        n33 --> n191
        n34 --> n192
        n34 --> n193
        n34 --> n194
        n192 --> n236
        n192 --> n237
        n192 --> n238
        n192 --> n239
        n192 --> n240
        n192 --> n241
        n192 --> n242
        n192 --> n243
        n192 --> n244
        n192 --> n245
        n192 --> n246
        n192 --> n247
        n192 --> n248
        n193 --> n259
        n193 --> n260
        n193 --> n261
        n193 --> n262
        n193 --> n263
        n193 --> n264
        n193 --> n265
        n193 --> n266
        n193 --> n267
        n193 --> n268
        n193 --> n269
        n193 --> n270
        n194 --> n271
        n194 --> n272
        n189 --> n299
        n189 --> n300
        n189 --> n301
        n189 --> n302
        n189 --> n303
        n189 --> n304
        n189 --> n305
        n189 --> n306
        n190 --> n307
        n190 --> n308
        n190 --> n309
        n190 --> n310
        n190 --> n311
        n190 --> n312
        n190 --> n313
        n191 --> n314
        n191 --> n315
        n191 --> n316
        n191 --> n317
        n191 --> n318
        n191 --> n319
        n191 --> n320
        n191 --> n321
    end
    subgraph nb7["Solar"]
        n35["Solar"]
        n36["Annual Cycle"]
        n37["Season"]
        n180["Perihelion"]
        n181["Retreating"]
        n182["Hexadecan"]
        n183["Cross-Quarter Day"]
        n184["Equinox"]
        n185["Solstice"]
        n186["Aphelion"]
        n187["Advancing"]
        n188["Interval"]
        n195["Winter"]
        n196["Spring"]
        n197["Summer"]
        n198["Autumn"]
        n249["Thirteenth Hexadecan"]
        n250["Imbolc"]
        n251["Fifteenth Hexadecan"]
        n252["Winter Solstice"]
        n253["First Hexadecan"]
        n254["Third Hexadecan"]
        n255["Fifth Hexadecan"]
        n256["Seventh Hexadecan"]
        n257["Ninth Hexadecan"]
        n258["Eleventh Hexadecan"]
        n273["Beltane"]
        n274["Lammas"]
        n275["Samhain"]
        n276["Vernal Equinox"]
        n277["Autumnal Equinox"]
        n278["Summer Solstice"]
        n283["Post-Winter Solstice"]
        n284["Pre-Imbolc"]
        n285["Post-Imbolc"]
        n286["Pre-Vernal Equinox"]
        n287["Post-Vernal Equinox"]
        n288["Pre-Beltane"]
        n289["Post-Beltane"]
        n290["Pre-Summer Solstice"]
        n291["Post-Summer Solstice"]
        n292["Pre-Lammas"]
        n293["Post-Lammas"]
        n294["Pre-Autumnal Equinox"]
        n295["Post-Autumnal Equinox"]
        n296["Pre-Samhain"]
        n297["Post-Samhain"]
        n298["Pre-Winter Solstice"]
        n35 --> n36
        n35 --> n37
        n36 --> n180
        n36 --> n181
        n36 --> n182
        n36 --> n183
        n36 --> n184
        n36 --> n185
        n36 --> n186
        n36 --> n187
        n36 --> n188
        n37 --> n195
        n37 --> n196
        n37 --> n197
        n37 --> n198
        n195 --> n249
        n195 --> n250
        n195 --> n251
        n195 --> n252
        n182 --> n249
        n182 --> n251
        n182 --> n253
        n182 --> n254
        n182 --> n255
        n182 --> n256
        n182 --> n257
        n182 --> n258
        n183 --> n250
        n183 --> n273
        n183 --> n274
        n183 --> n275
        n196 --> n276
        n196 --> n253
        n196 --> n273
        n196 --> n254
        n184 --> n276
        n184 --> n277
        n197 --> n278
        n197 --> n255
        n197 --> n274
        n197 --> n256
        n185 --> n278
        n185 --> n252
        n198 --> n277
        n198 --> n257
        n198 --> n275
        n198 --> n258
        n188 --> n283
        n188 --> n284
        n188 --> n285
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
    end
    subgraph nb8["Eclipse"]
        n38["Eclipse"]
        n39["Frame"]
        n40["Phase"]
        n41["Solar"]
        n42["Lunar"]
        n199["Geocentric"]
        n200["Topocentric"]
        n201["Beginning"]
        n202["Maximum"]
        n203["Ending"]
        n204["Annular"]
        n205["Total"]
        n206["Partial"]
        n207["Total"]
        n208["Partial"]
        n38 --> n39
        n38 --> n40
        n38 --> n41
        n38 --> n42
        n39 --> n199
        n39 --> n200
        n40 --> n201
        n40 --> n202
        n40 --> n203
        n41 --> n204
        n41 --> n205
        n41 --> n206
        n42 --> n207
        n42 --> n208
    end
    class n0 root
    class n6 root
    class n11 root
    class n14 root
    class n19 root
    class n28 root
    class n31 root
    class n35 root
    class n38 root
```
