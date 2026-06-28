import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registrations, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    console.log('[API] GET /api/registrations - email:', email, 'userId:', userId);

    // If filtering by email, first find the user
    if (email) {
      console.log('[API] Looking up user by email:', email);
      const user = await db.query.users.findFirst({
        where: eq(users.email, email),
      });

      if (!user) {
        console.log('[API] User not found for email:', email);
        return NextResponse.json({ data: [], message: 'User not found' });
      }

      console.log('[API] User found:', user.id, user.email);
      const userRegistrations = await db.query.registrations.findMany({
        where: eq(registrations.user_id, user.id),
        with: {
          user: true,
          school: true,
          pathway: true,
        },
        orderBy: (registrations, { desc }) => [desc(registrations.created_at)],
      });

      console.log('[API] Found registrations:', userRegistrations.length);
      return NextResponse.json(userRegistrations);
    }

    // If filtering by userId
    if (userId) {
      console.log('[API] Looking up registrations by userId:', userId);
      const userRegistrations = await db.query.registrations.findMany({
        where: eq(registrations.user_id, parseInt(userId)),
        with: {
          user: true,
          school: true,
          pathway: true,
        },
        orderBy: (registrations, { desc }) => [desc(registrations.created_at)],
      });

      return NextResponse.json(userRegistrations);
    }

    // Fetch all registrations with user info (admin view)
    console.log('[API] Fetching all registrations');
    const allRegistrations = await db.query.registrations.findMany({
      with: {
        user: true,
        school: true,
        pathway: true,
      },
      orderBy: (registrations, { desc }) => [desc(registrations.created_at)],
    });

    console.log('[API] Total registrations:', allRegistrations.length);
    return NextResponse.json(allRegistrations);
  } catch (error) {
    console.error('[API] Error fetching registrations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch registrations' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('=== Registration Request ===');
    console.log('Body:', JSON.stringify(body, null, 2));

    // Validate required fields
    const requiredFields = ['nisn', 'fullName', 'email', 'phone', 'nilaiRataRata', 'preferredSchool', 'pathway', 'parentName', 'parentPhone'];
    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!body[field]) {
        missingFields.push(field);
      }
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Field berikut harus diisi: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Check if NISN already registered
    console.log('Checking NISN:', body.nisn);
    const existingRegistration = await db.query.registrations.findFirst({
      where: eq(registrations.nisn, body.nisn),
    });

    if (existingRegistration) {
      console.log('NISN already registered:', body.nisn);
      return NextResponse.json(
        { error: 'NISN sudah terdaftar di sistem' },
        { status: 409 }
      );
    }

    // Check if email already has a user account
    let userId: number;
    console.log('Checking email:', body.email);
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });

    if (existingUser) {
      console.log('Existing user found:', existingUser.id);
      userId = existingUser.id;
    } else {
      // Create a new user account
      console.log('Creating new user...');
      const newUser = await db.insert(users).values({
        email: body.email,
        full_name: body.fullName || body.email.split('@')[0],
        phone_number: body.phone,
        role: 'applicant',
        status: 'active',
      }).returning();

      if (!newUser || newUser.length === 0) {
        throw new Error('Failed to create user');
      }
      userId = newUser[0].id;
      console.log('New user created with ID:', userId);
    }

    // Generate unique registration number
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const registrationNumber = `REG-2026-${timestamp}-${randomNum}`;

    // Parse nilai rata-rata (0-100 scale)
    const nilaiRataRata = parseFloat(body.nilaiRataRata);
    console.log('Nilai rata-rata:', nilaiRataRata);

    // Convert nilai to decimal scale (0-10) for storage
    const gpaValue = (nilaiRataRata / 10).toFixed(2);

    // Calculate total score
    const certificatePoints = parseInt(body.certificatePoints || '0');
    const totalScore = ((nilaiRataRata * 0.6 + certificatePoints * 0.4) / 10).toFixed(2);

    // Prepare registration data
    const registrationData = {
      user_id: userId,
      nisn: body.nisn,
      registration_number: registrationNumber,
      date_of_birth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      gender: body.gender || null,
      address: body.address || '',
      city: body.city || '',
      province: body.province || '',
      zipcode: body.zipcode || '',
      latitude: body.latitude || null,
      longitude: body.longitude || null,
      parent_name: body.parentName,
      parent_phone: body.parentPhone,
      parent_email: body.parentEmail || null,
      preferred_school_id: parseInt(body.preferredSchool),
      pathway_id: parseInt(body.pathway),
      gpa: gpaValue,
      certificate_points: certificatePoints,
      total_score: totalScore,
      registration_status: 'submitted',
      verification_status: 'pending',
      selection_status: 'pending',
      submitted_at: new Date(),
    };

    console.log('Inserting registration with data:', JSON.stringify(registrationData, null, 2));

    // Insert registration
    const result = await db.insert(registrations).values(registrationData).returning();

    if (!result || result.length === 0) {
      throw new Error('Failed to create registration');
    }

    console.log('Registration created successfully:', result[0].id);

    return NextResponse.json(
      {
        message: 'Pendaftaran berhasil!',
        registrationNumber,
        id: result[0].id,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('=== Registration Error ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: `Terjadi kesalahan: ${error.message}` },
      { status: 500 }
    );
  }
}