import { SurrealDBClient } from '../surreal-client';
import { BaseEntity, FilterOptions, PaginatedResult } from '../models/base';
import logger from '../../utils/logger';

/**
 * Base repository class with common CRUD operations
 */
export abstract class BaseRepository<T extends BaseEntity> {
  protected client: SurrealDBClient;
  protected tableName: string;

  constructor(client: SurrealDBClient, tableName: string) {
    this.client = client;
    this.tableName = tableName;
  }

  /**
   * Create a new record
   */
  public async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    try {
      const now = new Date();
      const recordData = {
        ...data,
        created_at: now,
        updated_at: now
      };

      const record = await this.client.create<T>(this.tableName, recordData as any);
      logger.debug({
        msg: 'Repository create successful',
        table: this.tableName,
        id: (record as any).id
      }, 'Repository create');

      return record;
    } catch (error) {
      logger.error({
        msg: 'Repository create failed',
        table: this.tableName,
        data,
        error: error instanceof Error ? error.message : String(error)
      }, 'Repository create error');
      throw error;
    }
  }

  /**
   * Read a record by ID
   */
  public async read(id: string): Promise<T | null> {
    try {
      const fullId = id.includes(':') ? id : `${this.tableName}:${id}`;
      const record = await this.client.read<T>(fullId);
      
      logger.debug({
        msg: 'Repository read',
        table: this.tableName,
        id: fullId,
        found: !!record
      }, 'Repository read');

      return record;
    } catch (error) {
      logger.error({
        msg: 'Repository read failed',
        table: this.tableName,
        id,
        error: error instanceof Error ? error.message : String(error)
      }, 'Repository read error');
      throw error;
    }
  }

  /**
   * Update a record
   */
  public async update(id: string, data: Partial<Omit<T, 'id' | 'created_at'>>): Promise<T> {
    try {
      const fullId = id.includes(':') ? id : `${this.tableName}:${id}`;
      const updateData = {
        ...data,
        updated_at: new Date()
      };

      const record = await this.client.update<T>(fullId, updateData as any);
      
      logger.debug({
        msg: 'Repository update successful',
        table: this.tableName,
        id: fullId
      }, 'Repository update');

      return record;
    } catch (error) {
      logger.error({
        msg: 'Repository update failed',
        table: this.tableName,
        id,
        data,
        error: error instanceof Error ? error.message : String(error)
      }, 'Repository update error');
      throw error;
    }
  }

  /**
   * Delete a record
   */
  public async delete(id: string): Promise<void> {
    try {
      const fullId = id.includes(':') ? id : `${this.tableName}:${id}`;
      await this.client.delete(fullId);
      
      logger.debug({
        msg: 'Repository delete successful',
        table: this.tableName,
        id: fullId
      }, 'Repository delete');
    } catch (error) {
      logger.error({
        msg: 'Repository delete failed',
        table: this.tableName,
        id,
        error: error instanceof Error ? error.message : String(error)
      }, 'Repository delete error');
      throw error;
    }
  }

  /**
   * Find records with filters
   */
  public async find(where?: Record<string, any>): Promise<T[]> {
    try {
      const records = await this.client.find<T>(this.tableName, where);
      
      logger.debug({
        msg: 'Repository find',
        table: this.tableName,
        where,
        count: records.length
      }, 'Repository find');

      return records;
    } catch (error) {
      logger.error({
        msg: 'Repository find failed',
        table: this.tableName,
        where,
        error: error instanceof Error ? error.message : String(error)
      }, 'Repository find error');
      throw error;
    }
  }

  /**
   * Find one record matching criteria
   */
  public async findOne(where?: Record<string, any>): Promise<T | null> {
    try {
      const records = await this.find(where);
      return records[0] || null;
    } catch (error) {
      logger.error({
        msg: 'Repository findOne failed',
        table: this.tableName,
        where,
        error: error instanceof Error ? error.message : String(error)
      }, 'Repository findOne error');
      throw error;
    }
  }

  /**
   * Find records with pagination
   */
  /**
   * Find records with pagination
   */
  public async findPaginated(
    options: FilterOptions = {}
  ): Promise<PaginatedResult<T>> {
    try {
      const { where = {}, pagination = {} } = options;
      const { page = 1, limit = 50, sort = 'created_at', order = 'DESC' } = pagination;

      // Simple implementation - get all and paginate in memory
      // This is not efficient for large datasets but works for now
      const allRecords = await this.find(where);
      
      // Sort records
      const sortedRecords = allRecords.sort((a, b) => {
        const aVal = (a as any)[sort];
        const bVal = (b as any)[sort];
        if (order === 'DESC') {
          return new Date(bVal).getTime() - new Date(aVal).getTime();
        } else {
          return new Date(aVal).getTime() - new Date(bVal).getTime();
        }
      });
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedRecords = sortedRecords.slice(startIndex, endIndex);
      
      const result: PaginatedResult<T> = {
        data: paginatedRecords,
        pagination: {
          page,
          limit,
          total: allRecords.length,
          totalPages: Math.ceil(allRecords.length / limit),
          hasNext: endIndex < allRecords.length,
          hasPrev: page > 1
        }
      };

      logger.debug({
        msg: 'Repository findPaginated',
        table: this.tableName,
        page,
        limit,
        total: allRecords.length,
        totalPages: result.pagination.totalPages
      }, 'Repository findPaginated');

      return result;
    } catch (error) {
      logger.error({
        msg: 'Repository findPaginated failed',
        table: this.tableName,
        options,
        error: error instanceof Error ? error.message : String(error)
      }, 'Repository findPaginated error');
      throw error;
    }
  }

  /**
   * Check if a record exists
   */
  public async exists(where: Record<string, any>): Promise<boolean> {
    try {
      const record = await this.findOne(where);
      return !!record;
    } catch (error) {
      logger.error({
        msg: 'Repository exists failed',
        table: this.tableName,
        where,
        error: error instanceof Error ? error.message : String(error)
      }, 'Repository exists error');
      throw error;
    }
  }

  /**
   * Count records matching criteria
   */
  public async count(where?: Record<string, any>): Promise<number> {
    try {
      const records = await this.find(where);
      return records.length;
    } catch (error) {
      logger.error({
        msg: 'Repository count failed',
        table: this.tableName,
        where,
        error: error instanceof Error ? error.message : String(error)
      }, 'Repository count error');
      throw error;
    }
  }
}