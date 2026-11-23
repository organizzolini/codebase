import type { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Replaces `constellation_lines` with `constellation_edges`, the table the
 * `Constellation` graph generates, carrying its rows over. The keys and
 * indexes are named as TypeORM names them for the new table, so the next
 * generate finds no difference.
 */
export class Migration1795466077000 implements MigrationInterface {
  name = "Migration1795466077000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "constellation_edges" ("constellation_designation" text NOT NULL, "from_hip" bigint NOT NULL, "to_hip" bigint NOT NULL, CONSTRAINT "PK_a32e2be764ccbe09e19f10384f1" PRIMARY KEY ("constellation_designation", "from_hip", "to_hip"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "constellation_edges_to_hip" ON "constellation_edges"  ("to_hip") `,
    );
    await queryRunner.query(
      `CREATE INDEX "constellation_edges_from_hip" ON "constellation_edges"  ("from_hip") `,
    );
    await queryRunner.query(
      `INSERT INTO "constellation_edges" ("constellation_designation", "from_hip", "to_hip") SELECT "constellation_designation", "from_hip", "to_hip" FROM "constellation_lines"`,
    );
    await queryRunner.query(
      `ALTER TABLE "constellation_edges" ADD CONSTRAINT "FK_04d68e2ee86feb8798df9881158" FOREIGN KEY ("constellation_designation") REFERENCES "constellations"("designation") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "constellation_edges" ADD CONSTRAINT "FK_d952356fc9daa4133c753105b3c" FOREIGN KEY ("from_hip") REFERENCES "stars"("hip") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "constellation_edges" ADD CONSTRAINT "FK_b82df4a773517d7ddf1b8b8df14" FOREIGN KEY ("to_hip") REFERENCES "stars"("hip") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`DROP TABLE "constellation_lines"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "constellation_lines" ("constellation_designation" text NOT NULL, "from_hip" bigint NOT NULL, "to_hip" bigint NOT NULL, CONSTRAINT "PK_8b17475143b26888ce18b2ebc51" PRIMARY KEY ("constellation_designation", "from_hip", "to_hip"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "constellation_lines_to_hip" ON "constellation_lines"  ("to_hip") `,
    );
    await queryRunner.query(
      `CREATE INDEX "constellation_lines_from_hip" ON "constellation_lines"  ("from_hip") `,
    );
    await queryRunner.query(
      `INSERT INTO "constellation_lines" ("constellation_designation", "from_hip", "to_hip") SELECT "constellation_designation", "from_hip", "to_hip" FROM "constellation_edges"`,
    );
    await queryRunner.query(
      `ALTER TABLE "constellation_lines" ADD CONSTRAINT "FK_cd94ca681020ea973ded017c089" FOREIGN KEY ("constellation_designation") REFERENCES "constellations"("designation") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "constellation_lines" ADD CONSTRAINT "FK_cf2a9cc8a473723f68be0b40b41" FOREIGN KEY ("from_hip") REFERENCES "stars"("hip") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "constellation_lines" ADD CONSTRAINT "FK_bd51ce53daefdc59902c12e31ae" FOREIGN KEY ("to_hip") REFERENCES "stars"("hip") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(`DROP TABLE "constellation_edges"`);
  }
}
