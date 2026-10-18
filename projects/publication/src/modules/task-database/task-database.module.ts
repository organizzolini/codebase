import { Module } from "@nestjs/common";

import { TaskDatabaseService } from "./task-database.service";

/** Provides the service that verifies, adopts, and keeps the Nx task database. */
@Module({
  controllers: [],
  exports: [TaskDatabaseService],
  imports: [],
  providers: [TaskDatabaseService],
})
export class TaskDatabaseModule {}
