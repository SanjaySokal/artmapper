# Advanced Features

Advanced usage patterns and features of ArtMapper.

## Relationship Mappings

### One-to-Many Relationship

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

@Entity('Post')
@Table('posts')
export class Post {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  id?: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  @Column({ name: 'user_id', type: 'INT', nullable: false })
  userId!: number;
}
```

### Many-to-Many Relationship

```typescript
@Entity('User')
@Table('users')
export class User {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  id?: number;

  @ManyToMany(() => Role, { fetch: 'LAZY' })
  @JoinTable({
    name: 'user_roles',
    joinColumns: [{ name: 'user_id', referencedColumnName: 'id' }],
    inverseJoinColumns: [{ name: 'role_id', referencedColumnName: 'id' }]
  })
  roles?: Role[];
}

@Entity('Role')
@Table('roles')
export class Role {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  id?: number;

  @Column({ name: 'name', type: 'VARCHAR', length: 50 })
  name!: string;
}
```

### Loading Relationships

```typescript
// EAGER loading (automatic)
@ManyToOne(() => User, { fetch: 'EAGER' })
user?: User; // Loaded automatically

// LAZY loading (manual)
@OneToMany(() => Post, { fetch: 'LAZY' })
posts?: Post[]; // Load manually

// Manual loading
const entityManager = repository.getEntityManager();
const relationshipManager = entityManager.getRelationshipManager();
const posts = await relationshipManager.loadOneToMany(
  user,
  'posts',
  relationMetadata,
  Post
);
```

## Custom Queries

### Using Query Builder

```typescript
async findActiveUsers(): Promise<User[]> {
  const queryBuilder = this.createQueryBuilder();
  return queryBuilder
    .where('status = ?', 'active')
    .orderBy('created_at', 'DESC')
    .limit(10)
    .getMany<User>();
}
```

### Raw SQL Queries

```typescript
async findUsersByEmailDomain(domain: string): Promise<User[]> {
  return this.entityManager.query<User>(
    'SELECT * FROM users WHERE email LIKE ?',
    [`%@${domain}`]
  );
}
```

## Transactions

```typescript
async transferFunds(fromId: number, toId: number, amount: number): Promise<void> {
  const connection = await this.pool.getConnection();
  try {
    await connection.beginTransaction();

    // Deduct from sender
    await connection.execute(
      'UPDATE accounts SET balance = balance - ? WHERE id = ?',
      [amount, fromId]
    );

    // Add to receiver
    await connection.execute(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [amount, toId]
    );

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
```

## Custom Middleware

```typescript
const app = new App();

// Add custom middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Add authentication middleware
app.use((req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  // Verify token...
  next();
});

app.run();
```

## Configuration Injection

```typescript
@Service('ConfigService')
export class ConfigService {
  @Value('app.name')
  appName!: string;

  @Value('app.version')
  appVersion!: string;
}

// In App.ts
const container = Container.getInstance();
container.setConfig('app.name', 'MyApp');
container.setConfig('app.version', '1.0.0');
```

## Mapped Superclass

```typescript
@MappedSuperclass()
export abstract class BaseEntity {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  @Column({ name: 'id', type: 'INT' })
  id?: number;

  @Column({ name: 'created_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' })
  createdAt?: Date;

  @Column({ name: 'updated_at', type: 'TIMESTAMP', default: 'CURRENT_TIMESTAMP' })
  updatedAt?: Date;
}

@Entity('User')
@Table('users')
export class User extends BaseEntity {
  @Column({ name: 'username', type: 'VARCHAR', length: 100 })
  username!: string;
}
```

## Embedded Objects

```typescript
@Embeddable()
export class Address {
  @Column({ name: 'street', type: 'VARCHAR', length: 255 })
  street!: string;

  @Column({ name: 'city', type: 'VARCHAR', length: 100 })
  city!: string;

  @Column({ name: 'zip_code', type: 'VARCHAR', length: 10 })
  zipCode!: string;
}

@Entity('User')
@Table('users')
export class User {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  id?: number;

  @Embedded()
  address?: Address;
}
```

## Enums

```typescript
enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

@Entity('User')
@Table('users')
export class User {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  id?: number;

  @Enumerated('STRING')
  @Column({ name: 'status', type: 'VARCHAR', length: 20 })
  status!: UserStatus;
}
```

## Validation

```typescript
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

@Entity('User')
@Table('users')
export class User {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  id?: number;

  @IsNotEmpty()
  @MinLength(3)
  @Column({ name: 'username', type: 'VARCHAR', length: 100 })
  username!: string;

  @IsEmail()
  @Column({ name: 'email', type: 'VARCHAR', length: 255 })
  email!: string;
}
```

## Error Handling

```typescript
@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @GetMapping('/:id')
  async getUserById(@PathVariable('id') id: string): Promise<User | null> {
    try {
      const user = await this.userService.getUserById(parseInt(id));
      if (!user) {
        throw new Error('User not found');
      }
      return user;
    } catch (error) {
      throw error;
    }
  }
}

// Global error handler in App.ts
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});
```

## Testing

```typescript
import { SpringApplication } from 'artmapper';

describe('UserService', () => {
  let app: SpringApplication;
  let userService: UserService;

  beforeAll(async () => {
    app = new App();
    await app.run();
    userService = Container.getInstance().getBean(UserService);
  });

  afterAll(async () => {
    await app.stop();
  });

  it('should create a user', async () => {
    const user = await userService.createUser({
      username: 'testuser',
      email: 'test@example.com'
    });
    expect(user.id).toBeDefined();
    expect(user.username).toBe('testuser');
  });
});
```

## Performance Optimization

### Connection Pooling

```typescript
database: {
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'password',
  database: 'myapp',
  connectionLimit: 20, // Increase pool size
  waitForConnections: true,
  queueLimit: 0
}
```

### Lazy Loading

Use LAZY fetch for large collections:

```typescript
@OneToMany(() => Post, { fetch: 'LAZY' })
posts?: Post[]; // Not loaded until accessed
```

### Query Optimization

Use specific column selection:

```typescript
const queryBuilder = this.createQueryBuilder();
queryBuilder.select('id, username, email'); // Only select needed columns
return queryBuilder.getMany<User>();
```

## Best Practices

1. **Always use transactions for multiple operations**
2. **Use LAZY loading for large collections**
3. **Index frequently queried columns**
4. **Validate input data**
5. **Handle errors gracefully**
6. **Use connection pooling**
7. **Close connections properly**
8. **Use prepared statements (automatic with query builder)**

