import { db } from '@/lib/db';
import { users, registrations } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * Add Sample Registrations for Demo Users
 * Run with: npx ts-node scripts/add-sample-registrations.ts
 */

async function addSampleRegistrations() {
  try {
    console.log('📝 Adding sample registrations...\n');

    // Find user ahmad@student.test
    const user = await db.query.users.findFirst({
      where: eq(users.email, 'ahmad@student.test'),
    });

    if (!user) {
      console.error('❌ User ahmad@student.test not found!');
      console.log('💡 Run seed.ts first to create users');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);

    // Check if user already has registrations
    const existingRegs = await db.query.registrations.findMany({
      where: eq(registrations.user_id, user.id),
    });

    if (existingRegs.length > 0) {
      console.log(`⚠️  User already has ${existingRegs.length} registration(s). Skipping...`);
      console.log('💡 Delete existing registrations first or use --force to replace');
      process.exit(0);
    }

    // Create sample registrations
    const sampleRegistrations = [
      {
        user_id: user.id,
        nisn: '0012345678901234',
        registration_number: 'REG-2026-062801-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        date_of_birth: new Date('2010-05-15'),
        gender: 'M',
        address: 'Jl. Melati No. 10, RT 01/RW 05',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        zipcode: '12345',
        latitude: '-6.2615',
        longitude: '106.8113',
        parent_name: 'H. Ahmad Wijaya',
        parent_phone: '081234567890',
        parent_email: 'ahmad.wijaya@email.com',
        preferred_school_id: 1,
        pathway_id: 1,
        gpa: '8.50',
        certificate_points: 75,
        total_score: '51.90',
        registration_status: 'submitted',
        verification_status: 'pending',
        selection_status: 'pending',
        submitted_at: new Date(),
      },
    ];

    for (const reg of sampleRegistrations) {
      const result = await db.insert(registrations).values(reg).returning();
      console.log(`✅ Created registration: ${result[0].registration_number}`);
    }

    console.log('\n✨ Sample registrations added successfully!');
    console.log(`📊 Total registrations for ${user.email}: ${sampleRegistrations.length}`);
    console.log('\n🎯 Now login as ahmad@student.test to see the registration in dashboard!');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addSampleRegistrations();
