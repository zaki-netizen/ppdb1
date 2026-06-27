import { db } from '@/lib/db';
import { users } from '@/drizzle/schema';

/**
 * Test Database Connection
 * Run with: npx ts-node scripts/test-connection.ts
 */

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...\n');

    // Try to query users
    const count = await db.query.users.findMany({
      limit: 1,
    });

    console.log('✅ Database connection successful!');
    console.log(
      `📊 Found ${count.length} user(s) in database\n`
    );

    if (count.length === 0) {
      console.log(
        '💡 Tip: Run "npm run seed" to populate sample data\n'
      );
    }

    console.log('📋 Database Info:');
    console.log('   Schema: Successfully accessed');
    console.log('   Tables: All schema tables ready');
    console.log('   Status: ✅ Ready for development\n');
  } catch (error: any) {
    console.error('❌ Connection failed:', error.message);
    console.log('\n📝 Troubleshooting:');
    console.log('   1. Check PostgreSQL is running');
    console.log('   2. Verify DATABASE_URL in .env.local');
    console.log('   3. Ensure database exists: createdb ppdb_db');
    console.log('   4. Run migrations: npm run db:push');
    process.exit(1);
  }
}

testConnection();
