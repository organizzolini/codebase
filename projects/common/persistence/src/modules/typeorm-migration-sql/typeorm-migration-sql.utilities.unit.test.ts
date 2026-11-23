import { describe, expect, it } from "vitest";

import { normalizeSql } from "./typeorm-migration-sql.utilities";

const RAW = `CREATE TABLE "alpha" ("id" integer NOT NULL, "name" text DEFAULT 'It''s ON');

ALTER TABLE "alpha" ADD CONSTRAINT "pk" PRIMARY KEY ("id");
`;

const FORMATTED = `create table alpha (
    id integer not null,
    name text default 'It''s ON'
);
alter table alpha add constraint pk primary key (id);`;

describe(normalizeSql, () => {
  it("compares raw and formatted renderings of the same SQL as equal", () => {
    expect(normalizeSql(FORMATTED)).toBe(normalizeSql(RAW));
  });

  it("tells apart a changed identifier", () => {
    expect(normalizeSql(RAW.replace('"name"', '"title"'))).not.toBe(
      normalizeSql(FORMATTED),
    );
  });

  it("tells apart a changed literal's text or case", () => {
    expect(normalizeSql(RAW.replace("ON", "OFF"))).not.toBe(
      normalizeSql(FORMATTED),
    );
    expect(normalizeSql(RAW.replace("ON", "on"))).not.toBe(
      normalizeSql(FORMATTED),
    );
  });

  it("keeps whitespace and punctuation inside literals", () => {
    expect(normalizeSql("select 'a  ( b ) ;';")).toBe("select 'a  ( b ) ;'");
  });

  it("tells apart missing, extra, and reordered statements", () => {
    expect(normalizeSql("select 1; select 2;")).not.toBe(
      normalizeSql("select 1;"),
    );
    expect(normalizeSql("select 1;")).not.toBe(
      normalizeSql("select 1; select 1;"),
    );
    expect(normalizeSql("select 1; select 2;")).not.toBe(
      normalizeSql("select 2; select 1;"),
    );
  });

  it("normalizes empty SQL to an empty string", () => {
    expect(normalizeSql("\n")).toBe("");
  });
});
