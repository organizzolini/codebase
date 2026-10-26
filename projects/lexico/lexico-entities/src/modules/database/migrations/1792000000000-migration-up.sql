set lock_timeout = '10s';

set statement_timeout = '5m';

create extension if not exists pg_trgm;

create extension if not exists fuzzystrmatch;

create index lexemes_lemma_trigram_index on lexico.lexemes using gin (LOWER(lemma) gin_trgm_ops);

create index words_data_trigram_index on lexico.words using gin (LOWER("data") gin_trgm_ops);
