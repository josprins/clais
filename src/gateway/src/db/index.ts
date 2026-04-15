import { SurrealDBClient, initializeSurrealDB } from './surreal-client';
import { UserRepository } from './repositories/user-repository';
import { MessageRepository } from './repositories/message-repository';
import logger from '../utils/logger';

/**
 * Database manager holding all repositories
 */
export class DatabaseManager {
  private static instance: DatabaseManager;
  private client: SurrealDBClient;
  public users: UserRepository;
  public messages: MessageRepository;
  private connected: boolean = false;

  private constructor(client: SurrealDBClient) {
    this.client = client;
    this.users = new UserRepository(client);
    this.messages = new MessageRepository(client);
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      throw new Error('DatabaseManager not initialized. Call initializeDatabase() first.');
    }
    return DatabaseManager.instance;
  }

  /**
   * Initialize database connection and create manager
   */
  public static async initializeDatabase(config?: any): Promise<DatabaseManager> {
    try {
      logger.info('Initializing database connection...');
      
      const client = await initializeSurrealDB(config);
      DatabaseManager.instance = new DatabaseManager(client);
      DatabaseManager.instance.connected = true;
      
      logger.info('Database manager initialized successfully');
      return DatabaseManager.instance;
    } catch (error) {
      logger.error({
        msg: 'Failed to initialize database',
        error: error instanceof Error ? error.message : String(error)
      }, 'Database initialization error');
      throw error;
    }
  }

  /**
   * Check if database is connected
   */
  public isConnected(): boolean {
    return this.connected && this.client.isConnected();
  }

  /**
   * Health check
   */
  public async healthCheck(): Promise<boolean> {
    try {
      return await this.client.healthCheck();
    } catch (error) {
      logger.error({
        msg: 'Database health check failed',
        error: error instanceof Error ? error.message : String(error)
      }, 'Database health check error');
      return false;
    }
  }

  /**
   * Disconnect from database
   */
  public async disconnect(): Promise<void> {
    try {
      await this.client.disconnect();
      this.connected = false;
      logger.info('Database disconnected');
    } catch (error) {
      logger.error({
        msg: 'Error disconnecting from database',
        error: error instanceof Error ? error.message : String(error)
      }, 'Database disconnect error');
      throw error;
    }
  }
}

/**
 * Convenience function to get database manager instance
 */
export function getDatabase(): DatabaseManager {
  return DatabaseManager.getInstance();
}

/**
 * Initialize database (to be called at application startup)
 */
export async function initializeDatabase(): Promise<DatabaseManager> {
  return DatabaseManager.initializeDatabase();
}

// Default export
export default DatabaseManager;