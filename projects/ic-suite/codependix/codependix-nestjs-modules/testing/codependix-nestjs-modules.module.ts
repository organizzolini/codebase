import { Module } from "@nestjs/common";

/**
 * Fixture root module for `NestjsProjectService` unit tests.
 *
 * `exploreProject` imports the reported `rootModuleFile` dynamically, so the success path needs a real `MainModule` file on disk, not a mock.
 */
@Module({})
export class MainModule {}
