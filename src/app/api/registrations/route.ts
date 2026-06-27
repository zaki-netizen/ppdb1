import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registrations, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  return NextResponse.json([]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = ['nisn', 'email', 'phone', 'nilaiRataRata', 'preferredSchool', 'pathway', 'parentName', 'parentPhone'];
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Field "${field}" harus diisi` },
          { status: 400 }
        );
      }
    }

    // Check if NISN already registered
    const existingRegistration = await db.query.registrations.findFirst({
      where: eq(registrations.nisn, body.nisn),
    });

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'NISN sudah terdaftar' },
        { status: 409 }
      );
    }

    // Check if email already has a user account
    let userId: number;
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });

    if (existingUser) {
      userId = existingUser.id;
    } else {
      // Create a new user account
      const newUser = await db.insert(users).values({
        email: body.email,
        full_name: body.fullName || body.email.split('@')[0],
        phone_number: body.phone,
        role: 'applicant',
        status: 'active',
      }).returning();
      userId = newUser[0].id;
    }

    // Generate unique registration number
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const registrationNumber = `REG-2026-${timestamp}-${randomNum}`;

    // Parse nilai rata-rata (0-100 scale)
    const nilaiRataRata = parseFloat(body.nilaiRataRata);

    // Convert nilai to decimal scale (0-10) for storage
    const gpaValue = (nilaiRataRata / 10).toFixed(2);

    // Calculate total score (gpa * 0.6 + certificate_points * 0.4)
    const certificatePoints = parseInt(body.certificatePoints || '0');
    const totalScore = ((nilaiRataRata * 0.6 + certificatePoints * 0.4) / 10).toFixed(2);

    // Insert registration
    await db.insert(registrations).values({
      user_id: userId,
      nisn: body.nisn,
      registration_number: registrationNumber,
      full_name: body.fullName || body.email.split('@')[0],
      date_of_birth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      gender: body.gender || null,
      address: '',
      city: '',
      province: '',
      zipcode: '',
      parent_name: body.parentName,
      parent_phone: body.parentPhone,
      preferred_school_id: parseInt(body.preferredSchool),
      pathway_id: parseInt(body.pathway),
      gpa: gpaValue,
      certificate_points: certificatePoints,
      total_score: totalScore,
      registration_status: 'submitted',
      verification_status: 'pending',
      selection_status: 'pending',
      submitted_at: new Date(),
    } as any);

    return NextResponse.json(
      {
        message: 'Pendaftaran berhasil!',
        registrationNumber: registrationNumber,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Error creating registration:', error);
    return NextResponse.json(
      { error: `Terjadi kesalahan: ${error.message}` },
      { status: 500 }
    );
  }
}