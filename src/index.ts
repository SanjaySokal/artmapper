// Core exports
export {
  Entity,
  Table,
  Column,
  Id,
  GeneratedValue,
  OneToMany,
  ManyToOne,
  ManyToMany,
  OneToOne,
  ENTITY_METADATA_KEY,
  TABLE_METADATA_KEY,
  COLUMN_METADATA_KEY,
  ID_METADATA_KEY,
  GENERATED_VALUE_METADATA_KEY,
  type ColumnOptions,
  type GeneratedValueOptions,
  type RelationOptions
} from './core/decorators/entity';

export {
  JoinColumn,
  JoinColumns,
  JoinTable,
  MappedSuperclass,
  Embedded,
  Embeddable,
  Transient,
  Enumerated,
  Temporal,
  type JoinColumnOptions,
  type JoinTableOptions,
  type EnumType,
  type TemporalType
} from './core/decorators/mapping';

export {
  Component,
  Service,
  Controller,
  Repository,
  Autowired,
  Value,
  Qualifier
} from './core/decorators/component';

export {
  Data,
  Getter,
  Setter,
  Builder,
  ToString,
  EqualsAndHashCode,
  NoArgsConstructor,
  AllArgsConstructor,
  RequiredArgsConstructor
} from './core/decorators/lombok';

export {
  GetMapping,
  PostMapping,
  PutMapping,
  DeleteMapping,
  PatchMapping,
  RequestBody,
  RequestParam,
  PathVariable,
  RequestHeader
} from './core/decorators/web';

export {
  EntityManager,
  QueryBuilder
} from './core/orm/EntityManager';

export {
  BaseRepository,
  CrudRepository
} from './core/orm/Repository';

export {
  RelationshipManager
} from './core/orm/RelationshipManager';

export {
  DatabaseManager,
  type DatabaseConfig
} from './core/database/DatabaseConfig';

export {
  SchemaGenerator
} from './core/database/SchemaGenerator';

export {
  Container
} from './core/di/Container';

export {
  SpringApplication,
  type ApplicationConfig
} from './core/application/SpringApplication';

