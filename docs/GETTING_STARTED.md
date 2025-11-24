# Getting Started with ArtMapper

A step-by-step guide to building your first ArtMapper application.

## Prerequisites

- Node.js 14+ installed
- MySQL 5.7+ or MariaDB 10.2+ installed and running
- Basic knowledge of TypeScript/JavaScript
- Familiarity with Spring Boot (helpful but not required)

## Installation

### Step 1: Create a New Project

```bash
mkdir my-artmapper-app
cd my-artmapper-app
npm init -y
```

### Step 2: Install ArtMapper

```bash
npm install artmapper
npm install --save-dev typescript @types/node ts-node-dev
```

### Step 3: Install Express (Peer Dependency)

```bash
npm install express
npm install --save-dev @types/express
```

### Step 4: Initialize TypeScript

```bash
npx tsc --init
```

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": false,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "moduleResolution": "node",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "sourceMap": true,
    "allowJs": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Creating Your First Application

### Step 1: Create Project Structure

```
my-artmapper-app/
├── src/
│   ├── entity/
│   ├── repository/
│   ├── service/
│   ├── controller/
│   └── App.ts
├── package.json
└── tsconfig.json
```

### Step 2: Create an Entity

Create `src/entity/User.ts`:

```typescript
import { Entity, Table, Column, Id, GeneratedValue, Data } from 'artmapper';

@Entity('User')
@Table('users')
@Data()
export class User {
  @Id()
  @GeneratedValue({ strategy: 'AUTO' })
  @Column({ name: 'id', type: 'INT', nullable: false })
  id?: number;

  @Column({ name: 'username', type: 'VARCHAR', length: 100, nullable: false, unique: true })
  username!: string;

  @Column({ name: 'email', type: 'VARCHAR', length: 255, nullable: false, unique: true })
  email!: string;

  @Column({ name: 'created_at', type: 'TIMESTAMP', nullable: true, default: 'CURRENT_TIMESTAMP' })
  createdAt?: Date;
}
```

### Step 3: Create a Repository

Create `src/repository/UserRepository.ts`:

```typescript
import { Repository, BaseRepository } from 'artmapper';
import { Pool } from 'mysql2/promise';
import { User } from '../entity/User';

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

  async findByUsername(username: string): Promise<User | null> {
    const queryBuilder = this.createQueryBuilder();
    return queryBuilder.where('username = ?', username).getOne<User>();
  }
}
```

### Step 4: Create a Service

Create `src/service/UserService.ts`:

```typescript
import { Service, Autowired } from 'artmapper';
import { UserRepository } from '../repository/UserRepository';
import { User } from '../entity/User';

@Service('UserService')
export class UserService {
  @Autowired()
  private userRepository!: UserRepository;

  async createUser(userData: Partial<User>): Promise<User> {
    const user = new User();
    user.username = userData.username!;
    user.email = userData.email!;
    return this.userRepository.save(user);
  }

  async getUserById(id: number): Promise<User | null> {
    return this.userRepository.findById(id);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return this.userRepository.findByUsername(username);
  }
}
```

### Step 5: Create a Controller

Create `src/controller/UserController.ts`:

```typescript
import { Controller, GetMapping, PostMapping, PathVariable, RequestBody } from 'artmapper';
import { UserService } from '../service/UserService';
import { User } from '../entity/User';

@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @GetMapping('')
  async getAllUsers(): Promise<User[]> {
    return this.userService.getAllUsers();
  }

  @GetMapping('/:id')
  async getUserById(@PathVariable('id') id: string): Promise<User | null> {
    return this.userService.getUserById(parseInt(id));
  }

  @PostMapping('')
  async createUser(@RequestBody() userData: Partial<User>): Promise<User> {
    return this.userService.createUser(userData);
  }
}
```

### Step 6: Create the Application

Create `src/App.ts`:

```typescript
import 'reflect-metadata';
import { SpringApplication, ApplicationConfig } from 'artmapper';
import { UserController } from './controller/UserController';
import { UserService } from './service/UserService';
import { UserRepository } from './repository/UserRepository';
import { User } from './entity/User';

export class App extends SpringApplication {
  constructor() {
    const config: ApplicationConfig = {
      port: 3000,
      basePath: '/',
      database: {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'myapp',
        connectionLimit: 10,
      },
      controllers: [UserController],
      services: [UserService],
      repositories: [UserRepository],
      entities: [User],
      autoGenerateSchema: true, // Automatically create tables
    };

    super(config);
  }
}

// Run the application
if (require.main === module) {
  const app = new App();
  app.run().catch(console.error);
}
```

### Step 7: Add Scripts to package.json

```json
{
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/App.ts",
    "build": "tsc",
    "start": "node dist/App.js"
  }
}
```

### Step 8: Run the Application

```bash
npm run dev
```

The application will:
1. Connect to MySQL
2. Create the database if it doesn't exist
3. Create the `users` table automatically
4. Start the server on port 3000

### Step 9: Test the API

```bash
# Create a user
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com"}'

# Get all users
curl http://localhost:3000/api/users

# Get user by ID
curl http://localhost:3000/api/users/1
```

## Next Steps

- Read the [API Documentation](./API.md) for detailed information
- Check out [Advanced Features](./ADVANCED.md) for relationship mappings
- See [Examples](../src/example/) for more complex use cases

## Troubleshooting

### Database Connection Issues

Make sure MySQL is running and credentials are correct:

```bash
mysql -u root -p
```

### Port Already in Use

Change the port in `App.ts`:

```typescript
port: 3001, // or any available port
```

### TypeScript Errors

Make sure `experimentalDecorators` and `emitDecoratorMetadata` are enabled in `tsconfig.json`.

## Need Help?

- Check the [GitHub Issues](https://github.com/SanjaySokal/artmapper/issues)
- Read the [FAQ](./FAQ.md)
- Review the [Examples](../src/example/)

