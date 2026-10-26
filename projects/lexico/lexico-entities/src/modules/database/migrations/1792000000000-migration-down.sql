set lock_timeout = '10s';

set statement_timeout = '5min';

drop index lexico.words_data_trigram_index;

drop index lexico.lexemes_lemma_trigram_index;

drop extension if exists fuzzystrmatch;

drop extension if exists pg_trgm;
