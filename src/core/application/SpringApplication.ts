import 'reflect-metadata';
import express, { Express, type Request, type Response, NextFunction } from 'express';
import { Container } from '../di/Container';
import { DatabaseManager, DatabaseConfig } from '../database/DatabaseConfig';
import { SchemaGenerator } from '../database/SchemaGenerator';
import {
  GET_METADATA_KEY,
  POST_METADATA_KEY,
  PUT_METADATA_KEY,
  DELETE_METADATA_KEY,
  PATCH_METADATA_KEY,
  REQUEST_BODY_METADATA_KEY,
  REQUEST_PARAM_METADATA_KEY,
  PATH_VARIABLE_METADATA_KEY,
  REQUEST_HEADER_METADATA_KEY,
} from '../decorators/web';
import { CONTROLLER_METADATA_KEY } from '../decorators/component';
import { Pool } from 'mysql2/promise';
import { ENTITY_METADATA_KEY } from '../decorators/entity';

export interface ApplicationConfig {
  port?: number;
  database?: DatabaseConfig;
  controllers?: (new (...args: any[]) => any)[];
  services?: (new (...args: any[]) => any)[];
  repositories?: (new (...args: any[]) => any)[];
  components?: (new (...args: any[]) => any)[];
  entities?: (new (...args: any[]) => any)[];
  basePath?: string;
  autoGenerateSchema?: boolean; // Auto-create tables from entities (like JPA ddl-auto)
}

export class SpringApplication {
  private app: Express;
  private container: Container;
  private databaseManager: DatabaseManager;
  private config: ApplicationConfig;

  constructor(config: ApplicationConfig = {}) {
    this.app = express();
    this.container = Container.getInstance();
    this.databaseManager = DatabaseManager.getInstance();
    this.config = {
      port: 3000,
      basePath: '/',
      ...config,
    };

    this.setupMiddleware();
  }

  /**
   * Setup Express middleware
   */
  private setupMiddleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // CORS middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    });
  }

  /**
   * Initialize database connection
   */
  async initializeDatabase(): Promise<void> {
    if (this.config.database) {
      await this.databaseManager.initialize(this.config.database);
      this.container.setPool(this.databaseManager.getPool());

      // Auto-generate schema if enabled and entities are provided
      if (this.config.autoGenerateSchema && this.config.entities && this.config.entities.length > 0) {
        const schemaGenerator = new SchemaGenerator(this.databaseManager.getPool());
        await schemaGenerator.generateSchema(this.config.entities);
      }
    }
  }

  /**
   * Register all components
   */
  registerComponents(): void {
    // Register repositories first (they might be dependencies)
    if (this.config.repositories) {
      this.config.repositories.forEach(RepoClass => {
        if (this.config.database) {
          const pool = this.databaseManager.getPool();
          const instance = new RepoClass(pool);
          this.container.registerBean(RepoClass, instance);
        } else {
          this.container.registerBean(RepoClass);
        }
      });
    }

    // Register services
    if (this.config.services) {
      this.config.services.forEach(ServiceClass => {
        this.container.registerBean(ServiceClass);
      });
    }

    // Register components
    if (this.config.components) {
      this.config.components.forEach(ComponentClass => {
        this.container.registerBean(ComponentClass);
      });
    }

    // Register controllers last (they depend on services)
    if (this.config.controllers) {
      this.config.controllers.forEach(ControllerClass => {
        this.container.registerBean(ControllerClass);
      });
    }
  }

  /**
   * Register all routes from controllers
   */
  registerRoutes(): void {
    if (!this.config.controllers) return;

    this.config.controllers.forEach(ControllerClass => {
      const controllerMetadata = Reflect.getMetadata(CONTROLLER_METADATA_KEY, ControllerClass);
      const controllerPath = controllerMetadata?.path || '';
      const controller = this.container.getBean(ControllerClass);

      // Register GET routes
      const getRoutes = Reflect.getMetadata(GET_METADATA_KEY, ControllerClass) || [];
      getRoutes.forEach((route: any) => {
        const fullPath = `${this.config.basePath}${controllerPath}${route.path}`;
        this.app.get(fullPath, this.createRouteHandler(controller, route.handler, route.path));
      });

      // Register POST routes
      const postRoutes = Reflect.getMetadata(POST_METADATA_KEY, ControllerClass) || [];
      postRoutes.forEach((route: any) => {
        const fullPath = `${this.config.basePath}${controllerPath}${route.path}`;
        this.app.post(fullPath, this.createRouteHandler(controller, route.handler, route.path));
      });

      // Register PUT routes
      const putRoutes = Reflect.getMetadata(PUT_METADATA_KEY, ControllerClass) || [];
      putRoutes.forEach((route: any) => {
        const fullPath = `${this.config.basePath}${controllerPath}${route.path}`;
        this.app.put(fullPath, this.createRouteHandler(controller, route.handler, route.path));
      });

      // Register DELETE routes
      const deleteRoutes = Reflect.getMetadata(DELETE_METADATA_KEY, ControllerClass) || [];
      deleteRoutes.forEach((route: any) => {
        const fullPath = `${this.config.basePath}${controllerPath}${route.path}`;
        this.app.delete(fullPath, this.createRouteHandler(controller, route.handler, route.path));
      });

      // Register PATCH routes
      const patchRoutes = Reflect.getMetadata(PATCH_METADATA_KEY, ControllerClass) || [];
      patchRoutes.forEach((route: any) => {
        const fullPath = `${this.config.basePath}${controllerPath}${route.path}`;
        this.app.patch(fullPath, this.createRouteHandler(controller, route.handler, route.path));
      });
    });
  }

  /**
   * Create a route handler with parameter injection
   */
  private createRouteHandler(controller: any, handlerName: string, routePath: string) {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const handler = controller[handlerName];
        if (!handler) {
          return res.status(500).json({ error: `Handler ${handlerName} not found` });
        }

        // Extract path variables from route path
        const pathVarNames: string[] = [];
        const pathVarRegex = /:(\w+)/g;
        let match;
        while ((match = pathVarRegex.exec(routePath)) !== null) {
          pathVarNames.push(match[1]);
        }

        // Get parameter metadata
        const requestBodyParams = Reflect.getMetadata(REQUEST_BODY_METADATA_KEY, controller, handlerName) || {};
        const requestParamParams = Reflect.getMetadata(REQUEST_PARAM_METADATA_KEY, controller, handlerName) || {};
        const pathVariableParams = Reflect.getMetadata(PATH_VARIABLE_METADATA_KEY, controller, handlerName) || {};
        const requestHeaderParams = Reflect.getMetadata(REQUEST_HEADER_METADATA_KEY, controller, handlerName) || {};

        // Build arguments array
        const paramTypes = Reflect.getMetadata('design:paramtypes', controller, handlerName) || [];
        const args: any[] = [];

        for (let i = 0; i < paramTypes.length; i++) {
          if (requestBodyParams[i]) {
            args[i] = req.body;
          } else if (requestParamParams[i]) {
            const paramInfo = requestParamParams[i];
            args[i] = req.query[paramInfo.name];
          } else if (pathVariableParams[i]) {
            const paramInfo = pathVariableParams[i];
            // Try to get from params by name, or by index if name matches path variable
            args[i] = req.params[paramInfo.name] || 
                     (pathVarNames.length > 0 && req.params[pathVarNames[0]]) ||
                     Object.values(req.params)[0];
          } else if (requestHeaderParams[i]) {
            const paramInfo = requestHeaderParams[i];
            args[i] = req.headers[paramInfo.name.toLowerCase()];
          } else if (paramTypes[i] === Request) {
            args[i] = req;
          } else if (paramTypes[i] === Response) {
            args[i] = res;
          } else {
            args[i] = undefined;
          }
        }

        // Call handler
        const result = await handler.apply(controller, args);

        // Send response
        if (result !== undefined && !res.headersSent) {
          if (typeof result === 'object') {
            res.json(result);
          } else {
            res.send(result);
          }
        }
      } catch (error: any) {
        next(error);
      }
    };
  }

  /**
   * Add custom middleware
   */
  use(middleware: any): void {
    this.app.use(middleware);
  }

  /**
   * Get the Express app instance
   */
  getApp(): Express {
    return this.app;
  }

  /**
   * Start the application
   */
  async run(): Promise<void> {
    // Initialize database
    await this.initializeDatabase();

    // Register components
    this.registerComponents();

    // Register routes
    this.registerRoutes();

    // Error handling middleware
    this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error('Error:', err);
      res.status(err.status || 500).json({
        error: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
      });
    });

    // Start server
    const port = this.config.port || 3000;
    this.app.listen(port, () => {
      console.log(`✓ Spring Boot TS application running on port ${port}`);
      console.log(`✓ Base path: ${this.config.basePath}`);
    });
  }

  /**
   * Stop the application
   */
  async stop(): Promise<void> {
    await this.databaseManager.close();
  }
}

/**
 * Static method to run the application
 */
export async function run(applicationClass: new () => SpringApplication, config?: ApplicationConfig): Promise<void> {
  const app = new applicationClass();
  await app.run();
}

