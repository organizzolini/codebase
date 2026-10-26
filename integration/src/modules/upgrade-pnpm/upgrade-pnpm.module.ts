import { Module } from "@nestjs/common";

import { PackageManifestModule } from "../package-manifest/package-manifest.module";
import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { UpgradePnpmService } from "./upgrade-pnpm.service";

/** Provides the upgrade of the pnpm version the workspace pins. */
@Module({
  controllers: [],
  exports: [UpgradePnpmService],
  imports: [PackageManifestModule, ProcessRunnerModule],
  providers: [UpgradePnpmService],
})
export class UpgradePnpmModule {}
