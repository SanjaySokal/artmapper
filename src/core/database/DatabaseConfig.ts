import { Pool, PoolOptions, createPool, Pool as PoolType } from 'mysql2/promise';

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  connectionLimit?: number;
  waitForConnections?: boolean;
  queueLimit?: number;
}

export class DatabaseManager {
  private static instance: DatabaseManager;
  private pool: Pool | null = null;
  private config: DatabaseConfig | null = null;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize database connection pool
   */
  async initialize(config: DatabaseConfig): Promise<void> {
    this.config = config;
    
    // Ensure database exists first (before connecting to it)
    await this.ensureDatabaseExists(config.database);

    const poolOptions: PoolOptions = {
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      waitForConnections: config.waitForConnections !== false,
      connectionLimit: config.connectionLimit || 10,
      queueLimit: config.queueLimit || 0,
    };

    this.pool = createPool(poolOptions);

    // Test connection
    try {
      const connection = await this.pool.getConnection();
      await connection.ping();
      connection.release();
      console.log('✓ Database connection established');
    } catch (error) {
      console.error('✗ Database connection failed:', error);
      throw error;
    }
  }

  /**
   * Ensure the database exists, create if it doesn't
   */
  private async ensureDatabaseExists(databaseName: string): Promise<void> {
    if (!this.config) return;

    try {
      // Create a connection without specifying database
      const tempPool = createPool({
        host: this.config.host,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
      });

      await tempPool.execute(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
      await tempPool.end();
    } catch (error) {
      // If we can't create database, it might already exist or we don't have permissions
      // This is not a fatal error, continue
      console.warn('Could not create database (may already exist):', (error as Error).message);
    }
  }

  /**
   * Get the connection pool
   */
  getPool(): Pool {
    if (!this.pool) {
      throw new Error('Database not initialized. Call initialize() first.');
    }
    return this.pool;
  }

  /**
   * Close all database connections
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      this.pool = null;
      console.log('✓ Database connections closed');
    }
  }

  /**
   * Execute a raw SQL query
   */
  async query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const pool = this.getPool();
    const [rows] = await pool.execute(sql, params || []);
    return rows as T[];
  }
}

