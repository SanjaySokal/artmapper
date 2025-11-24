# ArtMapper - Spring Boot Clone for Node.js/TypeScript

**ArtMapper** is a comprehensive Spring Boot clone for Node.js with TypeScript/JavaScript, featuring JPA-like ORM, Lombok-style decorators, dependency injection, and MySQL support. Build enterprise-grade applications with the power of Spring Boot in Node.js!

[![npm version](https://img.shields.io/npm/v/artmapper.svg)](https://www.npmjs.com/package/artmapper)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub](https://img.shields.io/github/stars/SanjaySokal/artmapper.svg)](https://github.com/SanjaySokal/artmapper)

## Features

### 🎯 Core Features
- **Entity Management**: JPA-like entity decorators (`@Entity`, `@Table`, `@Column`, `@Id`, `@GeneratedValue`)
- **Advanced Mappings**: `@JoinColumn`, `@JoinTable`, `@MappedSuperclass`, `@Embedded`, `@Transient`, `@Enumerated`, `@Temporal`
- **ORM Layer**: EntityManager with CRUD operations and query builder
- **Relationship Handling**: Full support for `@OneToMany`, `@ManyToOne`, `@ManyToMany`, `@OneToOne` with eager/lazy loading
- **Repository Pattern**: Spring Data JPA-like repositories
- **Dependency Injection**: Full DI container with `@Service`, `@Controller`, `@Component`, `@Repository`
- **Lombok Decorators**: `@Data`, `@Getter`, `@Setter`, `@Builder`, `@ToString`, `@EqualsAndHashCode`
- **Web Framework**: RESTful controllers with `@GetMapping`, `@PostMapping`, `@PutMapping`, `@DeleteMapping`
- **MySQL Integration**: Connection pooling and transaction support
- **Auto Schema Generation**: Automatically create tables from entity metadata
- **Type Safety**: Full TypeScript support with decorators
- **JavaScript Support**: Works with plain JavaScript files too!

## Installation

Install ArtMapper from npm:

```bash
npm install artmapper
```

Or using yarn:

```bash
yarn add artmapper
```

Or using pnpm:

```bash
pnpm add artmapper
```

## Configuration

Create a `.env` file or set environment variables:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=springboot_ts
```

## Database Setup

The framework can automatically create the database and tables! Just set `autoGenerateSchema: true` in your application config.

Or manually run the schema SQL:

```bash
mysql -u root -p < src/example/database/schema.sql
```

## Usage

### TypeScript Example

#### 1. Define an Entity

```typescript
import { Entity, Table, Column, Id, GeneratedValue, Data, OneToMany, JoinColumn } from 'artmapper';

@Entity('User')
@Table('users')
@Data()
export class User {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  @Column({ name: 'id', type: 'INT' })
  id?: number;

  @Column({ name: 'username', type: 'VARCHAR', length: 100, nullable: false })
  username!: string;

  @OneToMany(() => Post, { mappedBy: 'userId' })
  posts?: Post[];
}
```

#### 2. Create a Repository

```typescript
import { Repository, BaseRepository } from 'artmapper';
import { Pool } from 'mysql2/promise';
import { User } from './User';

@Repository('UserRepository')
export class UserRepository extends BaseRepository<User, number> {
  constructor(pool: Pool) {
    super(pool);
  }

  getEntityClass(): new () => User {
    return User;
  }

  getId(entity: User): number {
    return entity.id!;
  }
}
```

#### 3. Create a Service

```typescript
import { Service, Autowired } from 'artmapper';
import { UserRepository } from './UserRepository';
import { User } from './User';

@Service('UserService')
export class UserService {
  @Autowired()
  private userRepository!: UserRepository;

  async createUser(userData: Partial<User>): Promise<User> {
    const user = new User();
    user.username = userData.username!;
    return this.userRepository.save(user);
  }
}
```

#### 4. Create a Controller

```typescript
import { Controller, GetMapping, PostMapping, PathVariable, RequestBody } from 'artmapper';
import { UserService } from './UserService';
import { User } from './User';

@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @GetMapping('')
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @PostMapping('')
  async createUser(@RequestBody() userData: Partial<User>): Promise<User> {
    return this.userService.createUser(userData);
  }
}
```

### JavaScript Example

The framework also works with plain JavaScript! Just use CommonJS syntax:

```javascript
// User.js
const { Entity, Table, Column, Id, GeneratedValue, Data } = require('artmapper');

@Entity('User')
@Table('users')
@Data()
class User {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  @Column({ name: 'id', type: 'INT', nullable: false })
  id;

  @Column({ name: 'username', type: 'VARCHAR', length: 100, nullable: false })
  username;
}

module.exports = { User };
```

```javascript
// UserController.js
const { Controller, GetMapping, PostMapping, RequestBody } = require('artmapper');

@Controller('/api/users')
class UserController {
  constructor(userService) {
    this.userService = userService;
  }

  @GetMapping('')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @PostMapping('')
  async createUser(@RequestBody() userData) {
    return this.userService.createUser(userData);
  }
}

module.exports = { UserController };
```

## Available Decorators

### Entity Decorators
- `@Entity(name?)` - Marks a class as a JPA entity
- `@Table(name)` - Specifies the database table name
- `@Column(options?)` - Marks a property as a database column
- `@Id()` - Marks a property as the primary key
- `@GeneratedValue(options?)` - Specifies ID generation strategy
- `@OneToMany(options?)` - One-to-many relationship
- `@ManyToOne(options?)` - Many-to-one relationship
- `@ManyToMany(options?)` - Many-to-many relationship
- `@OneToOne(options?)` - One-to-one relationship

### Mapping Decorators
- `@JoinColumn(options?)` - Specifies a column for joining an entity association
- `@JoinColumns(...columns)` - Groups multiple JoinColumn annotations
- `@JoinTable(options?)` - Specifies the mapping of associations (for ManyToMany)
- `@MappedSuperclass()` - Designates a class whose mapping is applied to inheriting entities
- `@Embedded()` - Specifies a field whose value is an embeddable class
- `@Embeddable()` - Specifies a class whose instances are stored as part of an owning entity
- `@Transient()` - Specifies that the property is not persistent
- `@Enumerated(type?)` - Specifies that a property should be persisted as an enum
- `@Temporal(type)` - Specifies the temporal type of a date field

### Component Decorators
- `@Component(name?)` - Marks a class as a Spring component
- `@Service(name?)` - Marks a class as a Spring service
- `@Controller(path?)` - Marks a class as a Spring controller
- `@Repository(name?)` - Marks a class as a Spring repository
- `@Autowired(type?)` - Marks a property for dependency injection
- `@Value(key)` - Injects a configuration value
- `@Qualifier(name)` - Qualifies which bean to inject

### Lombok Decorators
- `@Data()` - Generates getters, setters, toString, equals, hashCode
- `@Getter(accessLevel?)` - Generates getter methods
- `@Setter(accessLevel?)` - Generates setter methods
- `@Builder()` - Generates builder pattern
- `@ToString(includeFieldNames?)` - Generates toString method
- `@EqualsAndHashCode()` - Generates equals and hashCode methods
- `@NoArgsConstructor()` - Generates no-args constructor
- `@AllArgsConstructor()` - Generates constructor with all fields
- `@RequiredArgsConstructor()` - Generates constructor with required fields

### Web Decorators
- `@GetMapping(path)` - Maps GET request
- `@PostMapping(path)` - Maps POST request
- `@PutMapping(path)` - Maps PUT request
- `@DeleteMapping(path)` - Maps DELETE request
- `@PatchMapping(path)` - Maps PATCH request
- `@RequestBody()` - Binds request body to parameter
- `@RequestParam(name?)` - Binds query parameter
- `@PathVariable(name?)` - Binds path variable
- `@RequestHeader(name)` - Binds request header

## Advanced Relationship Mappings

### ManyToOne with JoinColumn

```typescript
@Entity('Post')
@Table('posts')
export class Post {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  id?: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user?: User;
}
```

### ManyToMany with JoinTable

```typescript
@Entity('User')
@Table('users')
export class User {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  id?: number;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumns: [{ name: 'user_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [{ name: 'role_id', referencedColumnName: 'id' }]
  })
  roles?: Role[];
}
```

### OneToMany with MappedBy

```typescript
@Entity('User')
@Table('users')
export class User {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  id?: number;

  @OneToMany(() => Post, { mappedBy: 'userId', fetch: 'LAZY' })
  posts?: Post[];
}
```

## Running the Example

```bash
# Development mode (TypeScript)
npm run dev

# Development mode (JavaScript)
node --require ts-node/register src/example/js-example/app.js

# Build
npm run build

# Production
npm start
```

The example application will be available at `http://localhost:3000`

### Example API Endpoints

- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create a new user
- `PUT /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user

- `GET /api/posts` - Get all posts
- `GET /api/posts?userId=1` - Get posts by user ID
- `GET /api/posts/:id` - Get post by ID
- `POST /api/posts` - Create a new post
- `PUT /api/posts/:id` - Update a post
- `DELETE /api/posts/:id` - Delete a post

## Project Structure

```
src/
├── core/
│   ├── decorators/
│   │   ├── entity.ts      # JPA entity decorators
│   │   ├── mapping.ts     # Advanced mapping decorators
│   │   ├── component.ts   # Spring component decorators
│   │   ├── lombok.ts      # Lombok-style decorators
│   │   └── web.ts         # Web/HTTP decorators
│   ├── orm/
│   │   ├── EntityManager.ts      # JPA-like entity manager
│   │   ├── Repository.ts         # Repository base classes
│   │   └── RelationshipManager.ts # Relationship loading
│   ├── database/
│   │   ├── DatabaseConfig.ts     # Database connection management
│   │   └── SchemaGenerator.ts    # Auto schema generation
│   ├── di/
│   │   └── Container.ts          # Dependency injection container
│   └── application/
│       └── SpringApplication.ts  # Application bootstrap
├── example/
│   ├── entity/           # Example entities (TypeScript)
│   ├── repository/       # Example repositories
│   ├── service/          # Example services
│   ├── controller/       # Example controllers
│   ├── js-example/       # JavaScript examples
│   ├── database/         # Database schema
│   └── App.ts           # Example application
└── index.ts             # Main exports
```

## TypeScript vs JavaScript

The framework supports both TypeScript and JavaScript:

- **TypeScript**: Full type safety, better IDE support, compile-time checks
- **JavaScript**: No compilation step, works directly with Node.js, same decorators

Both use the same decorators and have the same functionality. Choose based on your preference!

## Documentation

- [Getting Started Guide](./docs/GETTING_STARTED.md) - Step-by-step tutorial
- [API Documentation](./docs/API.md) - Complete API reference
- [Advanced Features](./docs/ADVANCED.md) - Advanced usage patterns
- [Examples](./src/example/) - Working code examples

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Sanjay Sokal**

- GitHub: [@SanjaySokal](https://github.com/SanjaySokal)
- Repository: [artmapper](https://github.com/SanjaySokal/artmapper)

## Acknowledgments

- Inspired by Spring Boot and JPA
- Built with TypeScript and Node.js
- Uses Express.js for web framework
- MySQL2 for database connectivity

## Support

If you find this project helpful, please consider giving it a ⭐ on GitHub!

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/SanjaySokal/artmapper).
