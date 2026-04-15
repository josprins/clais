/**
 * Base interface for all SurrealDB entities
 */
export interface BaseEntity {
  id: string;
  created_at: Date;
  updated_at: Date;
}

/**
 * Metadata for auditing
 */
export interface AuditMetadata {
  created_by?: string;
  updated_by?: string;
  deleted_at?: Date;
  deleted_by?: string;
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

/**
 * Pagination result
 */
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

/**
 * Generic filter options
 */
export interface FilterOptions {
  where?: Record<string, any>;
  pagination?: PaginationOptions;
}