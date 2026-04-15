import { BaseEntity, AuditMetadata } from './base';

/**
 * Message types
 */
export type MessageType = 'text' | 'command' | 'photo' | 'document' | 'audio' | 'voice' | 'location' | 'contact' | 'sticker';

/**
 * Message direction
 */
export type MessageDirection = 'incoming' | 'outgoing';

/**
 * Message entity stored in SurrealDB
 */
export interface Message extends BaseEntity {
  // Telegram message ID (unique per chat)
  telegram_message_id: number;
  
  // Telegram chat ID
  telegram_chat_id: number;
  
  // Related user ID (reference to user table)
  user_id: string; // user:123456789
  
  // Message content
  type: MessageType;
  text?: string;
  media_url?: string;
  media_type?: string;
  file_size?: number;
  
  // Message metadata
  direction: MessageDirection;
  timestamp: Date;
  edited_timestamp?: Date;
  
  // Context
  reply_to_message_id?: number;
  forward_from_message_id?: number;
  
  // Processing status
  processed: boolean;
  processed_at?: Date;
  processing_errors?: string[];
  
  // LLM processing
  llm_processed?: boolean;
  llm_response?: string;
  llm_model?: string;
  
  // Audit metadata
  metadata?: AuditMetadata;
}

/**
 * Message creation data
 */
export type CreateMessageInput = Omit<Message, 'id' | 'created_at' | 'updated_at'> & {
  processed?: boolean;
  llm_processed?: boolean;
};

/**
 * Message update data
 */
export type UpdateMessageInput = Partial<Pick<Message, 'processed' | 'processed_at' | 'processing_errors' | 'llm_processed' | 'llm_response' | 'llm_model'>>;

/**
 * Message filter options
 */
export interface MessageFilterOptions {
  user_id?: string;
  telegram_chat_id?: number;
  direction?: MessageDirection;
  type?: MessageType;
  processed?: boolean;
  llm_processed?: boolean;
  date_from?: Date;
  date_to?: Date;
}