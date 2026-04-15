import { SurrealDBClient } from '../surreal-client';
import { BaseRepository } from './base-repository';
import { User, CreateUserInput, UpdateUserInput, UserFilterOptions } from '../models/user';
import logger from '../../utils/logger';

/**
 * User repository with user-specific operations
 */
export class UserRepository extends BaseRepository<User> {
  constructor(client: SurrealDBClient) {
    super(client, 'user');
  }

  /**
   * Find user by Telegram ID
   */
  public async findByTelegramId(telegramId: number): Promise<User | null> {
    try {
      const users = await this.find({ telegram_id: telegramId });
      return users[0] || null;
    } catch (error) {
      logger.error({
        msg: 'findByTelegramId failed',
        telegramId,
        error: error instanceof Error ? error.message : String(error)
      }, 'UserRepository findByTelegramId error');
      throw error;
    }
  }

  /**
   * Find user by Telegram username
   */
  public async findByUsername(username: string): Promise<User | null> {
    try {
      // Note: This query searches inside the telegram_user object
      // SurrealDB supports nested field queries
      const users = await this.client.query<User>(
        `SELECT * FROM user WHERE telegram_user.username = $username`,
        { username }
      );
      return users[0] || null;
    } catch (error) {
      logger.error({
        msg: 'findByUsername failed',
        username,
        error: error instanceof Error ? error.message : String(error)
      }, 'UserRepository findByUsername error');
      throw error;
    }
  }

  /**
   * Create or update user from Telegram data
   */
  public async upsertFromTelegram(telegramUser: any): Promise<User> {
    try {
      const existingUser = await this.findByTelegramId(telegramUser.id);
      
      if (existingUser) {
        // Update existing user
        const updateData: UpdateUserInput = {
          telegram_user: {
            id: telegramUser.id,
            is_bot: telegramUser.is_bot || false,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            username: telegramUser.username,
            language_code: telegramUser.language_code,
            is_premium: telegramUser.is_premium
          },
          last_seen: new Date(),
          status: 'active'
        };

        // Increment interaction count
        const currentCount = existingUser.interaction_count || 0;
        updateData.interaction_count = currentCount + 1;

        return await this.update(existingUser.id, updateData);
      } else {
        // Create new user
        const userData: CreateUserInput = {
          telegram_id: telegramUser.id,
          telegram_user: {
            id: telegramUser.id,
            is_bot: telegramUser.is_bot || false,
            first_name: telegramUser.first_name,
            last_name: telegramUser.last_name,
            username: telegramUser.username,
            language_code: telegramUser.language_code,
            is_premium: telegramUser.is_premium
          },
          preferences: {
            language: telegramUser.language_code || 'en',
            notification_enabled: true,
            currency: 'EUR'
          },
          status: 'active',
          last_seen: new Date(),
          message_count: 0,
          interaction_count: 1,
          metadata: {
            created_by: 'telegram_bot'
          }
        };

        return await this.create(userData);
      }
    } catch (error) {
      logger.error({
        msg: 'upsertFromTelegram failed',
        telegramUser,
        error: error instanceof Error ? error.message : String(error)
      }, 'UserRepository upsertFromTelegram error');
      throw error;
    }
  }

  /**
   * Update user last seen timestamp
   */
  public async updateLastSeen(userId: string): Promise<User> {
    try {
      return await this.update(userId, {
        last_seen: new Date()
      });
    } catch (error) {
      logger.error({
        msg: 'updateLastSeen failed',
        userId,
        error: error instanceof Error ? error.message : String(error)
      }, 'UserRepository updateLastSeen error');
      throw error;
    }
  }

  /**
   * Increment user message count
   */
  public async incrementMessageCount(userId: string): Promise<User> {
    try {
      const user = await this.read(userId);
      if (!user) {
        throw new Error(`User not found: ${userId}`);
      }

      const currentCount = user.message_count || 0;
      return await this.update(userId, {
        message_count: currentCount + 1
      });
    } catch (error) {
      logger.error({
        msg: 'incrementMessageCount failed',
        userId,
        error: error instanceof Error ? error.message : String(error)
      }, 'UserRepository incrementMessageCount error');
      throw error;
    }
  }

  /**
   * Find active users
   */
  public async findActiveUsers(): Promise<User[]> {
    try {
      return await this.find({ status: 'active' });
    } catch (error) {
      logger.error({
        msg: 'findActiveUsers failed',
        error: error instanceof Error ? error.message : String(error)
      }, 'UserRepository findActiveUsers error');
      throw error;
    }
  }

  /**
   * Find users with advanced filtering
   */
  public async findUsers(filter: UserFilterOptions): Promise<User[]> {
    try {
      const where: Record<string, any> = {};
      
      if (filter.status) {
        where.status = filter.status;
      }
      
      if (filter.username) {
        // This would require a more complex query in SurrealDB
        // For simplicity, we'll filter in memory after fetching
        const users = await this.find(where);
        return users.filter(user => 
          user.telegram_user.username?.toLowerCase().includes(filter.username!.toLowerCase())
        );
      }
      
      if (filter.last_seen_after || filter.last_seen_before) {
        // Date filtering would also require complex queries
        // For now, we'll implement basic filtering
        const users = await this.find(where);
        return users.filter(user => {
          if (!user.last_seen) return false;
          const lastSeen = new Date(user.last_seen);
          
          if (filter.last_seen_after && lastSeen < filter.last_seen_after) {
            return false;
          }
          if (filter.last_seen_before && lastSeen > filter.last_seen_before) {
            return false;
          }
          return true;
        });
      }
      
      return await this.find(where);
    } catch (error) {
      logger.error({
        msg: 'findUsers failed',
        filter,
        error: error instanceof Error ? error.message : String(error)
      }, 'UserRepository findUsers error');
      throw error;
    }
  }
}