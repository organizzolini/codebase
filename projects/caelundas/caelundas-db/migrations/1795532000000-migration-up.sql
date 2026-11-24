SET lock_timeout = '10s';

SET statement_timeout = '5min';

ALTER TABLE "tags" ADD "icon" text;

ALTER TABLE "tags" ADD "note" text;

ALTER TABLE "tags" ADD "order" smallint NOT NULL DEFAULT '0';
