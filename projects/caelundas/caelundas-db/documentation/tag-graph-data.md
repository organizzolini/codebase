[Aspect](#aspect) · [Body](#body) · [Temporality](#temporality-daily) · [Daily](#temporality-daily) · [Sign](#sign) · [Lunar](#lunar) · [Planetary](#planetary) · [Yearly](#yearly) · [Eclipse](#eclipse)

## Aspect

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef shared fill:#fff4e5,stroke:#e8710a,stroke-width:2px
    n0["Aspect"] --> n1["Harmonic"] & n2["Nature"] & n3["Phase"] & n4["Compound"] & n5["Simple"]
    n1 --> n53["Harmonic 4"] & n54["Harmonic 12"] & n55["Harmonic 11"] & n56["Harmonic 5"] & n57["Harmonic 9"] & n58["Harmonic 10"] & n59["Harmonic 6"] & n60["Harmonic 8"] & n61["Harmonic 1"] & n62["Harmonic 7"] & n63["Harmonic 2"] & n64["Harmonic 3"]
    n2 --> n65["Hard"] & n66["Neutral"] & n67["Soft"]
    n68["Focal Body"] --> n69["Chiron Focal"] & n70["Venus Focal"] & n71["Moon Focal"] & n72["Ceres Focal"] & n73["Juno Focal"] & n74["Jupiter Focal"] & n75["Saturn Focal"] & n76["Neptune Focal"] & n77["Uranus Focal"] & n78["Pluto Focal"] & n79["Lunar Apogee Focal"] & n80["Lilith Focal"] & n81["Pallas Focal"] & n82["Mercury Focal"] & n83["Mars Focal"] & n84["Sun Focal"] & n85["North Lunar Node Focal"] & n86["Vesta Focal"]
    n3 --> n87["Exact"]
    n4 --> n68 & n99["Triple"] & n100["Quadruple"] & n101["Stellium"] & n102["Sextuple"]
    n5 --> n122["Minor"] & n123["Specialty"] & n124["Major"]
    n53 --> n208["T Square"] & n209["Grand Cross"] & n210["Square"]
    n65 --> n208 & n209 & n210 & n211["Sesquiquadrate"] & n212["Semisquare"] & n213["Opposite"]
    n99 --> n208 & n214["Yod"] & n215["Grand Trine"]
    n100 --> n209 & n216["Kite"]
    n54 --> n214 & n217["Quincunx"] & n218["Semisextile"]
    n66 --> n101 & n214 & n217 & n219["Undecile"] & n220["Conjunct"] & n221["Septile"]
    n122 --> n217 & n211 & n212 & n218
    n55 --> n219
    n123 --> n219 & n222["Quintile"] & n223["Novile"] & n224["Tredecile"] & n221 & n225["Decile"] & n226["Biquintile"]
    n56 --> n222 & n226
    n67 --> n222 & n223 & n224 & n227["Sextile"] & n218 & n225 & n226 & n228["Trine"] & n215 & n216 & n229["Hexagram"]
    n57 --> n223
    n58 --> n224 & n225
    n124 --> n210 & n227 & n220 & n213 & n228
    n59 --> n227 & n216 & n229
    n60 --> n211 & n212
    n61 --> n101 & n220
    n62 --> n221
    n63 --> n213
    n64 --> n228 & n215
    n101 --> n230["4 Body"] & n231["5 Body"] & n232["6 Body"] & n233["7 Body"] & n234["3 Body"]
    n102 --> n229
    class n0 root
    class n101,n208,n209,n210,n211,n212,n213,n214,n215,n216,n217,n218,n219,n220,n221,n222,n223,n224,n225,n226,n227,n228,n229 shared
```

## Body

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef shared fill:#fff4e5,stroke:#e8710a,stroke-width:2px
    n6["Body"] --> n7["Asteroid"] & n8["Luminary"] & n9["Point"] & n10["Planet"]
    n7 --> n88["Chiron"] & n89["Juno"] & n90["Ceres"] & n91["Vesta"] & n92["Pallas"]
    n8 --> n93["Moon"] & n94["Sun"]
    n95["Outer"] --> n96["Pluto"] & n97["Uranus"] & n98["Neptune"]
    n103["Personal"] --> n104["Venus"] & n105["Mars"] & n106["Mercury"]
    n116["Social"] --> n117["Jupiter"] & n118["Saturn"]
    n9 --> n119["Lunar Apogee"] & n120["North Lunar Node"] & n121["Lilith"]
    n10 --> n95 & n96 & n104 & n117 & n105 & n97 & n106 & n118 & n98 & n278["Malefic"] & n279["Benefic"] & n280["Inner"]
    n278 --> n105 & n118
    n279 --> n104 & n117
    n280 --> n103 & n116
    class n6 root
    class n96,n97,n98,n104,n105,n106,n117,n118 shared
```

## Temporality, Daily

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    subgraph nb2["Temporality"]
        direction LR
        n11["Temporality"] --> n12["Perfective"] & n13["Progressive"]
        n13 --> n107["Minutes"] & n108["Hours"] & n109["Days"] & n110["Weeks"] & n111["Months"] & n112["Quarters"] & n113["Years"] & n114["Decades"] & n115["Centuries"]
    end
    subgraph nb3["Daily"]
        direction LR
        n14["Daily"] --> n15["Daily Solar"] & n16["Daily Lunar"] & n17["Twilight"]
        n15 --> n125["Nadir"] & n126["Daylight"] & n127["Rise"] & n128["Zenith"] & n129["Set"] & n130["Night"]
        n16 --> n151["Set"] & n152["Nadir"] & n153["Rise"] & n154["Zenith"] & n155["Moon Up"] & n156["Moon Down"]
        n17 --> n157["Astronomical Dawn"] & n158["Astronomical Twilight"] & n159["Nautical Dawn"] & n160["Nautical Twilight"] & n161["Civil Dawn"] & n162["Civil Dusk"] & n163["Nautical Dusk"] & n164["Astronomical Dusk"]
    end
    nb2 ~~~ nb3
    class n11,n14 root
```

## Sign

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef shared fill:#fff4e5,stroke:#e8710a,stroke-width:2px
    n18["Sign"] --> n19["Decan"] & n20["Dignity"] & n21["Element"] & n22["Modality"] & n23["Polarity"] & n24["Stay"] & n25["Gemini"] & n26["Capricorn"] & n27["Sagittarius"] & n28["Cancer"] & n29["Leo"] & n30["Virgo"] & n31["Libra"] & n32["Scorpio"] & n33["Aquarius"] & n34["Aries"] & n35["Pisces"] & n36["Taurus"] & n37["Peak"]
    n19 --> n131["Second Decan"] & n132["Third Decan"] & n133["First Decan"]
    n20 --> n134["Peregrine"] & n135["Domicile"] & n136["Exaltation"] & n137["Fall"] & n138["Detriment"]
    n21 --> n139["Air"] & n140["Earth"] & n141["Fire"] & n142["Water"]
    n22 --> n143["Mutable"] & n144["Cardinal"] & n145["Fixed"]
    n23 --> n146["Positive"] & n147["Negative"]
    n24 --> n148["Full Sign"] & n149["Half Stay"] & n150["Decan Stay"]
    n139 --> n25 & n31 & n33
    n143 --> n25 & n27 & n30 & n35
    n146 --> n25 & n27 & n29 & n31 & n33 & n34
    n140 --> n26 & n30 & n36
    n144 --> n26 & n28 & n31 & n34
    n147 --> n26 & n28 & n30 & n32 & n35 & n36
    n141 --> n27 & n29 & n34
    n142 --> n28 & n32 & n35
    n145 --> n29 & n32 & n33 & n36
    n37 --> n281["After Peak"] & n282["Before Peak"]
    class n18 root
    class n25,n26,n27,n28,n29,n30,n31,n32,n33,n34,n35,n36 shared
```

## Lunar

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    n38["Lunar"] --> n39["Apsides"] & n40["Monthly Cycle"]
    n39 --> n165["Perigee"] & n166["Apogee"] & n167["Advancing"] & n168["Retreating"]
    n40 --> n171["Full"] & n172["Waning Gibbous"] & n173["Last Quarter"] & n174["Waning Crescent"] & n175["New"] & n176["Waxing Crescent"] & n177["First Quarter"] & n178["Waxing Gibbous"]
    class n38 root
```

## Planetary

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    n41["Planetary"] --> n42["Direction"] & n43["Synodic Stage"] & n44["Phase"]
    n42 --> n169["Retrograde Period"] & n170["Direct Period"]
    n43 --> n188["Mars"] & n189["Mercury"] & n190["Venus"]
    n44 --> n191["Mercurian"] & n192["Venusian"] & n193["Martian"]
    n191 --> n235["Morning Set"] & n236["Evening Rise"] & n237["Evening Visibility"] & n238["Eastern Elongation"] & n239["Evening Set"] & n240["Morning Rise"] & n241["Morning Visibility"] & n242["Western Elongation"] & n243["Western Brightest"] & n244["Morning Widening"] & n245["Morning Closing"] & n246["Evening Widening"] & n247["Evening Closing"]
    n192 --> n258["Evening Rise"] & n259["Evening Visibility"] & n260["Eastern Elongation"] & n261["Eastern Brightest"] & n262["Evening Set"] & n263["Morning Rise"] & n264["Western Brightest"] & n265["Evening Widening"] & n266["Evening Closing"] & n267["Morning Visibility"] & n268["Morning Widening"] & n269["Morning Closing"]
    n193 --> n270["Morning Rise"] & n271["Morning Widening"]
    n188 --> n299["Rise and set"] & n300["Widening"] & n301["Conjunction"] & n302["Visibility"] & n303["Opposition"] & n304["Brightest"] & n305["Closing"]
    n189 --> n306["Visibility"] & n307["Elongation"] & n308["Brightest"] & n309["Closing"] & n310["Widening"] & n311["Conjunction"] & n312["Rise and set"]
    n190 --> n313["Brightest"] & n314["Closing"] & n315["Visibility"] & n316["Widening"] & n317["Conjunction"] & n318["Rise and set"] & n319["Elongation"]
    class n41 root
```

## Yearly

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef shared fill:#fff4e5,stroke:#e8710a,stroke-width:2px
    n45["Yearly"] --> n46["Annual Cycle"] & n47["Season"]
    n46 --> n179["Perihelion"] & n180["Retreating"] & n181["Hexadecan"] & n182["Cross-Quarter Day"] & n183["Equinox"] & n184["Solstice"] & n185["Aphelion"] & n186["Advancing"] & n187["Interval"]
    n47 --> n194["Winter"] & n195["Spring"] & n196["Summer"] & n197["Autumn"]
    n194 --> n248["Thirteenth Hexadecan"] & n249["Imbolc"] & n250["Fifteenth Hexadecan"] & n251["Winter Solstice"]
    n181 --> n248 & n250 & n252["First Hexadecan"] & n253["Third Hexadecan"] & n254["Fifth Hexadecan"] & n255["Seventh Hexadecan"] & n256["Ninth Hexadecan"] & n257["Eleventh Hexadecan"]
    n182 --> n249 & n272["Beltane"] & n273["Lammas"] & n274["Samhain"]
    n195 --> n275["Vernal Equinox"] & n252 & n272 & n253
    n183 --> n275 & n276["Autumnal Equinox"]
    n196 --> n277["Summer Solstice"] & n254 & n273 & n255
    n184 --> n277 & n251
    n197 --> n276 & n256 & n274 & n257
    n187 --> n283["Post-Winter Solstice"] & n284["Pre-Imbolc"] & n285["Post-Imbolc"] & n286["Pre-Vernal Equinox"] & n287["Post-Vernal Equinox"] & n288["Pre-Beltane"] & n289["Post-Beltane"] & n290["Pre-Summer Solstice"] & n291["Post-Summer Solstice"] & n292["Pre-Lammas"] & n293["Post-Lammas"] & n294["Pre-Autumnal Equinox"] & n295["Post-Autumnal Equinox"] & n296["Pre-Samhain"] & n297["Post-Samhain"] & n298["Pre-Winter Solstice"]
    class n45 root
    class n248,n249,n250,n251,n252,n253,n254,n255,n256,n257,n272,n273,n274,n275,n276,n277 shared
```

## Eclipse

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    n48["Eclipse"] --> n49["Frame"] & n50["Phase"] & n51["Solar"] & n52["Lunar"]
    n49 --> n198["Geocentric"] & n199["Topocentric"]
    n50 --> n200["Beginning"] & n201["Maximum"] & n202["Ending"]
    n51 --> n203["Annular"] & n204["Total"] & n205["Partial"]
    n52 --> n206["Total"] & n207["Partial"]
    class n48 root
```
