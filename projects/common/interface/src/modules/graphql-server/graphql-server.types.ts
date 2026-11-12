import type { PageInfo } from "./graphql-server.entities";

/**
 * Constructor type for class references.
 */
export type ClassConstructor<T> = abstract new (...arguments_: never[]) => T;

/**
 * Generic Relay Connection interface.
 */
export interface Connection<T> {
  edges: Edge<T>[];
  pageInfo: PageInfo;
  totalCount: number;
}

/**
 * Generic Relay Edge interface.
 */
export interface Edge<T> {
  cursor: string;
  node: T;
}

/** A type's data properties, excluding TypeORM `BaseEntity` methods. */
export type GraphQLFields<Type> = {
  [
    Key in keyof Type as Type[Key] extends (...arguments_: never[]) => unknown
      ? never
      : Key
  ]: Type[Key];
};

/** The GraphQL object shape over its entity. `Self` is the class. */
export type GraphQLObjectOf<
  Entity,
  Self,
  DatabaseOnlyField extends EntityField<Entity>,
  RelationField extends RelationKey<Entity, DatabaseOnlyField | ResolvedField> =
    never,
  ResolvedField extends RelationKey<Entity, DatabaseOnlyField> = never,
> = ([
  GraphQLObjectViolations<
    Entity,
    Self,
    DatabaseOnlyField | ResolvedField,
    RelationField
  >,
] extends [never]
  ? unknown
  : GraphQLObjectViolations<
      Entity,
      Self,
      DatabaseOnlyField | ResolvedField,
      RelationField
    >) &
  Omit<
    LoadedFields<Entity>,
    DatabaseOnlyField | RelationField | ResolvedField
  > &
  Relations<Self, RelationField>;

/** Why a GraphQL object differs from its entity, or `never`. */
export type GraphQLObjectViolations<
  Entity,
  Self,
  ExcludedField extends EntityField<Entity>,
  RelationField extends RelationKey<Entity, ExcludedField> = never,
> =
  | Violation<
      "extraFields",
      Exclude<keyof GraphQLFields<Self>, ExposedField<Entity, ExcludedField>>
    >
  | Violation<
      "mismatchedRelations",
      MismatchedRelation<LoadedFields<Entity>, Relations<Self, RelationField>>
    >
  | Violation<
      "missingFields",
      Exclude<ExposedField<Entity, ExcludedField>, keyof GraphQLFields<Self>>
    >
  | Violation<
      "retypedFields",
      NarrowedField<
        Omit<LoadedFields<Entity>, ExcludedField | RelationField>,
        GraphQLFields<Self>
      >
    >;

/** A mapper's GraphQL class output; unjoined relations are `undefined`. */
export type MappedFields<Type, RelationField extends keyof Type = never> = {
  [Key in keyof GraphQLFields<Type>]: Key extends RelationField
    ? GraphQLFields<Type>[Key] | undefined
    : GraphQLFields<Type>[Key];
};

/** Stands in for a related class, avoiding a metadata import cycle. */
export type Related<Type> = Type;

/** Exposed fields holding related rows, not column values like a `Date`. */
export type RelationKey<Entity, ExcludedField> = {
  [Key in ExposedField<Entity, ExcludedField>]-?: IsRelation<
    NonNullable<GraphQLFields<Entity>[Key]>
  > extends true
    ? Key
    : never;
}[ExposedField<Entity, ExcludedField>];

/** The data property names of an entity. */
type EntityField<Entity> = keyof GraphQLFields<Entity>;

/** The entity fields a GraphQL type exposes. */
type ExposedField<Entity, DatabaseOnlyField> = Exclude<
  EntityField<Entity>,
  DatabaseOnlyField
>;

/** Whether a field's value is related rows rather than a column's value. */
type IsRelation<Value> = [Value] extends [Date]
  ? false
  : [Value] extends [readonly (infer Row)[]]
    ? [Row] extends [object]
      ? true
      : false
    : [Value] extends [object]
      ? true
      : false;

/** An entity's fields; optional ones are also `undefined`. */
type LoadedFields<Entity> = {
  [Key in keyof GraphQLFields<Entity>]: object extends Pick<
    GraphQLFields<Entity>,
    Key
  >
    ? GraphQLFields<Entity>[Key] | undefined
    : GraphQLFields<Entity>[Key];
};

/** Each relation whose shape differs from the entity's own, by name. */
type MismatchedRelation<Fields, Declared> = {
  [Key in keyof Declared]-?: Key extends keyof Fields
    ? [RelationShape<Fields[Key]>] extends [RelationShape<Declared[Key]>]
      ? [RelationShape<Declared[Key]>] extends [RelationShape<Fields[Key]>]
        ? never
        : Key
      : Key
    : Key;
}[keyof Declared];

/** Fields whose column value their GraphQL type rejects, by name. */
type NarrowedField<Fields, SelfFields> = {
  [Key in keyof Fields & keyof SelfFields]-?: [Fields[Key]] extends [
    SelfFields[Key],
  ]
    ? never
    : Key;
}[keyof Fields & keyof SelfFields];

/** The relations a GraphQL class declares, as it types them. */
type Relations<Self, RelationField> = Pick<
  GraphQLFields<Self>,
  keyof GraphQLFields<Self> & RelationField
>;

/** Whether a relation is a list, nullable, or optional. */
type RelationShape<Relation> = [
  [NonNullable<Relation>] extends [Connection<unknown>]
    ? "many"
    : [NonNullable<Relation>] extends [readonly unknown[]]
      ? "many"
      : "one",
  null extends Relation ? "nullable" : "non-null",
  undefined extends Relation ? "optional" : "required",
];

/** A violation named `Kind`, listing `Fields`, or nothing when it is empty. */
type Violation<Kind extends string, Fields> = [Fields] extends [never]
  ? never
  : Record<Kind, Fields>;
