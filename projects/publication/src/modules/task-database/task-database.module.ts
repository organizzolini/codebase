import { Module } from "@nestjs/common";

import { ProcessRunnerModule } from "../process-runner/process-runner.module";

import { TaskDatabaseService } from "./task-database.service";

/** Provides the service that verifies, adopts, and keeps the Nx task database. */
@Module({
  controllers: [],
  exports: [TaskDatabaseService],
  imports: [ProcessRunnerModule],
  providers: [TaskDatabaseService],
})
export class TaskDatabaseModule {}
