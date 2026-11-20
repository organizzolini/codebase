import { Module } from "@nestjs/common";

import { SubmatrixUtilitiesModule } from "../../submatrix-utilities.module";

import { LetterUtilitiesService } from "./letter-utilities.service";
import { AinArabicLetterCharacteristicsService } from "./modules/arabic-ain-to-hah/ain-arabic-letter-characteristics.service";
import { AlefArabicLetterCharacteristicsService } from "./modules/arabic-ain-to-hah/alef-arabic-letter-characteristics.service";
import { BehArabicLetterCharacteristicsService } from "./modules/arabic-ain-to-hah/beh-arabic-letter-characteristics.service";
import { DalArabicLetterCharacteristicsService } from "./modules/arabic-ain-to-hah/dal-arabic-letter-characteristics.service";
import { FehArabicLetterCharacteristicsService } from "./modules/arabic-ain-to-hah/feh-arabic-letter-characteristics.service";
import { HahArabicLetterCharacteristicsService } from "./modules/arabic-ain-to-hah/hah-arabic-letter-characteristics.service";
import { HehArabicLetterCharacteristicsService } from "./modules/arabic-heh-to-qaf/heh-arabic-letter-characteristics.service";
import { KafArabicLetterCharacteristicsService } from "./modules/arabic-heh-to-qaf/kaf-arabic-letter-characteristics.service";
import { LamArabicLetterCharacteristicsService } from "./modules/arabic-heh-to-qaf/lam-arabic-letter-characteristics.service";
import { MeemArabicLetterCharacteristicsService } from "./modules/arabic-heh-to-qaf/meem-arabic-letter-characteristics.service";
import { NoonArabicLetterCharacteristicsService } from "./modules/arabic-heh-to-qaf/noon-arabic-letter-characteristics.service";
import { QafArabicLetterCharacteristicsService } from "./modules/arabic-heh-to-qaf/qaf-arabic-letter-characteristics.service";
import { RehArabicLetterCharacteristicsService } from "./modules/arabic-reh-to-yeh/reh-arabic-letter-characteristics.service";
import { SadArabicLetterCharacteristicsService } from "./modules/arabic-reh-to-yeh/sad-arabic-letter-characteristics.service";
import { SeenArabicLetterCharacteristicsService } from "./modules/arabic-reh-to-yeh/seen-arabic-letter-characteristics.service";
import { TahArabicLetterCharacteristicsService } from "./modules/arabic-reh-to-yeh/tah-arabic-letter-characteristics.service";
import { WawArabicLetterCharacteristicsService } from "./modules/arabic-reh-to-yeh/waw-arabic-letter-characteristics.service";
import { YehArabicLetterCharacteristicsService } from "./modules/arabic-reh-to-yeh/yeh-arabic-letter-characteristics.service";
import { DeltaGreekLetterCharacteristicsService } from "./modules/greek-delta-to-omega/delta-greek-letter-characteristics.service";
import { KappaGreekLetterCharacteristicsService } from "./modules/greek-delta-to-omega/kappa-greek-letter-characteristics.service";
import { LambdaGreekLetterCharacteristicsService } from "./modules/greek-delta-to-omega/lambda-greek-letter-characteristics.service";
import { OmegaGreekLetterCharacteristicsService } from "./modules/greek-delta-to-omega/omega-greek-letter-characteristics.service";
import { PhiGreekLetterCharacteristicsService } from "./modules/greek-phi-to-sigma/phi-greek-letter-characteristics.service";
import { PsiGreekLetterCharacteristicsService } from "./modules/greek-phi-to-sigma/psi-greek-letter-characteristics.service";
import { RhoGreekLetterCharacteristicsService } from "./modules/greek-phi-to-sigma/rho-greek-letter-characteristics.service";
import { SigmaGreekLetterCharacteristicsService } from "./modules/greek-phi-to-sigma/sigma-greek-letter-characteristics.service";
import { KieukHangulLetterCharacteristicsService } from "./modules/hangul/kieuk-hangul-letter-characteristics.service";
import { PieupHangulLetterCharacteristicsService } from "./modules/hangul/pieup-hangul-letter-characteristics.service";
import { YaHangulLetterCharacteristicsService } from "./modules/hangul/ya-hangul-letter-characteristics.service";
import { YeoHangulLetterCharacteristicsService } from "./modules/hangul/yeo-hangul-letter-characteristics.service";
import { YoHangulLetterCharacteristicsService } from "./modules/hangul/yo-hangul-letter-characteristics.service";
import { YuHangulLetterCharacteristicsService } from "./modules/hangul/yu-hangul-letter-characteristics.service";
import { AoHanziLetterCharacteristicsService } from "./modules/hanzi-ao-to-shang/ao-hanzi-letter-characteristics.service";
import { GanHanziLetterCharacteristicsService } from "./modules/hanzi-ao-to-shang/gan-hanzi-letter-characteristics.service";
import { JiaHanziLetterCharacteristicsService } from "./modules/hanzi-ao-to-shang/jia-hanzi-letter-characteristics.service";
import { JingHanziLetterCharacteristicsService } from "./modules/hanzi-ao-to-shang/jing-hanzi-letter-characteristics.service";
import { MuHanziLetterCharacteristicsService } from "./modules/hanzi-ao-to-shang/mu-hanzi-letter-characteristics.service";
import { ShangHanziLetterCharacteristicsService } from "./modules/hanzi-ao-to-shang/shang-hanzi-letter-characteristics.service";
import { ShenHanziLetterCharacteristicsService } from "./modules/hanzi-shen-to-you/shen-hanzi-letter-characteristics.service";
import { TianHanziLetterCharacteristicsService } from "./modules/hanzi-shen-to-you/tian-hanzi-letter-characteristics.service";
import { TuHanziLetterCharacteristicsService } from "./modules/hanzi-shen-to-you/tu-hanzi-letter-characteristics.service";
import { TuSoilHanziLetterCharacteristicsService } from "./modules/hanzi-shen-to-you/tu-soil-hanzi-letter-characteristics.service";
import { WangHanziLetterCharacteristicsService } from "./modules/hanzi-shen-to-you/wang-hanzi-letter-characteristics.service";
import { YouHanziLetterCharacteristicsService } from "./modules/hanzi-shen-to-you/you-hanzi-letter-characteristics.service";
import { DaletHebrewLetterCharacteristicsService } from "./modules/hebrew-katakana/dalet-hebrew-letter-characteristics.service";
import { LamedHebrewLetterCharacteristicsService } from "./modules/hebrew-katakana/lamed-hebrew-letter-characteristics.service";
import { TavHebrewLetterCharacteristicsService } from "./modules/hebrew-katakana/tav-hebrew-letter-characteristics.service";
import { YuKatakanaLetterCharacteristicsService } from "./modules/hebrew-katakana/yu-katakana-letter-characteristics.service";
import { ALatinLetterCharacteristicsService } from "./modules/latin-a-to-h/a-latin-letter-characteristics.service";
import { BLatinLetterCharacteristicsService } from "./modules/latin-a-to-h/b-latin-letter-characteristics.service";
import { CLatinLetterCharacteristicsService } from "./modules/latin-a-to-h/c-latin-letter-characteristics.service";
import { ELatinLetterCharacteristicsService } from "./modules/latin-a-to-h/e-latin-letter-characteristics.service";
import { FLatinLetterCharacteristicsService } from "./modules/latin-a-to-h/f-latin-letter-characteristics.service";
import { HLatinLetterCharacteristicsService } from "./modules/latin-a-to-h/h-latin-letter-characteristics.service";
import { ILatinLetterCharacteristicsService } from "./modules/latin-i-to-s/i-latin-letter-characteristics.service";
import { LLatinLetterCharacteristicsService } from "./modules/latin-i-to-s/l-latin-letter-characteristics.service";
import { MLatinLetterCharacteristicsService } from "./modules/latin-i-to-s/m-latin-letter-characteristics.service";
import { NLatinLetterCharacteristicsService } from "./modules/latin-i-to-s/n-latin-letter-characteristics.service";
import { OLatinLetterCharacteristicsService } from "./modules/latin-i-to-s/o-latin-letter-characteristics.service";
import { SLatinLetterCharacteristicsService } from "./modules/latin-i-to-s/s-latin-letter-characteristics.service";
import { TLatinLetterCharacteristicsService } from "./modules/latin-t-to-z/t-latin-letter-characteristics.service";
import { ULatinLetterCharacteristicsService } from "./modules/latin-t-to-z/u-latin-letter-characteristics.service";
import { WLatinLetterCharacteristicsService } from "./modules/latin-t-to-z/w-latin-letter-characteristics.service";
import { XLatinLetterCharacteristicsService } from "./modules/latin-t-to-z/x-latin-letter-characteristics.service";
import { YLatinLetterCharacteristicsService } from "./modules/latin-t-to-z/y-latin-letter-characteristics.service";
import { ZLatinLetterCharacteristicsService } from "./modules/latin-t-to-z/z-latin-letter-characteristics.service";

/**
 * Provides and exports every letter service, one per letter, with an Arabic letter's positional
 * forms together. Each letter has one base template per script reading corner, or per positional
 * form for Arabic. Each template yields sixteen evaluators: four corners by four rotations.
 */
@Module({
  controllers: [],
  exports: [
    LetterUtilitiesService,
    ALatinLetterCharacteristicsService,
    AinArabicLetterCharacteristicsService,
    AlefArabicLetterCharacteristicsService,
    AoHanziLetterCharacteristicsService,
    BLatinLetterCharacteristicsService,
    BehArabicLetterCharacteristicsService,
    CLatinLetterCharacteristicsService,
    DalArabicLetterCharacteristicsService,
    DaletHebrewLetterCharacteristicsService,
    DeltaGreekLetterCharacteristicsService,
    ELatinLetterCharacteristicsService,
    FLatinLetterCharacteristicsService,
    FehArabicLetterCharacteristicsService,
    GanHanziLetterCharacteristicsService,
    HLatinLetterCharacteristicsService,
    HahArabicLetterCharacteristicsService,
    HehArabicLetterCharacteristicsService,
    ILatinLetterCharacteristicsService,
    JiaHanziLetterCharacteristicsService,
    JingHanziLetterCharacteristicsService,
    KafArabicLetterCharacteristicsService,
    KappaGreekLetterCharacteristicsService,
    KieukHangulLetterCharacteristicsService,
    LLatinLetterCharacteristicsService,
    LamArabicLetterCharacteristicsService,
    LambdaGreekLetterCharacteristicsService,
    LamedHebrewLetterCharacteristicsService,
    MLatinLetterCharacteristicsService,
    MeemArabicLetterCharacteristicsService,
    MuHanziLetterCharacteristicsService,
    NLatinLetterCharacteristicsService,
    NoonArabicLetterCharacteristicsService,
    OLatinLetterCharacteristicsService,
    OmegaGreekLetterCharacteristicsService,
    PhiGreekLetterCharacteristicsService,
    PieupHangulLetterCharacteristicsService,
    PsiGreekLetterCharacteristicsService,
    QafArabicLetterCharacteristicsService,
    RehArabicLetterCharacteristicsService,
    RhoGreekLetterCharacteristicsService,
    SLatinLetterCharacteristicsService,
    SadArabicLetterCharacteristicsService,
    SeenArabicLetterCharacteristicsService,
    ShangHanziLetterCharacteristicsService,
    ShenHanziLetterCharacteristicsService,
    SigmaGreekLetterCharacteristicsService,
    TLatinLetterCharacteristicsService,
    TahArabicLetterCharacteristicsService,
    TavHebrewLetterCharacteristicsService,
    TianHanziLetterCharacteristicsService,
    TuHanziLetterCharacteristicsService,
    TuSoilHanziLetterCharacteristicsService,
    ULatinLetterCharacteristicsService,
    WLatinLetterCharacteristicsService,
    WangHanziLetterCharacteristicsService,
    WawArabicLetterCharacteristicsService,
    XLatinLetterCharacteristicsService,
    YLatinLetterCharacteristicsService,
    YaHangulLetterCharacteristicsService,
    YehArabicLetterCharacteristicsService,
    YeoHangulLetterCharacteristicsService,
    YoHangulLetterCharacteristicsService,
    YouHanziLetterCharacteristicsService,
    YuHangulLetterCharacteristicsService,
    YuKatakanaLetterCharacteristicsService,
    ZLatinLetterCharacteristicsService,
  ],
  imports: [SubmatrixUtilitiesModule],
  providers: [
    LetterUtilitiesService,
    ALatinLetterCharacteristicsService,
    AinArabicLetterCharacteristicsService,
    AlefArabicLetterCharacteristicsService,
    AoHanziLetterCharacteristicsService,
    BLatinLetterCharacteristicsService,
    BehArabicLetterCharacteristicsService,
    CLatinLetterCharacteristicsService,
    DalArabicLetterCharacteristicsService,
    DaletHebrewLetterCharacteristicsService,
    DeltaGreekLetterCharacteristicsService,
    ELatinLetterCharacteristicsService,
    FLatinLetterCharacteristicsService,
    FehArabicLetterCharacteristicsService,
    GanHanziLetterCharacteristicsService,
    HLatinLetterCharacteristicsService,
    HahArabicLetterCharacteristicsService,
    HehArabicLetterCharacteristicsService,
    ILatinLetterCharacteristicsService,
    JiaHanziLetterCharacteristicsService,
    JingHanziLetterCharacteristicsService,
    KafArabicLetterCharacteristicsService,
    KappaGreekLetterCharacteristicsService,
    KieukHangulLetterCharacteristicsService,
    LLatinLetterCharacteristicsService,
    LamArabicLetterCharacteristicsService,
    LambdaGreekLetterCharacteristicsService,
    LamedHebrewLetterCharacteristicsService,
    MLatinLetterCharacteristicsService,
    MeemArabicLetterCharacteristicsService,
    MuHanziLetterCharacteristicsService,
    NLatinLetterCharacteristicsService,
    NoonArabicLetterCharacteristicsService,
    OLatinLetterCharacteristicsService,
    OmegaGreekLetterCharacteristicsService,
    PhiGreekLetterCharacteristicsService,
    PieupHangulLetterCharacteristicsService,
    PsiGreekLetterCharacteristicsService,
    QafArabicLetterCharacteristicsService,
    RehArabicLetterCharacteristicsService,
    RhoGreekLetterCharacteristicsService,
    SLatinLetterCharacteristicsService,
    SadArabicLetterCharacteristicsService,
    SeenArabicLetterCharacteristicsService,
    ShangHanziLetterCharacteristicsService,
    ShenHanziLetterCharacteristicsService,
    SigmaGreekLetterCharacteristicsService,
    TLatinLetterCharacteristicsService,
    TahArabicLetterCharacteristicsService,
    TavHebrewLetterCharacteristicsService,
    TianHanziLetterCharacteristicsService,
    TuHanziLetterCharacteristicsService,
    TuSoilHanziLetterCharacteristicsService,
    ULatinLetterCharacteristicsService,
    WLatinLetterCharacteristicsService,
    WangHanziLetterCharacteristicsService,
    WawArabicLetterCharacteristicsService,
    XLatinLetterCharacteristicsService,
    YLatinLetterCharacteristicsService,
    YaHangulLetterCharacteristicsService,
    YehArabicLetterCharacteristicsService,
    YeoHangulLetterCharacteristicsService,
    YoHangulLetterCharacteristicsService,
    YouHanziLetterCharacteristicsService,
    YuHangulLetterCharacteristicsService,
    YuKatakanaLetterCharacteristicsService,
    ZLatinLetterCharacteristicsService,
  ],
})
export class LetterCharacteristicsModule {}
