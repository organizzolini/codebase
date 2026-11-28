import { Module } from "@nestjs/common";

import { EphemerisModule } from "../ephemeris/ephemeris.module";
import { BoundarySearchModule } from "../ephemeris/modules/boundary-search/boundary-search.module";

import {
  COMPOSITE_ASPECT_DETECTORS_TOKEN,
  PROGRESSIVE_ASPECT_DETECTORS_TOKEN,
  SIMPLE_ASPECT_DETECTORS_TOKEN,
} from "./aspects.constants";
import { AspectsService } from "./aspects.service";
import { AspectEdgesService } from "./modules/calculation/aspect-edges.service";
import { MajorAspectsModule } from "./modules/major-aspects/major-aspects.module";
import { MajorAspectsService } from "./modules/major-aspects/major-aspects.service";
import { MinorAspectsModule } from "./modules/minor-aspects/minor-aspects.module";
import { MinorAspectsService } from "./modules/minor-aspects/minor-aspects.service";
import { QuadrupleAspectsModule } from "./modules/quadruple-aspects/quadruple-aspects.module";
import { QuadrupleAspectsService } from "./modules/quadruple-aspects/quadruple-aspects.service";
import { QuintupleAspectsModule } from "./modules/quintuple-aspects/quintuple-aspects.module";
import { QuintupleAspectsService } from "./modules/quintuple-aspects/quintuple-aspects.service";
import { SextupleAspectsModule } from "./modules/sextuple-aspects/sextuple-aspects.module";
import { SextupleAspectsService } from "./modules/sextuple-aspects/sextuple-aspects.service";
import { SpecialtyAspectsModule } from "./modules/specialty-aspects/specialty-aspects.module";
import { SpecialtyAspectsService } from "./modules/specialty-aspects/specialty-aspects.service";
import { StelliumModule } from "./modules/stellium/stellium.module";
import { StelliumService } from "./modules/stellium/stellium.service";
import { TripleAspectsModule } from "./modules/triple-aspects/triple-aspects.module";
import { TripleAspectsService } from "./modules/triple-aspects/triple-aspects.service";
import { AspectsUtilitiesModule } from "./modules/utilities/aspects-utilities.module";

import type {
  CompositeAspectDetector,
  ProgressiveAspectDetector,
  SimpleAspectDetector,
} from "./aspects.types";

/**
 * NestJS module for astronomical aspect detection.
 * Orchestrates all aspect-type sub-modules and exports {@link AspectsService} which
 * composes 2-body and multi-body pattern detection across the full aspect taxonomy.
 */
@Module({
  controllers: [],
  exports: [AspectsService],
  imports: [
    AspectsUtilitiesModule,
    BoundarySearchModule,
    EphemerisModule,
    MajorAspectsModule,
    MinorAspectsModule,
    TripleAspectsModule,
    QuadrupleAspectsModule,
    QuintupleAspectsModule,
    SextupleAspectsModule,
    SpecialtyAspectsModule,
    StelliumModule,
  ],
  providers: [
    AspectEdgesService,
    AspectsService,
    {
      inject: [
        MajorAspectsService,
        MinorAspectsService,
        SpecialtyAspectsService,
      ],
      provide: SIMPLE_ASPECT_DETECTORS_TOKEN,
      useFactory: (
        majorAspectsService: MajorAspectsService,
        minorAspectsService: MinorAspectsService,
        specialtyAspectsService: SpecialtyAspectsService,
      ): SimpleAspectDetector[] => [
        majorAspectsService,
        minorAspectsService,
        specialtyAspectsService,
      ],
    },
    {
      inject: [
        TripleAspectsService,
        QuadrupleAspectsService,
        QuintupleAspectsService,
        SextupleAspectsService,
        StelliumService,
      ],
      provide: COMPOSITE_ASPECT_DETECTORS_TOKEN,
      useFactory: (
        tripleAspectsService: TripleAspectsService,
        quadrupleAspectsService: QuadrupleAspectsService,
        quintupleAspectsService: QuintupleAspectsService,
        sextupleAspectsService: SextupleAspectsService,
        stelliumService: StelliumService,
      ): CompositeAspectDetector[] => [
        tripleAspectsService,
        quadrupleAspectsService,
        quintupleAspectsService,
        sextupleAspectsService,
        stelliumService,
      ],
    },
    {
      inject: [
        MajorAspectsService,
        MinorAspectsService,
        SpecialtyAspectsService,
        TripleAspectsService,
        QuadrupleAspectsService,
        QuintupleAspectsService,
        SextupleAspectsService,
        StelliumService,
      ],
      provide: PROGRESSIVE_ASPECT_DETECTORS_TOKEN,
      useFactory: (
        majorAspectsService: MajorAspectsService,
        minorAspectsService: MinorAspectsService,
        specialtyAspectsService: SpecialtyAspectsService,
        tripleAspectsService: TripleAspectsService,
        quadrupleAspectsService: QuadrupleAspectsService,
        quintupleAspectsService: QuintupleAspectsService,
        sextupleAspectsService: SextupleAspectsService,
        stelliumService: StelliumService,
      ): ProgressiveAspectDetector[] => [
        majorAspectsService,
        minorAspectsService,
        specialtyAspectsService,
        tripleAspectsService,
        quadrupleAspectsService,
        quintupleAspectsService,
        sextupleAspectsService,
        stelliumService,
      ],
    },
  ],
})
export class AspectsModule {}
