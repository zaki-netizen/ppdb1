import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { registrations, users } from '@/drizzle/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Registration request:', body.email);

    // Validate required fields
    const requiredFields = ['nisn', 'fullName', 'email', 'phone', 'nilaiRataRata', 'preferredSchool', 'pathway', 'parentName', 'parentPhone', 'password'];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `"${field}" harus diisi` },
          { status: 400 }
        );
      }
    }

    // Validate password length
    if (body.password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter' },
        { status: 400 }
      );
    }

    // Check if email already registered
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, body.email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar. Silakan login.' },
        { status: 409 }
      );
    }

    // Check if NISN already registered
    const existingNisn = await db.query.registrations.findFirst({
      where: eq(registrations.nisn, body.nisn),
    });

    if (existingNisn) {
      return NextResponse.json(
        { error: 'NISN sudah terdaftar' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(body.password, 10);

    // Create user account with password
    const newUser = await db.insert(users).values({
      email: body.email,
      full_name: body.fullName,
      phone_number: body.phone,
      password_hash: passwordHash,
      role: 'applicant',
      status: 'active',
    }).returning();

    if (!newUser || newUser.length === 0) {
      throw new Error('Failed to create user');
    }

    const userId = newUser[0].id;
    console.log('User created:', userId);

    // Generate registration number
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const registrationNumber = `REG-2026-${timestamp}-${randomNum}`;

    // Calculate scores
    const nilaiRataRata = parseFloat(body.nilaiRataRata);
    const gpaValue = (nilaiRataRata / 10).toFixed(2);
    const certificatePoints = parseInt(body.certificatePoints || '0');
    const totalScore = ((nilaiRataRata * 0.6 + certificatePoints * 0.4) / 10).toFixed(2);

    // Create registration
    const registration = await db.insert(registrations).values({
      user_id: userId,
      nisn: body.nisn,
      registration_number: registrationNumber,
      date_of_birth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      gender: body.gender || null,
      address: body.address || '',
      city: body.city || '',
      province: body.province || '',
      zipcode: body.zipcode || '',
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
    }).returning();

    console.log('Registration created:', registration[0].id);

    return NextResponse.json(
      {
        message: 'Pendaftaran berhasil!',
        registrationNumber,
        userId,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: `Terjadi kesalahan: ${error.message}` },
      { status: 500 }
    );
  }
}