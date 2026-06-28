import { db } from '@/lib/db';
import {
  users,
  schools,
  registrations,
  registration_pathways,
  ppdb_schedules,
} from '@/drizzle/schema';
import bcrypt from 'bcryptjs';

/**
 * Seed Database with Sample Data
 * Run with: npx ts-node scripts/seed.ts
 */

async function seed() {
  try {
    console.log('🌱 Starting database seed...\n');

    // 1. Clear existing data (optional - remove for production)
    console.log('🗑️  Clearing existing data...');
    // await db.delete(users);
    // await db.delete(schools);
    // await db.delete(registration_pathways);

    // 2. Create Admin User
    console.log('👨‍💼 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    await db.insert(users).values({
      email: 'admin@ppdb.test',
      password_hash: adminPassword,
      full_name: 'Pak Bambang (Admin)',
      phone_number: '08123456789',
      role: 'admin',
      status: 'active',
    });

    // 3. Create Sample Users (Applicants)
    console.log('👨‍🎓 Creating sample applicant users...');
    const applicantPassword = await bcrypt.hash('password123', 10);
    const applicants = [
      {
        email: 'ahmad@student.test',
        full_name: 'Ahmad Suryanto',
        phone_number: '08111111111',
      },
      {
        email: 'siti@student.test',
        full_name: 'Siti Nurhaliza',
        phone_number: '08222222222',
      },
      {
        email: 'budi@student.test',
        full_name: 'Budi Hermawan',
        phone_number: '08333333333',
      },
    ];

    const insertedUsers = await Promise.all(
      applicants.map((applicant) =>
        db.insert(users).values({
          ...applicant,
          password_hash: applicantPassword,
          role: 'applicant',
          status: 'active',
        }).returning()
      )
    );

    // 4. Create Schools
    console.log('🏫 Creating schools...');
    const schoolsData = [
      {
        name: 'SMA Negeri 1 Jakarta',
        npsn: '20100001',
        level: 'SMA',
        address: 'Jl. Diponegoro No. 1, Jakarta Pusat',
        phone: '(021) 3912345',
        email: 'info@sman1jkt.sch.id',
        latitude: '-6.1751',
        longitude: '106.8226',
        accreditation: 'A',
        vision: 'Menghasilkan lulusan yang cerdas, berkarakter, dan berkomitmen',
        mission: 'Menyelenggarakan pendidikan berkualitas tinggi',
      },
      {
        name: 'SMA Negeri 2 Bandung',
        npsn: '20100002',
        level: 'SMA',
        address: 'Jl. Cihampelas No. 154, Bandung',
        phone: '(022) 4234567',
        email: 'info@sman2bdg.sch.id',
        latitude: '-6.8957',
        longitude: '107.6049',
        accreditation: 'A',
        vision: 'Sekolah unggul dalam prestasi akademik dan karakter',
        mission: 'Membina siswa berprestasi dan berakhlak mulia',
      },
      {
        name: 'SMA Negeri 3 Surabaya',
        npsn: '20100003',
        level: 'SMA',
        address: 'Jl. Genteng Kali No. 10, Surabaya',
        phone: '(031) 5456789',
        email: 'info@sman3sby.sch.id',
        latitude: '-7.2575',
        longitude: '112.7521',
        accreditation: 'A',
        vision: 'Menjadi sekolah pilihan dengan standar internasional',
        mission: 'Menciptakan generasi muda bermutu dan mandiri',
      },
    ];

    const insertedSchools = await Promise.all(
      schoolsData.map((school) => db.insert(schools).values(school).returning())
    );

    // 5. Create Registration Pathways
    console.log('📋 Creating registration pathways...');
    const pathwaysData = [
      {
        school_id: 1,
        pathway_name: 'Jalur Prestasi',
        min_gpa: 3.0,
        quota: 50,
        available_quota: 50,
        min_certificate_points: 0,
        status: 'open',
      },
      {
        school_id: 1,
        pathway_name: 'Jalur Zonasi',
        max_distance_km: 5.0,
        quota: 100,
        available_quota: 100,
        min_certificate_points: 0,
        status: 'open',
      },
      {
        school_id: 1,
        pathway_name: 'Jalur Afirmasi',
        quota: 30,
        available_quota: 30,
        min_certificate_points: 0,
        status: 'open',
      },
      {
        school_id: 2,
        pathway_name: 'Jalur Prestasi',
        min_gpa: 3.2,
        quota: 40,
        available_quota: 40,
        min_certificate_points: 0,
        status: 'open',
      },
      {
        school_id: 2,
        pathway_name: 'Jalur Zonasi',
        max_distance_km: 3.0,
        quota: 80,
        available_quota: 80,
        min_certificate_points: 0,
        status: 'open',
      },
    ];

    await Promise.all(
      pathwaysData.map((pathway) =>
        db.insert(registration_pathways).values(pathway)
      )
    );

    // 6. Create Sample Registrations for Users
    console.log('📝 Creating sample registrations...');
    const timestamp = Date.now().toString().slice(-6);

    const registrationsData = [
      {
        user_id: insertedUsers[0][0].id, // Ahmad
        nisn: '0012345678901234',
        registration_number: `REG-2026-${timestamp}-001`,
        date_of_birth: new Date('2010-05-15'),
        gender: 'M',
        address: 'Jl. Melati No. 10, RT 01/RW 05, Kelurahan Melawai',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        zipcode: '12160',
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
      {
        user_id: insertedUsers[1][0].id, // Siti
        nisn: '0012345678901235',
        registration_number: `REG-2026-${timestamp}-002`,
        date_of_birth: new Date('2010-08-22'),
        gender: 'F',
        address: 'Jl. Anggrek No. 25, RT 02/RW 08',
        city: 'Bandung',
        province: 'Jawa Barat',
        zipcode: '40123',
        latitude: '-6.8957',
        longitude: '107.6049',
        parent_name: 'Hj. Siti Aminah',
        parent_phone: '081234567891',
        parent_email: 'siti.aminah@email.com',
        preferred_school_id: 2,
        pathway_id: 4,
        gpa: '9.00',
        certificate_points: 85,
        total_score: '55.40',
        registration_status: 'submitted',
        verification_status: 'approved',
        selection_status: 'pending',
        submitted_at: new Date(),
      },
      {
        user_id: insertedUsers[2][0].id, // Budi
        nisn: '0012345678901236',
        registration_number: `REG-2026-${timestamp}-003`,
        date_of_birth: new Date('2010-03-10'),
        gender: 'M',
        address: 'Jl. Kenanga No. 8, RT 01/RW 03',
        city: 'Surabaya',
        province: 'Jawa Timur',
        zipcode: '60123',
        latitude: '-7.2575',
        longitude: '112.7521',
        parent_name: 'Bpk. Budi Santoso',
        parent_phone: '081234567892',
        parent_email: 'budi.santoso@email.com',
        preferred_school_id: 3,
        pathway_id: 1,
        gpa: '8.20',
        certificate_points: 60,
        total_score: '48.92',
        registration_status: 'submitted',
        verification_status: 'pending',
        selection_status: 'pending',
        submitted_at: new Date(),
      },
    ];

    await Promise.all(
      registrationsData.map((reg) => db.insert(registrations).values(reg))
    );

    // 7. Create PPDB Schedule
    console.log('📅 Creating PPDB schedules...');
    const now = new Date();
    const schedules = [
      {
        event_name: 'Pendaftaran Online Dibuka',
        description: 'Mulai pendaftaran siswa baru secara online',
        start_date: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        end_date: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000), // 21 days from now
        priority: 'high',
      },
      {
        event_name: 'Verifikasi Berkas',
        description: 'Periode verifikasi berkas pendaftaran oleh panitia',
        start_date: new Date(now.getTime() + 22 * 24 * 60 * 60 * 1000),
        end_date: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000),
        priority: 'high',
      },
      {
        event_name: 'Pengumuman Hasil Seleksi',
        description: 'Pengumuman resmi hasil seleksi siswa baru',
        start_date: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
        end_date: new Date(now.getTime() + 35 * 24 * 60 * 60 * 1000),
        priority: 'high',
      },
    ];

    await Promise.all(
      schedules.map((schedule) => db.insert(ppdb_schedules).values(schedule))
    );

    console.log('\n✨ Seed completed successfully!');
    console.log('📊 Created:');
    console.log('   • 1 admin user (admin@ppdb.test / admin123)');
    console.log('   • 3 applicant users with registrations');
    console.log('   • 3 schools with locations');
    console.log('   • 5 registration pathways');
    console.log('   • 3 PPDB schedule events');
    console.log('\n🎯 Next: npm run dev');
    console.log('\n📌 Demo Accounts:');
    console.log('   Admin:   admin@ppdb.test / admin123');
    console.log('   Student: ahmad@student.test / password123');
    console.log('   Student: siti@student.test / password123');
    console.log('   Student: budi@student.test / password123');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
}

seed();
