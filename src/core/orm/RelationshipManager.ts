import 'reflect-metadata';
import { Pool, RowDataPacket } from 'mysql2/promise';
import {
  ONE_TO_MANY_METADATA_KEY,
  MANY_TO_ONE_METADATA_KEY,
  MANY_TO_MANY_METADATA_KEY,
  ONE_TO_ONE_METADATA_KEY,
  TABLE_METADATA_KEY,
  ID_METADATA_KEY,
  COLUMN_METADATA_KEY,
} from '../decorators/entity';
import { JOIN_COLUMN_METADATA_KEY, JOIN_TABLE_METADATA_KEY } from '../decorators/mapping';

export class RelationshipManager {
  constructor(private pool: Pool) {}

  /**
   * Load a ManyToOne relationship
   */
  async loadManyToOne<T>(
    entity: any,
    propertyKey: string,
    relationMetadata: any,
    targetEntityClass: new () => T
  ): Promise<T | null> {
    const joinColumnMeta = Reflect.getMetadata(JOIN_COLUMN_METADATA_KEY, entity.constructor) || {};
    const joinColumn = joinColumnMeta[propertyKey];
    
    let foreignKeyColumn: string;
    let foreignKeyValue: any;

    if (joinColumn) {
      foreignKeyColumn = joinColumn.name;
      foreignKeyValue = entity[foreignKeyColumn] || entity[propertyKey];
    } else if (relationMetadata.joinColumn) {
      foreignKeyColumn = typeof relationMetadata.joinColumn === 'string' 
        ? relationMetadata.joinColumn 
        : relationMetadata.joinColumn.name || `${propertyKey}_id`;
      foreignKeyValue = entity[foreignKeyColumn] || entity[propertyKey];
    } else {
      foreignKeyColumn = `${propertyKey}_id`;
      foreignKeyValue = entity[foreignKeyColumn] || entity[propertyKey];
    }

    if (!foreignKeyValue) {
      return null;
    }

    const targetTableMeta = Reflect.getMetadata(TABLE_METADATA_KEY, targetEntityClass);
    const targetTable = targetTableMeta?.name || targetEntityClass.name.toLowerCase();
    const targetIdMeta = Reflect.getMetadata(ID_METADATA_KEY, targetEntityClass);
    const targetColumnMeta = Reflect.getMetadata(COLUMN_METADATA_KEY, targetEntityClass) || {};
    const targetIdColumn = targetIdMeta ? (targetColumnMeta[targetIdMeta]?.name || targetIdMeta) : 'id';

    const referencedColumn = joinColumn?.referencedColumnName || 'id';

    const sql = `SELECT * FROM \`${targetTable}\` WHERE \`${referencedColumn}\` = ? LIMIT 1`;
    const [rows] = await this.pool.execute(sql, [foreignKeyValue]) as [RowDataPacket[], any];

    if (rows.length === 0) {
      return null;
    }

    return this.mapRowToEntity(targetEntityClass, rows[0], targetColumnMeta);
  }

  /**
   * Load a OneToMany relationship
   */
  async loadOneToMany<T>(
    entity: any,
    propertyKey: string,
    relationMetadata: any,
    targetEntityClass: new () => T
  ): Promise<T[]> {
    const mappedBy = relationMetadata.mappedBy || propertyKey;
    const targetTableMeta = Reflect.getMetadata(TABLE_METADATA_KEY, targetEntityClass);
    const targetTable = targetTableMeta?.name || targetEntityClass.name.toLowerCase();
    const targetColumnMeta = Reflect.getMetadata(COLUMN_METADATA_KEY, targetEntityClass) || {};
    
    // Get the ID of the current entity
    const sourceIdMeta = Reflect.getMetadata(ID_METADATA_KEY, entity.constructor);
    const sourceColumnMeta = Reflect.getMetadata(COLUMN_METADATA_KEY, entity.constructor) || {};
    const sourceIdColumn = sourceIdMeta ? (sourceColumnMeta[sourceIdMeta]?.name || sourceIdMeta) : 'id';
    const sourceIdValue = entity[sourceIdMeta] || entity.id;

    if (!sourceIdValue) {
      return [];
    }

    // Find the foreign key column in the target entity
    const foreignKeyColumn = targetColumnMeta[mappedBy]?.name || `${entity.constructor.name.toLowerCase()}_id` || mappedBy;

    const sql = `SELECT * FROM \`${targetTable}\` WHERE \`${foreignKeyColumn}\` = ?`;
    const [rows] = await this.pool.execute(sql, [sourceIdValue]) as [RowDataPacket[], any];

    return rows.map(row => this.mapRowToEntity(targetEntityClass, row, targetColumnMeta));
  }

  /**
   * Load a ManyToMany relationship
   */
  async loadManyToMany<T>(
    entity: any,
    propertyKey: string,
    relationMetadata: any,
    targetEntityClass: new () => T
  ): Promise<T[]> {
    const joinTableMeta = Reflect.getMetadata(JOIN_TABLE_METADATA_KEY, entity.constructor) || {};
    const joinTable = joinTableMeta[propertyKey];

    let joinTableName: string;
    let joinColumn: string;
    let inverseJoinColumn: string;

    if (joinTable) {
      joinTableName = joinTable.name || `${entity.constructor.name.toLowerCase()}_${propertyKey}`;
      joinColumn = joinTable.joinColumns?.[0]?.name || `${entity.constructor.name.toLowerCase()}_id`;
      inverseJoinColumn = joinTable.inverseJoinColumns?.[0]?.name || `${targetEntityClass.name.toLowerCase()}_id`;
    } else if (relationMetadata.joinTable) {
      if (typeof relationMetadata.joinTable === 'string') {
        joinTableName = relationMetadata.joinTable;
        joinColumn = `${entity.constructor.name.toLowerCase()}_id`;
        inverseJoinColumn = `${targetEntityClass.name.toLowerCase()}_id`;
      } else {
        joinTableName = relationMetadata.joinTable.name || `${entity.constructor.name.toLowerCase()}_${propertyKey}`;
        joinColumn = relationMetadata.joinTable.joinColumns?.[0]?.name || `${entity.constructor.name.toLowerCase()}_id`;
        inverseJoinColumn = relationMetadata.joinTable.inverseJoinColumns?.[0]?.name || `${targetEntityClass.name.toLowerCase()}_id`;
      }
    } else {
      joinTableName = `${entity.constructor.name.toLowerCase()}_${propertyKey}`;
      joinColumn = `${entity.constructor.name.toLowerCase()}_id`;
      inverseJoinColumn = `${targetEntityClass.name.toLowerCase()}_id`;
    }

    // Get the ID of the current entity
    const sourceIdMeta = Reflect.getMetadata(ID_METADATA_KEY, entity.constructor);
    const sourceIdValue = entity[sourceIdMeta] || entity.id;

    if (!sourceIdValue) {
      return [];
    }

    const targetTableMeta = Reflect.getMetadata(TABLE_METADATA_KEY, targetEntityClass);
    const targetTable = targetTableMeta?.name || targetEntityClass.name.toLowerCase();
    const targetColumnMeta = Reflect.getMetadata(COLUMN_METADATA_KEY, targetEntityClass) || {};
    const targetIdMeta = Reflect.getMetadata(ID_METADATA_KEY, targetEntityClass);
    const targetIdColumn = targetIdMeta ? (targetColumnMeta[targetIdMeta]?.name || targetIdMeta) : 'id';

    const sql = `
      SELECT t.* FROM \`${targetTable}\` t
      INNER JOIN \`${joinTableName}\` jt ON t.\`${targetIdColumn}\` = jt.\`${inverseJoinColumn}\`
      WHERE jt.\`${joinColumn}\` = ?
    `;

    const [rows] = await this.pool.execute(sql, [sourceIdValue]) as [RowDataPacket[], any];

    return rows.map(row => this.mapRowToEntity(targetEntityClass, row, targetColumnMeta));
  }

  /**
   * Load a OneToOne relationship
   */
  async loadOneToOne<T>(
    entity: any,
    propertyKey: string,
    relationMetadata: any,
    targetEntityClass: new () => T
  ): Promise<T | null> {
    // OneToOne can be bidirectional, check if mappedBy is set
    if (relationMetadata.mappedBy) {
      // This is the inverse side, load from the owning side
      return this.loadOneToMany(entity, propertyKey, relationMetadata, targetEntityClass).then(results => 
        results.length > 0 ? results[0] : null
      );
    } else {
      // This is the owning side, use join column
      return this.loadManyToOne(entity, propertyKey, relationMetadata, targetEntityClass);
    }
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
}

