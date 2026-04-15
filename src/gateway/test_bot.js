const { Bot } = require('grammy');

async function testBot() {
  const token = '8717456591:AAHCGvUfpRBZ9kzjQVSmLzzce0DFnFJCQwg';
  const bot = new Bot(token);

  // Log bot info
  console.log('Testing bot with token:', token.substring(0, 10) + '...');

  // Get bot info
  const botInfo = await bot.botInfo;
  console.log('Bot info from grammY:', botInfo);

// Simple echo handler
bot.on('message:text', async (ctx) => {
  console.log('Received message:', ctx.message.text, 'from:', ctx.from?.id);
  await ctx.reply(`Echo: ${ctx.message.text}`);
  console.log('Sent echo reply');
});

// Start command
bot.command('start', async (ctx) => {
  console.log('Start command from:', ctx.from?.id);
  await ctx.reply('Hello! I am a test bot.');
});

// Error handling
bot.catch((err) => {
  console.error('Bot error:', err);
});

console.log('Starting bot...');
bot.start({
  onStart: (info) => {
    console.log('Bot started successfully:', info);
  },
  drop_pending_updates: true
});

// Stop after 30 seconds for testing
setTimeout(() => {
  console.log('Stopping bot after test...');
  bot.stop();
  process.exit(0);
}, 30000);