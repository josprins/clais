// Test database integration with the bot
require('dotenv').config({ path: '.env.test' });

const { initializeDatabase } = require('./dist/db/index');

async function testDatabaseIntegration() {
  console.log('=== Testing Database Integration ===');
  
  try {
    console.log('1. Initializing database...');
    const db = await initializeDatabase();
    
    console.log('✅ Database initialized');
    console.log(`   Connected: ${db.isConnected()}`);
    
    console.log('2. Testing health check...');
    const healthy = await db.healthCheck();
    console.log(`✅ Health check: ${healthy ? 'PASS' : 'FAIL'}`);
    
    console.log('3. Testing user repository...');
    // Create a test user
    const testUser = {
      telegramId: 123456789,
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      languageCode: 'en',
      isBot: false,
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString()
    };
    
    const createdUser = await db.users.create(testUser);
    console.log(`✅ Created user: ${createdUser.id || createdUser.telegramId}`);
    
    // Find user by Telegram ID
    const foundUser = await db.users.findByTelegramId(123456789);
    console.log(`✅ Found user: ${foundUser ? 'YES' : 'NO'}`);
    
    console.log('4. Testing message repository...');
    // Create a test message
    const testMessage = {
      telegramMessageId: 999,
      telegramChatId: 123456789,
      userId: foundUser?.id || 'test:user',
      text: 'Test message for database integration',
      timestamp: new Date().toISOString(),
      messageType: 'text',
      direction: 'incoming'
    };
    
    const createdMessage = await db.messages.create(testMessage);
    console.log(`✅ Created message: ${createdMessage.id || createdMessage.telegramMessageId}`);
    
    // Find messages by user
    const userMessages = await db.messages.findByUser(foundUser?.id || 'test:user');
    console.log(`✅ Found ${userMessages.length} messages for user`);
    
    console.log('5. Cleaning up test data...');
    if (createdMessage.id) {
      await db.messages.delete(createdMessage.id);
    }
    if (createdUser.id) {
      await db.users.delete(createdUser.id);
    }
    console.log('✅ Test data cleaned up');
    
    console.log('6. Disconnecting...');
    await db.disconnect();
    console.log('✅ Disconnected');
    
    console.log('\n🎉 Database integration test PASSED!');
    return true;
    
  } catch (error) {
    console.error('\n❌ Database integration test FAILED:', error.message);
    console.error('Error stack:', error.stack);
    
    // Try to provide helpful debugging info
    console.log('\n--- Debugging Information ---');
    console.log('1. Is SurrealDB running? Check with: curl http://localhost:8000/health');
    console.log('2. Current SURREALDB_URL:', process.env.SURREALDB_URL);
    console.log('3. Default credentials should be root/root');
    console.log('4. Check if the database was compiled correctly');
    
    return false;
  }
}

async function main() {
  const success = await testDatabaseIntegration();
  process.exit(success ? 0 : 1);
}

main().catch(error => {
  console.error('Unhandled error in test:', error);
  process.exit(1);
});