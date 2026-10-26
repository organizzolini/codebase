import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Adds the `pg_trgm` and `fuzzystrmatch` extensions fuzzy Latin search ranks
 * with, and the trigram indexes that keep it fast over every headword and word.
 */
export class Migration1792000000000 implements MigrationInterface {
  name = "Migration1792000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '10s'`);
    await queryRunner.query(`SET statement_timeout = '5m'`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "fuzzystrmatch"`);
    await queryRunner.query(
      `CREATE INDEX "lexemes_lemma_trigram_index" ON "lexico"."lexemes" USING gin (LOWER("lemma") gin_trgm_ops)`,
    );
    await queryRunner.query(
      `CREATE INDEX "words_data_trigram_index" ON "lexico"."words" USING gin (LOWER("data") gin_trgm_ops)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`SET lock_timeout = '10s'`);
    await queryRunner.query(`SET statement_timeout = '5m'`);
    await queryRunner.query(`DROP INDEX "lexico"."words_data_trigram_index"`);
    await queryRunner.query(
      `DROP INDEX "lexico"."lexemes_lemma_trigram_index"`,
    );
    await queryRunner.query(`DROP EXTENSION IF EXISTS "fuzzystrmatch"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "pg_trgm"`);
  }
}
