SET lock_timeout = '10s';

SET statement_timeout = '5min';

CREATE TABLE "tags" ("id" uuid NOT NULL DEFAULT uuidv7(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" uuid, "icon" text, "is_default_group" boolean NOT NULL DEFAULT true, "is_filterable" boolean NOT NULL DEFAULT true, "is_groupable" boolean NOT NULL DEFAULT true, "is_selectable" boolean NOT NULL DEFAULT true, "is_sortable" boolean NOT NULL DEFAULT true, "name" text NOT NULL, "note" text, "rank" smallint NOT NULL DEFAULT '0', "slug" text NOT NULL, CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id")); COMMENT ON COLUMN "tags"."id" IS 'Primary key, a uuidv7 the database assigns on insert'; COMMENT ON COLUMN "tags"."created_at" IS 'Timestamp when the record was created'; COMMENT ON COLUMN "tags"."created_by" IS 'Identifier of the user or process that created the record'; COMMENT ON COLUMN "tags"."updated_at" IS 'Timestamp when the record was last updated'; COMMENT ON COLUMN "tags"."updated_by" IS 'Identifier of the user or process that last updated the record';

CREATE INDEX "tags_slug" ON "tags"  ("slug");

CREATE TABLE IF NOT EXISTS "caelundas"."typeorm_metadata" ("type" character varying NOT NULL, "database" character varying, "schema" character varying, "table" character varying, "name" character varying, "value" text);

INSERT INTO "caelundas"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (current_database(), $1, $2, $3, $4, $5);

INSERT INTO "caelundas"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (current_database(), $1, $2, $3, $4, $5);

INSERT INTO "caelundas"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (current_database(), $1, $2, $3, $4, $5);

CREATE TABLE "calendar_events" ("id" uuid NOT NULL DEFAULT uuidv7(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" uuid, "end" TIMESTAMP WITH TIME ZONE NOT NULL, "end_local_day" date GENERATED ALWAYS AS (("end" AT TIME ZONE timezone)::date) STORED NOT NULL, "latitude" numeric(9,6) NOT NULL, "longitude" numeric(9,6) NOT NULL, "name" text NOT NULL, "note" text NOT NULL, "start" TIMESTAMP WITH TIME ZONE NOT NULL, "start_local_day" date GENERATED ALWAYS AS (("start" AT TIME ZONE timezone)::date) STORED NOT NULL, "start_local_hour" smallint GENERATED ALWAYS AS (EXTRACT(HOUR FROM "start" AT TIME ZONE timezone)::smallint) STORED NOT NULL, "timezone" text NOT NULL, CONSTRAINT "calendar_events_natural_key" UNIQUE ("name", "start", "end", "latitude", "longitude"), CONSTRAINT "PK_faf5391d232322a87cdd1c6f30c" PRIMARY KEY ("id")); COMMENT ON COLUMN "calendar_events"."id" IS 'Primary key, a uuidv7 the database assigns on insert'; COMMENT ON COLUMN "calendar_events"."created_at" IS 'Timestamp when the record was created'; COMMENT ON COLUMN "calendar_events"."created_by" IS 'Identifier of the user or process that created the record'; COMMENT ON COLUMN "calendar_events"."updated_at" IS 'Timestamp when the record was last updated'; COMMENT ON COLUMN "calendar_events"."updated_by" IS 'Identifier of the user or process that last updated the record';

CREATE INDEX "calendar_events_location_start" ON "calendar_events"  ("latitude", "longitude", "start");

CREATE INDEX "calendar_events_start_local_day" ON "calendar_events"  ("start_local_day");

CREATE INDEX "calendar_events_end" ON "calendar_events"  ("end");

CREATE INDEX "calendar_events_start_end" ON "calendar_events"  ("start", "end");

CREATE TABLE "calendar_event_tags" ("calendar_event_id" uuid NOT NULL, "tag_id" uuid NOT NULL, CONSTRAINT "PK_e9cd6a8835a055d90f7d2df0ed7" PRIMARY KEY ("calendar_event_id", "tag_id"));

CREATE INDEX "calendar_event_tags_tag_id_calendar_event_id" ON "calendar_event_tags"  ("tag_id", "calendar_event_id");

CREATE TABLE "measures" ("id" uuid NOT NULL DEFAULT uuidv7(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" uuid, "icon" text NOT NULL, "name" text NOT NULL, "note" text NOT NULL, "slug" text NOT NULL, "unit" text NOT NULL, CONSTRAINT "measures_unit" CHECK ("unit" in ('count', 'duration', 'instant', 'none')), CONSTRAINT "PK_ec34a47385441849095def20546" PRIMARY KEY ("id")); COMMENT ON COLUMN "measures"."id" IS 'Primary key, a uuidv7 the database assigns on insert'; COMMENT ON COLUMN "measures"."created_at" IS 'Timestamp when the record was created'; COMMENT ON COLUMN "measures"."created_by" IS 'Identifier of the user or process that created the record'; COMMENT ON COLUMN "measures"."updated_at" IS 'Timestamp when the record was last updated'; COMMENT ON COLUMN "measures"."updated_by" IS 'Identifier of the user or process that last updated the record';

CREATE UNIQUE INDEX "measures_slug" ON "measures"  ("slug");

CREATE TABLE "metrics" ("id" uuid NOT NULL DEFAULT uuidv7(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" uuid, "expression_id" uuid, "icon" text NOT NULL, "name" text NOT NULL, "note" text NOT NULL, "slug" text NOT NULL, "unit" text NOT NULL, CONSTRAINT "metrics_unit" CHECK ("unit" in ('count', 'duration', 'instant', 'none')), CONSTRAINT "PK_5283cad666a83376e28a715bf0e" PRIMARY KEY ("id")); COMMENT ON COLUMN "metrics"."id" IS 'Primary key, a uuidv7 the database assigns on insert'; COMMENT ON COLUMN "metrics"."created_at" IS 'Timestamp when the record was created'; COMMENT ON COLUMN "metrics"."created_by" IS 'Identifier of the user or process that created the record'; COMMENT ON COLUMN "metrics"."updated_at" IS 'Timestamp when the record was last updated'; COMMENT ON COLUMN "metrics"."updated_by" IS 'Identifier of the user or process that last updated the record';

CREATE UNIQUE INDEX "metrics_expression_id" ON "metrics"  ("expression_id");

CREATE UNIQUE INDEX "metrics_slug" ON "metrics"  ("slug");

CREATE TABLE "metric_expressions" ("id" uuid NOT NULL DEFAULT uuidv7(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" uuid, "kind" text NOT NULL, "measure_id" uuid, "metric_id" uuid, "operator" text, "parent_id" uuid, "position" smallint NOT NULL, CONSTRAINT "metric_expressions_kind" CHECK (("kind" = 'measure' AND "measure_id" IS NOT NULL) OR ("kind" = 'metric' AND "metric_id" IS NOT NULL) OR ("kind" = 'operator' AND "operator" IS NOT NULL)), CONSTRAINT "PK_724c7b31fb18c0c65db6d39965c" PRIMARY KEY ("id")); COMMENT ON COLUMN "metric_expressions"."id" IS 'Primary key, a uuidv7 the database assigns on insert'; COMMENT ON COLUMN "metric_expressions"."created_at" IS 'Timestamp when the record was created'; COMMENT ON COLUMN "metric_expressions"."created_by" IS 'Identifier of the user or process that created the record'; COMMENT ON COLUMN "metric_expressions"."updated_at" IS 'Timestamp when the record was last updated'; COMMENT ON COLUMN "metric_expressions"."updated_by" IS 'Identifier of the user or process that last updated the record';

CREATE UNIQUE INDEX "metric_expressions_parent_position" ON "metric_expressions"  ("parent_id", "position") WHERE "parent_id" IS NOT NULL;

CREATE TABLE "constellation_edges" ("constellation_id" text NOT NULL, "source_node" bigint NOT NULL, "target_node" bigint NOT NULL, CONSTRAINT "PK_bfdda0678824ee2374f1c72f018" PRIMARY KEY ("constellation_id", "source_node", "target_node"));

CREATE INDEX "constellation_edges_target_node" ON "constellation_edges"  ("target_node");

CREATE INDEX "constellation_edges_source_node" ON "constellation_edges"  ("source_node");

CREATE TABLE "constellations" ("designation" text NOT NULL, "is_zodiac" boolean NOT NULL, "name" text NOT NULL, CONSTRAINT "PK_a2e3889182b012a788561333c5d" PRIMARY KEY ("designation"));

CREATE TABLE "stars" ("color_index" real NOT NULL, "declination_degrees" real NOT NULL, "hipparcos_number" bigint NOT NULL, "magnitude" real NOT NULL, "right_ascension_hours" real NOT NULL, CONSTRAINT "PK_f227cc7d7b5630d31397da00507" PRIMARY KEY ("hipparcos_number"));

CREATE TABLE "tag_edges" ("source_node" uuid NOT NULL, "target_node" uuid NOT NULL, CONSTRAINT "PK_tag_edges" PRIMARY KEY ("source_node", "target_node"));

CREATE INDEX "tag_edges_target_node" ON "tag_edges"  ("target_node");

CREATE INDEX "tag_edges_source_node" ON "tag_edges"  ("source_node");

CREATE TABLE "metric_expressions_closure" ("ancestor_id" uuid NOT NULL, "descendant_id" uuid NOT NULL, CONSTRAINT "PK_317f275950bb7a558756794a7d6" PRIMARY KEY ("ancestor_id", "descendant_id"));

CREATE INDEX "IDX_4dd9ee9dd9e246b4cbe04f14e7" ON "metric_expressions_closure"  ("ancestor_id");

CREATE INDEX "IDX_4c8cc112ad12a06cebe2d12f45" ON "metric_expressions_closure"  ("descendant_id");

ALTER TABLE "calendar_event_tags" ADD CONSTRAINT "FK_146237171c57f84a0ff62036294" FOREIGN KEY ("calendar_event_id") REFERENCES "calendar_events"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "calendar_event_tags" ADD CONSTRAINT "FK_6f0520ed07726fe729a882a6928" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "metrics" ADD CONSTRAINT "FK_8661e41337b8db4934b3a1e62ec" FOREIGN KEY ("expression_id") REFERENCES "metric_expressions"("id") ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE "metric_expressions" ADD CONSTRAINT "FK_d6378a0ab39be61f7ef0066c09a" FOREIGN KEY ("measure_id") REFERENCES "measures"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE "metric_expressions" ADD CONSTRAINT "FK_99e1eaba42385dcb9548092b6a8" FOREIGN KEY ("metric_id") REFERENCES "metrics"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE "metric_expressions" ADD CONSTRAINT "FK_eebfca0101b6bb9b9f3ec2cc108" FOREIGN KEY ("parent_id") REFERENCES "metric_expressions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "constellation_edges" ADD CONSTRAINT "FK_037fc3e87b256f309e5cf499cde" FOREIGN KEY ("constellation_id") REFERENCES "constellations"("designation") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "constellation_edges" ADD CONSTRAINT "FK_0d6cd1241fe640015005c630a03" FOREIGN KEY ("source_node") REFERENCES "stars"("hipparcos_number") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "constellation_edges" ADD CONSTRAINT "FK_a7954f4db381f98e1b7a734b1c5" FOREIGN KEY ("target_node") REFERENCES "stars"("hipparcos_number") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "tag_edges" ADD CONSTRAINT "FK_57008c88a60a908ca4b8bbf5807" FOREIGN KEY ("source_node") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "tag_edges" ADD CONSTRAINT "FK_4ebc4574b20762da23f596a8303" FOREIGN KEY ("target_node") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "metric_expressions_closure" ADD CONSTRAINT "FK_4dd9ee9dd9e246b4cbe04f14e7c" FOREIGN KEY ("ancestor_id") REFERENCES "metric_expressions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "metric_expressions_closure" ADD CONSTRAINT "FK_4c8cc112ad12a06cebe2d12f45e" FOREIGN KEY ("descendant_id") REFERENCES "metric_expressions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

INSERT INTO "measures" ("id", "slug", "name", "icon", "note", "unit") VALUES
('01a215c2-febb-77a2-b54b-34276070207e', 'events', 'Events', 'hash', 'Events counted, one each.', 'count'),
('01a215c2-febc-77a1-9712-beece1aea441', 'perfective-events', 'Perfective events', 'circle-dot', 'Events that happen at a moment and last no time.', 'count'),
('01a215c2-febd-77a0-b1da-20b262e52854', 'progressive-events', 'Progressive events', 'move-horizontal', 'Events that last a while and have a start and an end.', 'count'),
('01a215c2-febe-77a7-93a1-ab7be213ac3f', 'days-with-events', 'Days with events', 'calendar-days', 'The local days an event starts on, each counted once.', 'count'),
('01a215c2-febf-77a6-bc69-2d01634e3002', 'unique-names', 'Unique names', 'fingerprint', 'The different event names, each counted once.', 'count'),
('01a215c2-fec0-77a5-9e30-97c6e484b415', 'unique-tags', 'Unique tags', 'tags', 'The different tags events carry directly, each counted once.', 'count'),
('01a215c2-fec1-77a4-b8f8-198c643338f8', 'duration', 'Duration', 'timer', 'The lengths of the events added up, in minutes; a perfective event lasts none.', 'duration'),
('01a215c2-fec3-77aa-a48f-0a1b66a400d6', 'covered-duration', 'Covered duration', 'layers', 'How long at least one progressive event is under way, in minutes; overlaps count once.', 'duration'),
('01a215c2-fec4-77a9-8556-8ca0e7d284b9', 'longest-progressive-duration', 'Longest progressive duration', 'arrow-up-to-line', 'The length of the longest progressive event, in minutes.', 'duration'),
('01a215c2-fec5-77a8-a71e-77666709088c', 'shortest-progressive-duration', 'Shortest progressive duration', 'arrow-down-to-line', 'The length of the shortest progressive event, in minutes.', 'duration'),
('01a215c2-fec6-77af-81e5-f92fe8478c97', 'median-progressive-duration', 'Median progressive duration', 'scale', 'The middle length of the progressive events, in minutes, half shorter and half longer.', 'duration'),
('01a215c2-fec7-77ae-a3ad-63f569f2117a', 'first-start', 'First start', 'arrow-left-to-line', 'When the earliest event starts, in epoch milliseconds.', 'instant'),
('01a215c2-fec8-77ad-8c74-e5bae928954d', 'last-start', 'Last start', 'arrow-right-to-line', 'When the latest event starts, in epoch milliseconds.', 'instant'),
('01a215c2-fec9-77ac-ae3c-6c406a671950', 'period-length', 'Period length', 'ruler', 'The length of the period measured, in minutes.', 'duration'),
('01a215c2-feca-77b3-880b-d609eb9d9d3b', 'clipped-duration', 'Clipped duration', 'layers-2', 'The events'' lengths inside the period added up, in minutes; overlaps count once per event.', 'duration'),
('01a215c2-fecb-77b2-aad3-58cf6cc8610e', 'covered-clipped-duration', 'Covered clipped duration', 'layers', 'How long inside the period at least one event is under way, in minutes; overlaps count once.', 'duration'),
('01a215c2-fecc-77b1-b49a-c294ec06e511', 'progressive-clipped-duration', 'Progressive clipped duration', 'layers-2', 'The Progressive events'' lengths inside the period added up, in minutes.', 'duration'),
('01a215c2-fecd-77b0-9562-455a6dbd69e4', 'progressive-covered-clipped-duration', 'Progressive covered clipped duration', 'layers', 'How long inside the period at least one Progressive event is under way, in minutes.', 'duration');

INSERT INTO "metrics" ("id", "slug", "name", "icon", "note", "unit") VALUES
('01a215c2-ff1e-77c7-a6d7-c1eba622245f', 'events', 'Events', 'hash', 'How many distinct events there are.', 'count'),
('01a215c2-ff1f-77c6-809f-4bb12758a822', 'unique-names', 'Unique names', 'fingerprint', 'How many different event names there are.', 'count'),
('01a215c2-ff20-77c5-a166-3276a8972c35', 'unique-tags', 'Unique tags', 'tags', 'How many different tags the events carry.', 'count'),
('01a215c2-ff21-77c4-832d-b43c29cdb018', 'days-with-events', 'Days with events', 'calendar-days', 'How many calendar days an event starts on.', 'count'),
('01a215c2-ff22-77cb-adf5-3ec5a97834e3', 'perfective-events', 'Perfective events', 'circle-dot', 'How many events happen at a moment and last no time.', 'count'),
('01a215c2-ff23-77ca-8fbc-a08b2ab6b8f6', 'progressive-events', 'Progressive events', 'move-horizontal', 'How many events last a while and have a start and an end.', 'count'),
('01a215c2-ff24-77c9-a984-2b50abed3cd9', 'duration', 'Duration', 'timer', 'The lengths of all the events added up; a perfective event lasts none.', 'duration'),
('01a215c2-ff25-77c8-8a53-ad162b1b80ac', 'covered-duration', 'Time covered', 'layers', 'How long at least one progressive event is under way; overlaps count once.', 'duration'),
('01a215c2-ff26-77cf-941b-17dfac5604b7', 'average-duration', 'Average duration', 'ruler', 'The mean length of the progressive events; perfective events have none.', 'duration'),
('01a215c2-ff27-77ce-b6e2-9e652d8c889a', 'median-duration', 'Median duration', 'scale', 'The middle length of the progressive events, half shorter and half longer.', 'duration'),
('01a215c2-ff28-77cd-90aa-002aad3b0d6d', 'longest-duration', 'Longest duration', 'arrow-up-to-line', 'The length of the longest progressive event.', 'duration'),
('01a215c2-ff29-77cc-b171-8af02e719170', 'shortest-duration', 'Shortest duration', 'arrow-down-to-line', 'The length of the shortest progressive event.', 'duration'),
('01a215c2-ff2b-77d2-bd00-f77f30da992e', 'covered-percent', 'Percent of time covered', 'layers', 'The share of the period at least one event is under way; overlaps count once, so it tops out at 100%.', 'none'),
('01a215c2-ff2c-77d1-9fc8-7904b0111d31', 'total-time-percent', 'Time counted', 'layers-2', 'The events'' lengths added up as a share of the period; overlaps count once per event, so it can pass 100%.', 'none'),
('01a215c2-ff2d-77d0-b997-e3ca314fe104', 'progressive-covered-percent', 'Progressive time covered', 'layers', 'The share of the period at least one Progressive event is under way; overlaps count once.', 'none'),
('01a215c2-ff2e-77d7-9a5f-6593b2fa65ef', 'progressive-total-percent', 'Progressive time counted', 'layers-2', 'The Progressive events'' lengths added up as a share of the period; overlaps count once per event, so it can pass 100%.', 'none'),
('01a215c2-ff2f-77d6-a426-ec593230e9f2', 'first-start', 'First start', 'arrow-left-to-line', 'When the earliest event starts.', 'instant'),
('01a215c2-ff30-77d5-86ee-561eb36f6dc5', 'last-start', 'Last start', 'arrow-right-to-line', 'When the latest event starts.', 'instant');

INSERT INTO "metric_expressions" ("id", "parent_id", "position", "kind", "operator", "measure_id", "metric_id") VALUES
('01a215c3-02a3-744a-8d96-bbcca5057276', NULL, 0, 'measure', NULL, '01a215c2-febb-77a2-b54b-34276070207e', NULL),
('01a215c3-02a4-7449-ae5e-3d9226b3f659', NULL, 0, 'measure', NULL, '01a215c2-febf-77a6-bc69-2d01634e3002', NULL),
('01a215c3-02a5-7448-8825-a45ba7ee7a2c', NULL, 0, 'measure', NULL, '01a215c2-fec0-77a5-9e30-97c6e484b415', NULL),
('01a215c3-02a6-744f-aaed-2ee12724fe37', NULL, 0, 'measure', NULL, '01a215c2-febe-77a7-93a1-ab7be213ac3f', NULL),
('01a215c3-02a7-744e-b4b4-90a6a853421a', NULL, 0, 'measure', NULL, '01a215c2-febc-77a1-9712-beece1aea441', NULL),
('01a215c3-02a8-744d-957c-1b6c2989c6ed', NULL, 0, 'measure', NULL, '01a215c2-febd-77a0-b1da-20b262e52854', NULL),
('01a215c3-02a9-744c-b74b-9d35aac44af0', NULL, 0, 'measure', NULL, '01a215c2-fec1-77a4-b8f8-198c643338f8', NULL),
('01a215c3-02aa-7453-9113-07fb2a72cedb', NULL, 0, 'measure', NULL, '01a215c2-fec3-77aa-a48f-0a1b66a400d6', NULL),
('01a215c3-02ab-7452-b3da-8980aba952ae', NULL, 0, 'operator', 'divide', NULL, NULL),
('01a215c3-02ac-7451-9da2-70462ce7d6b1', '01a215c3-02ab-7452-b3da-8980aba952ae', 0, 'metric', NULL, NULL, '01a215c2-ff24-77c9-a984-2b50abed3cd9'),
('01a215c3-02ad-7450-be69-fa0fac125a84', '01a215c3-02ab-7452-b3da-8980aba952ae', 1, 'measure', NULL, '01a215c2-febd-77a0-b1da-20b262e52854', NULL),
('01a215c3-02ae-7457-9831-7cd52d48df6f', NULL, 0, 'measure', NULL, '01a215c2-fec6-77af-81e5-f92fe8478c97', NULL),
('01a215c3-02af-7456-baf8-e69aae86a372', NULL, 0, 'measure', NULL, '01a215c2-fec4-77a9-8556-8ca0e7d284b9', NULL),
('01a215c3-02b0-7455-84c0-69202e3d2745', NULL, 0, 'measure', NULL, '01a215c2-fec5-77a8-a71e-77666709088c', NULL),
('01a215c3-02b2-745b-8757-55af30a62f33', NULL, 0, 'operator', 'percent', NULL, NULL),
('01a215c3-02b4-7459-83e6-463a310b37e9', '01a215c3-02b2-745b-8757-55af30a62f33', 0, 'measure', NULL, '01a215c2-fecb-77b2-aad3-58cf6cc8610e', NULL),
('01a215c3-02b5-7458-adad-c8c3b241bbfc', '01a215c3-02b2-745b-8757-55af30a62f33', 1, 'measure', NULL, '01a215c2-fec9-77ac-ae3c-6c406a671950', NULL),
('01a215c3-02b7-745e-a83c-354eb32a83aa', NULL, 0, 'operator', 'percent', NULL, NULL),
('01a215c3-02b9-745c-94d3-21ddb59f8b80', '01a215c3-02b7-745e-a83c-354eb32a83aa', 0, 'measure', NULL, '01a215c2-feca-77b3-880b-d609eb9d9d3b', NULL),
('01a215c3-02ba-73a3-b69a-a86336ca086b', '01a215c3-02b7-745e-a83c-354eb32a83aa', 1, 'measure', NULL, '01a215c2-fec9-77ac-ae3c-6c406a671950', NULL),
('01a215c3-02bc-73a1-b129-94ee37bf1041', NULL, 0, 'operator', 'percent', NULL, NULL),
('01a215c3-02be-73a7-bdb8-817d3820183f', '01a215c3-02bc-73a1-b129-94ee37bf1041', 0, 'measure', NULL, '01a215c2-fecd-77b0-9562-455a6dbd69e4', NULL),
('01a215c3-02bf-73a6-9f80-0b02b95e9c02', '01a215c3-02bc-73a1-b129-94ee37bf1041', 1, 'measure', NULL, '01a215c2-fec9-77ac-ae3c-6c406a671950', NULL),
('01a215c3-02c1-73a4-9a17-7791bbc3e4f8', NULL, 0, 'operator', 'percent', NULL, NULL),
('01a215c3-02c3-73aa-86a6-601cbcb4ecd6', '01a215c3-02c1-73a4-9a17-7791bbc3e4f8', 0, 'measure', NULL, '01a215c2-fecc-77b1-b49a-c294ec06e511', NULL),
('01a215c3-02c4-73a9-a76d-eaa23de370b9', '01a215c3-02c1-73a4-9a17-7791bbc3e4f8', 1, 'measure', NULL, '01a215c2-fec9-77ac-ae3c-6c406a671950', NULL),
('01a215c3-02c6-73af-a3fc-d7313e547897', NULL, 0, 'measure', NULL, '01a215c2-fec7-77ae-a3ad-63f569f2117a', NULL),
('01a215c3-02c7-73ae-8dc4-59f6bf82fd7a', NULL, 0, 'measure', NULL, '01a215c2-fec8-77ad-8c74-e5bae928954d', NULL);

INSERT INTO "metric_expressions_closure" ("ancestor_id", "descendant_id") VALUES
('01a215c3-02a3-744a-8d96-bbcca5057276', '01a215c3-02a3-744a-8d96-bbcca5057276'),
('01a215c3-02a4-7449-ae5e-3d9226b3f659', '01a215c3-02a4-7449-ae5e-3d9226b3f659'),
('01a215c3-02a5-7448-8825-a45ba7ee7a2c', '01a215c3-02a5-7448-8825-a45ba7ee7a2c'),
('01a215c3-02a6-744f-aaed-2ee12724fe37', '01a215c3-02a6-744f-aaed-2ee12724fe37'),
('01a215c3-02a7-744e-b4b4-90a6a853421a', '01a215c3-02a7-744e-b4b4-90a6a853421a'),
('01a215c3-02a8-744d-957c-1b6c2989c6ed', '01a215c3-02a8-744d-957c-1b6c2989c6ed'),
('01a215c3-02a9-744c-b74b-9d35aac44af0', '01a215c3-02a9-744c-b74b-9d35aac44af0'),
('01a215c3-02aa-7453-9113-07fb2a72cedb', '01a215c3-02aa-7453-9113-07fb2a72cedb'),
('01a215c3-02ab-7452-b3da-8980aba952ae', '01a215c3-02ab-7452-b3da-8980aba952ae'),
('01a215c3-02ac-7451-9da2-70462ce7d6b1', '01a215c3-02ac-7451-9da2-70462ce7d6b1'),
('01a215c3-02ab-7452-b3da-8980aba952ae', '01a215c3-02ac-7451-9da2-70462ce7d6b1'),
('01a215c3-02ad-7450-be69-fa0fac125a84', '01a215c3-02ad-7450-be69-fa0fac125a84'),
('01a215c3-02ab-7452-b3da-8980aba952ae', '01a215c3-02ad-7450-be69-fa0fac125a84'),
('01a215c3-02ae-7457-9831-7cd52d48df6f', '01a215c3-02ae-7457-9831-7cd52d48df6f'),
('01a215c3-02af-7456-baf8-e69aae86a372', '01a215c3-02af-7456-baf8-e69aae86a372'),
('01a215c3-02b0-7455-84c0-69202e3d2745', '01a215c3-02b0-7455-84c0-69202e3d2745'),
('01a215c3-02b2-745b-8757-55af30a62f33', '01a215c3-02b2-745b-8757-55af30a62f33'),
('01a215c3-02b4-7459-83e6-463a310b37e9', '01a215c3-02b4-7459-83e6-463a310b37e9'),
('01a215c3-02b2-745b-8757-55af30a62f33', '01a215c3-02b4-7459-83e6-463a310b37e9'),
('01a215c3-02b5-7458-adad-c8c3b241bbfc', '01a215c3-02b5-7458-adad-c8c3b241bbfc'),
('01a215c3-02b2-745b-8757-55af30a62f33', '01a215c3-02b5-7458-adad-c8c3b241bbfc'),
('01a215c3-02b7-745e-a83c-354eb32a83aa', '01a215c3-02b7-745e-a83c-354eb32a83aa'),
('01a215c3-02b9-745c-94d3-21ddb59f8b80', '01a215c3-02b9-745c-94d3-21ddb59f8b80'),
('01a215c3-02b7-745e-a83c-354eb32a83aa', '01a215c3-02b9-745c-94d3-21ddb59f8b80'),
('01a215c3-02ba-73a3-b69a-a86336ca086b', '01a215c3-02ba-73a3-b69a-a86336ca086b'),
('01a215c3-02b7-745e-a83c-354eb32a83aa', '01a215c3-02ba-73a3-b69a-a86336ca086b'),
('01a215c3-02bc-73a1-b129-94ee37bf1041', '01a215c3-02bc-73a1-b129-94ee37bf1041'),
('01a215c3-02be-73a7-bdb8-817d3820183f', '01a215c3-02be-73a7-bdb8-817d3820183f'),
('01a215c3-02bc-73a1-b129-94ee37bf1041', '01a215c3-02be-73a7-bdb8-817d3820183f'),
('01a215c3-02bf-73a6-9f80-0b02b95e9c02', '01a215c3-02bf-73a6-9f80-0b02b95e9c02'),
('01a215c3-02bc-73a1-b129-94ee37bf1041', '01a215c3-02bf-73a6-9f80-0b02b95e9c02'),
('01a215c3-02c1-73a4-9a17-7791bbc3e4f8', '01a215c3-02c1-73a4-9a17-7791bbc3e4f8'),
('01a215c3-02c3-73aa-86a6-601cbcb4ecd6', '01a215c3-02c3-73aa-86a6-601cbcb4ecd6'),
('01a215c3-02c1-73a4-9a17-7791bbc3e4f8', '01a215c3-02c3-73aa-86a6-601cbcb4ecd6'),
('01a215c3-02c4-73a9-a76d-eaa23de370b9', '01a215c3-02c4-73a9-a76d-eaa23de370b9'),
('01a215c3-02c1-73a4-9a17-7791bbc3e4f8', '01a215c3-02c4-73a9-a76d-eaa23de370b9'),
('01a215c3-02c6-73af-a3fc-d7313e547897', '01a215c3-02c6-73af-a3fc-d7313e547897'),
('01a215c3-02c7-73ae-8dc4-59f6bf82fd7a', '01a215c3-02c7-73ae-8dc4-59f6bf82fd7a');

UPDATE "metrics" AS m SET "expression_id" = v."expression_id"::uuid FROM (VALUES
('01a215c2-ff1e-77c7-a6d7-c1eba622245f', '01a215c3-02a3-744a-8d96-bbcca5057276'),
('01a215c2-ff1f-77c6-809f-4bb12758a822', '01a215c3-02a4-7449-ae5e-3d9226b3f659'),
('01a215c2-ff20-77c5-a166-3276a8972c35', '01a215c3-02a5-7448-8825-a45ba7ee7a2c'),
('01a215c2-ff21-77c4-832d-b43c29cdb018', '01a215c3-02a6-744f-aaed-2ee12724fe37'),
('01a215c2-ff22-77cb-adf5-3ec5a97834e3', '01a215c3-02a7-744e-b4b4-90a6a853421a'),
('01a215c2-ff23-77ca-8fbc-a08b2ab6b8f6', '01a215c3-02a8-744d-957c-1b6c2989c6ed'),
('01a215c2-ff24-77c9-a984-2b50abed3cd9', '01a215c3-02a9-744c-b74b-9d35aac44af0'),
('01a215c2-ff25-77c8-8a53-ad162b1b80ac', '01a215c3-02aa-7453-9113-07fb2a72cedb'),
('01a215c2-ff26-77cf-941b-17dfac5604b7', '01a215c3-02ab-7452-b3da-8980aba952ae'),
('01a215c2-ff27-77ce-b6e2-9e652d8c889a', '01a215c3-02ae-7457-9831-7cd52d48df6f'),
('01a215c2-ff28-77cd-90aa-002aad3b0d6d', '01a215c3-02af-7456-baf8-e69aae86a372'),
('01a215c2-ff29-77cc-b171-8af02e719170', '01a215c3-02b0-7455-84c0-69202e3d2745'),
('01a215c2-ff2b-77d2-bd00-f77f30da992e', '01a215c3-02b2-745b-8757-55af30a62f33'),
('01a215c2-ff2c-77d1-9fc8-7904b0111d31', '01a215c3-02b7-745e-a83c-354eb32a83aa'),
('01a215c2-ff2d-77d0-b997-e3ca314fe104', '01a215c3-02bc-73a1-b129-94ee37bf1041'),
('01a215c2-ff2e-77d7-9a5f-6593b2fa65ef', '01a215c3-02c1-73a4-9a17-7791bbc3e4f8'),
('01a215c2-ff2f-77d6-a426-ec593230e9f2', '01a215c3-02c6-73af-a3fc-d7313e547897'),
('01a215c2-ff30-77d5-86ee-561eb36f6dc5', '01a215c3-02c7-73ae-8dc4-59f6bf82fd7a')
) AS v ("metric_id", "expression_id") WHERE m."id" = v."metric_id"::uuid;

CREATE TABLE "groups" ("id" uuid NOT NULL DEFAULT uuidv7(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" uuid, "icon" text NOT NULL, "name" text NOT NULL, "note" text NOT NULL, "slug" text NOT NULL, CONSTRAINT "PK_659d1483316afb28afd3a90646e" PRIMARY KEY ("id")); COMMENT ON COLUMN "groups"."id" IS 'Primary key, a uuidv7 the database assigns on insert'; COMMENT ON COLUMN "groups"."created_at" IS 'Timestamp when the record was created'; COMMENT ON COLUMN "groups"."created_by" IS 'Identifier of the user or process that created the record'; COMMENT ON COLUMN "groups"."updated_at" IS 'Timestamp when the record was last updated'; COMMENT ON COLUMN "groups"."updated_by" IS 'Identifier of the user or process that last updated the record';

CREATE UNIQUE INDEX "groups_slug" ON "groups"  ("slug");

CREATE TABLE "filters" ("id" uuid NOT NULL DEFAULT uuidv7(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" uuid, "event_name" text, "group_id" uuid NOT NULL, "icon" text, "name" text, "note" text, "parent_id" uuid, "period" date, "slug" text, "tag_id" uuid, CONSTRAINT "PK_0a3564db8ce9b0dcb991598944c" PRIMARY KEY ("id")); COMMENT ON COLUMN "filters"."id" IS 'Primary key, a uuidv7 the database assigns on insert'; COMMENT ON COLUMN "filters"."created_at" IS 'Timestamp when the record was created'; COMMENT ON COLUMN "filters"."created_by" IS 'Identifier of the user or process that created the record'; COMMENT ON COLUMN "filters"."updated_at" IS 'Timestamp when the record was last updated'; COMMENT ON COLUMN "filters"."updated_by" IS 'Identifier of the user or process that last updated the record';

CREATE INDEX "filters_parent_id" ON "filters"  ("parent_id");

CREATE UNIQUE INDEX "filters_key" ON "filters"  ("group_id", "period", "tag_id", "event_name", "slug") NULLS NOT DISTINCT;

CREATE TABLE "calendar_event_facts" ("filter_id" uuid NOT NULL, "measurement" double precision NOT NULL, "measure_id" uuid NOT NULL, CONSTRAINT "PK_82a96180f9d2a14e089252ce4ec" PRIMARY KEY ("filter_id", "measure_id"));

CREATE TABLE "dimensions" ("id" uuid NOT NULL DEFAULT uuidv7(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "created_by" uuid, "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_by" uuid, "icon" text NOT NULL, "name" text NOT NULL, "note" text NOT NULL, "slug" text NOT NULL, CONSTRAINT "PK_79693265d800ad0830d1ddddb41" PRIMARY KEY ("id")); COMMENT ON COLUMN "dimensions"."id" IS 'Primary key, a uuidv7 the database assigns on insert'; COMMENT ON COLUMN "dimensions"."created_at" IS 'Timestamp when the record was created'; COMMENT ON COLUMN "dimensions"."created_by" IS 'Identifier of the user or process that created the record'; COMMENT ON COLUMN "dimensions"."updated_at" IS 'Timestamp when the record was last updated'; COMMENT ON COLUMN "dimensions"."updated_by" IS 'Identifier of the user or process that last updated the record';

CREATE UNIQUE INDEX "dimensions_slug" ON "dimensions"  ("slug");

CREATE TABLE "dimension_edges" ("source_node" uuid NOT NULL, "target_node" uuid NOT NULL, CONSTRAINT "PK_bd7e34426c28d43358106079918" PRIMARY KEY ("source_node", "target_node"));

CREATE INDEX "dimension_edges_target_node" ON "dimension_edges"  ("target_node");

CREATE TABLE "group_dimensions" ("dimension_id" uuid NOT NULL, "group_id" uuid NOT NULL, CONSTRAINT "PK_5bd4e27fc7003ac82ae305f10ee" PRIMARY KEY ("dimension_id", "group_id"));

CREATE INDEX "group_dimensions_group_id_dimension_id" ON "group_dimensions"  ("group_id", "dimension_id");

ALTER TABLE "filters" ADD CONSTRAINT "FK_c2d12bbd0b40be55bb870aa49e4" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE "filters" ADD CONSTRAINT "FK_d32d15579026cca686fe6855ecb" FOREIGN KEY ("parent_id") REFERENCES "filters"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "filters" ADD CONSTRAINT "FK_28625f33a212f5719317e3e1c46" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "calendar_event_facts" ADD CONSTRAINT "FK_c0e6eb1ab34bfe089ef2ee08f48" FOREIGN KEY ("filter_id") REFERENCES "filters"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "calendar_event_facts" ADD CONSTRAINT "FK_ef4d3a90406ecd641a41f001d99" FOREIGN KEY ("measure_id") REFERENCES "measures"("id") ON DELETE RESTRICT ON UPDATE NO ACTION;

ALTER TABLE "dimension_edges" ADD CONSTRAINT "FK_2b1885a778ae03ebef163bd6b52" FOREIGN KEY ("source_node") REFERENCES "dimensions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "dimension_edges" ADD CONSTRAINT "FK_fe1fefe391a02371a9fadf7fd71" FOREIGN KEY ("target_node") REFERENCES "dimensions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "group_dimensions" ADD CONSTRAINT "FK_66b36374e5fb47d7b36595e61de" FOREIGN KEY ("dimension_id") REFERENCES "dimensions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE "group_dimensions" ADD CONSTRAINT "FK_9dc7962e1301aad95b372b90ba2" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

INSERT INTO "dimensions" ("id", "slug", "name", "icon", "note") VALUES
('01a215c3-1000-7000-8000-000000000001', 'name', 'Name', 'type', 'One distinct event name, so the recurrences of an event aggregate.'),
('01a215c3-1000-7000-8000-000000000002', 'day', 'Day', 'calendar-days', 'One local day, the date of the events'' start in their own zone.'),
('01a215c3-1000-7000-8000-000000000003', 'week', 'Week', 'calendar-range', 'One week of local days.'),
('01a215c3-1000-7000-8000-000000000004', 'month', 'Month', 'calendar', 'One month of local days.'),
('01a215c3-1000-7000-8000-000000000005', 'quarter', 'Quarter', 'calendar-fold', 'One quarter of local days.'),
('01a215c3-1000-7000-8000-000000000006', 'year', 'Year', 'calendar-1', 'One year of local days.'),
('01a215c3-1000-7000-8000-000000000007', 'tag', 'Tag', 'tag', 'One tag of the tag tree, with its descendants; the values are the rows of the tags table.');

INSERT INTO "dimension_edges" ("source_node", "target_node") VALUES
('01a215c3-1000-7000-8000-000000000002', '01a215c3-1000-7000-8000-000000000003'),
('01a215c3-1000-7000-8000-000000000002', '01a215c3-1000-7000-8000-000000000004'),
('01a215c3-1000-7000-8000-000000000004', '01a215c3-1000-7000-8000-000000000005'),
('01a215c3-1000-7000-8000-000000000005', '01a215c3-1000-7000-8000-000000000006');

INSERT INTO "groups" ("id", "slug", "name", "icon", "note") VALUES
('01a215c3-1002-7000-8000-000000000001', 'name', 'Name', 'type', 'One event name.'),
('01a215c3-1002-7000-8000-000000000002', 'day', 'Day', 'calendar-days', 'One local day.'),
('01a215c3-1002-7000-8000-000000000003', 'week', 'Week', 'calendar-range', 'One week.'),
('01a215c3-1002-7000-8000-000000000004', 'month', 'Month', 'calendar', 'One month.'),
('01a215c3-1002-7000-8000-000000000005', 'quarter', 'Quarter', 'calendar-fold', 'One quarter.'),
('01a215c3-1002-7000-8000-000000000006', 'year', 'Year', 'calendar-1', 'One year.'),
('01a215c3-1002-7000-8000-000000000007', 'tag', 'Tag', 'tag', 'One tag with its descendants.');

INSERT INTO "group_dimensions" ("group_id", "dimension_id") VALUES
('01a215c3-1002-7000-8000-000000000001', '01a215c3-1000-7000-8000-000000000001'),
('01a215c3-1002-7000-8000-000000000002', '01a215c3-1000-7000-8000-000000000002'),
('01a215c3-1002-7000-8000-000000000003', '01a215c3-1000-7000-8000-000000000003'),
('01a215c3-1002-7000-8000-000000000004', '01a215c3-1000-7000-8000-000000000004'),
('01a215c3-1002-7000-8000-000000000005', '01a215c3-1000-7000-8000-000000000005'),
('01a215c3-1002-7000-8000-000000000006', '01a215c3-1000-7000-8000-000000000006'),
('01a215c3-1002-7000-8000-000000000007', '01a215c3-1000-7000-8000-000000000007');

CREATE FUNCTION "expand_keys"(keys text[]) RETURNS TABLE (key text) LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE ROWS 2 AS $$ BEGIN IF cardinality(keys) = 0 THEN key := NULL; RETURN NEXT; ELSE RETURN QUERY SELECT unnest(keys); END IF; END $$;

CREATE FUNCTION "expand_tags"(ids uuid[]) RETURNS TABLE (id uuid) LANGUAGE plpgsql IMMUTABLE PARALLEL SAFE ROWS 6 AS $$ BEGIN RETURN QUERY SELECT unnest(ids); END $$;

CREATE FUNCTION "tag_edges_guard"() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NEW.source_node = NEW.target_node OR EXISTS (WITH RECURSIVE below AS (SELECT NEW.target_node AS id UNION SELECT e.target_node FROM below AS b INNER JOIN tag_edges AS e ON e.source_node = b.id) SELECT 1 FROM below WHERE id = NEW.source_node) THEN RAISE check_violation USING MESSAGE = format('tag edge %s to %s would make the tag graph cyclic', NEW.source_node, NEW.target_node); END IF; IF EXISTS (SELECT 1 FROM tag_edges AS e INNER JOIN tags AS sibling ON sibling.id = e.target_node INNER JOIN tags AS child ON child.id = NEW.target_node WHERE e.source_node = NEW.source_node AND e.target_node <> NEW.target_node AND (sibling.name = child.name OR sibling.slug = child.slug)) THEN RAISE unique_violation USING MESSAGE = format('tag %s has a sibling with the same name or slug under %s', NEW.target_node, NEW.source_node); END IF; RETURN NEW; END $$;

CREATE TRIGGER "tag_edges_guard" BEFORE INSERT OR UPDATE ON "tag_edges" FOR EACH ROW EXECUTE FUNCTION "tag_edges_guard"();

CREATE FUNCTION "tags_root_guard"() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN IF NOT EXISTS (SELECT 1 FROM tag_edges WHERE target_node = NEW.id) AND EXISTS (SELECT 1 FROM tags AS other WHERE other.id <> NEW.id AND (other.name = NEW.name OR other.slug = NEW.slug) AND NOT EXISTS (SELECT 1 FROM tag_edges WHERE target_node = other.id)) THEN RAISE unique_violation USING MESSAGE = format('tag %s shares its name or slug with another root', NEW.id); END IF; RETURN NULL; END $$;

CREATE CONSTRAINT TRIGGER "tags_root_guard" AFTER INSERT OR UPDATE ON "tags" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION "tags_root_guard"();

CREATE MATERIALIZED VIEW "tag_trees" AS with recursive walk as (
    select id as ancestor_id, id as descendant_id from tags
    union
    select w.ancestor_id, e.target_node
    from walk as w
    inner join tag_edges as e on e.source_node = w.descendant_id
)
select ancestor_id, descendant_id from walk;

INSERT INTO "caelundas"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4);

CREATE UNIQUE INDEX "tag_trees_ancestor_id_descendant_id" ON "tag_trees"  ("ancestor_id", "descendant_id");

CREATE INDEX "tag_trees_descendant_id" ON "tag_trees"  ("descendant_id");

CREATE MATERIALIZED VIEW "calendar_event_tag_sets" AS select
    e.id as calendar_event_id,
    coalesce(g.tag_ids, '{}'::uuid[]) as tag_ids,
    coalesce(a.ancestor_tag_ids, '{}'::uuid[]) as ancestor_tag_ids
from calendar_events as e
left join (
    select
        calendar_event_id,
        array_agg(tag_id order by tag_id) as tag_ids
    from calendar_event_tags
    group by calendar_event_id
) as g on e.id = g.calendar_event_id
left join (
    select
        et.calendar_event_id,
        array_agg(distinct c.ancestor_id order by c.ancestor_id) as ancestor_tag_ids
    from calendar_event_tags as et
    inner join tag_trees as c on et.tag_id = c.descendant_id and c.ancestor_id <> c.descendant_id
    group by et.calendar_event_id
) as a on e.id = a.calendar_event_id;

INSERT INTO "caelundas"."typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4);

CREATE INDEX "calendar_event_tag_sets_ancestor_tag_ids" ON "calendar_event_tag_sets" USING gin ("ancestor_tag_ids");

CREATE INDEX "calendar_event_tag_sets_tag_ids" ON "calendar_event_tag_sets" USING gin ("tag_ids");

CREATE UNIQUE INDEX "calendar_event_tag_sets_calendar_event_id" ON "calendar_event_tag_sets"  ("calendar_event_id");

CREATE FUNCTION "window_events"(p_start timestamptz, p_end timestamptz) RETURNS TABLE (calendar_event_id uuid, "name" text, note text, timezone text, "start" timestamptz, "end" timestamptz, "day" date, end_local_day date, "hour" smallint, duration_minutes integer, tag_ids uuid[], ancestor_tag_ids uuid[]) LANGUAGE plpgsql STABLE PARALLEL SAFE ROWS 1500 AS $$ #variable_conflict use_column BEGIN RETURN QUERY SELECT c.id, c."name", c.note, c.timezone, c."start", c."end", c.start_local_day, c.end_local_day, c.start_local_hour, floor(extract(epoch from c."end" - c."start") / 60)::integer, s.tag_ids, s.ancestor_tag_ids FROM calendar_events c JOIN calendar_event_tag_sets s ON s.calendar_event_id = c.id WHERE c."start" < p_end AND c."end" >= p_start; END $$;
