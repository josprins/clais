import { SurrealDBClient } from '../surreal-client';
import { BaseRepository } from './base-repository';
import { Message, CreateMessageInput, UpdateMessageInput, MessageFilterOptions, MessageDirection } from '../models/message';
import logger from '../../utils/logger';

/**
 * Message repository with message-specific operations
 */
export class MessageRepository extends BaseRepository<Message> {
  constructor(client: SurrealDBClient) {
    super(client, 'message');
  }

  /**
   * Find message by Telegram message ID and chat ID
   */
  public async findByTelegramId(telegramMessageId: number, telegramChatId: number): Promise<Message | null> {
    try {
      const messages = await this.find({
        telegram_message_id: telegramMessageId,
        telegram_chat_id: telegramChatId
      });
      return messages[0] || null;
    } catch (error) {
      logger.error({
        msg: 'findByTelegramId failed',
        telegramMessageId,
        telegramChatId,
        error: error instanceof Error ? error.message : String(error)
      }, 'MessageRepository findByTelegramId error');
      throw error;
    }
  }

  /**
   * Find messages by user ID
   */
  public async findByUserId(userId: string): Promise<Message[]> {
    try {
      return await this.find({ user_id: userId });
    } catch (error) {
      logger.error({
        msg: 'findByUserId failed',
        userId,
        error: error instanceof Error ? error.message : String(error)
      }, 'MessageRepository findByUserId error');
      throw error;
    }
  }

  /**
   * Find messages by chat ID
   */
  public async findByChatId(telegramChatId: number): Promise<Message[]> {
    try {
      return await this.find({ telegram_chat_id: telegramChatId });
    } catch (error) {
      logger.error({
        msg: 'findByChatId failed',
        telegramChatId,
        error: error instanceof Error ? error.message : String(error)
      }, 'MessageRepository findByChatId error');
      throw error;
    }
  }

  /**
   * Find unprocessed messages
   */
  public async findUnprocessed(limit?: number): Promise<Message[]> {
    try {
      let query = `SELECT * FROM message WHERE processed = false ORDER BY created_at ASC`;
      if (limit) {
        query += ` LIMIT ${limit}`;
      }
      
      return await this.client.query<Message>(query);
    } catch (error) {
      logger.error({
        msg: 'findUnprocessed failed',
        error: error instanceof Error ? error.message : String(error)
      }, 'MessageRepository findUnprocessed error');
      throw error;
    }
  }

  /**
   * Find messages for LLM processing
   */
  public async findForLLMProcessing(limit?: number): Promise<Message[]> {
    try {
      let query = `SELECT * FROM message WHERE llm_processed = false AND processed = true ORDER BY created_at ASC`;
      if (limit) {
        query += ` LIMIT ${limit}`;
      }
      
      return await this.client.query<Message>(query);
    } catch (error) {
      logger.error({
        msg: 'findForLLMProcessing failed',
        error: error instanceof Error ? error.message : String(error)
      }, 'MessageRepository findForLLMProcessing error');
      throw error;
    }
  }

  /**
   * Create message from Telegram data
   */
  public async createFromTelegram(
    telegramMessage: any,
    userId: string,
    direction: MessageDirection
  ): Promise<Message> {
    try {
      const messageData: CreateMessageInput = {
        telegram_message_id: telegramMessage.message_id,
        telegram_chat_id: telegramMessage.chat.id,
        user_id: userId,
        type: this.mapTelegramType(telegramMessage),
        text: telegramMessage.text || telegramMessage.caption,
        direction,
        timestamp: new Date(telegramMessage.date * 1000),
        processed: false,
        llm_processed: false
      };

      // Handle media
      if (telegramMessage.photo) {
        messageData.media_url = telegramMessage.photo[0]?.file_id;
        messageData.media_type = 'photo';
        messageData.file_size = telegramMessage.photo[0]?.file_size;
      } else if (telegramMessage.document) {
        messageData.media_url = telegramMessage.document.file_id;
        messageData.media_type = 'document';
        messageData.file_size = telegramMessage.document.file_size;
      } else if (telegramMessage.audio) {
        messageData.media_url = telegramMessage.audio.file_id;
        messageData.media_type = 'audio';
        messageData.file_size = telegramMessage.audio.file_size;
      } else if (telegramMessage.voice) {
        messageData.media_url = telegramMessage.voice.file_id;
        messageData.media_type = 'voice';
        messageData.file_size = telegramMessage.voice.file_size;
      }

      // Handle reply
      if (telegramMessage.reply_to_message) {
        messageData.reply_to_message_id = telegramMessage.reply_to_message.message_id;
      }

      // Handle forward
      if (telegramMessage.forward_from_message_id) {
        messageData.forward_from_message_id = telegramMessage.forward_from_message_id;
      }

      return await this.create(messageData);
    } catch (error) {
      logger.error({
        msg: 'createFromTelegram failed',
        telegramMessage,
        userId,
        direction,
        error: error instanceof Error ? error.message : String(error)
      }, 'MessageRepository createFromTelegram error');
      throw error;
    }
  }

  /**
   * Mark message as processed
   */
  public async markAsProcessed(messageId: string, error?: string): Promise<Message> {
    try {
      const updateData: UpdateMessageInput = {
        processed: true,
        processed_at: new Date()
      };

      if (error) {
        updateData.processing_errors = [error];
      }

      return await this.update(messageId, updateData);
    } catch (error) {
      logger.error({
        msg: 'markAsProcessed failed',
        messageId,
        error: error instanceof Error ? error.message : String(error)
      }, 'MessageRepository markAsProcessed error');
      throw error;
    }
  }

  /**
   * Mark message as LLM processed
   */
  public async markAsLLMProcessed(
    messageId: string,
    response: string,
    model: string
  ): Promise<Message> {
    try {
      const updateData: UpdateMessageInput = {
        llm_processed: true,
        llm_response: response,
        llm_model: model
      };

      return await this.update(messageId, updateData);
    } catch (error) {
      logger.error({
        msg: 'markAsLLMProcessed failed',
        messageId,
        response,
        model,
        error: error instanceof Error ? error.message : String(error)
      }, 'MessageRepository markAsLLMProcessed error');
      throw error;
    }
  }

  /**
   * Find messages with advanced filtering
   */
  public async findMessages(filter: MessageFilterOptions): Promise<Message[]> {
    try {
      const where: Record<string, any> = {};
      
      if (filter.user_id) {
        where.user_id = filter.user_id;
      }
      
      if (filter.telegram_chat_id) {
        where.telegram_chat_id = filter.telegram_chat_id;
      }
      
      if (filter.direction) {
        where.direction = filter.direction;
      }
      
      if (filter.type) {
        where.type = filter.type;
      }
      
      if (filter.processed !== undefined) {
        where.processed = filter.processed;
      }
      
      if (filter.llm_processed !== undefined) {
        where.llm_processed = filter.llm_processed;
      }

      let messages = await this.find(where);

      // Apply date filtering in memory (for now)
      if (filter.date_from || filter.date_to) {
        messages = messages.filter(message => {
          const timestamp = new Date(message.timestamp);
          
          if (filter.date_from && timestamp < filter.date_from) {
            return false;
          }
          if (filter.date_to && timestamp > filter.date_to) {
            return false;
          }
          return true;
        });
      }

      return messages;
    } catch (error) {
      logger.error({
        msg: 'findMessages failed',
        filter,
        error: error instanceof Error ? error.message : String(error)
      }, 'MessageRepository findMessages error');
      throw error;
    }
  }

  /**
   * Get message statistics
   */
  public async getStatistics(userId?: string): Promise<{
    total: number;
    processed: number;
    unprocessed: number;
    byType: Record<string, number>;
    byDirection: Record<MessageDirection, number>;
  }> {
    try {
      const where = userId ? { user_id: userId } : undefined;
      const messages = await this.find(where);

      const stats = {
        total: messages.length,
        processed: messages.filter(m => m.processed).length,
        unprocessed: messages.filter(m => !m.processed).length,
        byType: {} as Record<string, number>,
        byDirection: {
          incoming: 0,
          outgoing: 0
        } as Record<MessageDirection, number>
      };

      messages.forEach(message => {
        // Count by type
        stats.byType[message.type] = (stats.byType[message.type] || 0) + 1;
        
        // Count by direction
        stats.byDirection[message.direction]++;
      });

      return stats;
    } catch (error) {
      logger.error({
        msg: 'getStatistics failed',
        userId,
        error: error instanceof Error ? error.message : String(error)
      }, 'MessageRepository getStatistics error');
      throw error;
    }
  }

  /**
   * Map Telegram message type to our internal type
   */
  private mapTelegramType(telegramMessage: any): Message['type'] {
    if (telegramMessage.text) {
      if (telegramMessage.text.startsWith('/')) {
        return 'command';
      }
      return 'text';
    }
    if (telegramMessage.photo) return 'photo';
    if (telegramMessage.document) return 'document';
    if (telegramMessage.audio) return 'audio';
    if (telegramMessage.voice) return 'voice';
    if (telegramMessage.location) return 'location';
    if (telegramMessage.contact) return 'contact';
    if (telegramMessage.sticker) return 'sticker';
    
    return 'text'; // fallback
  }
}