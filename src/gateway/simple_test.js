const { Bot } = require('grammy');

const token = '8717456591:AAHCGvUfpRBZ9kzjQVSmLzzce0DFnFJCQwg';

console.log('=== Testing Telegram Bot ===');
console.log('Token:', token.substring(0, 10) + '...');
console.log('');

// Test direct API call first
const https = require('https');
function apiCall(method, params = {}) {
  return new Promise((resolve, reject) => {
    const url = `https://api.telegram.org/bot${token}/${method}?${new URLSearchParams(params)}`;
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function test() {
  try {
    console.log('1. Testing direct API call...');
    const me = await apiCall('getMe');
    console.log('   Bot username:', me.result.username);
    console.log('   Bot ID:', me.result.id);
    console.log('   OK:', me.ok);
    
    console.log('\n2. Checking for pending updates...');
    const updates = await apiCall('getUpdates', { offset: -1 });
    console.log('   Pending updates:', updates.result.length);
    if (updates.result.length > 0) {
      const lastUpdateId = updates.result[updates.result.length - 1].update_id;
      console.log('   Last update ID:', lastUpdateId);
      console.log('   Clearing updates with offset:', lastUpdateId + 1);
      await apiCall('getUpdates', { offset: lastUpdateId + 1 });
    }
    
    console.log('\n3. Creating grammY bot instance...');
    const bot = new Bot(token);
    
    console.log('\n4. Testing bot info from grammY...');
    const botInfo = await bot.botInfo;
    console.log('   Username:', botInfo.username);
    console.log('   First name:', botInfo.first_name);
    console.log('   ID:', botInfo.id);
    
    console.log('\n5. Setting up handlers...');
    bot.on('message:text', async (ctx) => {
      console.log('   [HANDLER] Received message:', ctx.message.text);
      await ctx.reply(`Echo: ${ctx.message.text}`);
    });
    
    bot.command('start', async (ctx) => {
      console.log('   [HANDLER] Start command received');
      await ctx.reply('Hello! Test bot is working.');
    });
    
    bot.catch((err) => {
      console.error('   [ERROR]', err);
    });
    
    console.log('\n6. Starting bot (will run for 15 seconds)...');
    bot.start({
      onStart: (info) => {
        console.log('   Bot started:', info.username);
      },
      drop_pending_updates: true
    });
    
    // Run for 15 seconds then stop
    setTimeout(() => {
      console.log('\n7. Stopping bot...');
      bot.stop();
      console.log('\n=== Test complete ===');
      console.log('Please send a message to @Claizer_bot to test.');
      process.exit(0);
    }, 15000);
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
}

test();