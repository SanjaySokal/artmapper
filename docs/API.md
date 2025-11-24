# ArtMapper API Documentation

Complete API reference for ArtMapper framework.

## Table of Contents

- [Entity Decorators](#entity-decorators)
- [Mapping Decorators](#mapping-decorators)
- [Component Decorators](#component-decorators)
- [Lombok Decorators](#lombok-decorators)
- [Web Decorators](#web-decorators)
- [ORM Classes](#orm-classes)
- [Application Configuration](#application-configuration)

## Entity Decorators

### @Entity

Marks a class as a JPA entity.

```typescript
@Entity(name?: string)
```

**Parameters:**
- `name` (optional): Entity name. Defaults to class name.

**Example:**
```typescript
@Entity('User')
@Table('users')
export class User {
  // ...
}
```

### @Table

Specifies the database table name for the entity.

```typescript
@Table(name: string)
```

**Parameters:**
- `name`: Database table name.

**Example:**
```typescript
@Table('users')
export class User {
  // ...
}
```

### @Column

Marks a property as a database column.

```typescript
@Column(options?: ColumnOptions)
```

**ColumnOptions:**
```typescript
interface ColumnOptions {
  name?: string;              // Column name (default: property name)
  type?: string;              // SQL type (VARCHAR, INT, TEXT, etc.)
  nullable?: boolean;         // Allow NULL (default: true)
  unique?: boolean;           // Unique constraint (default: false)
  length?: number;            // Length for VARCHAR
  precision?: number;         // Precision for DECIMAL
  scale?: number;             // Scale for DECIMAL
  default?: any;              // Default value
}
```

**Example:**
```typescript
@Column({ name: 'username', type: 'VARCHAR', length: 100, nullable: false, unique: true })
username!: string;
```

### @Id

Marks a property as the primary key.

```typescript
@Id()
```

**Example:**
```typescript
@Id()
@GeneratedValue({ strategy: 'AUTO' })
@Column({ name: 'id', type: 'INT' })
id?: number;
```

### @GeneratedValue

Specifies the generation strategy for the primary key.

```typescript
@GeneratedValue(options?: GeneratedValueOptions)
```

**GeneratedValueOptions:**
```typescript
interface GeneratedValueOptions {
  strategy?: 'AUTO' | 'IDENTITY' | 'SEQUENCE' | 'UUID';
  generator?: string;
}
```

**Example:**
```typescript
@Id()
@GeneratedValue({ strategy: 'AUTO' })
id?: number;
```

## Mapping Decorators

### @JoinColumn

Specifies a column for joining an entity association.

```typescript
@JoinColumn(options?: JoinColumnOptions)
```

**JoinColumnOptions:**
```typescript
interface JoinColumnOptions {
  name?: string;                    // Foreign key column name
  referencedColumnName?: string;    // Referenced column (default: 'id')
  nullable?: boolean;               // Allow NULL (default: true)
  unique?: boolean;                 // Unique constraint
  insertable?: boolean;             // Insertable (default: true)
  updatable?: boolean;              // Updatable (default: true)
  columnDefinition?: string;        // Column definition
}
```

**Example:**
```typescript
@ManyToOne(() => User)
@JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
user?: User;
```

### @JoinTable

Specifies the mapping of associations (for ManyToMany).

```typescript
@JoinTable(options?: JoinTableOptions)
```

**JoinTableOptions:**
```typescript
interface JoinTableOptions {
  name?: string;                    // Join table name
  catalog?: string;                 // Catalog name
  schema?: string;                  // Schema name
  joinColumns?: JoinColumnOptions[];      // Join columns
  inverseJoinColumns?: JoinColumnOptions[]; // Inverse join columns
}
```

**Example:**
```typescript
@ManyToMany(() => Role)
@JoinTable({
  name: 'user_roles',
  joinColumns: [{ name: 'user_id', referencedColumnName: 'id' }],
  inverseJoinColumns: [{ name: 'role_id', referencedColumnName: 'id' }]
})
roles?: Role[];
```

### @OneToMany

Defines a one-to-many relationship.

```typescript
@OneToMany(options?: RelationOptions)
```

**RelationOptions:**
```typescript
interface RelationOptions {
  targetEntity?: () => Function;    // Target entity class
  cascade?: ('PERSIST' | 'MERGE' | 'REMOVE' | 'REFRESH' | 'ALL')[];
  fetch?: 'EAGER' | 'LAZY';         // Fetch type (default: 'LAZY')
  mappedBy?: string;                // Property name in target entity
  orphanRemoval?: boolean;          // Remove orphaned entities
  optional?: boolean;               // Optional relationship
}
```

**Example:**
```typescript
@OneToMany(() => Post, { mappedBy: 'userId', fetch: 'LAZY' })
posts?: Post[];
```

### @ManyToOne

Defines a many-to-one relationship.

```typescript
@ManyToOne(options?: RelationOptions)
```

**Example:**
```typescript
@ManyToOne(() => User, { fetch: 'EAGER' })
@JoinColumn({ name: 'user_id' })
user?: User;
```

### @ManyToMany

Defines a many-to-many relationship.

```typescript
@ManyToMany(options?: RelationOptions)
```

**Example:**
```typescript
@ManyToMany(() => Role, { fetch: 'LAZY' })
@JoinTable({
  name: 'user_roles',
  joinColumns: [{ name: 'user_id' }],
  inverseJoinColumns: [{ name: 'role_id' }]
})
roles?: Role[];
```

### @OneToOne

Defines a one-to-one relationship.

```typescript
@OneToOne(options?: RelationOptions)
```

**Example:**
```typescript
@OneToOne(() => Profile, { fetch: 'EAGER' })
@JoinColumn({ name: 'profile_id' })
profile?: Profile;
```

## Component Decorators

### @Component

Marks a class as a Spring component.

```typescript
@Component(name?: string)
```

**Example:**
```typescript
@Component('MyComponent')
export class MyComponent {
  // ...
}
```

### @Service

Marks a class as a Spring service.

```typescript
@Service(name?: string)
```

**Example:**
```typescript
@Service('UserService')
export class UserService {
  // ...
}
```

### @Controller

Marks a class as a Spring controller.

```typescript
@Controller(path?: string)
```

**Example:**
```typescript
@Controller('/api/users')
export class UserController {
  // ...
}
```

### @Repository

Marks a class as a Spring repository.

```typescript
@Repository(name?: string)
```

**Example:**
```typescript
@Repository('UserRepository')
export class UserRepository extends BaseRepository<User, number> {
  // ...
}
```

### @Autowired

Marks a property for dependency injection.

```typescript
@Autowired(type?: Function)
```

**Example:**
```typescript
@Service('UserService')
export class UserService {
  @Autowired()
  private userRepository!: UserRepository;
}
```

### @Value

Injects a configuration value.

```typescript
@Value(key: string)
```

**Example:**
```typescript
@Service('ConfigService')
export class ConfigService {
  @Value('app.name')
  appName!: string;
}
```

## Lombok Decorators

### @Data

Generates getters, setters, toString, equals, and hashCode methods.

```typescript
@Data()
```

**Example:**
```typescript
@Data()
export class User {
  username!: string;
  email!: string;
}
```

### @Getter / @Setter

Generates getter or setter methods.

```typescript
@Getter(accessLevel?: 'PUBLIC' | 'PROTECTED' | 'PRIVATE')
@Setter(accessLevel?: 'PUBLIC' | 'PROTECTED' | 'PRIVATE')
```

### @Builder

Generates a builder pattern.

```typescript
@Builder()
```

**Example:**
```typescript
const user = User.builder()
  .setUsername('john')
  .setEmail('john@example.com')
  .build();
```

## Web Decorators

### @GetMapping / @PostMapping / @PutMapping / @DeleteMapping / @PatchMapping

Maps HTTP methods to controller methods.

```typescript
@GetMapping(path: string)
@PostMapping(path: string)
@PutMapping(path: string)
@DeleteMapping(path: string)
@PatchMapping(path: string)
```

**Example:**
```typescript
@GetMapping('/users')
async getAllUsers(): Promise<User[]> {
  return this.userService.getAllUsers();
}
```

### @RequestBody

Binds request body to parameter.

```typescript
@RequestBody()
```

**Example:**
```typescript
@PostMapping('/users')
async createUser(@RequestBody() userData: Partial<User>): Promise<User> {
  return this.userService.createUser(userData);
}
```

### @RequestParam

Binds query parameter.

```typescript
@RequestParam(name?: string)
```

**Example:**
```typescript
@GetMapping('/posts')
async getPosts(@RequestParam('userId') userId?: string): Promise<Post[]> {
  // ...
}
```

### @PathVariable

Binds path variable.

```typescript
@PathVariable(name?: string)
```

**Example:**
```typescript
@GetMapping('/users/:id')
async getUserById(@PathVariable('id') id: string): Promise<User | null> {
  return this.userService.getUserById(parseInt(id));
}
```

## ORM Classes

### EntityManager

Main ORM class for entity operations.

```typescript
class EntityManager {
  constructor(pool: Pool)
  
  async persist<T>(entity: T): Promise<T>
  async find<T>(entityClass: new () => T, id: any): Promise<T | null>
  async findAll<T>(entityClass: new () => T): Promise<T[]>
  async remove<T>(entity: T): Promise<void>
  async query<T>(sql: string, params?: any[]): Promise<T[]>
  async queryOne<T>(sql: string, params?: any[]): Promise<T | null>
  createQueryBuilder(entityClass: Function): QueryBuilder
  getRelationshipManager(): RelationshipManager
}
```

### BaseRepository

Base repository class extending CrudRepository.

```typescript
abstract class BaseRepository<T, ID> implements CrudRepository<T, ID> {
  constructor(pool: Pool)
  
  abstract getEntityClass(): new () => T
  abstract getId(entity: T): ID
  
  async save(entity: T): Promise<T>
  async saveAll(entities: T[]): Promise<T[]>
  async findById(id: ID): Promise<T | null>
  async findAll(): Promise<T[]>
  async existsById(id: ID): Promise<boolean>
  async count(): Promise<number>
  async deleteById(id: ID): Promise<void>
  async delete(entity: T): Promise<void>
  async deleteAll(): Promise<void>
  createQueryBuilder(): QueryBuilder
}
```

## Application Configuration

### SpringApplication

Main application class.

```typescript
class SpringApplication {
  constructor(config: ApplicationConfig)
  
  async run(): Promise<void>
  async stop(): Promise<void>
  use(middleware: any): void
  getApp(): Express
}
```

### ApplicationConfig

```typescript
interface ApplicationConfig {
  port?: number;                    // Server port (default: 3000)
  database?: DatabaseConfig;        // Database configuration
  controllers?: Function[];         // Controller classes
  services?: Function[];            // Service classes
  repositories?: Function[];        // Repository classes
  components?: Function[];          // Component classes
  entities?: Function[];            // Entity classes
  basePath?: string;                // Base API path (default: '/')
  autoGenerateSchema?: boolean;     // Auto-create tables (default: false)
}
```

### DatabaseConfig

```typescript
interface DatabaseConfig {
  host: string;                     // Database host
  port: number;                     // Database port
  user: string;                     // Database user
  password: string;                 // Database password
  database: string;                 // Database name
  connectionLimit?: number;         // Connection pool limit (default: 10)
  waitForConnections?: boolean;     // Wait for connections (default: true)
  queueLimit?: number;              // Queue limit (default: 0)
}
```

## Examples

See the [examples directory](../src/example/) for complete working examples.

