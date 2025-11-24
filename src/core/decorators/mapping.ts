import 'reflect-metadata';

export const JOIN_COLUMN_METADATA_KEY = Symbol('joinColumn');
export const JOIN_TABLE_METADATA_KEY = Symbol('joinTable');
export const JOIN_COLUMNS_METADATA_KEY = Symbol('joinColumns');
export const INVERSE_JOIN_COLUMNS_METADATA_KEY = Symbol('inverseJoinColumns');

export interface JoinColumnOptions {
  name?: string;
  referencedColumnName?: string;
  nullable?: boolean;
  unique?: boolean;
  insertable?: boolean;
  updatable?: boolean;
  columnDefinition?: string;
}

export interface JoinTableOptions {
  name?: string;
  catalog?: string;
  schema?: string;
  joinColumns?: JoinColumnOptions[];
  inverseJoinColumns?: JoinColumnOptions[];
}

/**
 * Spring JPA @JoinColumn equivalent
 * Specifies a column for joining an entity association or element collection
 */
export function JoinColumn(options?: JoinColumnOptions) {
  return function (target: any, propertyKey: string) {
    const existingJoinColumns = Reflect.getMetadata(JOIN_COLUMN_METADATA_KEY, target.constructor) || {};
    existingJoinColumns[propertyKey] = {
      name: options?.name || `${propertyKey}_id`,
      referencedColumnName: options?.referencedColumnName || 'id',
      nullable: options?.nullable !== false,
      unique: options?.unique || false,
      insertable: options?.insertable !== false,
      updatable: options?.updatable !== false,
      columnDefinition: options?.columnDefinition,
    };
    Reflect.defineMetadata(JOIN_COLUMN_METADATA_KEY, existingJoinColumns, target.constructor);
  };
}

/**
 * Spring JPA @JoinColumns equivalent
 * Groups multiple JoinColumn annotations
 */
export function JoinColumns(...columns: JoinColumnOptions[]) {
  return function (target: any, propertyKey: string) {
    const existingJoinColumns = Reflect.getMetadata(JOIN_COLUMNS_METADATA_KEY, target.constructor) || {};
    existingJoinColumns[propertyKey] = columns.map(col => ({
      name: col.name || `${propertyKey}_id`,
      referencedColumnName: col.referencedColumnName || 'id',
      nullable: col.nullable !== false,
      unique: col.unique || false,
      insertable: col.insertable !== false,
      updatable: col.updatable !== false,
      columnDefinition: col.columnDefinition,
    }));
    Reflect.defineMetadata(JOIN_COLUMNS_METADATA_KEY, existingJoinColumns, target.constructor);
  };
}

/**
 * Spring JPA @JoinTable equivalent
 * Specifies the mapping of associations
 */
export function JoinTable(options?: JoinTableOptions) {
  return function (target: any, propertyKey: string) {
    const existingJoinTables = Reflect.getMetadata(JOIN_TABLE_METADATA_KEY, target.constructor) || {};
    existingJoinTables[propertyKey] = {
      name: options?.name || `${target.constructor.name}_${propertyKey}`,
      catalog: options?.catalog,
      schema: options?.schema,
      joinColumns: options?.joinColumns || [],
      inverseJoinColumns: options?.inverseJoinColumns || [],
    };
    Reflect.defineMetadata(JOIN_TABLE_METADATA_KEY, existingJoinTables, target.constructor);
  };
}

/**
 * Spring JPA @MappedSuperclass equivalent
 * Designates a class whose mapping information is applied to the entities that inherit from it
 */
export const MAPPED_SUPERCLASS_METADATA_KEY = Symbol('mappedSuperclass');

export function MappedSuperclass() {
  return function (target: Function) {
    Reflect.defineMetadata(MAPPED_SUPERCLASS_METADATA_KEY, true, target);
  };
}

/**
 * Spring JPA @Embedded equivalent
 * Specifies a persistent field or property of an entity whose value is an instance of an embeddable class
 */
export const EMBEDDED_METADATA_KEY = Symbol('embedded');

export function Embedded() {
  return function (target: any, propertyKey: string) {
    const existingEmbedded = Reflect.getMetadata(EMBEDDED_METADATA_KEY, target.constructor) || {};
    existingEmbedded[propertyKey] = true;
    Reflect.defineMetadata(EMBEDDED_METADATA_KEY, existingEmbedded, target.constructor);
  };
}

/**
 * Spring JPA @Embeddable equivalent
 * Specifies a class whose instances are stored as an intrinsic part of an owning entity
 */
export const EMBEDDABLE_METADATA_KEY = Symbol('embeddable');

export function Embeddable() {
  return function (target: Function) {
    Reflect.defineMetadata(EMBEDDABLE_METADATA_KEY, true, target);
  };
}

/**
 * Spring JPA @Transient equivalent
 * Specifies that the property or field is not persistent
 */
export const TRANSIENT_METADATA_KEY = Symbol('transient');

export function Transient() {
  return function (target: any, propertyKey: string) {
    const existingTransient = Reflect.getMetadata(TRANSIENT_METADATA_KEY, target.constructor) || {};
    existingTransient[propertyKey] = true;
    Reflect.defineMetadata(TRANSIENT_METADATA_KEY, existingTransient, target.constructor);
  };
}

/**
 * Spring JPA @Enumerated equivalent
 * Specifies that a persistent property or field should be persisted as an enumerated type
 */
export const ENUMERATED_METADATA_KEY = Symbol('enumerated');

export type EnumType = 'ORDINAL' | 'STRING';

export function Enumerated(value: EnumType = 'ORDINAL') {
  return function (target: any, propertyKey: string) {
    const existingEnumerated = Reflect.getMetadata(ENUMERATED_METADATA_KEY, target.constructor) || {};
    existingEnumerated[propertyKey] = { type: value };
    Reflect.defineMetadata(ENUMERATED_METADATA_KEY, existingEnumerated, target.constructor);
  };
}

/**
 * Spring JPA @Temporal equivalent
 * Specifies the temporal type of a date field
 */
export const TEMPORAL_METADATA_KEY = Symbol('temporal');

export type TemporalType = 'DATE' | 'TIME' | 'TIMESTAMP';

export function Temporal(value: TemporalType) {
  return function (target: any, propertyKey: string) {
    const existingTemporal = Reflect.getMetadata(TEMPORAL_METADATA_KEY, target.constructor) || {};
    existingTemporal[propertyKey] = { type: value };
    Reflect.defineMetadata(TEMPORAL_METADATA_KEY, existingTemporal, target.constructor);
  };
}

