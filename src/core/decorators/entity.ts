import 'reflect-metadata';

export const ENTITY_METADATA_KEY = Symbol('entity');
export const TABLE_METADATA_KEY = Symbol('table');
export const COLUMN_METADATA_KEY = Symbol('column');
export const ID_METADATA_KEY = Symbol('id');
export const GENERATED_VALUE_METADATA_KEY = Symbol('generatedValue');
export const ONE_TO_MANY_METADATA_KEY = Symbol('oneToMany');
export const MANY_TO_ONE_METADATA_KEY = Symbol('manyToOne');
export const MANY_TO_MANY_METADATA_KEY = Symbol('manyToMany');
export const ONE_TO_ONE_METADATA_KEY = Symbol('oneToOne');

export interface ColumnOptions {
  name?: string;
  type?: string;
  nullable?: boolean;
  unique?: boolean;
  length?: number;
  precision?: number;
  scale?: number;
  default?: any;
  enum?: string[]; // For ENUM type - array of allowed values
  unsigned?: boolean; // For numeric types
  zerofill?: boolean; // For numeric types
  autoIncrement?: boolean; // Auto increment
  comment?: string; // Column comment
  charset?: string; // Character set
  collate?: string; // Collation
  onUpdate?: string; // ON UPDATE clause (e.g., 'CURRENT_TIMESTAMP')
}

export interface GeneratedValueOptions {
  strategy?: 'AUTO' | 'IDENTITY' | 'SEQUENCE' | 'UUID';
  generator?: string;
}

export interface RelationOptions {
  targetEntity?: () => Function;
  cascade?: ('PERSIST' | 'MERGE' | 'REMOVE' | 'REFRESH' | 'ALL')[];
  fetch?: 'EAGER' | 'LAZY';
  mappedBy?: string;
  joinColumn?: string | { name?: string; referencedColumnName?: string };
  joinTable?: string | { name?: string; joinColumns?: any[]; inverseJoinColumns?: any[] };
  orphanRemoval?: boolean;
  optional?: boolean;
}

/**
 * Marks a class as a JPA entity
 */
export function Entity(name?: string) {
  return function (target: Function) {
    Reflect.defineMetadata(ENTITY_METADATA_KEY, { name: name || target.name }, target);
  };
}

/**
 * Specifies the table name for the entity
 */
export function Table(name: string) {
  return function (target: Function) {
    Reflect.defineMetadata(TABLE_METADATA_KEY, { name }, target);
  };
}

/**
 * Marks a property as a database column
 */
export function Column(options?: ColumnOptions) {
  return function (target: any, propertyKey: string) {
    const existingColumns = Reflect.getMetadata(COLUMN_METADATA_KEY, target.constructor) || {};
    existingColumns[propertyKey] = {
      name: options?.name || propertyKey,
      type: options?.type,
      nullable: options?.nullable !== false,
      unique: options?.unique || false,
      length: options?.length,
      precision: options?.precision,
      scale: options?.scale,
      default: options?.default,
    };
    Reflect.defineMetadata(COLUMN_METADATA_KEY, existingColumns, target.constructor);
  };
}

/**
 * Marks a property as the primary key
 */
export function Id() {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(ID_METADATA_KEY, propertyKey, target.constructor);
  };
}

/**
 * Specifies generation strategy for primary key
 */
export function GeneratedValue(options?: GeneratedValueOptions) {
  return function (target: any, propertyKey: string) {
    Reflect.defineMetadata(GENERATED_VALUE_METADATA_KEY, {
      propertyKey,
      strategy: options?.strategy || 'AUTO',
      generator: options?.generator,
    }, target.constructor);
  };
}

/**
 * One-to-many relationship
 */
export function OneToMany(options?: RelationOptions) {
  return function (target: any, propertyKey: string) {
    const existingRelations = Reflect.getMetadata(ONE_TO_MANY_METADATA_KEY, target.constructor) || {};
    existingRelations[propertyKey] = {
      targetEntity: options?.targetEntity,
      cascade: options?.cascade || [],
      fetch: options?.fetch || 'LAZY',
      mappedBy: options?.mappedBy,
    };
    Reflect.defineMetadata(ONE_TO_MANY_METADATA_KEY, existingRelations, target.constructor);
  };
}

/**
 * Many-to-one relationship
 */
export function ManyToOne(options?: RelationOptions) {
  return function (target: any, propertyKey: string) {
    const existingRelations = Reflect.getMetadata(MANY_TO_ONE_METADATA_KEY, target.constructor) || {};
    existingRelations[propertyKey] = {
      targetEntity: options?.targetEntity,
      cascade: options?.cascade || [],
      fetch: options?.fetch || 'EAGER',
      joinColumn: options?.joinColumn,
    };
    Reflect.defineMetadata(MANY_TO_ONE_METADATA_KEY, existingRelations, target.constructor);
  };
}

/**
 * Many-to-many relationship
 */
export function ManyToMany(options?: RelationOptions) {
  return function (target: any, propertyKey: string) {
    const existingRelations = Reflect.getMetadata(MANY_TO_MANY_METADATA_KEY, target.constructor) || {};
    existingRelations[propertyKey] = {
      targetEntity: options?.targetEntity,
      cascade: options?.cascade || [],
      fetch: options?.fetch || 'LAZY',
      joinTable: options?.joinTable,
    };
    Reflect.defineMetadata(MANY_TO_MANY_METADATA_KEY, existingRelations, target.constructor);
  };
}

/**
 * One-to-one relationship
 */
export function OneToOne(options?: RelationOptions) {
  return function (target: any, propertyKey: string) {
    const existingRelations = Reflect.getMetadata(ONE_TO_ONE_METADATA_KEY, target.constructor) || {};
    existingRelations[propertyKey] = {
      targetEntity: options?.targetEntity,
      cascade: options?.cascade || [],
      fetch: options?.fetch || 'EAGER',
      joinColumn: options?.joinColumn,
    };
    Reflect.defineMetadata(ONE_TO_ONE_METADATA_KEY, existingRelations, target.constructor);
  };
}

