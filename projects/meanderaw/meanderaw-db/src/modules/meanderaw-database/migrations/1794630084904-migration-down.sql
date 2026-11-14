set lock_timeout = '10s';
set statement_timeout = '5m';

truncate table meanderaw.meander_characteristics, meanderaw.meanders;

alter table meanderaw.meander_characteristics drop constraint "FK_c218eaeda874d43128801d123e6";

alter table meanderaw.meander_characteristics drop constraint "FK_4a668f4e62d5af49d5ce981c06d";

alter table meanderaw.meanders add "characteristics" jsonb not null;

drop index meanderaw."IDX_96d6f3ed6abd14b7739c2086c2";

drop table meanderaw.meander_characteristics;

drop index meanderaw."IDX_7b51623d8d90faf4d98a9a6a12";

drop table meanderaw.characteristics;
