import 'reflect-metadata';
import { Pool } from 'mysql2/promise';
import {
  ENTITY_METADATA_KEY,
  TABLE_METADATA_KEY,
  COLUMN_METADATA_KEY,
  ID_METADATA_KEY,
  GENERATED_VALUE_METADATA_KEY,
} from '../decorators/entity';

export class SchemaGenerator {
  constructor(private pool: Pool) {}

  /**
   * Generate and execute CREATE TABLE statements for all entities
   */
  async generateSchema(entities: Function[]): Promise<void> {
    for (const entityClass of entities) {
      await this.createTable(entityClass);
    }
    console.log('✓ Database schema generated successfully');
  }

  /**
   * Create a table for an entity
   */
  private async createTable(entityClass: Function): Promise<void> {
    const entityMetadata = Reflect.getMetadata(ENTITY_METADATA_KEY, entityClass);
    if (!entityMetadata) {
      return; // Not an entity, skip
    }

    const tableMetadata = Reflect.getMetadata(TABLE_METADATA_KEY, entityClass);
    const columnMetadata = Reflect.getMetadata(COLUMN_METADATA_KEY, entityClass) || {};
    const idProperty = Reflect.getMetadata(ID_METADATA_KEY, entityClass);
    const generatedValue = Reflect.getMetadata(GENERATED_VALUE_METADATA_KEY, entityClass);

    const tableName = tableMetadata?.name || entityClass.name.toLowerCase();

    // Check if table already exists
    const tableExists = await this.tableExists(tableName);
    if (tableExists) {
      console.log(`  Table '${tableName}' already exists, skipping...`);
      return;
    }

    // Build CREATE TABLE statement
    const columns: string[] = [];
    let primaryKeyColumn: string | null = null;

    Object.keys(columnMetadata).forEach(propertyKey => {
      const colMeta = columnMetadata[propertyKey];
      const colName = colMeta.name || propertyKey;
      let colDef = `\`${colName}\` ${this.getSqlType(colMeta.type, colMeta.length, colMeta.precision, colMeta.scale)}`;

      // Handle nullable
      if (colMeta.nullable === false) {
        colDef += ' NOT NULL';
      }

      // Handle unique
      if (colMeta.unique) {
        colDef += ' UNIQUE';
      }

      // Handle default
      if (colMeta.default !== undefined) {
        if (typeof colMeta.default === 'string') {
          colDef += ` DEFAULT '${colMeta.default}'`;
        } else {
          colDef += ` DEFAULT ${colMeta.default}`;
        }
      }

      // Handle AUTO_INCREMENT for ID
      if (propertyKey === idProperty && generatedValue?.strategy === 'AUTO') {
        colDef += ' AUTO_INCREMENT';
        primaryKeyColumn = colName;
      }

      columns.push(colDef);
    });

    // Add primary key constraint
    if (primaryKeyColumn) {
      columns.push(`PRIMARY KEY (\`${primaryKeyColumn}\`)`);
    }

    // Handle updated_at with ON UPDATE CURRENT_TIMESTAMP
    const updatedAtCol = columns.findIndex(c => c.includes('updated_at') && c.includes('DEFAULT CURRENT_TIMESTAMP'));
    if (updatedAtCol !== -1) {
      columns[updatedAtCol] = columns[updatedAtCol].replace(
        'DEFAULT CURRENT_TIMESTAMP',
        'DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
      );
    }

    const sql = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n  ${columns.join(',\n  ')}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`;

    try {
      await this.pool.execute(sql);
      console.log(`  ✓ Created table '${tableName}'`);
    } catch (error: any) {
      console.error(`  ✗ Failed to create table '${tableName}':`, error.message);
      throw error;
    }
  }

  /**
   * Check if a table exists
   */
  private async tableExists(tableName: string): Promise<boolean> {
    try {
      const [rows] = await this.pool.execute(
        `SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?`,
        [tableName]
      ) as any[];
      return rows[0].count > 0;
    } catch {
      return false;
    }
  }

  /**
   * Convert TypeScript type to SQL type
   */
  private getSqlType(
    type?: string,
    length?: number,
    precision?: number,
    scale?: number
  ): string {
    if (!type) {
      return 'VARCHAR(255)';
    }

    const upperType = type.toUpperCase();

    switch (upperType) {
      case 'INT':
      case 'INTEGER':
        return 'INT';
      case 'BIGINT':
        return 'BIGINT';
      case 'SMALLINT':
        return 'SMALLINT';
      case 'TINYINT':
        return 'TINYINT';
      case 'FLOAT':
        return 'FLOAT';
      case 'DOUBLE':
        return 'DOUBLE';
      case 'DECIMAL':
      case 'NUMERIC':
        if (precision && scale) {
          return `DECIMAL(${precision},${scale})`;
        } else if (precision) {
          return `DECIMAL(${precision})`;
        }
        return 'DECIMAL(10,2)';
      case 'VARCHAR':
        return length ? `VARCHAR(${length})` : 'VARCHAR(255)';
      case 'CHAR':
        return length ? `CHAR(${length})` : 'CHAR(1)';
      case 'TEXT':
        return 'TEXT';
      case 'LONGTEXT':
        return 'LONGTEXT';
      case 'MEDIUMTEXT':
        return 'MEDIUMTEXT';
      case 'TINYTEXT':
        return 'TINYTEXT';
      case 'BLOB':
        return 'BLOB';
      case 'LONGBLOB':
        return 'LONGBLOB';
      case 'DATE':
        return 'DATE';
      case 'TIME':
        return 'TIME';
      case 'DATETIME':
        return 'DATETIME';
      case 'TIMESTAMP':
        return 'TIMESTAMP';
      case 'BOOLEAN':
      case 'BOOL':
        return 'BOOLEAN';
      case 'JSON':
        return 'JSON';
      default:
        return length ? `VARCHAR(${length})` : 'VARCHAR(255)';
    }
  }

  /**
   * Drop all tables for entities (use with caution!)
   */
  async dropSchema(entities: Function[]): Promise<void> {
    for (const entityClass of entities) {
      const entityMetadata = Reflect.getMetadata(ENTITY_METADATA_KEY, entityClass);
      if (!entityMetadata) {
        continue;
      }

      const tableMetadata = Reflect.getMetadata(TABLE_METADATA_KEY, entityClass);
      const tableName = tableMetadata?.name || entityClass.name.toLowerCase();

      try {
        await this.pool.execute(`DROP TABLE IF EXISTS \`${tableName}\``);
        console.log(`  ✓ Dropped table '${tableName}'`);
      } catch (error: any) {
        console.error(`  ✗ Failed to drop table '${tableName}':`, error.message);
      }
    }
  }
}

