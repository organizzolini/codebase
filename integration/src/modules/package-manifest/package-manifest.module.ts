import { Module } from "@nestjs/common";

import { PackageManifestService } from "./package-manifest.service";

/** Provides the edits the upgrades make to the workspace root `package.json`. */
@Module({
  controllers: [],
  exports: [PackageManifestService],
  imports: [],
  providers: [PackageManifestService],
})
export class PackageManifestModule {}
