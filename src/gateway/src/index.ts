import 'dotenv/config';
import { Bot } from 'grammy';
import logger from './utils/logger';
import { performanceMonitor } from './utils/metrics';
import { DatabaseManager, initializeDatabase } from './db'; // S-005 integrated

let database: DatabaseManager | null = null; // S-005 integrated

// Global error handlers to prevent silent crashes
process.on('unhandledRejection', (reason, _promise) => {
  logger.error({
    msg: 'Unhandled Promise Rejection',
    reason: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined
  }, 'CRITICAL: Unhandled rejection');
  // Don't exit, let PM2 handle restart if needed
});

process.on('uncaughtException', (error) => {
  logger.error({
    msg: 'Uncaught Exception',
    error: error.message,
    stack: error.stack
  }, 'CRITICAL: Uncaught exception');
  // Graceful shutdown
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Validate environment variables
const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {
  logger.error('TELEGRAM_BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

// Create bot instance
const bot = new Bot(token);

// Middleware to measure response time
bot.use(async (ctx, next) => {
  const startTime = Date.now();
  const messageId = ctx.update.update_id.toString();
  const userId = ctx.from?.id || 0;
  
  // Determine message type and tier
  let messageType: 'text' | 'command' | 'other' = 'other';
  let tier: 1 | 2 | 3 = 3; // Default to lowest tier
  
  if (ctx.message?.text) {
    if (ctx.message.text.startsWith('/')) {
      messageType = 'command';
      // Simple commands are Tier 1
      const command = ctx.message.text.split(' ')[0].toLowerCase();
      if (['/start', '/help', '/stats'].includes(command)) {
        tier = 1;
      } else {
        tier = 2; // Other commands are Tier 2
      }
    } else {
      messageType = 'text';
      // Simple text messages (echo) are Tier 1
      tier = 1;
    }
  }
  
  // Debug logging
  logger.info({
    msg: 'Middleware processing message',
    messageId,
    userId,
    messageType,
    tier,
    hasMessage: !!ctx.message?.text,
    text: ctx.message?.text?.substring(0, 50)
  }, 'Performance middleware triggered');
  
  try {
    await next();
    const responseTimeMs = Date.now() - startTime;
    
    // Record successful response
    performanceMonitor.recordMetric({
      messageId,
      userId,
      messageType,
      tier,
      responseTimeMs,
      success: true
    });
    
    // Log performance for debugging
    logger.info({
      msg: 'Response time recorded',
      messageId,
      responseTimeMs,
      tier
    }, `Response time: ${responseTimeMs}ms`);
    
  } catch (error) {
    const responseTimeMs = Date.now() - startTime;
    
    // Record failed response
    performanceMonitor.recordMetric({
      messageId,
      userId,
      messageType,
      tier,
      responseTimeMs,
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
    
    // Re-throw for global error handler
    throw error;
  }
});



// Start command
bot.command('start', async (ctx) => {
  const from = ctx.from;
  if (!from) return;
  
  const userName = from.first_name || 'there';
  await ctx.reply(`👋 Hello ${userName}! I'm Stuur, your personal AI assistant.\n\nSend me a message and I'll echo it back for now.`);
  logger.info(`Start command from ${from.id}`);
});

// Help command
bot.command('help', async (ctx) => {
  await ctx.reply(
    `🤖 **Stuur Bot Help**\n\n` +
    `• Just send me a message and I'll echo it back\n` +
    `• /start - Start conversation\n` +
    `• /help - Show this help message\n` +
    `• /stats - Show performance statistics\n\n` +
    `This is the foundation build. More features coming soon!`
  );
});

// Stats command
bot.command('stats', async (ctx) => {
  const stats = performanceMonitor.getTier1Stats();
  const meetsRequirements = performanceMonitor.meetsS003Requirements();
  
  let statsMessage = `📊 **Performance Statistics**\n\n`;
  
  if (stats.totalMessages === 0) {
    statsMessage += `No Tier 1 messages recorded yet.\n` +
                   `Send a message or use /start to see statistics.`;
  } else {
    const requirementStatus = meetsRequirements ? '✅' : '❌';
    
    statsMessage += `**Tier 1 Messages:** ${stats.totalMessages}\n` +
                   `**Average Response Time:** ${stats.averageResponseTime}ms\n` +
                   `**95th Percentile:** ${stats.percentile95}ms\n` +
                   `**99th Percentile:** ${stats.percentile99}ms\n` +
                   `**Success Rate:** ${stats.successRate}%\n` +
                   `**Min/Max:** ${stats.minResponseTime}ms / ${stats.maxResponseTime}ms\n\n` +
                   `**S-003 Requirement:** <2s average over 100 messages\n` +
                   `**Status:** ${requirementStatus} ${meetsRequirements ? 'Met' : 'Not met'}\n`;
    
    if (!meetsRequirements && stats.totalMessages >= 100) {
      statsMessage += `⚠️ Average response time (${stats.averageResponseTime}ms) exceeds 2s requirement.`;
    } else if (stats.totalMessages < 100) {
      statsMessage += `📈 Need ${100 - stats.totalMessages} more messages to evaluate requirement.`;
    }
  }
  
  await ctx.reply(statsMessage);
});

// Echo handler for non-command text (registered AFTER command handlers)
logger.info('Registering echo handler for message:text');
bot.on('message:text', async (ctx) => {
  const message = ctx.message.text;
  
  logger.info(`Echo handler triggered for message: "${message}"`);
  
  // Skip commands (they start with /)
  if (message.startsWith('/')) {
    logger.info(`Skipping command: ${message}`);
    return; // Let command handlers deal with it
  }
  
  const from = ctx.from;
  if (!from) {
    logger.warn('Message received without sender information');
    return;
  }
  
  const userId = from.id;
  const userName = from.first_name || `User ${userId}`;
  
  logger.info(`Received message from ${userName} (${userId}): "${message}"`);
  
  try {
    // Echo the message back
    await ctx.reply(`Echo: ${message}`, {
      reply_parameters: { message_id: ctx.message.message_id }
    });
    logger.info(`Echoed message to ${userName} (${userId})`);
  } catch (error) {
    logger.error({
      msg: 'Failed to echo message',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 'Echo handler error');
  }
});

// Error handling
bot.catch((err) => {
  const ctx = err.ctx;
  const error = err.error;
  const updateId = ctx?.update?.update_id ?? 'unknown';
  
  logger.error({
    msg: 'Error while handling update',
    updateId,
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined
  }, 'Bot error occurred');
  
  // Try to notify user about error with friendly Dutch message
  if (ctx && ctx.chat) {
    ctx.reply('Even geduld, er ging iets mis. Probeer het straks opnieuw.').catch((replyErr) => {
      logger.error({
        msg: 'Failed to send error message to user',
        error: replyErr.message,
        chatId: ctx.chat?.id
      }, 'Error notification failed');
    });
  }
});

// Main function to start the bot
async function main() {
  logger.info('Starting Stuur Telegram bot...');
  
  try {
    // Database initialization for S-005
    logger.info('Initializing database connection...');
    try {
      database = await initializeDatabase();
      logger.info('Database connected successfully');
    } catch (dbError) {
      logger.warn({
        msg: 'Database connection failed, continuing without database',
        error: dbError instanceof Error ? dbError.message : String(dbError)
      }, 'Database connection warning');
      database = null;
    }
    
    await bot.start({
      onStart: (botInfo) => {
        logger.info(`Bot started successfully as @${botInfo.username} (ID: ${botInfo.id})`);
        logger.info(`Bot is running in ${process.env.NODE_ENV || 'development'} mode`);
        logger.info('Error handling active: PM2 auto-restart, friendly user messages, file logging');
        logger.info('Performance monitoring active: S-003 response time tracking (<2s requirement)');
        
        // Log initial performance status
        const stats = performanceMonitor.getTier1Stats();
        logger.info({
          msg: 'Initial performance status',
          tier1Messages: stats.totalMessages,
          meetsRequirement: performanceMonitor.meetsS003Requirements(),
          requirement: 'Average <2000ms over 100 Tier 1 messages'
        }, 'S-003 performance monitoring initialized');
      },
      drop_pending_updates: true // Ignore pending updates on restart
    });
    
    logger.info('Bot is now running and ready to receive messages');
    
    // Periodic performance logging (every 5 minutes)
    setInterval(() => {
      const stats = performanceMonitor.getTier1Stats();
      if (stats.totalMessages > 0) {
        const meetsRequirements = performanceMonitor.meetsS003Requirements();
        logger.info({
          msg: 'Periodic performance check',
          tier1Messages: stats.totalMessages,
          averageResponseTimeMs: stats.averageResponseTime,
          meetsS003Requirement: meetsRequirements,
          requirementMet: meetsRequirements ? '✅' : '❌'
        }, `Performance: ${stats.averageResponseTime}ms avg (${stats.totalMessages} messages)`);
      }
    }, 5 * 60 * 1000); // 5 minutes
    
  } catch (error) {
    logger.error({
      msg: 'Failed to start bot',
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, 'CRITICAL: Bot startup failed');
    
    // Exit with error code so PM2 can restart
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
}

// Start the bot
main();

// Graceful shutdown handlers
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  try {
    await bot.stop();
    logger.info('Bot stopped successfully');
    
    // Disconnect database if connected (S-005 integrated)
    if (database && typeof database.disconnect === 'function') {
      await database.disconnect();
      logger.info('Database disconnected successfully');
    }
  } catch (error) {
    logger.error({ error: error instanceof Error ? error.message : String(error) }, 'Error during bot shutdown');
  }
  
  // Give logs time to flush
  setTimeout(() => {
    process.exit(0);
  }, 1000);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));