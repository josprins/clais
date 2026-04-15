// Test SurrealDB connection
const { Surreal } = require('surrealdb.js');

async function testSurrealDB() {
  console.log('Testing SurrealDB connection...');
  
  try {
    // Create a new connection
    const db = new Surreal();
    
    // Try to connect to localhost (default port 8000)
    console.log('Connecting to http://localhost:8000...');
    await db.connect('http://localhost:8000', {
      namespace: 'test',
      database: 'test',
      auth: {
        username: 'root',
        password: 'root'
      }
    });
    
    console.log('✅ Connected successfully!');
    
    // Try a simple query
    const result = await db.query('SELECT * FROM $db');
    console.log('✅ Query successful:', result);
    
    await db.close();
    console.log('✅ Disconnected');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    console.error('Error details:', error);
    
    // Check if SurrealDB is running
    console.log('\n--- Debugging steps ---');
    console.log('1. Is SurrealDB running? Check with: curl http://localhost:8000/health');
    console.log('2. Default credentials: root/root');
    console.log('3. Default URL: http://localhost:8000');
    console.log('4. Make sure SurrealDB is started with:');
    console.log('   surreal start --log info --user root --pass root memory');
  }
}

// Also test with different connection methods
async function testAlternative() {
  console.log('\n--- Testing alternative connection method ---');
  
  try {
    const db = new Surreal();
    
    // Alternative: connect without auth first
    console.log('Trying to connect without auth...');
    await db.connect('http://localhost:8000');
    
    // Then signin
    await db.signin({
      username: 'root',
      password: 'root'
    });
    
    // Use namespace and database
    await db.use('test', 'test');
    
    console.log('✅ Alternative connection successful!');
    
    await db.close();
  } catch (error) {
    console.error('❌ Alternative connection also failed:', error.message);
  }
}

async function main() {
  console.log('=== SurrealDB Connection Test ===');
  await testSurrealDB();
  await testAlternative();
  console.log('\n=== Test complete ===');
}

main().catch(console.error);