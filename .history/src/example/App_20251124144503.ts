import 'reflect-metadata';
import { SpringApplication, ApplicationConfig } from '../index';
import { UserController } from './controller/UserController';
import { PostController } from './controller/PostController';
import { UserService } from './service/UserService';
import { PostService } from './service/PostService';
import { UserRepository } from './repository/UserRepository';
import { PostRepository } from './repository/PostRepository';
import { User } from './entity/User';
import { Post } from './entity/Post';

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
        database: process.env.DB_NAME || 'springboot_ts',
        connectionLimit: 10,
      },
      controllers: [
        UserController,
        PostController,
      ],
      services: [
        UserService,
        PostService,
      ],
      repositories: [
        UserRepository,
        PostRepository,
      ],
      entities: [
        User,
        Post,
      ],
      autoGenerateSchema: true, // Automatically create tables from entities
    };

    super(config);
  }
}
