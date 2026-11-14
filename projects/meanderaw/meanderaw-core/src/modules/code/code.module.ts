import { Module } from "@nestjs/common";

import { SymmetryModule } from "../symmetry/symmetry.module";

import { CodeService } from "./code.service";

/**
 * Wires up the module that owns a meander's Code. {@link SymmetryModule} is
 * the one import, and its direction is the arrangement: depending the other
 * way as well would put the two in a cycle.
 */
@Module({
  controllers: [],
  exports: [CodeService],
  imports: [SymmetryModule],
  providers: [CodeService],
})
export class CodeModule {}
