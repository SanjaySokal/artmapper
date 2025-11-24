import 'reflect-metadata';
import {
  COMPONENT_METADATA_KEY,
  SERVICE_METADATA_KEY,
  CONTROLLER_METADATA_KEY,
  REPOSITORY_METADATA_KEY,
  AUTOWIRED_METADATA_KEY,
  VALUE_METADATA_KEY,
  QUALIFIER_METADATA_KEY,
} from '../decorators/component';
import { Pool } from 'mysql2/promise';

export class Container {
  private static instance: Container;
  private beans: Map<string, any> = new Map();
  private beanTypes: Map<string, Function> = new Map();
  private config: Map<string, any> = new Map();
  private pool: Pool | null = null;

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  /**
   * Set database pool for repositories
   */
  setPool(pool: Pool): void {
    this.pool = pool;
  }

  /**
   * Register a configuration value
   */
  setConfig(key: string, value: any): void {
    this.config.set(key, value);
  }

  /**
   * Get a configuration value
   */
  getConfig(key: string): any {
    return this.config.get(key);
  }

  /**
   * Register a bean (component, service, controller, repository)
   */
  registerBean<T>(target: new (...args: any[]) => T, instance?: T): void {
    const componentMetadata = Reflect.getMetadata(COMPONENT_METADATA_KEY, target);
    const serviceMetadata = Reflect.getMetadata(SERVICE_METADATA_KEY, target);
    const controllerMetadata = Reflect.getMetadata(CONTROLLER_METADATA_KEY, target);
    const repositoryMetadata = Reflect.getMetadata(REPOSITORY_METADATA_KEY, target);

    let beanName: string;
    if (componentMetadata) {
      beanName = componentMetadata.name || target.name;
    } else if (serviceMetadata) {
      beanName = serviceMetadata.name || target.name;
    } else if (controllerMetadata) {
      beanName = target.name;
    } else if (repositoryMetadata) {
      beanName = repositoryMetadata.name || target.name;
    } else {
      beanName = target.name;
    }

    this.beanTypes.set(beanName, target);
    if (instance) {
      this.beans.set(beanName, instance);
    }
  }

  /**
   * Get a bean by name or type
   */
  getBean<T>(nameOrType: string | (new (...args: any[]) => any)): T {
    let beanName: string;

    if (typeof nameOrType === 'function') {
      // Find by type
      for (const [name, type] of this.beanTypes.entries()) {
        if (type === nameOrType || type.prototype instanceof nameOrType) {
          beanName = name;
          break;
        }
      }
      if (!beanName!) {
        throw new Error(`Bean of type ${(nameOrType as any).name} not found`);
      }
    } else {
      beanName = nameOrType;
    }

    // Return existing instance if available
    if (this.beans.has(beanName)) {
      return this.beans.get(beanName) as T;
    }

    // Create new instance
    const beanType = this.beanTypes.get(beanName);
    if (!beanType) {
      throw new Error(`Bean ${beanName} not found`);
    }

    const instance = this.createInstance(beanType as new (...args: any[]) => any);
    this.beans.set(beanName, instance);
    return instance as T;
  }

  /**
   * Create an instance of a class with dependency injection
   */
  private createInstance<T>(target: new (...args: any[]) => T): T {
    // Get constructor parameters
    const paramTypes = Reflect.getMetadata('design:paramtypes', target) || [];
    const autowiredMetadata = Reflect.getMetadata(AUTOWIRED_METADATA_KEY, target) || {};
    const valueMetadata = Reflect.getMetadata(VALUE_METADATA_KEY, target) || {};
    const qualifierMetadata = Reflect.getMetadata(QUALIFIER_METADATA_KEY, target) || {};

    // Resolve constructor dependencies
    const constructorArgs = paramTypes.map((paramType: any, index: number) => {
      if (paramType && paramType.name === 'Pool' && this.pool) {
        return this.pool;
      }
      // Try to find bean by type
      try {
        return this.getBean(paramType);
      } catch {
        return undefined;
      }
    });

    // Create instance
    const instance = new target(...constructorArgs);

    // Inject field dependencies
    Object.keys(autowiredMetadata).forEach(propertyKey => {
      const autowiredInfo = autowiredMetadata[propertyKey];
      const qualifier = qualifierMetadata[propertyKey];
      
      let dependency: any;
      if (qualifier) {
        dependency = this.getBean(qualifier);
      } else if (autowiredInfo.type) {
        dependency = this.getBean(autowiredInfo.type);
      }

      if (dependency) {
        (instance as any)[propertyKey] = dependency;
      }
    });

    // Inject configuration values
    Object.keys(valueMetadata).forEach(propertyKey => {
      const configKey = valueMetadata[propertyKey];
      const configValue = this.getConfig(configKey);
      if (configValue !== undefined) {
        (instance as any)[propertyKey] = configValue;
      }
    });

    return instance;
  }

  /**
   * Scan and register all beans from a directory
   */
  async scanAndRegister(modulePath: string): Promise<void> {
    // In a real implementation, this would scan the file system
    // For now, we'll rely on manual registration or explicit imports
  }

  /**
   * Get all registered beans
   */
  getAllBeans(): Map<string, any> {
    return new Map(this.beans);
  }

  /**
   * Clear all beans
   */
  clear(): void {
    this.beans.clear();
    this.beanTypes.clear();
    this.config.clear();
  }
}

