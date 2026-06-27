import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../drizzle/schema';
import bcrypt from 'bcryptjs';

const connectionString = 'postgresql://neondb_owner:npg_MJRyFICN5Z3S@ep-wispy-salad-ao1lo2ha-pooler.c-2.ap-southeast-1.aws.neon.tech/neondb?sslmode=require';

const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const studentPassword = await bcrypt.hash('password123', 10);

    const adminResult = await db.insert(schema.users).values({
      email: 'admin@ppdb.test',
      password_hash: adminPassword,
      full_name: 'Pak Bambang (Admin)',
      phone_number: '081234567890',
      role: 'admin',
      status: 'active',
    }).returning();
    console.log('✅ Admin user created:', adminResult[0]?.email);

    // Create student user
    const studentResult = await db.insert(schema.users).values({
      email: 'ahmad@student.test',
      password_hash: studentPassword,
      full_name: 'Ahmad Suryanto',
      phone_number: '081234567891',
      role: 'applicant',
      status: 'active',
    }).returning();
    console.log('✅ Student user created:', studentResult[0]?.email);

    // Create schools
    const schools = await db.insert(schema.schools).values([
      {
        name: 'SMA Negeri 1 Jakarta',
        npsn: '20101234',
        level: 'SMA',
        address: 'Jl. Merdeka No. 1, Jakarta Pusat',
        phone: '021-1234567',
        email: 'sman1jkt@sch.id',
        latitude: '-6.17',
        longitude: '106.86',
        accreditation: 'A',
      },
      {
        name: 'SMA Negeri 2 Bandung',
        npsn: '20101235',
        level: 'SMA',
        address: 'Jl. Braga No. 1, Bandung',
        phone: '022-1234567',
        email: 'sman2bdg@sch.id',
        latitude: '-6.91',
        longitude: '107.61',
        accreditation: 'A',
      },
      {
        name: 'SMA Negeri 3 Surabaya',
        npsn: '20101236',
        level: 'SMA',
        address: 'Jl. Tunjungan No. 1, Surabaya',
        phone: '031-1234567',
        email: 'sman3sby@sch.id',
        latitude: '-7.25',
        longitude: '112.75',
        accreditation: 'A',
      },
    ]).returning();
    console.log('✅ 3 Schools created');

    // Create registration pathways
    const pathways = await db.insert(schema.registration_pathways).values([
      { school_id: schools[0].id, pathway_name: 'Jalur Prestasi', min_gpa: '3.00', quota: 50, available_quota: 50, min_certificate_points: 0, status: 'open' },
      { school_id: schools[0].id, pathway_name: 'Jalur Zonasi', min_gpa: '0.00', max_distance_km: '5.00', quota: 30, available_quota: 30, status: 'open' },
      { school_id: schools[0].id, pathway_name: 'Jalur Afirmasi', min_gpa: '0.00', quota: 20, available_quota: 20, status: 'open' },
      { school_id: schools[1].id, pathway_name: 'Jalur Prestasi', min_gpa: '3.00', quota: 40, available_quota: 40, min_certificate_points: 0, status: 'open' },
      { school_id: schools[1].id, pathway_name: 'Jalur Zonasi', min_gpa: '0.00', max_distance_km: '5.00', quota: 25, available_quota: 25, status: 'open' },
    ]).returning();
    console.log('✅ 5 Pathways created');

    // Create sample registration for student
    const registration = await db.insert(schema.registrations).values({
      user_id: studentResult[0].id,
      registration_number: 'REG-2026-001',
      nisn: '1234567890123456',
      date_of_birth: new Date('2008-05-15'),
      gender: 'M',
      address: 'Jl. Sudirman No. 123',
      city: 'Jakarta',
      province: 'DKI Jakarta',
      zipcode: '10220',
      latitude: '-6.17',
      longitude: '106.86',
      location_verified: true,
      parent_name: 'Budi Suryanto',
      parent_phone: '081234567892',
      parent_email: 'budi.suryanto@email.com',
      preferred_school_id: schools[0].id,
      pathway_id: pathways[0].id,
      gpa: '3.75',
      certificate_points: 85,
      total_score: '36.25',
      registration_status: 'submitted',
      verification_status: 'approved',
      selection_status: 'pending',
      submitted_at: new Date(),
    }).returning();
    console.log('✅ Sample registration created');

    // Create PPDB schedules
    await db.insert(schema.ppdb_schedules).values([
      { event_name: 'Pendaftaran Online', description: 'Periode pendaftaran PPDB 2026', start_date: new Date('2026-06-01'), end_date: new Date('2026-06-15'), priority: 'high' },
      { event_name: 'Verifikasi Dokumen', description: 'Verifikasi kelengkapan berkas', start_date: new Date('2026-06-16'), end_date: new Date('2026-06-20'), priority: 'high' },
      { event_name: 'Seleksi & Pengumuman', description: 'Proses seleksi dan pengumuman hasil', start_date: new Date('2026-06-21'), end_date: new Date('2026-06-26'), priority: 'high' },
      { event_name: 'Daftar Ulang', description: 'Pendaftaran ulang bagi yang diterima', start_date: new Date('2026-06-27'), end_date: new Date('2026-06-30'), priority: 'normal' },
    ]);
    console.log('✅ 4 Schedules created');

    // Create sample notification
    await db.insert(schema.notifications).values({
      user_id: studentResult[0].id,
      title: 'Pendaftaran Berhasil',
      message: 'Selamat! Pendaftaran Anda telah berhasil submitted. Silakan tunggu verifikasi dari panitia.',
      type: 'system',
      related_registration_id: registration[0].id,
      sent_at: new Date(),
    });
    console.log('✅ Sample notification created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Demo Accounts:');
    console.log('   Admin:   admin@ppdb.test / admin123');
    console.log('   Student: ahmad@student.test / password123');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await client.end();
  }
}

seed();