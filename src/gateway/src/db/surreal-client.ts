import { Surreal } from 'surrealdb.js';
import logger from '../utils/logger';

/**
 * Configuration for SurrealDB connection
 */
export interface SurrealDBConfig {
  url: string;
  namespace: string;
  database: string;
  username: string;
  password: string;
}

/**
 * SurrealDB client wrapper with connection pooling and error handling
 */
export class SurrealDBClient {
  private static instance: SurrealDBClient;
  private client: Surreal;
  private config: SurrealDBConfig;
  private connected: boolean = false;

  private constructor(config: SurrealDBConfig) {
    this.config = config;
    this.client = new Surreal();
  }

  /**
   * Get singleton instance
   */
  public static getInstance(config?: SurrealDBConfig): SurrealDBClient {
    if (!SurrealDBClient.instance) {
      if (!config) {
        throw new Error('Config required for first initialization');
      }
      SurrealDBClient.instance = new SurrealDBClient(config);
    }
    return SurrealDBClient.instance;
  }

  /**
   * Connect to SurrealDB
   */
  public async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      logger.info({
        msg: 'Connecting to SurrealDB',
        url: this.config.url,
        namespace: this.config.namespace,
        database: this.config.database
      }, 'SurrealDB connection attempt');

      await this.client.connect(this.config.url, {
        namespace: this.config.namespace,
        database: this.config.database,
        auth: {
          username: this.config.username,
          password: this.config.password
        }
      });

      this.connected = true;
      
      logger.info({
        msg: 'Connected to SurrealDB',
        url: this.config.url,
        namespace: this.config.namespace,
        database: this.config.database
      }, 'SurrealDB connected successfully');

      // Test connection with a simple query
      await this.client.query('SELECT * FROM $db');
      logger.debug('SurrealDB connection test passed');

    } catch (error) {
      this.connected = false;
      logger.error({
        msg: 'Failed to connect to SurrealDB',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, 'SurrealDB connection failed');
      throw error;
    }
  }

  /**
   * Disconnect from SurrealDB
   */
  public async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }

    try {
      await this.client.close();
      this.connected = false;
      logger.info('Disconnected from SurrealDB');
    } catch (error) {
      logger.error({
        msg: 'Error disconnecting from SurrealDB',
        error: error instanceof Error ? error.message : String(error)
      }, 'SurrealDB disconnect error');
      throw error;
    }
  }

  /**
   * Check if connected
   */
  public isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get raw Surreal client (for advanced operations)
   */
  public getClient(): Surreal {
    if (!this.connected) {
      throw new Error('SurrealDB client not connected');
    }
    return this.client;
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.client.query('SELECT * FROM $db');
      return Array.isArray(result);
    } catch (error) {
      logger.error({
        msg: 'SurrealDB health check failed',
        error: error instanceof Error ? error.message : String(error)
      }, 'SurrealDB health check error');
      return false;
    }
  }

  /**
   * Execute a query with error handling
   */
  public async query<T = any>(query: string, params?: Record<string, any>): Promise<T[]> {
    try {
      logger.debug({
        msg: 'Executing SurrealDB query',
        query,
        params
      }, 'SurrealDB query');

      // @ts-ignore
      const result = await this.client.query<T>(query, params);
      
      // The result structure depends on the query type
      // For SELECT queries, result is an array of arrays
      if (Array.isArray(result)) {
        // Flatten array of arrays
        const flattened = (result as any).flat();
        return flattened as T[];
      }
      
      return result as T[];
    } catch (error) {
      logger.error({
        msg: 'SurrealDB query failed',
        query,
        params,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      }, 'SurrealDB query error');
      throw error;
    }
  }

  /**
   * Create a record
   */
  public async create<T = any>(table: string, data: Partial<T>): Promise<T> {
    try {
      logger.debug({
        msg: 'Creating SurrealDB record',
        table,
        data
      }, 'SurrealDB create');

      // Generate a unique ID if not provided
      const id = (data as any).id || `${table}:${Date.now()}`;
      // @ts-ignore
      const record = await this.client.create(id, data as any);
      return record as T;
    } catch (error) {
      logger.error({
        msg: 'SurrealDB create failed',
        table,
        data,
        error: error instanceof Error ? error.message : String(error)
      }, 'SurrealDB create error');
      throw error;
    }
  }

  /**
   * Read a record by ID
   */
  public async read<T = any>(id: string): Promise<T | null> {
    try {
      logger.debug({
        msg: 'Reading SurrealDB record',
        id
      }, 'SurrealDB read');

      // @ts-ignore
      const record = await this.client.select<T>(id);
      // @ts-ignore
      return record || null;
    } catch (error) {
      logger.error({
        msg: 'SurrealDB read failed',
        id,
        error: error instanceof Error ? error.message : String(error)
      }, 'SurrealDB read error');
      throw error;
    }
  }

  /**
   * Update a record
   */
  public async update<T = any>(id: string, data: Partial<T>): Promise<T> {
    try {
      logger.debug({
        msg: 'Updating SurrealDB record',
        id,
        data
      }, 'SurrealDB update');

      // @ts-ignore
      const record = await this.client.update<T>(id, data);
      // @ts-ignore
      return record as T;
    } catch (error) {
      logger.error({
        msg: 'SurrealDB update failed',
        id,
        data,
        error: error instanceof Error ? error.message : String(error)
      }, 'SurrealDB update error');
      throw error;
    }
  }

  /**
   * Delete a record
   */
  public async delete(id: string): Promise<void> {
    try {
      logger.debug({
        msg: 'Deleting SurrealDB record',
        id
      }, 'SurrealDB delete');

      await this.client.delete(id);
    } catch (error) {
      logger.error({
        msg: 'SurrealDB delete failed',
        id,
        error: error instanceof Error ? error.message : String(error)
      }, 'SurrealDB delete error');
      throw error;
    }
  }

  /**
   * Find records by criteria
   */
  public async find<T = any>(table: string, where?: Record<string, any>): Promise<T[]> {
    try {
      let query = `SELECT * FROM ${table}`;
      const params: Record<string, any> = {};
      
      if (where && Object.keys(where).length > 0) {
        const conditions = Object.keys(where).map((key, index) => {
          params[`param${index}`] = where[key];
          return `${key} = $param${index}`;
        }).join(' AND ');
        query += ` WHERE ${conditions}`;
      }

      logger.debug({
        msg: 'Finding SurrealDB records',
        table,
        where,
        query
      }, 'SurrealDB find');

      return await this.query<T>(query, params);
    } catch (error) {
      logger.error({
        msg: 'SurrealDB find failed',
        table,
        where,
        error: error instanceof Error ? error.message : String(error)
      }, 'SurrealDB find error');
      throw error;
    }
  }
}

/**
 * Default configuration from environment variables
 */
export function getDefaultConfig(): SurrealDBConfig {
  return {
    url: process.env.SURREALDB_URL || 'http://localhost:8000',
    namespace: process.env.SURREALDB_NAMESPACE || 'stuur',
    database: process.env.SURREALDB_DATABASE || 'stuur',
    username: process.env.SURREALDB_USER || 'root',
    password: process.env.SURREALDB_PASS || 'root'
  };
}

/**
 * Initialize and connect the default SurrealDB client
 */
export async function initializeSurrealDB(config?: SurrealDBConfig): Promise<SurrealDBClient> {
  const dbConfig = config || getDefaultConfig();
  const client = SurrealDBClient.getInstance(dbConfig);
  await client.connect();
  return client;
}

// Export default client instance
export const surrealDB = SurrealDBClient.getInstance(getDefaultConfig());