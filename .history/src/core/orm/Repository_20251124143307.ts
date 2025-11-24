import 'reflect-metadata';
import { EntityManager } from './EntityManager';
import { Pool } from 'mysql2/promise';
import { TABLE_METADATA_KEY } from '../decorators/entity';

/**
 * Base repository interface similar to Spring Data JPA's CrudRepository
 */
export interface CrudRepository<T, ID> {
  save(entity: T): Promise<T>;
  saveAll(entities: T[]): Promise<T[]>;
  findById(id: ID): Promise<T | null>;
  findAll(): Promise<T[]>;
  existsById(id: ID): Promise<boolean>;
  count(): Promise<number>;
  deleteById(id: ID): Promise<void>;
  delete(entity: T): Promise<void>;
  deleteAll(): Promise<void>;
}

/**
 * Base repository implementation
 */
export abstract class BaseRepository<T, ID> implements CrudRepository<T, ID> {
  protected entityManager: EntityManager;

  constructor(protected pool: Pool) {
    this.entityManager = new EntityManager(pool);
  }

  abstract getEntityClass(): new () => T;
  abstract getId(entity: T): ID;

  async save(entity: T): Promise<T> {
    return this.entityManager.persist(entity);
  }

  async saveAll(entities: T[]): Promise<T[]> {
    const saved: T[] = [];
    for (const entity of entities) {
      saved.push(await this.save(entity));
    }
    return saved;
  }

  async findById(id: ID): Promise<T | null> {
    return this.entityManager.find(this.getEntityClass(), id);
  }

  async findAll(): Promise<T[]> {
    return this.entityManager.findAll(this.getEntityClass());
  }

  async existsById(id: ID): Promise<boolean> {
    const entity = await this.findById(id);
    return entity !== null;
  }

  async count(): Promise<number> {
    const entityClass = this.getEntityClass();
    const tableMetadata = Reflect.getMetadata('table', entityClass);
    const tableName = tableMetadata?.name || entityClass.name.toLowerCase();
    const result = await this.entityManager.queryOne<{ count: number }>(
      `SELECT COUNT(*) as count FROM ${tableName}`
    );
    return result?.count || 0;
  }

  async deleteById(id: ID): Promise<void> {
    const entity = await this.findById(id);
    if (entity) {
      await this.entityManager.remove(entity);
    }
  }

  async delete(entity: T): Promise<void> {
    await this.entityManager.remove(entity);
  }

  async deleteAll(): Promise<void> {
    const entities = await this.findAll();
    for (const entity of entities) {
      await this.delete(entity);
    }
  }

  /**
   * Create a query builder for custom queries
   */
  createQueryBuilder() {
    return this.entityManager.createQueryBuilder(this.getEntityClass());
  }
}

