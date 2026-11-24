SET lock_timeout = '10s';

SET statement_timeout = '5min';

ALTER TABLE "tags" DROP COLUMN "order";

ALTER TABLE "tags" DROP COLUMN "note";

ALTER TABLE "tags" DROP COLUMN "icon";
