import { Module } from "@nestjs/common";

import { PackageManifestModule } from "../package-manifest/package-manifest.module";

import { UpgradeNodeService } from "./upgrade-node.service";

/** Provides the upgrade of the Node version the workspace runs. */
@Module({
  controllers: [],
  exports: [UpgradeNodeService],
  imports: [PackageManifestModule],
  providers: [UpgradeNodeService],
})
export class UpgradeNodeModule {}
