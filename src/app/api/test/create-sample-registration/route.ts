import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registrations, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

/**
 * API to create sample registration for testing
 * GET /api/test/create-sample-registration
 *
 * This endpoint creates a sample registration for ahmad@student.test
 * No auth required - just visit the URL to create the data
 */

export async function GET() {
  try {
    console.log('[TEST] Creating sample registration...');

    // Find user ahmad@student.test
    const user = await db.query.users.findFirst({
      where: eq(users.email, 'ahmad@student.test'),
    });

    if (!user) {
      return NextResponse.json({
        error: 'User ahmad@student.test not found. Run seed first!'
      }, { status: 404 });
    }

    console.log('[TEST] Found user:', user.id, user.email);

    // Check if user already has registrations
    const existingRegs = await db.query.registrations.findMany({
      where: eq(registrations.user_id, user.id),
    });

    if (existingRegs.length > 0) {
      console.log('[TEST] User already has registrations:', existingRegs.length);
      return NextResponse.json({
        message: 'User already has registrations!',
        count: existingRegs.length,
        registrations: existingRegs.map(r => ({
          id: r.id,
          registration_number: r.registration_number,
          school_id: r.preferred_school_id,
          status: r.registration_status
        }))
      });
    }

    // Create sample registration with fixed school_id=1 and pathway_id=1
    // (Assuming seed data creates SMA Negeri 1 Jakarta with ID 1)
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    const sampleRegistration = {
      user_id: user.id,
      nisn: '0012345678901234',
      registration_number: `REG-2026-${timestamp}-${randomNum}`,
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
      parent_email: user.email,
      preferred_school_id: 1, // SMA Negeri 1 Jakarta
      pathway_id: 1, // Jalur Prestasi
      gpa: '8.50',
      certificate_points: 75,
      total_score: '51.90',
      registration_status: 'submitted',
      verification_status: 'pending',
      selection_status: 'pending',
      submitted_at: new Date(),
    };

    const result = await db.insert(registrations).values(sampleRegistration).returning();

    console.log('[TEST] Created registration:', result[0].id);

    return NextResponse.json({
      success: true,
      message: '✅ Sample registration created successfully!',
      user: user.email,
      registration: {
        id: result[0].id,
        registration_number: result[0].registration_number,
        school_id: 1,
        pathway_id: 1,
        gpa: result[0].gpa,
        total_score: result[0].total_score,
        status: result[0].registration_status
      },
      next_step: 'Login as ahmad@student.test / password123 and visit /dashboard/student'
    });
  } catch (error: any) {
    console.error('[TEST] Error:', error);
    return NextResponse.json({
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
