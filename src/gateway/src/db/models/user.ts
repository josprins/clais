import { BaseEntity, AuditMetadata } from './base';

/**
 * Telegram user information
 */
export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

/**
 * User preferences
 */
export interface UserPreferences {
  language?: string;
  timezone?: string;
  notification_enabled?: boolean;
  reminder_time?: string; // HH:mm format
  currency?: string;
}

/**
 * User entity stored in SurrealDB
 */
export interface User extends BaseEntity {
  // Telegram user ID (used as part of SurrealDB ID: user:123456789)
  telegram_id: number;
  
  // Telegram user data
  telegram_user: TelegramUser;
  
  // User preferences
  preferences: UserPreferences;
  
  // Audit metadata
  metadata?: AuditMetadata;
  
  // Status
  status: 'active' | 'inactive' | 'blocked';
  last_seen?: Date;
  
  // Statistics
  message_count: number;
  interaction_count: number;
}

/**
 * User creation data (without auto-generated fields)
 */
export type CreateUserInput = Omit<User, 'id' | 'created_at' | 'updated_at'>;

/**
 * User update data
 */
export type UpdateUserInput = Partial<Omit<User, 'id' | 'telegram_id' | 'created_at' | 'updated_at'>>;

/**
 * User filter options
 */
export interface UserFilterOptions {
  status?: User['status'];
  username?: string;
  last_seen_after?: Date;
  last_seen_before?: Date;
}