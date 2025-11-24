import 'reflect-metadata';
import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import {
  ENTITY_METADATA_KEY,
  TABLE_METADATA_KEY,
  COLUMN_METADATA_KEY,
  ID_METADATA_KEY,
  GENERATED_VALUE_METADATA_KEY,
  ONE_TO_MANY_METADATA_KEY,
  MANY_TO_ONE_METADATA_KEY,
  MANY_TO_MANY_METADATA_KEY,
  ONE_TO_ONE_METADATA_KEY,
} from '../decorators/entity';
import { RelationshipManager } from './RelationshipManager';

export class EntityManager {
  private relationshipManager: RelationshipManager;

  constructor(private pool: Pool) {
    this.relationshipManager = new RelationshipManager(pool);
  }

  /**
   * Persist an entity to the database
   */
  async persist<T>(entity: T): Promise<T> {
    const entityClass = entity.constructor as Function;
    const entityMetadata = Reflect.getMetadata(ENTITY_METADATA_KEY, entityClass);
    const tableMetadata = Reflect.getMetadata(TABLE_METADATA_KEY, entityClass);
    const columnMetadata = Reflect.getMetadata(COLUMN_METADATA_KEY, entityClass) || {};
    const idProperty = Reflect.getMetadata(ID_METADATA_KEY, entityClass);
    const generatedValue = Reflect.getMetadata(GENERATED_VALUE_METADATA_KEY, entityClass);

    if (!entityMetadata) {
      throw new Error(`Class ${entityClass.name} is not an entity`);
    }

    const tableName = tableMetadata?.name || entityClass.name.toLowerCase();
    const columns = Object.keys(columnMetadata);
    const values = columns.map(col => (entity as any)[col]);

    // Check if entity has an ID (for update vs insert)
    const idValue = idProperty ? (entity as any)[idProperty] : null;
    const idColumn = idProperty ? columnMetadata[idProperty]?.name || idProperty : null;

    if (idValue && generatedValue?.strategy !== 'AUTO') {
      // Update existing entity
      const setClause = columns
        .filter(col => col !== idProperty)
        .map(col => {
          const colName = columnMetadata[col].name || col;
          return `${colName} = ?`;
        })
        .join(', ');

      const updateValues = columns
        .filter(col => col !== idProperty)
        .map(col => (entity as any)[col]);

      const sql = `UPDATE ${tableName} SET ${setClause} WHERE ${idColumn} = ?`;
      await this.pool.execute(sql, [...updateValues, idValue]);
      return entity;
    } else {
      // Insert new entity
      const columnNames = columns.map(col => columnMetadata[col].name || col);
      const placeholders = columns.map(() => '?').join(', ');

      let sql = `INSERT INTO ${tableName} (${columnNames.join(', ')}) VALUES (${placeholders})`;
      
      if (generatedValue?.strategy === 'AUTO' && idProperty) {
        sql += '; SELECT LAST_INSERT_ID() as id';
      }

      const [result] = await this.pool.execute(sql, values) as [ResultSetHeader, any];
      
      if (generatedValue?.strategy === 'AUTO' && idProperty) {
        (entity as any)[idProperty] = result.insertId;
      }

      return entity;
    }
  }

  /**
   * Find an entity by ID
   */
  async find<T>(entityClass: new () => T, id: any): Promise<T | null> {
    const entityMetadata = Reflect.getMetadata(ENTITY_METADATA_KEY, entityClass);
    const tableMetadata = Reflect.getMetadata(TABLE_METADATA_KEY, entityClass);
    const columnMetadata = Reflect.getMetadata(COLUMN_METADATA_KEY, entityClass) || {};
    const idProperty = Reflect.getMetadata(ID_METADATA_KEY, entityClass);

    if (!entityMetadata) {
      throw new Error(`Class ${entityClass.name} is not an entity`);
    }

    const tableName = tableMetadata?.name || entityClass.name.toLowerCase();
    const idColumn = idProperty ? columnMetadata[idProperty]?.name || idProperty : 'id';

    const sql = `SELECT * FROM ${tableName} WHERE ${idColumn} = ? LIMIT 1`;
    const [rows] = await this.pool.execute(sql, [id]) as [RowDataPacket[], any];

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(entityClass, rows[0], columnMetadata);
  }

  /**
   * Find all entities
   */
  async findAll<T>(entityClass: new () => T): Promise<T[]> {
    const entityMetadata = Reflect.getMetadata(ENTITY_METADATA_KEY, entityClass);
    const tableMetadata = Reflect.getMetadata(TABLE_METADATA_KEY, entityClass);
    const columnMetadata = Reflect.getMetadata(COLUMN_METADATA_KEY, entityClass) || {};

    if (!entityMetadata) {
      throw new Error(`Class ${entityClass.name} is not an entity`);
    }

    const tableName = tableMetadata?.name || entityClass.name.toLowerCase();
    const sql = `SELECT * FROM ${tableName}`;
    const [rows] = await this.pool.execute(sql) as [RowDataPacket[], any];

    const entities = rows.map(row => this.mapRowToEntity(entityClass, row, columnMetadata));
    
    // Load EAGER relationships for all entities
    for (const entity of entities) {
      await this.loadRelationships(entity);
    }
    
    return entities;
  }

  /**
   * Remove an entity from the database
   */
  async remove<T>(entity: T): Promise<void> {
    const entityClass = entity.constructor as Function;
    const entityMetadata = Reflect.getMetadata(ENTITY_METADATA_KEY, entityClass);
    const tableMetadata = Reflect.getMetadata(TABLE_METADATA_KEY, entityClass);
    const columnMetadata = Reflect.getMetadata(COLUMN_METADATA_KEY, entityClass) || {};
    const idProperty = Reflect.getMetadata(ID_METADATA_KEY, entityClass);

    if (!entityMetadata) {
      throw new Error(`Class ${entityClass.name} is not an entity`);
    }

    if (!idProperty) {
      throw new Error(`Entity ${entityClass.name} does not have an ID property`);
    }

    const tableName = tableMetadata?.name || entityClass.name.toLowerCase();
    const idColumn = columnMetadata[idProperty]?.name || idProperty;
    const idValue = (entity as any)[idProperty];

    if (!idValue) {
      throw new Error(`Entity ${entityClass.name} does not have an ID value`);
    }

    const sql = `DELETE FROM ${tableName} WHERE ${idColumn} = ?`;
    await this.pool.execute(sql, [idValue]);
  }

  /**
   * Execute a custom query
   */
  async query<T>(sql: string, params?: any[]): Promise<T[]> {
    const [rows] = await this.pool.execute(sql, params || []) as [RowDataPacket[], any];
    return rows as T[];
  }

  /**
   * Execute a custom query and return single result
   */
  async queryOne<T>(sql: string, params?: any[]): Promise<T | null> {
    const results = await this.query<T>(sql, params);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Create a query builder
   */
  createQueryBuilder(entityClass: Function): QueryBuilder {
    return new QueryBuilder(this.pool, entityClass);
  }

  /**
   * Map database row to entity instance
   */
  private mapRowToEntity<T>(entityClass: new () => T, row: RowDataPacket, columnMetadata: any): T {
    const entity = new entityClass();
    const reverseColumnMap: { [key: string]: string } = {};

    // Create reverse mapping: column name -> property name
    Object.keys(columnMetadata).forEach(prop => {
      const colName = columnMetadata[prop].name || prop;
      reverseColumnMap[colName] = prop;
    });

    // Map row data to entity properties
    Object.keys(row).forEach(colName => {
      const propName = reverseColumnMap[colName] || colName;
      (entity as any)[propName] = row[colName];
    });

    return entity;
  }

  /**
   * Load relationships for an entity (EAGER loading)
   */
  async loadRelationships<T>(entity: T): Promise<T> {
    const entityClass = entity.constructor as Function;
    
    // Load ManyToOne relationships (EAGER by default)
    const manyToOneRelations = Reflect.getMetadata(MANY_TO_ONE_METADATA_KEY, entityClass) || {};
    for (const [propertyKey, relationMeta] of Object.entries(manyToOneRelations)) {
      const meta = relationMeta as any;
      if (meta.fetch === 'EAGER' && meta.targetEntity) {
        const targetEntityClass = meta.targetEntity();
        const related = await this.relationshipManager.loadManyToOne(
          entity,
          propertyKey,
          meta,
          targetEntityClass
        );
        (entity as any)[propertyKey] = related;
      }
    }

    // Load OneToOne relationships (EAGER by default)
    const oneToOneRelations = Reflect.getMetadata(ONE_TO_ONE_METADATA_KEY, entityClass) || {};
    for (const [propertyKey, relationMeta] of Object.entries(oneToOneRelations)) {
      const meta = relationMeta as any;
      if (meta.fetch === 'EAGER' && meta.targetEntity) {
        const targetEntityClass = meta.targetEntity();
        const related = await this.relationshipManager.loadOneToOne(
          entity,
          propertyKey,
          meta,
          targetEntityClass
        );
        (entity as any)[propertyKey] = related;
      }
    }

    return entity;
  }

  /**
   * Get relationship manager for manual relationship loading
   */
  getRelationshipManager(): RelationshipManager {
    return this.relationshipManager;
  }
}

/**
 * Query Builder for type-safe queries
 */
export class QueryBuilder {
  private selectClause = '*';
  private fromClause = '';
  private whereClauses: string[] = [];
  private whereParams: any[] = [];
  private orderByClause = '';
  private limitClause = '';
  private joinClauses: string[] = [];

  constructor(private pool: Pool, private entityClass: Function) {
    const tableMetadata = Reflect.getMetadata(TABLE_METADATA_KEY, entityClass);
    this.fromClause = tableMetadata?.name || entityClass.name.toLowerCase();
  }

  select(fields: string): this {
    this.selectClause = fields;
    return this;
  }

  where(condition: string, ...params: any[]): this {
    this.whereClauses.push(condition);
    this.whereParams.push(...params);
    return this;
  }

  andWhere(condition: string, ...params: any[]): this {
    return this.where(condition, ...params);
  }

  orderBy(field: string, direction: 'ASC' | 'DESC' = 'ASC'): this {
    this.orderByClause = `ORDER BY ${field} ${direction}`;
    return this;
  }

  limit(count: number, offset?: number): this {
    this.limitClause = offset !== undefined ? `LIMIT ${offset}, ${count}` : `LIMIT ${count}`;
    return this;
  }

  join(table: string, condition: string): this {
    this.joinClauses.push(`JOIN ${table} ON ${condition}`);
    return this;
  }

  leftJoin(table: string, condition: string): this {
    this.joinClauses.push(`LEFT JOIN ${table} ON ${condition}`);
    return this;
  }

  async getMany<T>(): Promise<T[]> {
    const sql = this.buildQuery();
    const [rows] = await this.pool.execute(sql, this.whereParams) as [RowDataPacket[], any];
    return rows as T[];
  }

  async getOne<T>(): Promise<T | null> {
    const results = await this.getMany<T>();
    return results.length > 0 ? results[0] : null;
  }

  private buildQuery(): string {
    let sql = `SELECT ${this.selectClause} FROM ${this.fromClause}`;
    
    if (this.joinClauses.length > 0) {
      sql += ' ' + this.joinClauses.join(' ');
    }

    if (this.whereClauses.length > 0) {
      sql += ' WHERE ' + this.whereClauses.join(' AND ');
    }

    if (this.orderByClause) {
      sql += ' ' + this.orderByClause;
    }

    if (this.limitClause) {
      sql += ' ' + this.limitClause;
    }

    return sql;
  }
}

