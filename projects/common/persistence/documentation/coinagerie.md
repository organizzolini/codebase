<!-- coinagerie:start -->

## 🪙 Coinagerie

The words this project uses, regenerated with this project's `coinagerie-check:write` Nx target.

- **cardinality**: The relation category that distinguishes one-to-one, one-to-many, many-to-one, and many-to-many links in the ERD model.
- **creatable**: The entity base layer that adds create-time columns, sitting second in the identifiable, creatable, updatable, deletable chain.
- **db**: A stray fragment for database; this package's code and docs use the full word, so the headword carries no local role.
- **deletable**: The entity base layer that adds soft-delete support, last in the identifiable, creatable, updatable, deletable chain.
- **department**: A fixture entity with a customized table name and nullable text column, defined by `ErdDepartment` in `department.entity.ts`.
- **employee**: A fixture entity with an inherited identifier and a many-to-one department relation, defined by `ErdEmployee` in `employee.entity.ts`.
- **gamma**: A placeholder project name in the extractor's unit test fixtures, with no meaning beyond the test.
- **identifiable**: The entity base layer that adds a primary id, first in the identifiable, creatable, updatable, deletable chain.
- **nullability**: Whether a database column accepts SQL `NULL`; the
  `postgresqlErdColumnSchema` flag is rendered by `renderColumn` in
  `postgresql-erd.utilities.ts`.
- **serial**: A PostgreSQL integer type that supplies sequential values, mapped
  to Mermaid `int` by `POSTGRESQL_ERD_TYPE_MAP` in
  `postgresql-erd.constants.ts`.
- **smallint**: A PostgreSQL two-byte integer type, mapped to Mermaid `int` by
  `POSTGRESQL_ERD_TYPE_MAP` in `postgresql-erd.constants.ts`.
- **updatable**: The entity base layer that adds update tracking columns, third in the identifiable, creatable, updatable, deletable chain.
- **verb**: The verb in a log message that the export log convention test expects after the subject emoji, such as exists.

<!-- coinagerie:end -->
