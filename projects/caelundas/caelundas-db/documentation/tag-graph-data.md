[Aspect](#aspect) · [Body](#body) · [Temporality](#temporality-daily) · [Daily](#temporality-daily) · [Sign](#sign) · [Lunar](#lunar) · [Planetary](#planetary) · [Yearly](#yearly) · [Eclipse](#eclipse-ingress) · [Ingress](#eclipse-ingress)

## Aspect

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef shared fill:#fff4e5,stroke:#e8710a,stroke-width:2px
    n0["Aspect"] --> n1["Harmonic"] & n2["Nature"] & n3["Phase"] & n4["Compound"] & n5["Simple"]
    n1 --> n47["Harmonic 4"] & n48["Harmonic 12"] & n49["Harmonic 11"] & n50["Harmonic 5"] & n51["Harmonic 9"] & n52["Harmonic 10"] & n53["Harmonic 6"] & n54["Harmonic 8"] & n55["Harmonic 1"] & n56["Harmonic 7"] & n57["Harmonic 2"] & n58["Harmonic 3"]
    n2 --> n59["Hard"] & n60["Neutral"] & n61["Soft"]
    n62["Focal Body"] --> n63["Chiron Focal"] & n64["Venus Focal"] & n65["Moon Focal"] & n66["Ceres Focal"] & n67["Juno Focal"] & n68["Jupiter Focal"] & n69["Saturn Focal"] & n70["Neptune Focal"] & n71["Uranus Focal"] & n72["Pluto Focal"] & n73["Lunar Apogee Focal"] & n74["Lilith Focal"] & n75["Pallas Focal"] & n76["Mercury Focal"] & n77["Mars Focal"] & n78["Sun Focal"] & n79["North Lunar Node Focal"] & n80["Vesta Focal"]
    n3 --> n81["Exact"]
    n4 --> n62 & n93["Triple"] & n94["Quadruple"] & n95["Stellium"] & n96["Sextuple"]
    n5 --> n116["Minor"] & n117["Specialty"] & n118["Major"]
    n47 --> n195["T Square"] & n196["Grand Cross"] & n197["Square"]
    n59 --> n195 & n196 & n197 & n198["Sesquiquadrate"] & n199["Semisquare"] & n200["Opposite"]
    n93 --> n195 & n201["Yod"] & n202["Grand Trine"]
    n94 --> n196 & n203["Kite"]
    n48 --> n201 & n204["Quincunx"] & n205["Semisextile"]
    n60 --> n95 & n201 & n204 & n206["Undecile"] & n207["Conjunct"] & n208["Septile"]
    n116 --> n204 & n198 & n199 & n205
    n49 --> n206
    n117 --> n206 & n217["Quintile"] & n218["Novile"] & n219["Tredecile"] & n208 & n220["Decile"] & n221["Biquintile"]
    n50 --> n217 & n221
    n61 --> n217 & n218 & n219 & n222["Sextile"] & n205 & n220 & n221 & n223["Trine"] & n202 & n203 & n224["Hexagram"]
    n51 --> n218
    n52 --> n219 & n220
    n118 --> n197 & n222 & n207 & n200 & n223
    n53 --> n222 & n203 & n224
    n54 --> n198 & n199
    n55 --> n95 & n207
    n56 --> n208
    n57 --> n200
    n58 --> n223 & n202
    n95 --> n229["4 Body"] & n230["5 Body"] & n231["6 Body"] & n232["7 Body"] & n233["3 Body"]
    n96 --> n224
    class n0 root
    class n95,n195,n196,n197,n198,n199,n200,n201,n202,n203,n204,n205,n206,n207,n208,n217,n218,n219,n220,n221,n222,n223,n224 shared
```

## Body

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef shared fill:#fff4e5,stroke:#e8710a,stroke-width:2px
    n6["Body"] --> n7["Asteroid"] & n8["Luminary"] & n9["Point"] & n10["Planet"]
    n7 --> n82["Chiron"] & n83["Juno"] & n84["Ceres"] & n85["Vesta"] & n86["Pallas"]
    n8 --> n87["Moon"] & n88["Sun"]
    n89["Outer"] --> n90["Pluto"] & n91["Uranus"] & n92["Neptune"]
    n97["Personal"] --> n98["Venus"] & n99["Mars"] & n100["Mercury"]
    n110["Social"] --> n111["Jupiter"] & n112["Saturn"]
    n9 --> n113["Lunar Apogee"] & n114["North Lunar Node"] & n115["Lilith"]
    n10 --> n89 & n90 & n98 & n111 & n99 & n91 & n100 & n112 & n92 & n277["Malefic"] & n278["Benefic"] & n279["Inner"]
    n277 --> n99 & n112
    n278 --> n98 & n111
    n279 --> n97 & n110
    class n6 root
    class n90,n91,n92,n98,n99,n100,n111,n112 shared
```

## Temporality, Daily

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    subgraph nb2["Temporality"]
        direction LR
        n11["Temporality"] --> n12["Perfective"] & n13["Progressive"]
        n13 --> n101["Minutes"] & n102["Hours"] & n103["Days"] & n104["Weeks"] & n105["Months"] & n106["Quarters"] & n107["Years"] & n108["Decades"] & n109["Centuries"]
    end
    subgraph nb3["Daily"]
        direction LR
        n14["Daily"] --> n15["Solar"] & n16["Lunar"] & n17["Twilight"]
        n15 --> n119["Nadir"] & n120["Daylight"] & n121["Rise"] & n122["Zenith"] & n123["Set"] & n124["Night"]
        n16 --> n147["Set"] & n148["Nadir"] & n149["Rise"] & n150["Zenith"] & n151["Moon Up"] & n152["Moon Down"]
        n17 --> n153["Astronomical Dawn"] & n154["Astronomical Twilight"] & n155["Nautical Dawn"] & n156["Nautical Twilight"] & n157["Civil Dawn"] & n158["Civil Dusk"] & n159["Nautical Dusk"] & n160["Astronomical Dusk"]
    end
    nb2 ~~~ nb3
    class n11,n14 root
```

## Sign

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef shared fill:#fff4e5,stroke:#e8710a,stroke-width:2px
    n18["Sign"] --> n19["Dignity"] & n20["Element"] & n21["Modality"] & n22["Polarity"] & n23["Zodiac"]
    n19 --> n129["Peregrine"] & n130["Domicile"] & n131["Exaltation"] & n132["Fall"] & n133["Detriment"]
    n20 --> n134["Air"] & n135["Earth"] & n136["Fire"] & n137["Water"]
    n21 --> n138["Mutable"] & n139["Cardinal"] & n140["Fixed"]
    n22 --> n141["Positive"] & n142["Negative"]
    n134 --> n209["Gemini"] & n210["Libra"] & n211["Aquarius"]
    n138 --> n209 & n212["Sagittarius"] & n213["Virgo"] & n214["Pisces"]
    n141 --> n209 & n212 & n215["Leo"] & n210 & n211 & n216["Aries"]
    n135 --> n225["Capricorn"] & n213 & n226["Taurus"]
    n139 --> n225 & n227["Cancer"] & n210 & n216
    n142 --> n225 & n227 & n213 & n228["Scorpio"] & n214 & n226
    n136 --> n212 & n215 & n216
    n137 --> n227 & n228 & n214
    n140 --> n215 & n228 & n211 & n226
    n23 --> n209 & n225 & n212 & n227 & n215 & n213 & n210 & n228 & n211 & n216 & n214 & n226
    class n18 root
    class n209,n210,n211,n212,n213,n214,n215,n216,n225,n226,n227,n228 shared
```

## Lunar

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    n24["Lunar"] --> n25["Apsides"] & n26["Monthly Cycle"]
    n25 --> n161["Perigee"] & n162["Apogee"] & n163["Advancing"] & n164["Retreating"]
    n26 --> n167["Full"] & n168["Waning Gibbous"] & n169["Last Quarter"] & n170["Waning Crescent"] & n171["New"] & n172["Waxing Crescent"] & n173["First Quarter"] & n174["Waxing Gibbous"]
    class n24 root
```

## Planetary

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    n27["Planetary"] --> n28["Direction"] & n29["Synodic Stage"] & n30["Phase"]
    n28 --> n165["Retrograde Period"] & n166["Direct Period"]
    n29 --> n175["Mars"] & n176["Mercury"] & n177["Venus"]
    n30 --> n178["Mercurian"] & n179["Venusian"] & n180["Martian"]
    n178 --> n234["Morning Set"] & n235["Evening Rise"] & n236["Evening Visibility"] & n237["Eastern Elongation"] & n238["Evening Set"] & n239["Morning Rise"] & n240["Morning Visibility"] & n241["Western Elongation"] & n242["Western Brightest"] & n243["Morning Widening"] & n244["Morning Closing"] & n245["Evening Widening"] & n246["Evening Closing"]
    n179 --> n257["Evening Rise"] & n258["Evening Visibility"] & n259["Eastern Elongation"] & n260["Eastern Brightest"] & n261["Evening Set"] & n262["Morning Rise"] & n263["Western Brightest"] & n264["Evening Widening"] & n265["Evening Closing"] & n266["Morning Visibility"] & n267["Morning Widening"] & n268["Morning Closing"]
    n180 --> n269["Morning Rise"] & n270["Morning Widening"]
    n175 --> n299["Rise and set"] & n300["Widening"] & n301["Conjunction"] & n302["Visibility"] & n303["Opposition"] & n304["Brightest"] & n305["Closing"]
    n176 --> n306["Visibility"] & n307["Elongation"] & n308["Brightest"] & n309["Closing"] & n310["Widening"] & n311["Conjunction"] & n312["Rise and set"]
    n177 --> n313["Brightest"] & n314["Closing"] & n315["Visibility"] & n316["Widening"] & n317["Conjunction"] & n318["Rise and set"] & n319["Elongation"]
    class n27 root
```

## Yearly

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    classDef shared fill:#fff4e5,stroke:#e8710a,stroke-width:2px
    n31["Yearly"] --> n32["Season"] & n33["Perihelion"] & n34["Retreating"] & n35["Hexadecan"] & n36["Cross-Quarter Day"] & n37["Equinox"] & n38["Solstice"] & n39["Aphelion"] & n40["Advancing"] & n41["Interval"]
    n32 --> n181["Winter"] & n182["Spring"] & n183["Summer"] & n184["Autumn"]
    n181 --> n247["Thirteenth Hexadecan"] & n248["Imbolc"] & n249["Fifteenth Hexadecan"] & n250["Winter Solstice"]
    n35 --> n247 & n249 & n251["First Hexadecan"] & n252["Third Hexadecan"] & n253["Fifth Hexadecan"] & n254["Seventh Hexadecan"] & n255["Ninth Hexadecan"] & n256["Eleventh Hexadecan"]
    n36 --> n248 & n271["Beltane"] & n272["Lammas"] & n273["Samhain"]
    n182 --> n274["Vernal Equinox"] & n251 & n271 & n252
    n37 --> n274 & n275["Autumnal Equinox"]
    n183 --> n276["Summer Solstice"] & n253 & n272 & n254
    n38 --> n276 & n250
    n184 --> n275 & n255 & n273 & n256
    n41 --> n283["Post-Winter Solstice"] & n284["Pre-Imbolc"] & n285["Post-Imbolc"] & n286["Pre-Vernal Equinox"] & n287["Post-Vernal Equinox"] & n288["Pre-Beltane"] & n289["Post-Beltane"] & n290["Pre-Summer Solstice"] & n291["Post-Summer Solstice"] & n292["Pre-Lammas"] & n293["Post-Lammas"] & n294["Pre-Autumnal Equinox"] & n295["Post-Autumnal Equinox"] & n296["Pre-Samhain"] & n297["Post-Samhain"] & n298["Pre-Winter Solstice"]
    class n31 root
    class n247,n248,n249,n250,n251,n252,n253,n254,n255,n256,n271,n272,n273,n274,n275,n276 shared
```

## Eclipse, Ingress

```mermaid
flowchart LR
    classDef root fill:#e8f0fe,stroke:#1a73e8,stroke-width:3px
    subgraph nb8["Eclipse"]
        direction LR
        n42["Eclipse"] --> n43["Frame"] & n44["Phase"] & n45["Solar"] & n46["Lunar"]
        n43 --> n185["Geocentric"] & n186["Topocentric"]
        n44 --> n187["Beginning"] & n188["Maximum"] & n189["Ending"]
        n45 --> n190["Annular"] & n191["Total"] & n192["Partial"]
        n46 --> n193["Total"] & n194["Partial"]
    end
    subgraph nb9["Ingress"]
        direction LR
        n125["Decan"] --> n126["Second Decan"] & n127["Third Decan"] & n128["First Decan"]
        n143["Stay"] --> n144["Full Sign"] & n145["Half Stay"] & n146["Decan Stay"]
        n280["Peak"] --> n281["After Peak"] & n282["Before Peak"]
        n320["Ingress"] --> n125 & n143 & n280
    end
    nb8 ~~~ nb9
    class n42,n320 root
```
