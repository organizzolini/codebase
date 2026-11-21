import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Indexes `(rows, code)`, the order a page reads its rows in once ties break
 * by Code rather than by the order the meanders were stored in.
 */
export class Migration1794900000000 implements MigrationInterface {
  name = "Migration1794900000000";

  /** Drops the `(rows, code)` index. */
  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "meanderaw"."IDX_44c9d699d159e78e7a9bb8285f"`,
    );
  }

  /** Creates the `(rows, code)` index. */
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_44c9d699d159e78e7a9bb8285f" ON "meanderaw"."meanders"  ("rows", "code") `,
    );
  }
}
